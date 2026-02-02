export interface AnomalyResult {
  isAnomaly: boolean;
  ratio: number;
  sourceLength: number;
  targetLength: number;
}

export interface AnomalyOptions {
  threshold?: number; // Default 5x
}

export function detectLengthAnomaly(
  source: string,
  target: string,
  options: AnomalyOptions = {}
): AnomalyResult {
  const { threshold = 5 } = options;

  const sourceLength = source.length;
  const targetLength = target.length;

  if (sourceLength === 0) {
    return {
      isAnomaly: targetLength > 0,
      ratio: Infinity,
      sourceLength,
      targetLength
    };
  }

  const ratio = targetLength / sourceLength;

  return {
    isAnomaly: ratio > threshold,
    ratio,
    sourceLength,
    targetLength
  };
}
