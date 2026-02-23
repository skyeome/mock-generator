import type { JsonValidationResult } from '@/lib/json-validator/types';

const POSITION_PATTERN = /at position\s+(\d+)/i;

function parseOffset(errorMessage: string): number | undefined {
  const matched = errorMessage.match(POSITION_PATTERN);

  if (!matched || !matched[1]) {
    return undefined;
  }

  const parsed = Number.parseInt(matched[1], 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

function computeLineColumn(input: string, offset: number): { line: number; column: number } {
  const safeOffset = Math.min(offset, input.length);
  let line = 1;
  let column = 1;

  for (let index = 0; index < safeOffset; index += 1) {
    const char = input[index];

    if (char === '\r') {
      if (input[index + 1] === '\n') {
        index += 1;
      }

      line += 1;
      column = 1;
      continue;
    }

    if (char === '\n') {
      line += 1;
      column = 1;
      continue;
    }

    column += 1;
  }

  return { line, column };
}

function getErrorDetails(error: unknown): string | undefined {
  if (error instanceof SyntaxError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return undefined;
}

export function validateJson(input: string): JsonValidationResult {
  try {
    JSON.parse(input);

    return {
      valid: true,
      errors: [],
    };
  } catch (error) {
    const details = getErrorDetails(error);
    const parsedOffset = details ? parseOffset(details) : undefined;
    const offset = parsedOffset ?? 0;
    const position = parsedOffset === undefined ? { line: 1, column: 1 } : computeLineColumn(input, offset);

    return {
      valid: false,
      errors: [
        {
          message: 'Invalid JSON syntax',
          offset,
          line: position.line,
          column: position.column,
        },
      ],
    };
  }
}
