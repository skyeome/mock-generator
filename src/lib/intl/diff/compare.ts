import type { DiffOperation, DiffResult, DiffOperationType } from '../types';
import { parsePath } from '../utils/flatten';

/**
 * Extracts all leaf key paths from a nested object in depth-first order.
 * Returns only leaf paths (no parent/intermediate paths).
 * Arrays are traversed with bracket notation (e.g., items[0].name).
 * Nested arrays (array-in-array) are treated as opaque leaves.
 */
export function extractKeyOrder(
  obj: Record<string, unknown>,
  prefix = ''
): string[] {
  const keys: string[] = [];

  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (Array.isArray(value)) {
      // Recurse into array elements -- do NOT push the array path itself
      value.forEach((item, index) => {
        const arrayPath = `${path}[${index}]`;

        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          // Object inside array -- recurse, do NOT push arrayPath itself
          keys.push(...extractKeyOrder(item as Record<string, unknown>, arrayPath));
        } else {
          // Primitive leaf or nested array (nested array is out of scope -- treat as opaque leaf)
          // NOTE: Nested arrays (array-in-array) are not expected in i18n data.
          // Treated as opaque leaves. If needed in the future, implement dedicated handling.
          keys.push(arrayPath);
        }
      });
    } else if (value !== null && typeof value === 'object') {
      // Object -- recurse, do NOT push the object path itself
      keys.push(...extractKeyOrder(value as Record<string, unknown>, path));
    } else {
      // Leaf node (string, number, boolean, null, undefined)
      keys.push(path);
    }
  }

  return keys;
}

/**
 * Gets the value at a path (dot-notation or bracket-notation) in an object.
 */
function getValueAtPath(obj: Record<string, unknown>, path: string): unknown {
  const segments = parsePath(path);
  let current: unknown = obj;

  for (const segment of segments) {
    if (current == null) return undefined;

    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);
      if (isNaN(index) || index < 0 || index >= current.length) {
        return undefined;
      }
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Checks if a value exists at a path (dot-notation or bracket-notation) in an object.
 */
function hasPath(obj: Record<string, unknown>, path: string): boolean {
  const segments = parsePath(path);
  let current: unknown = obj;

  for (const segment of segments) {
    if (current == null) return false;

    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);
      if (isNaN(index) || index < 0 || index >= current.length) {
        return false;
      }
      current = current[index];
    } else if (typeof current === 'object') {
      if (!(segment in (current as Record<string, unknown>))) {
        return false;
      }
      current = (current as Record<string, unknown>)[segment];
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Compares two JSON objects and returns a detailed diff result.
 * Detects MISSING, ORPHANED, TYPE_MISMATCH, VALUE_DIFF, and EQUAL operations.
 * Only leaf paths are compared (no parent/intermediate object or array paths).
 */
export function compareJson(
  source: Record<string, unknown>,
  target: Record<string, unknown>
): DiffResult {
  const operations: DiffOperation[] = [];
  const stats = {
    missing: 0,
    orphaned: 0,
    typeMismatch: 0,
    equal: 0,
  };

  const sourceKeys = extractKeyOrder(source);
  const targetKeys = extractKeyOrder(target);
  const allKeys = new Set([...sourceKeys, ...targetKeys]);

  for (const keyPath of Array.from(allKeys)) {
    const hasInSource = hasPath(source, keyPath);
    const hasInTarget = hasPath(target, keyPath);
    const sourceValue = hasInSource ? getValueAtPath(source, keyPath) : undefined;
    const targetValue = hasInTarget ? getValueAtPath(target, keyPath) : undefined;

    let operationType: DiffOperationType;

    if (!hasInSource && hasInTarget) {
      // Key exists in target but not in source
      operationType = 'ORPHANED';
      stats.orphaned++;
    } else if (hasInSource && !hasInTarget) {
      // Key exists in source but not in target
      operationType = 'MISSING';
      stats.missing++;
    } else if (hasInSource && hasInTarget) {
      // Both exist, check type and value
      const sourceType = Array.isArray(sourceValue)
        ? 'array'
        : sourceValue === null
        ? 'null'
        : typeof sourceValue;
      const targetType = Array.isArray(targetValue)
        ? 'array'
        : targetValue === null
        ? 'null'
        : typeof targetValue;

      if (sourceType !== targetType) {
        operationType = 'TYPE_MISMATCH';
        stats.typeMismatch++;
      } else if (sourceType === 'object' && targetType === 'object') {
        // Skip nested objects - their children are compared individually
        continue;
      } else if (sourceType === 'array' && targetType === 'array') {
        // Skip array parents - their children are compared individually as leaf nodes
        continue;
      } else {
        // Primitive comparison
        if (sourceValue === targetValue) {
          operationType = 'EQUAL';
          stats.equal++;
        } else {
          operationType = 'VALUE_DIFF';
        }
      }
    } else {
      // Should not happen, but fallback to EQUAL
      operationType = 'EQUAL';
      stats.equal++;
    }

    operations.push({
      type: operationType,
      keyPath,
      sourceValue,
      targetValue,
    });
  }

  return {
    operations,
    stats,
    sourceKeyOrder: sourceKeys,
    targetKeyOrder: targetKeys,
  };
}
