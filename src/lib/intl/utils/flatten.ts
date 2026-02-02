/**
 * Flattens a nested JSON object into a Map with dot-notation keys.
 *
 * @param obj - The object to flatten
 * @param prefix - Optional prefix for all keys
 * @returns A Map with flattened key-value pairs
 *
 * @example
 * flattenJson({ user: { name: 'John' } })
 * // Map { "user.name" => "John" }
 */
export function flattenJson(
  obj: Record<string, unknown>,
  prefix = ''
): Map<string, unknown> {
  const result = new Map<string, unknown>();

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      const nested = flattenJson(value as Record<string, unknown>, newKey);
      for (const [nestedKey, nestedValue] of nested) {
        result.set(nestedKey, nestedValue);
      }
    } else {
      result.set(newKey, value);
    }
  }

  return result;
}

/**
 * Converts a flattened Map back to a nested object structure.
 *
 * @param map - The flattened Map to unflatten
 * @returns A nested object
 *
 * @example
 * unflattenJson(new Map([["user.name", "John"]]))
 * // { user: { name: "John" } }
 */
export function unflattenJson(
  map: Map<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [path, value] of map) {
    setNestedValue(result, path, value);
  }

  return result;
}

/**
 * Gets a value from a nested object using dot-notation path.
 *
 * @param obj - The object to search
 * @param path - The dot-notation path (e.g., "user.profile.name")
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * getNestedValue({ user: { name: 'John' } }, 'user.name')
 * // "John"
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  if (path === '') {
    return obj;
  }

  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (!isPlainObject(current) || !(key in current)) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Sets a value in a nested object using dot-notation path.
 * Creates intermediate objects as needed.
 *
 * @param obj - The object to modify
 * @param path - The dot-notation path (e.g., "user.profile.name")
 * @param value - The value to set
 *
 * @example
 * const obj = {};
 * setNestedValue(obj, 'user.name', 'John');
 * // obj is now { user: { name: "John" } }
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (!isPlainObject(current[key])) {
      current[key] = {};
    }

    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
}

/**
 * Type guard to check if a value is a plain object
 * (not an array, null, or other special object types)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
