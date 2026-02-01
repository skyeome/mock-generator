'use client';

type ExportFormat = 'json' | 'csv' | 'sql' | 'typescript';

interface FormatOptionsProps {
  format: ExportFormat;
  options: FormatOptionValues;
  onChange: (options: FormatOptionValues) => void;
}

export interface FormatOptionValues {
  // JSON options
  jsonIndent?: 2 | 4;

  // CSV options
  csvDelimiter?: ',' | ';' | '\t' | '|';
  csvIncludeHeaders?: boolean;

  // SQL options
  sqlTableName?: string;
  sqlDialect?: 'mysql' | 'postgresql' | 'sqlite';

  // TypeScript options
  tsInterfaceName?: string;
}

export function FormatOptions({ format, options, onChange }: FormatOptionsProps) {
  const updateOption = <K extends keyof FormatOptionValues>(
    key: K,
    value: FormatOptionValues[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  if (format === 'json') {
    return (
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
        <h3 className="text-sm font-medium text-zinc-200 mb-3">JSON Options</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Indentation
            </label>
            <select
              value={options.jsonIndent ?? 2}
              onChange={(e) => updateOption('jsonIndent', Number(e.target.value) as 2 | 4)}
              className="w-full px-3 py-2 bg-zinc-800 text-zinc-200 text-sm rounded border border-zinc-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (format === 'csv') {
    return (
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
        <h3 className="text-sm font-medium text-zinc-200 mb-3">CSV Options</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Delimiter
            </label>
            <select
              value={options.csvDelimiter ?? ','}
              onChange={(e) => updateOption('csvDelimiter', e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-800 text-zinc-200 text-sm rounded border border-zinc-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="csv-headers"
              checked={options.csvIncludeHeaders ?? true}
              onChange={(e) => updateOption('csvIncludeHeaders', e.target.checked)}
              className="w-4 h-4 text-emerald-600 bg-zinc-800 border-zinc-700 rounded focus:ring-emerald-500"
            />
            <label htmlFor="csv-headers" className="ml-2 text-sm text-zinc-300">
              Include headers
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (format === 'sql') {
    return (
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
        <h3 className="text-sm font-medium text-zinc-200 mb-3">SQL Options</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Table Name
            </label>
            <input
              type="text"
              value={options.sqlTableName ?? 'mock_data'}
              onChange={(e) => updateOption('sqlTableName', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 text-zinc-200 text-sm rounded border border-zinc-700 focus:border-emerald-500 focus:outline-none"
              placeholder="mock_data"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              SQL Dialect
            </label>
            <select
              value={options.sqlDialect ?? 'postgresql'}
              onChange={(e) => updateOption('sqlDialect', e.target.value as any)}
              className="w-full px-3 py-2 bg-zinc-800 text-zinc-200 text-sm rounded border border-zinc-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="sqlite">SQLite</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  if (format === 'typescript') {
    return (
      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
        <h3 className="text-sm font-medium text-zinc-200 mb-3">TypeScript Options</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Interface Name
            </label>
            <input
              type="text"
              value={options.tsInterfaceName ?? 'MockData'}
              onChange={(e) => updateOption('tsInterfaceName', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 text-zinc-200 text-sm rounded border border-zinc-700 focus:border-emerald-500 focus:outline-none"
              placeholder="MockData"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
