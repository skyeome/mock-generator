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

    const filename = `mock-data.${extensions[format]}`;
    const blob = new Blob([data], { type: 'text/plain' });
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
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-t border-zinc-800 rounded-b-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">
          {recordCount} {recordCount === 1 ? 'record' : 'records'}
        </span>
        <span className="px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 rounded">
          {format.toUpperCase()}
        </span>
      </div>

      <button
        onClick={handleDownload}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors border border-emerald-500"
      >
        <Download className="w-4 h-4" />
        <span>Download</span>
      </button>
    </div>
  );
}
