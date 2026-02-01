'use client';

import { Download } from 'lucide-react';

interface ExportActionsProps {
  data: string;
  format: 'json' | 'csv' | 'sql' | 'typescript';
  recordCount: number;
}

export function ExportActions({ data, format, recordCount }: ExportActionsProps) {
  const handleDownload = () => {
    const extensions: Record<typeof format, string> = {
      json: 'json',
      csv: 'csv',
      sql: 'sql',
      typescript: 'ts',
    };

    const mimeTypes: Record<typeof format, string> = {
      json: 'application/json',
      csv: 'text/csv',
      sql: 'application/sql',
      typescript: 'text/typescript',
    };

    const filename = `mock-data.${extensions[format]}`;
    const blob = new Blob([data], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-muted border-t border-border rounded-b-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {recordCount} {recordCount === 1 ? 'record' : 'records'}
        </span>
        <span className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded">
          {format.toUpperCase()}
        </span>
      </div>

      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Download</span>
      </button>
    </div>
  );
}
