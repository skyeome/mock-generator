import type { JsonSchema, FakerHint, SemanticType } from '../types';
import type { AIConfig } from '../types/ai';
import { detectSemantic } from './detectSemantic';

// Map semantic types to Faker.js methods
const FAKER_METHODS: Record<SemanticType, string> = {
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
  unknown: 'lorem.word',
};

/**
 * Recursively enrich schema with x-faker hints
 */
export function enrichSchemaWithSemantics(
  schema: JsonSchema,
  fieldName?: string
): JsonSchema {
  const enriched = { ...schema };

  if (schema.type === 'object' && schema.properties) {
    enriched.properties = {};
    for (const [key, prop] of Object.entries(schema.properties)) {
      enriched.properties[key] = enrichSchemaWithSemantics(prop, key);
    }
  }

  if (schema.type === 'array' && schema.items) {
    if (Array.isArray(schema.items)) {
      enriched.items = schema.items.map(item => enrichSchemaWithSemantics(item));
    } else {
      enriched.items = enrichSchemaWithSemantics(schema.items);
    }
  }

  // Add x-faker hint for primitive types
  if (fieldName && (schema.type === 'string' || schema.type === 'number' || schema.type === 'integer' || schema.type === 'boolean')) {
    // Pass schema type to detectSemantic for type-priority detection
    // e.g., userId: 1 (integer) should be detected as "id", not "username"
    const schemaType = Array.isArray(schema.type) ? schema.type[0] : schema.type;
    const semantic = detectSemantic(fieldName, schema.format, schemaType);

    // Only add x-faker if we have a meaningful semantic match
    // For 'unknown', only apply to strings where lorem.word makes sense
    // Numeric types should fall back to their native generation
    if (semantic !== 'unknown' || schema.type === 'string') {
      const method = FAKER_METHODS[semantic];

      if (method) {
        const hint: FakerHint = { method };

        // Add format-specific args
        if (semantic === 'datetime' || semantic === 'pastDate') {
          hint.method = 'date.past';
        } else if (semantic === 'futureDate') {
          hint.method = 'date.future';
        } else if (semantic === 'id') {
          hint.args = [{ min: 1, max: 999999 }];
        }

        enriched['x-faker'] = hint;
      }
    }
  }

  return enriched;
}

// Export the AI-enhanced version for use when AI is available
export { enrichSchemaWithAI, analyzeSchemaWithAI } from './aiDetectSemantic';

/**
 * Unified enrichment function that handles both AI and regex-based enrichment
 * @param schema - JSON schema to enrich
 * @param options - Optional AI configuration
 * @returns Enriched schema with x-faker hints
 */
export async function enrichSchema(
  schema: JsonSchema,
  options?: {
    ai?: Ai | null;
    config?: Partial<AIConfig>;
  }
): Promise<JsonSchema> {
  const { ai, config } = options || {};

  // If AI binding provided and enabled, use AI enrichment
  if (ai && config?.enabled !== false) {
    const { enrichSchemaWithAI } = await import('./aiDetectSemantic');
    return enrichSchemaWithAI(schema, ai, config);
  }

  // Fall back to regex-based enrichment
  return enrichSchemaWithSemantics(schema);
}
