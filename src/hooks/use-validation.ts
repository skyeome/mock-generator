import { useState, useEffect, useMemo } from 'react';
import { checkVariableConsistency } from '@/lib/intl/validation/consistency';
import { detectLengthAnomaly } from '@/lib/intl/validation/anomaly';
import type { ValidationIssue } from '@/components/intl/validation-panel';

function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const keyPath = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'string') {
      result[keyPath] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, keyPath));
    }
  }

  return result;
}

export function useValidation(
  sourceContent: string,
  targetContent: string
): { issues: ValidationIssue[]; isValidating: boolean } {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isValidating, setIsValidating] = useState(true);

  // Debounce validation to avoid excessive computation
  useEffect(() => {
    setIsValidating(true);

    const timeoutId = setTimeout(() => {
      const newIssues: ValidationIssue[] = [];

      // Handle empty content
      if (!sourceContent.trim() && !targetContent.trim()) {
        setIssues([]);
        setIsValidating(false);
        return;
      }

      try {
        // Parse JSON
        let sourceObj: any;
        let targetObj: any;

        try {
          sourceObj = JSON.parse(sourceContent);
        } catch (e) {
          newIssues.push({
            keyPath: 'source',
            type: 'schema_error',
            severity: 'error',
            message: 'Invalid source JSON',
          });
          setIssues(newIssues);
          setIsValidating(false);
          return;
        }

        try {
          targetObj = JSON.parse(targetContent);
        } catch (e) {
          newIssues.push({
            keyPath: 'target',
            type: 'schema_error',
            severity: 'error',
            message: 'Invalid target JSON',
          });
          setIssues(newIssues);
          setIsValidating(false);
          return;
        }

        // Flatten both objects
        const sourceFlat = flattenObject(sourceObj);
        const targetFlat = flattenObject(targetObj);

        // Validate each key pair
        for (const keyPath in sourceFlat) {
          if (!Object.prototype.hasOwnProperty.call(sourceFlat, keyPath)) continue;

          const sourceValue = sourceFlat[keyPath];
          const targetValue = targetFlat[keyPath];

          if (!targetValue) {
            // Key missing in target - skip validation
            continue;
          }

          // Check variable consistency
          const consistencyResult = checkVariableConsistency(sourceValue, targetValue);

          if (consistencyResult.missingInTarget.length > 0) {
            newIssues.push({
              keyPath,
              type: 'variable_missing',
              severity: 'error',
              message: `Missing variables: ${consistencyResult.missingInTarget.join(', ')}`,
              details: {
                expected: Array.from(new Set([
                  ...consistencyResult.missingInTarget,
                  ...consistencyResult.extraInTarget,
                ])),
                actual: consistencyResult.extraInTarget,
              },
            });
          }

          if (consistencyResult.extraInTarget.length > 0) {
            newIssues.push({
              keyPath,
              type: 'variable_extra',
              severity: 'error',
              message: `Extra variables: ${consistencyResult.extraInTarget.join(', ')}`,
              details: {
                expected: consistencyResult.missingInTarget,
                actual: consistencyResult.extraInTarget,
              },
            });
          }

          // Check length anomaly
          const anomalyResult = detectLengthAnomaly(sourceValue, targetValue);

          if (anomalyResult.isAnomaly) {
            newIssues.push({
              keyPath,
              type: 'length_anomaly',
              severity: 'warning',
              message: `Length ratio is ${anomalyResult.ratio.toFixed(1)}x`,
              details: {
                ratio: anomalyResult.ratio,
              },
            });
          }
        }

        setIssues(newIssues);
      } catch (e) {
        // Generic error handling
        newIssues.push({
          keyPath: 'unknown',
          type: 'schema_error',
          severity: 'error',
          message: e instanceof Error ? e.message : 'Unknown validation error',
        });
        setIssues(newIssues);
      } finally {
        setIsValidating(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [sourceContent, targetContent]);

  return { issues, isValidating };
}
