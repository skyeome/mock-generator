export interface SqlExportOptions {
  tableName: string;
  dialect?: 'mysql' | 'postgresql' | 'sqlite';
}

/**
 * Escape a value for SQL
 */
function escapeSqlValue(value: unknown, dialect: string): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'boolean') {
    if (dialect === 'sqlite') {
      return value ? '1' : '0';
    }
    return value ? 'TRUE' : 'FALSE';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    // Serialize objects/arrays as JSON strings
    return escapeSqlValue(JSON.stringify(value), dialect);
  }

  // String - escape single quotes
  const str = String(value);
  return "'" + str.replace(/'/g, "''") + "'";
}

/**
 * Export data as SQL INSERT statements
 */
export function exportToSql(
  data: unknown[],
  options: SqlExportOptions
): string {
  if (data.length === 0) {
    return '';
  }

  const { tableName, dialect = 'mysql' } = options;

  // Get columns from first record
  const firstRecord = data[0] as Record<string, unknown>;
  const columns = Object.keys(firstRecord);

  // Build column list
  const columnList = columns.join(', ');

  // Build value rows
  const valueRows = data.map(record => {
    const rec = record as Record<string, unknown>;
    const values = columns.map(col => escapeSqlValue(rec[col], dialect));
    return '(' + values.join(', ') + ')';
  });

  // Combine into INSERT statement
  return `INSERT INTO ${tableName} (${columnList}) VALUES\n${valueRows.join(',\n')};`;
}
