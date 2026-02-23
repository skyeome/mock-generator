import type { JsonFormatResult } from '@/lib/json-validator/types';

function parseJson(input: string): unknown {
  return JSON.parse(input);
}

export function prettifyJson(input: string): JsonFormatResult {
  try {
    const parsed = parseJson(input);

    return {
      success: true,
      output: JSON.stringify(parsed, null, 2),
    };
  } catch {
    return {
      success: false,
      output: '',
      error: 'Invalid JSON syntax',
    };
  }
}

export function minifyJson(input: string): JsonFormatResult {
  try {
    const parsed = parseJson(input);

    return {
      success: true,
      output: JSON.stringify(parsed),
    };
  } catch {
    return {
      success: false,
      output: '',
      error: 'Invalid JSON syntax',
    };
  }
}
