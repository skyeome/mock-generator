/**
 * Reorders keys in target object to match the order in source object.
 * Keys present in target but not in source are appended at the end.
 * Recursively handles nested objects.
 *
 * @param target - The object whose keys should be reordered
 * @param source - The object whose key order should be matched
 * @returns A new object with reordered keys
 */
export function reorderKeys<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const result: Record<string, unknown> = {};
  const sourceKeys = Object.keys(source);
  const targetKeys = new Set(Object.keys(target));

  // Add keys in source order first
  for (const key of sourceKeys) {
    if (targetKeys.has(key)) {
      const sourceVal = source[key];
      const targetVal = target[key];

      if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
        result[key] = reorderKeys(
          targetVal as Record<string, unknown>,
          sourceVal as Record<string, unknown>
        );
      } else {
        result[key] = targetVal;
      }
      targetKeys.delete(key);
    }
  }

  // Append orphaned keys at end
  for (const key of targetKeys) {
    result[key] = target[key];
  }

  return result as T;
}

/**
 * Type guard to check if a value is a plain object
 * (not an array, null, or other special object types)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
