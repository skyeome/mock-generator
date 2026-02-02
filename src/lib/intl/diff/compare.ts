import type { DiffOperation, DiffResult, DiffOperationType } from '../types';

/**
 * Extracts all key paths from a nested object in depth-first order.
 * Returns array of dot-notation paths (e.g., ['user', 'user.name', 'user.email']).
 */
export function extractKeyOrder(
  obj: Record<string, unknown>,
  prefix = ''
): string[] {
  const keys: string[] = [];

  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    keys.push(path);

    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...extractKeyOrder(value as Record<string, unknown>, path));
    }
  }

  return keys;
}

/**
 * Gets the value at a dot-notation path in an object.
 */
function getValueAtPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Checks if a value exists at a dot-notation path in an object.
 */
function hasPath(obj: Record<string, unknown>, path: string): boolean {
  const parts = path.split('.');
  let current: any = obj;

  for (const part of parts) {
    if (current === null || current === undefined || !(part in current)) {
      return false;
    }
    current = current[part];
  }

  return true;
}

/**
 * Compares two JSON objects and returns a detailed diff result.
 * Detects MISSING, ORPHANED, TYPE_MISMATCH, VALUE_DIFF, and EQUAL operations.
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
        // Skip nested objects - their children will be compared individually
        continue;
      } else if (sourceType === 'array' || targetType === 'array') {
        // For arrays, check if they're deeply equal
        const arraysEqual =
          JSON.stringify(sourceValue) === JSON.stringify(targetValue);
        if (arraysEqual) {
          operationType = 'EQUAL';
          stats.equal++;
        } else {
          operationType = 'VALUE_DIFF';
        }
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
