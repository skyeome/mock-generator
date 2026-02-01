import type { SemanticType } from '../types/schema';

/**
 * All available semantic types for field detection
 */
export const SEMANTIC_TYPES: SemanticType[] = [
  'firstName',
  'lastName',
  'fullName',
  'username',
  'email',
  'phone',
  'url',
  'avatar',
  'streetAddress',
  'city',
  'country',
  'zipCode',
  'latitude',
  'longitude',
  'uuid',
  'id',
  'date',
  'datetime',
  'timestamp',
  'pastDate',
  'futureDate',
  'price',
  'currency',
  'creditCard',
  'company',
  'jobTitle',
  'sentence',
  'paragraph',
  'word',
  'imageUrl',
  'boolean',
  'number',
  'integer',
  'unknown',
];

/**
 * System prompt for AI schema analysis
 */
export const SCHEMA_ANALYSIS_SYSTEM_PROMPT = `You are a data schema analyzer specializing in identifying semantic field types for mock data generation.

Given a JSON schema, your task is to:
1. Identify the domain context (e-commerce, social-media, healthcare, finance, etc.)
2. Analyze each field and suggest the most appropriate semantic type
3. Identify fields that should be coherent (same person's firstName/lastName/email)

Available semantic types:
${SEMANTIC_TYPES.join(', ')}

IMPORTANT RULES:
- Use exact semantic type names from the list above
- Set confidence between 0.0-1.0 based on how certain you are
- Group related fields in coherenceGroups (e.g., buyer's name fields together)
- Consider field names, parent object names, and overall schema context

Respond ONLY with valid JSON matching this exact structure:
{
  "domainContext": "string describing the data domain",
  "fieldHints": [
    {
      "fieldPath": "dot.notation.path",
      "suggestedSemantic": "SemanticType from list",
      "confidence": 0.0-1.0,
      "reasoning": "brief explanation",
      "relatedFields": ["optional", "related", "fields"]
    }
  ],
  "coherenceGroups": [
    ["field1", "field2", "field3"]
  ]
}`;

/**
 * Build user prompt from schema
 */
export function buildSchemaPrompt(schema: Record<string, unknown>): string {
  return `Analyze this JSON schema and identify semantic types for generating realistic mock data:

\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

Provide your analysis as JSON.`;
}

/**
 * Few-shot examples for better AI performance
 */
export const FEW_SHOT_EXAMPLES = [
  {
    input: {
      type: 'object',
      properties: {
        buyerFirstName: { type: 'string' },
        buyerLastName: { type: 'string' },
        buyerEmail: { type: 'string', format: 'email' },
        totalPrice: { type: 'number' },
      },
    },
    output: {
      domainContext: 'e-commerce',
      fieldHints: [
        {
          fieldPath: 'buyerFirstName',
          suggestedSemantic: 'firstName',
          confidence: 0.95,
          reasoning: 'Field name indicates buyer first name',
          relatedFields: ['buyerLastName', 'buyerEmail'],
        },
        {
          fieldPath: 'buyerLastName',
          suggestedSemantic: 'lastName',
          confidence: 0.95,
          reasoning: 'Field name indicates buyer last name',
          relatedFields: ['buyerFirstName', 'buyerEmail'],
        },
        {
          fieldPath: 'buyerEmail',
          suggestedSemantic: 'email',
          confidence: 0.98,
          reasoning: 'Field name and format indicate email address',
          relatedFields: ['buyerFirstName', 'buyerLastName'],
        },
        {
          fieldPath: 'totalPrice',
          suggestedSemantic: 'price',
          confidence: 0.9,
          reasoning: 'Field name indicates monetary price',
        },
      ],
      coherenceGroups: [['buyerFirstName', 'buyerLastName', 'buyerEmail']],
    },
  },
];
