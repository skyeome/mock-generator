'use client';

import { useState } from 'react';

interface ExportActionsProps {
  data: string;
  format: 'json' | 'csv' | 'sql' | 'typescript';
  recordCount: number;
}

export function ExportActions({ data, format, recordCount }: ExportActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-t border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">
          {recordCount} {recordCount === 1 ? 'record' : 'records'}
        </span>
        <span className="px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 rounded">
          {format.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
          }`}
        >
          {copied ? '✓ Copied to Clipboard' : 'Copy to Clipboard'}
        </button>

        <button
          onClick={handleDownload}
          className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-colors"
        >
          Download
        </button>
      </div>
    </div>
  );
}
