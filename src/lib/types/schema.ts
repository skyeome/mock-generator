// JSON Schema types with Faker extension
export type JsonSchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'array'
  | 'object'
  | 'null';

export interface JsonSchema {
  $schema?: string;
  type: JsonSchemaType | JsonSchemaType[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema | JsonSchema[];
  required?: string[];
  format?: string;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  pattern?: string;
  description?: string;
  // Custom extension for Faker hints
  'x-faker'?: FakerHint;
  // AI-enhanced extensions
  'x-ai-domain'?: string;
  'x-ai-coherence'?: string[][];
  'x-ai-related'?: string[];
}

export interface FakerHint {
  method: string;
  args?: unknown[];
  locale?: string;
  // AI-specific metadata
  aiConfidence?: number;
  aiReasoning?: string;
}

export type SemanticType =
  | 'firstName' | 'lastName' | 'fullName' | 'username'
  | 'email' | 'phone' | 'url' | 'avatar'
  | 'streetAddress' | 'city' | 'country' | 'zipCode' | 'latitude' | 'longitude'
  | 'uuid' | 'id'
  | 'date' | 'datetime' | 'timestamp' | 'pastDate' | 'futureDate'
  | 'price' | 'currency' | 'creditCard'
  | 'company' | 'jobTitle'
  | 'sentence' | 'paragraph' | 'word'
  | 'imageUrl' | 'boolean' | 'number' | 'integer'
  | 'unknown';
