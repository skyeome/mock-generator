import type { DiffOperation, DiffResult } from './types';

/**
 * Compare two JSON objects and generate diff operations
 */
export function compareJson(
  source: Record<string, unknown>,
  target: Record<string, unknown>
): DiffResult {
  const operations: DiffOperation[] = [];
  const sourceKeyOrder: string[] = [];
  const targetKeyOrder: string[] = [];

  // Traverse source and find missing/different keys
  function traverseSource(
    srcObj: any,
    tgtObj: any,
    path: string[] = []
  ): void {
    if (typeof srcObj !== 'object' || srcObj === null) {
      const keyPath = path.join('.');
      sourceKeyOrder.push(keyPath);

      if (tgtObj === undefined) {
        operations.push({
          type: 'MISSING',
          keyPath,
          sourceValue: srcObj,
          targetValue: undefined,
        });
      } else if (typeof srcObj !== typeof tgtObj) {
        operations.push({
          type: 'TYPE_MISMATCH',
          keyPath,
          sourceValue: srcObj,
          targetValue: tgtObj,
        });
      } else if (JSON.stringify(srcObj) !== JSON.stringify(tgtObj)) {
        operations.push({
          type: 'VALUE_DIFF',
          keyPath,
          sourceValue: srcObj,
          targetValue: tgtObj,
        });
      } else {
        operations.push({
          type: 'EQUAL',
          keyPath,
          sourceValue: srcObj,
          targetValue: tgtObj,
        });
      }
      return;
    }

    // Handle nested objects
    for (const key in srcObj) {
      const newPath = [...path, key];
      const srcVal = srcObj[key];
      const tgtVal = tgtObj?.[key];

      if (
        typeof srcVal === 'object' &&
        srcVal !== null &&
        !Array.isArray(srcVal)
      ) {
        traverseSource(srcVal, tgtVal || {}, newPath);
      } else {
        const keyPath = newPath.join('.');
        sourceKeyOrder.push(keyPath);

        if (tgtVal === undefined) {
          operations.push({
            type: 'MISSING',
            keyPath,
            sourceValue: srcVal,
            targetValue: undefined,
          });
        } else if (typeof srcVal !== typeof tgtVal) {
          operations.push({
            type: 'TYPE_MISMATCH',
            keyPath,
            sourceValue: srcVal,
            targetValue: tgtVal,
          });
        } else if (JSON.stringify(srcVal) !== JSON.stringify(tgtVal)) {
          operations.push({
            type: 'VALUE_DIFF',
            keyPath,
            sourceValue: srcVal,
            targetValue: tgtVal,
          });
        } else {
          operations.push({
            type: 'EQUAL',
            keyPath,
            sourceValue: srcVal,
            targetValue: tgtVal,
          });
        }
      }
    }
  }

  // Find orphaned keys in target
  function traverseTarget(
    srcObj: any,
    tgtObj: any,
    path: string[] = []
  ): void {
    if (typeof tgtObj !== 'object' || tgtObj === null) {
      const keyPath = path.join('.');
      targetKeyOrder.push(keyPath);
      return;
    }

    for (const key in tgtObj) {
      const newPath = [...path, key];
      const tgtVal = tgtObj[key];
      const srcVal = srcObj?.[key];

      if (
        typeof tgtVal === 'object' &&
        tgtVal !== null &&
        !Array.isArray(tgtVal)
      ) {
        traverseTarget(srcVal || {}, tgtVal, newPath);
      } else {
        const keyPath = newPath.join('.');
        targetKeyOrder.push(keyPath);

        if (srcVal === undefined) {
          operations.push({
            type: 'ORPHANED',
            keyPath,
            sourceValue: undefined,
            targetValue: tgtVal,
          });
        }
      }
    }
  }

  traverseSource(source, target);
  traverseTarget(source, target);

  // Calculate stats
  const stats = {
    missing: operations.filter((op) => op.type === 'MISSING').length,
    orphaned: operations.filter((op) => op.type === 'ORPHANED').length,
    typeMismatch: operations.filter((op) => op.type === 'TYPE_MISMATCH').length,
    equal: operations.filter((op) => op.type === 'EQUAL').length,
  };

  return {
    operations,
    stats,
    sourceKeyOrder,
    targetKeyOrder,
  };
}
