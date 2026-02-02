export type DiffOperationType =
  | 'MISSING'      // Key exists in source but not target
  | 'ORPHANED'     // Key exists in target but not source
  | 'TYPE_MISMATCH'// Value types differ
  | 'VALUE_DIFF'   // Values differ (for review)
  | 'EQUAL';       // No difference

export interface DiffOperation {
  type: DiffOperationType;
  keyPath: string;
  sourceValue: unknown;
  targetValue: unknown;
  children?: DiffOperation[];
}

export interface DiffResult {
  operations: DiffOperation[];
  stats: {
    missing: number;
    orphaned: number;
    typeMismatch: number;
    equal: number;
  };
  sourceKeyOrder: string[];
  targetKeyOrder: string[];
}

export interface MaskResult {
  masked: string;
  tokens: string[];
}

export interface TranslationEntry {
  key: string;
  value: string;
}

export interface ValidationResult {
  success: boolean;
  errors: Array<{ path: string; message: string }>;
}

export interface ConsistencyResult {
  isConsistent: boolean;
  missingInTarget: string[];
  extraInTarget: string[];
}

export interface AnomalyResult {
  isAnomaly: boolean;
  ratio: number;
  sourceLength: number;
  targetLength: number;
}
