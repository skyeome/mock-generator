import type { JsonSchema, JsonSchemaType } from '../types';

// Detect string format from value
function detectFormat(value: string): string | undefined {
  // Email pattern
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
  // UUID pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) return 'uuid';
  // ISO date-time pattern
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'date-time';
  // ISO date pattern
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date';
  // URI pattern
  if (/^https?:\/\//.test(value)) return 'uri';
  // IPv4 pattern
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(value)) return 'ipv4';
  return undefined;
}

// Get JSON type from value
function getJsonType(value: unknown): JsonSchemaType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'number';
  }
  return 'string';
}

// Merge multiple schemas (for array items)
function mergeSchemas(schemas: JsonSchema[]): JsonSchema {
  if (schemas.length === 0) return { type: 'null' };
  if (schemas.length === 1) return schemas[0];

  // Collect all types
  const types = new Set<JsonSchemaType>();
  schemas.forEach(s => {
    if (Array.isArray(s.type)) {
      s.type.forEach(t => types.add(t));
    } else {
      types.add(s.type);
    }
  });

  // If all same type, merge properties or items
  const typeArray = Array.from(types);

  // Handle array type merging
  if (typeArray.length === 1 && typeArray[0] === 'array') {
    const itemSchemas: JsonSchema[] = [];
    schemas.forEach(s => {
      if (s.items) {
        if (Array.isArray(s.items)) {
          itemSchemas.push(...s.items);
        } else {
          itemSchemas.push(s.items);
        }
      }
    });
    return {
      type: 'array',
      items: itemSchemas.length > 0 ? mergeSchemas(itemSchemas) : { type: 'null' },
    };
  }

  if (typeArray.length === 1 && typeArray[0] === 'object') {
    const allProperties: Record<string, JsonSchema[]> = {};
    const requiredSets: Set<string>[] = [];

    schemas.forEach(s => {
      if (s.properties) {
        requiredSets.push(new Set(s.required || []));
        Object.entries(s.properties).forEach(([key, prop]) => {
          if (!allProperties[key]) allProperties[key] = [];
          allProperties[key].push(prop);
        });
      }
    });

    const mergedProperties: Record<string, JsonSchema> = {};
    Object.entries(allProperties).forEach(([key, props]) => {
      mergedProperties[key] = mergeSchemas(props);
    });

    // Required = intersection of all required sets
    const required = requiredSets.length > 0
      ? Array.from(requiredSets.reduce((a, b) => {
          const intersection = new Set<string>();
          a.forEach(x => {
            if (b.has(x)) intersection.add(x);
          });
          return intersection;
        }))
      : [];

    return {
      type: 'object',
      properties: mergedProperties,
      required: required.length > 0 ? required : undefined,
    };
  }

  // Multiple types
  return { type: typeArray.length === 1 ? typeArray[0] : typeArray };
}

// Main inference function
export function inferSchema(sample: unknown): JsonSchema {
  const type = getJsonType(sample);

  if (type === 'null') {
    return { type: 'null' };
  }

  if (type === 'boolean') {
    return { type: 'boolean' };
  }

  if (type === 'number' || type === 'integer') {
    return { type };
  }

  if (type === 'string') {
    const schema: JsonSchema = { type: 'string' };
    const format = detectFormat(sample as string);
    if (format) schema.format = format;
    return schema;
  }

  if (type === 'array') {
    const arr = sample as unknown[];
    if (arr.length === 0) {
      return { type: 'array', items: { type: 'null' } };
    }
    const itemSchemas = arr.map(item => inferSchema(item));
    return {
      type: 'array',
      items: mergeSchemas(itemSchemas),
    };
  }

  if (type === 'object') {
    const obj = sample as Record<string, unknown>;
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    Object.entries(obj).forEach(([key, value]) => {
      properties[key] = inferSchema(value);
      if (value !== null && value !== undefined) {
        required.push(key);
      }
    });

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  return { type: 'null' };
}

export { detectFormat, mergeSchemas };
