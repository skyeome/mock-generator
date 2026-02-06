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
 * Parses a path string into segments, handling both dot notation and bracket notation.
 *
 * @param path - The path string (e.g., "user.items[0].name" or "a.b.c")
 * @returns Array of path segments
 *
 * @example
 * parsePath("user.items[0].name")
 * // ["user", "items", "0", "name"]
 *
 * parsePath("a.b.c")
 * // ["a", "b", "c"]
 */
export function parsePath(path: string): string[] {
  if (path === '') {
    return [];
  }

  const segments: string[] = [];
  let current = '';
  let i = 0;

  while (i < path.length) {
    const char = path[i];

    if (char === '.') {
      if (current) {
        segments.push(current);
        current = '';
      }
      i++;
    } else if (char === '[') {
      if (current) {
        segments.push(current);
        current = '';
      }
      // Find matching ]
      const closeIndex = path.indexOf(']', i);
      if (closeIndex === -1) {
        throw new Error(`Unclosed bracket in path: ${path}`);
      }
      const index = path.slice(i + 1, closeIndex);
      segments.push(index);
      i = closeIndex + 1;
    } else {
      current += char;
      i++;
    }
  }

  if (current) {
    segments.push(current);
  }

  return segments;
}

/**
 * Gets a value from a nested object using dot-notation or bracket-notation path.
 *
 * @param obj - The object to search
 * @param path - The path (e.g., "user.profile.name" or "items[0].name")
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * getNestedValue({ user: { name: 'John' } }, 'user.name')
 * // "John"
 *
 * getNestedValue({ items: [{ name: 'A' }] }, 'items[0].name')
 * // "A"
 */
export function getNestedValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  if (path === '') {
    return obj;
  }

  const segments = parsePath(path);
  let current: unknown = obj;

  for (const segment of segments) {
    // Check if current is null or undefined
    if (current == null) {
      return undefined;
    }

    // Handle array access
    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);
      if (isNaN(index) || index < 0 || index >= current.length) {
        return undefined;
      }
      current = current[index];
    }
    // Handle object access
    else if (isPlainObject(current)) {
      if (!(segment in current)) {
        return undefined;
      }
      current = current[segment];
    }
    // Invalid path - current is neither array nor object
    else {
      return undefined;
    }
  }

  return current;
}

/**
 * Sets a value in a nested object using dot-notation or bracket-notation path.
 * Creates intermediate objects or arrays as needed.
 *
 * @param obj - The object to modify
 * @param path - The path (e.g., "user.profile.name" or "items[0].name")
 * @param value - The value to set
 *
 * @example
 * const obj = {};
 * setNestedValue(obj, 'user.name', 'John');
 * // obj is now { user: { name: "John" } }
 *
 * const obj2 = {};
 * setNestedValue(obj2, 'items[0].name', 'A');
 * // obj2 is now { items: [{ name: "A" }] }
 */
export function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): void {
  const segments = parsePath(path);
  let current: Record<string, unknown> | unknown[] = obj;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const nextSegment = segments[i + 1];
    const isNextIndex = /^\d+$/.test(nextSegment);

    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);

      // Ensure array is large enough
      while (current.length <= index) {
        current.push(undefined);
      }

      // Create intermediate structure
      if (current[index] == null) {
        current[index] = isNextIndex ? [] : {};
      }

      current = current[index] as Record<string, unknown> | unknown[];
    } else {
      // Object access
      if (current[segment] == null) {
        current[segment] = isNextIndex ? [] : {};
      }

      current = current[segment] as Record<string, unknown> | unknown[];
    }
  }

  // Set the final value
  const lastSegment = segments[segments.length - 1];
  if (Array.isArray(current)) {
    const index = parseInt(lastSegment, 10);
    while (current.length <= index) {
      current.push(undefined);
    }
    current[index] = value;
  } else {
    current[lastSegment] = value;
  }
}

/**
 * Type guard to check if a value is a plain object
 * (not an array, null, or other special object types)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
