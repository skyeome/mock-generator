export interface CsvExportOptions {
  delimiter?: string;
  includeHeader?: boolean;
}

/**
 * Escape a value for CSV format
 */
function escapeCsvValue(value: unknown, delimiter: string): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    // Arrays and objects are serialized as JSON
    return escapeCsvValue(JSON.stringify(value), delimiter);
  }

  const str = String(value);

  // Check if escaping is needed
  if (str.includes('"') || str.includes(delimiter) || str.includes('\n') || str.includes('\r')) {
    // Escape quotes by doubling them and wrap in quotes
    return '"' + str.replace(/"/g, '""') + '"';
  }

  return str;
}

/**
 * Flatten a nested object into a flat object with dot notation keys
 */
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Export data as CSV string
 */
export function exportToCsv(
  data: unknown[],
  options: CsvExportOptions = {}
): string {
  if (data.length === 0) {
    return '';
  }

  const { delimiter = ',', includeHeader = true } = options;

  // Flatten all objects
  const flattenedData = data.map(item => {
    if (typeof item === 'object' && item !== null) {
      return flattenObject(item as Record<string, unknown>);
    }
    return { value: item };
  });

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  flattenedData.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });
  const headers = Array.from(allKeys);

  const lines: string[] = [];

  // Add header row
  if (includeHeader) {
    lines.push(headers.join(delimiter));
  }

  // Add data rows
  flattenedData.forEach(item => {
    const values = headers.map(key => escapeCsvValue(item[key], delimiter));
    lines.push(values.join(delimiter));
  });

  return lines.join('\n');
}
