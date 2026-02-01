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
    <div className="relative h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {format} Output
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all ${copied
              ? 'bg-primary/20 text-primary'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
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

      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="flex">
          {/* Line numbers */}
          <div className="shrink-0 px-3 py-4 bg-muted/30 border-r border-border/50 select-none sticky left-0">
            {lines.map((_, index) => (
              <div
                key={index}
                className="text-xs text-muted-foreground text-right leading-6 font-mono"
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code content */}
          <pre className="flex-1 px-4 py-4">
            <code className="text-sm text-foreground leading-6 font-mono whitespace-pre">
              {data}
            </code>
          </pre>
        </div>
      </ScrollArea>
    </div>
  );
}
