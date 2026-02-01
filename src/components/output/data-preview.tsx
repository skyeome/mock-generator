'use client';

import { useState } from 'react';

interface DataPreviewProps {
  data: string;
  format: 'json' | 'csv' | 'sql' | 'typescript';
}

export function DataPreview({ data, format }: DataPreviewProps) {
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

  const lines = data.split('\n');

  return (
    <div className="relative h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
          {format} Output
        </span>
        <button
          onClick={handleCopy}
          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Line numbers */}
          <div className="flex-shrink-0 px-3 py-4 bg-zinc-950 border-r border-zinc-800 select-none">
            {lines.map((_, index) => (
              <div
                key={index}
                className="text-xs text-zinc-600 text-right leading-6"
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code content */}
          <pre className="flex-1 px-4 py-4 overflow-x-auto">
            <code className="text-sm text-zinc-200 leading-6 font-mono">
              {data}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
