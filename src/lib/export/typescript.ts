export interface TypeScriptExportOptions {
  interfaceName: string;
  exportKeyword?: boolean;
}

/**
 * Infer TypeScript type from a value
 */
function inferType(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return 'unknown';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'unknown[]';
    }
    const itemType = inferType(value[0]);
    return `${itemType}[]`;
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const properties = Object.entries(obj)
      .map(([key, val]) => `  ${key}: ${inferType(val)};`)
      .join('\n');
    return `{\n${properties}\n}`;
  }

  if (typeof value === 'string') {
    return 'string';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  return 'unknown';
}

/**
 * Build TypeScript interface from a record
 */
function buildInterface(
  record: Record<string, unknown>,
  interfaceName: string,
  exportKeyword: boolean
): string {
  const properties = Object.entries(record)
    .map(([key, value]) => {
      const type = inferType(value);
      return `  ${key}: ${type};`;
    })
    .join('\n');

  const exportStr = exportKeyword ? 'export ' : '';
  return `${exportStr}interface ${interfaceName} {\n${properties}\n}`;
}

/**
 * Export data as TypeScript interface definition
 */
export function exportToTypeScript(
  data: unknown[],
  options: TypeScriptExportOptions
): string {
  const { interfaceName, exportKeyword = true } = options;

  if (data.length === 0) {
    const exportStr = exportKeyword ? 'export ' : '';
    return `${exportStr}interface ${interfaceName} {\n}`;
  }

  // Use first record as template
  const firstRecord = data[0] as Record<string, unknown>;
  return buildInterface(firstRecord, interfaceName, exportKeyword);
}
