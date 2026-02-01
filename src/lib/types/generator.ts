import type { SemanticType, JsonSchema } from './schema';

export interface GeneratorConfig {
  count: number;
  seed?: number;
  locale?: string;
}

export interface FieldOverride {
  path: string;
  semantic: SemanticType;
  fixedValue?: unknown;
  nullProbability?: number;
}

export interface GenerationResult {
  data: unknown[];
  schema: JsonSchema;
  duration: number;
}

export type ExportFormat = 'json' | 'csv' | 'sql' | 'typescript';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  // CSV options
  delimiter?: ',' | ';' | '\t';
  includeHeader?: boolean;
  // SQL options
  tableName?: string;
  dialect?: 'mysql' | 'postgresql' | 'sqlite';
  // TypeScript options
  interfaceName?: string;
}
