import { VARIABLE_PATTERNS } from './patterns';

export interface MaskResult {
  masked: string;
  tokens: string[];
}

export function maskVariables(text: string): MaskResult {
  const tokens: string[] = [];

  const masked = text.replace(VARIABLE_PATTERNS.all, (match) => {
    const index = tokens.length;
    tokens.push(match);
    return `__VAR_${index}__`;
  });

  return { masked, tokens };
}
