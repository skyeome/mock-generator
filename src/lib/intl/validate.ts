/**
 * Translation validation utilities
 * Validates translated content for quality issues
 */

import type { TranslationEntry, ValidationError } from '@/store/intl-store';

/**
 * Validate all translations for common issues
 */
export function validateTranslations(
  translations: TranslationEntry[],
  sourceParsed: Record<string, unknown>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const entry of translations) {
    if (entry.status !== 'completed') continue;

    // Check for variable mismatches
    const originalVars = extractVariables(entry.original);
    const translatedVars = extractVariables(entry.translated);

    if (!arraysEqual(originalVars, translatedVars)) {
      errors.push({
        keyPath: entry.key,
        type: 'variable_mismatch',
        message: `Variable mismatch: expected ${originalVars.join(', ')}, got ${translatedVars.join(', ')}`,
      });
    }

    // Check for length anomalies (translated text too different in length)
    const lengthRatio = entry.translated.length / entry.original.length;
    if (lengthRatio > 3 || lengthRatio < 0.3) {
      errors.push({
        keyPath: entry.key,
        type: 'length_anomaly',
        message: `Length anomaly: original=${entry.original.length}, translated=${entry.translated.length}`,
      });
    }

    // Check for absolute length limits
    if (entry.translated.length > 1000) {
      errors.push({
        keyPath: entry.key,
        type: 'length_anomaly',
        message: 'Translation exceeds maximum length of 1000 characters',
      });
    }
  }

  return errors;
}

/**
 * Extract variables from text
 */
function extractVariables(text: string): string[] {
  const variables: string[] = [];
  const patterns = [
    /\{\{([^}]+)\}\}/g, // {{variable}}
    /\{([^}]+)\}/g,     // {variable}
    /(%[sd])/g,         // %s, %d
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      variables.push(match[0]);
    }
  }

  return variables.sort();
}

/**
 * Check if two arrays are equal
 */
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
