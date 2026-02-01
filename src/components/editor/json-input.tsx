'use client';

import { AlignLeft, Trash2, Code } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

export function JsonInput({ value, onChange, error }: JsonInputProps) {
  const lineCount = value.split('\n').length;

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch {
      // Invalid JSON, can't format
    }
  };

  const handleClear = () => onChange('');

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col bg-card rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
              JSON Input
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleFormat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              title="Format JSON"
            >
              <AlignLeft className="w-3 h-3" />
              <span>Format</span>
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
              title="Clear"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Editor area */}
        <ScrollArea className="flex-1 min-h-0 overflow-hidden">
          <div className="flex min-h-full">
            {/* Line numbers */}
            <div className="shrink-0 py-4 px-3 bg-muted/30 text-muted-foreground text-sm font-mono select-none text-right border-r border-border/50 sticky left-0">
              {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
                <div key={i + 1} className="leading-6">{i + 1}</div>
              ))}
            </div>
            {/* Editor */}
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Paste your JSON sample here..."
              className="flex-1 p-4 bg-transparent text-foreground font-mono text-sm leading-6 resize-none focus:outline-none placeholder:text-muted-foreground min-h-full"
              spellCheck={false}
            />
          </div>
        </ScrollArea>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/50 rounded text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
