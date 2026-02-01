import type { JsonSchema } from '../types';
import type { AISchemaAnalysis, AISemanticHint, AIConfig } from '../types/ai';
import { DEFAULT_AI_CONFIG } from '../types/ai';
import { AIClient } from '../ai/client';
import { enrichSchemaWithSemantics } from './enrichSchema';

/**
 * Analyze schema with AI and return enhanced hints
 */
export async function analyzeSchemaWithAI(
  schema: JsonSchema,
  ai: Ai,
  config: Partial<AIConfig> = {}
): Promise<AISchemaAnalysis | null> {
  const client = new AIClient({ ...DEFAULT_AI_CONFIG, ...config });
  return client.analyzeSchema(schema, ai);
}

/**
 * Enrich schema with AI-detected semantics
 * Falls back to regex-based detection if AI fails
 */
export async function enrichSchemaWithAI(
  schema: JsonSchema,
  ai: Ai | null,
  config: Partial<AIConfig> = {}
): Promise<JsonSchema> {
  // If AI is not available or disabled, use regex fallback
  if (!ai || !config.enabled) {
    return enrichSchemaWithSemantics(schema);
  }

  try {
    const analysis = await analyzeSchemaWithAI(schema, ai, config);

    if (!analysis) {
      // AI returned no results, fall back to regex
      return enrichSchemaWithSemantics(schema);
    }

    // Apply AI hints to schema
    return applyAIHintsToSchema(schema, analysis);
  } catch (error) {
    console.error('AI enrichment failed, falling back to regex:', error);
    return enrichSchemaWithSemantics(schema);
  }
}

/**
 * Apply AI-detected hints to schema
 */
function applyAIHintsToSchema(
  schema: JsonSchema,
  analysis: AISchemaAnalysis
): JsonSchema {
  const enriched = { ...schema };

  // Store domain context as extension
  enriched['x-ai-domain'] = analysis.domainContext;

  // Store coherence groups for generation phase
  if (analysis.coherenceGroups.length > 0) {
    enriched['x-ai-coherence'] = analysis.coherenceGroups;
  }

  // Apply field hints
  if (schema.type === 'object' && schema.properties) {
    enriched.properties = {};

    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const hint = findHintForField(key, analysis.fieldHints);
      enriched.properties[key] = applyHintToProperty(propSchema, hint, key, analysis.fieldHints);
    }
  }

  // Handle array schemas
  if (schema.type === 'array' && schema.items && !Array.isArray(schema.items)) {
    enriched.items = applyAIHintsToSchema(schema.items, analysis);
  }

  return enriched;
}

/**
 * Find AI hint for a field by path
 */
function findHintForField(
  fieldPath: string,
  hints: AISemanticHint[]
): AISemanticHint | undefined {
  return hints.find(h =>
    h.fieldPath === fieldPath ||
    h.fieldPath.endsWith(`.${fieldPath}`)
  );
}

/**
 * Apply AI hint to a property schema
 */
function applyHintToProperty(
  propSchema: JsonSchema,
  hint: AISemanticHint | undefined,
  fieldName: string,
  allHints: AISemanticHint[]
): JsonSchema {
  // If no AI hint or low confidence, fall back to regex enrichment
  if (!hint || hint.confidence < 0.5) {
    return enrichSchemaWithSemantics(propSchema, fieldName);
  }

  const enriched = { ...propSchema };

  // Map semantic type to faker method
  const fakerMethod = mapSemanticToFaker(hint.suggestedSemantic);
  if (fakerMethod) {
    enriched['x-faker'] = {
      method: fakerMethod,
      aiConfidence: hint.confidence,
      aiReasoning: hint.reasoning
    };
  }

  // Store related fields for coherence
  if (hint.relatedFields && hint.relatedFields.length > 0) {
    enriched['x-ai-related'] = hint.relatedFields;
  }

  // Recursively handle nested objects
  if (propSchema.type === 'object' && propSchema.properties) {
    enriched.properties = {};
    for (const [key, nestedSchema] of Object.entries(propSchema.properties)) {
      const nestedPath = `${fieldName}.${key}`;
      const nestedHint = findHintForField(nestedPath, allHints);
      enriched.properties[key] = applyHintToProperty(nestedSchema, nestedHint, nestedPath, allHints);
    }
  }

  return enriched;
}

/**
 * Map semantic type to Faker.js method
 */
function mapSemanticToFaker(semantic: string): string | null {
  const mapping: Record<string, string> = {
    firstName: 'person.firstName',
    lastName: 'person.lastName',
    fullName: 'person.fullName',
    username: 'internet.username',
    email: 'internet.email',
    phone: 'phone.number',
    url: 'internet.url',
    avatar: 'image.avatar',
    streetAddress: 'location.streetAddress',
    city: 'location.city',
    country: 'location.country',
    zipCode: 'location.zipCode',
    latitude: 'location.latitude',
    longitude: 'location.longitude',
    uuid: 'string.uuid',
    id: 'number.int',
    date: 'date.past',
    datetime: 'date.past',
    timestamp: 'date.past',
    pastDate: 'date.past',
    futureDate: 'date.future',
    price: 'commerce.price',
    currency: 'finance.currencyCode',
    creditCard: 'finance.creditCardNumber',
    company: 'company.name',
    jobTitle: 'person.jobTitle',
    sentence: 'lorem.sentence',
    paragraph: 'lorem.paragraph',
    word: 'lorem.word',
    imageUrl: 'image.url',
    boolean: 'datatype.boolean',
    number: 'number.float',
    integer: 'number.int',
  };

  return mapping[semantic] || null;
}
