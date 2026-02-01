export interface JsonExportOptions {
  indent?: number;
}

/**
 * Export data as formatted JSON string
 */
export function exportToJson(
  data: unknown[],
  options: JsonExportOptions = {}
): string {
  const { indent = 2 } = options;
  return JSON.stringify(data, null, indent);
}
