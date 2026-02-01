'use client';

import { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <div className="relative h-full flex flex-col bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
            {format} Output
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all ${
            copied
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex min-h-full">
          {/* Line numbers */}
          <div className="flex-shrink-0 px-3 py-4 bg-zinc-900/30 border-r border-zinc-800/50 select-none sticky left-0">
            {lines.map((_, index) => (
              <div
                key={index}
                className="text-xs text-zinc-600 text-right leading-6 font-mono"
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code content */}
          <pre className="flex-1 px-4 py-4">
            <code className="text-sm text-zinc-200 leading-6 font-mono whitespace-pre">
              {data}
            </code>
          </pre>
        </div>
      </ScrollArea>
    </div>
  );
}
