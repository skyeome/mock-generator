export function unmaskVariables(masked: string, tokens: string[]): string {
  // Count expected placeholders first
  const placeholderMatches = masked.match(/__VAR_\d+__/g) || [];
  const expectedCount = tokens.length;

  if (placeholderMatches.length !== expectedCount) {
    throw new Error(
      `Variable count mismatch: expected ${expectedCount} but found ${placeholderMatches.length}`
    );
  }

  let result = masked;

  result = result.replace(/__VAR_(\d+)__/g, (match, indexStr) => {
    const index = parseInt(indexStr, 10);

    if (index >= tokens.length) {
      throw new Error(`Token index ${index} out of bounds (have ${tokens.length} tokens)`);
    }

    return tokens[index];
  });

  return result;
}
