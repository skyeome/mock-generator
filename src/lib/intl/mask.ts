/**
 * Variable masking utilities for translation
 * Masks variables like {count}, {{name}}, etc. before translation
 * to preserve them during AI translation
 */

export interface VariableMask {
  placeholder: string;
  original: string;
}

/**
 * Mask variables in text before translation
 * Replaces {var}, {{var}}, %s, %d patterns with placeholders
 */
export function maskVariables(text: string): {
  maskedText: string;
  variables: VariableMask[];
} {
  const variables: VariableMask[] = [];
  let maskedText = text;
  let counter = 0;

  // Match various variable patterns
  const patterns = [
    /\{\{[^}]+\}\}/g, // {{variable}}
    /\{[^}]+\}/g,     // {variable}
    /%[sd]/g,         // %s, %d
  ];

  for (const pattern of patterns) {
    maskedText = maskedText.replace(pattern, (match) => {
      const placeholder = `__VAR_${counter}__`;
      variables.push({ placeholder, original: match });
      counter++;
      return placeholder;
    });
  }

  return { maskedText, variables };
}

/**
 * Unmask variables after translation
 * Replaces placeholders back with original variables
 */
export function unmaskVariables(
  text: string,
  variables: VariableMask[]
): string {
  let result = text;

  for (const { placeholder, original } of variables) {
    result = result.replace(placeholder, original);
  }

  return result;
}
