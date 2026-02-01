import { faker } from '@faker-js/faker';
import type { JsonSchema, GeneratorConfig, FakerHint } from '../types';

/**
 * Get a faker function from a method path like "person.firstName"
 */
function getFakerFunction(method: string): (() => unknown) | null {
  const parts = method.split('.');
  let current: unknown = faker;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return null;
    }
  }

  return typeof current === 'function' ? (current as () => unknown).bind(faker) : null;
}

/**
 * Generate a value for a given faker hint
 */
function generateFromHint(hint: FakerHint): unknown {
  const fn = getFakerFunction(hint.method);
  if (!fn) return null;

  if (hint.args && hint.args.length > 0) {
    return (fn as (...args: unknown[]) => unknown)(...hint.args);
  }
  return fn();
}

/**
 * Generate a single value based on schema
 */
function generateValue(schema: JsonSchema): unknown {
  // Use x-faker hint if available
  if (schema['x-faker']) {
    const value = generateFromHint(schema['x-faker']);

    // Format date values if needed
    if (schema.format === 'date-time' && value instanceof Date) {
      return value.toISOString();
    }
    if (schema.format === 'date' && value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    return value;
  }

  // Handle type-based generation
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

  switch (type) {
    case 'null':
      return null;

    case 'boolean':
      return faker.datatype.boolean();

    case 'integer':
      // Check enum first
      if (schema.enum && schema.enum.length > 0) {
        return faker.helpers.arrayElement(schema.enum);
      }
      return faker.number.int({
        min: schema.minimum ?? 0,
        max: schema.maximum ?? 1000000,
      });

    case 'number':
      // Check enum first
      if (schema.enum && schema.enum.length > 0) {
        return faker.helpers.arrayElement(schema.enum);
      }
      return faker.number.float({
        min: schema.minimum ?? 0,
        max: schema.maximum ?? 1000000,
        fractionDigits: 2,
      });

    case 'string':
      // Check format
      if (schema.format === 'email') return faker.internet.email();
      if (schema.format === 'uri') return faker.internet.url();
      if (schema.format === 'uuid') return faker.string.uuid();
      if (schema.format === 'date-time') return faker.date.past().toISOString();
      if (schema.format === 'date') return faker.date.past().toISOString().split('T')[0];
      if (schema.format === 'ipv4') return faker.internet.ipv4();

      // Check enum
      if (schema.enum && schema.enum.length > 0) {
        return faker.helpers.arrayElement(schema.enum);
      }

      // Check pattern (basic support)
      if (schema.pattern) {
        return faker.helpers.fromRegExp(schema.pattern);
      }

      // Default string
      const minLen = schema.minLength ?? 1;
      const maxLen = schema.maxLength ?? 20;
      return faker.string.alphanumeric({ length: { min: minLen, max: maxLen } });

    case 'array':
      const minItems = schema.minItems ?? 1;
      const maxItems = schema.maxItems ?? 5;
      const count = faker.number.int({ min: minItems, max: maxItems });

      if (!schema.items) return [];

      const itemSchema = Array.isArray(schema.items) ? schema.items[0] : schema.items;
      return Array.from({ length: count }, () => generateValue(itemSchema));

    case 'object':
      if (!schema.properties) return {};

      const obj: Record<string, unknown> = {};
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        obj[key] = generateValue(propSchema);
      }
      return obj;

    default:
      return null;
  }
}

/**
 * Generate multiple mock data records
 */
export function generateMockData(
  schema: JsonSchema,
  config: GeneratorConfig
): unknown[] {
  // Set seed if provided
  if (config.seed !== undefined) {
    faker.seed(config.seed);
  }

  // Note: locale support requires importing locale-specific fakers
  // For now, we use the default English locale
  // Future: support for multiple locales via dynamic imports

  // If schema is an array of objects, generate count instances of the item schema
  // This handles the common case where user inputs an array of objects like [{name: "John"}]
  // We only unwrap when items is an object type with properties
  let itemSchema = schema;
  if (
    schema.type === 'array' &&
    schema.items &&
    !Array.isArray(schema.items) &&
    schema.items.type === 'object' &&
    schema.items.properties
  ) {
    itemSchema = schema.items;
  }

  // Generate records
  const records: unknown[] = [];
  for (let i = 0; i < config.count; i++) {
    records.push(generateValue(itemSchema));
  }

  return records;
}

/**
 * Generate a single record
 */
export function generateSingleRecord(schema: JsonSchema): unknown {
  return generateValue(schema);
}
