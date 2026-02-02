import { z } from 'zod';

// Recursive schema for i18n JSON - only strings or nested objects
const i18nValueSchema: z.ZodType<string | Record<string, unknown>> = z.lazy(() =>
  z.union([
    z.string(),
    z.record(z.string(), i18nValueSchema)
  ])
);

const i18nJsonSchema = z.record(z.string(), i18nValueSchema);

export interface ValidationResult {
  success: boolean;
  errors: Array<{ path: string; message: string }>;
}

export function validateI18nJson(json: unknown): ValidationResult {
  // First check if input is an object
  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    return {
      success: false,
      errors: [{
        path: '',
        message: 'Expected object, got ' + (Array.isArray(json) ? 'array' : typeof json)
      }]
    };
  }

  // Validate all leaf values must be strings (no numbers, booleans, null, arrays, etc.)
  const leafErrors = validateLeafValues(json as Record<string, unknown>);

  if (leafErrors.length > 0) {
    return {
      success: false,
      errors: leafErrors
    };
  }

  return {
    success: true,
    errors: []
  };
}

function validateLeafValues(
  obj: Record<string, unknown>,
  path = ''
): Array<{ path: string; message: string }> {
  const errors: Array<{ path: string; message: string }> = [];

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof value === 'string') {
      // Valid leaf value
      continue;
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively validate nested objects
      const nestedErrors = validateLeafValues(value as Record<string, unknown>, currentPath);
      errors.push(...nestedErrors);
    } else {
      // Invalid leaf value (number, boolean, null, array, etc.)
      errors.push({
        path: currentPath,
        message: `Expected string, got ${Array.isArray(value) ? 'array' : typeof value}`
      });
    }
  }

  return errors;
}
