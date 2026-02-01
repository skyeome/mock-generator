'use client';

import { AlignLeft, Trash2, Code } from 'lucide-react';

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
      <div className="flex-1 flex flex-col bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
              JSON Input
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleFormat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
              title="Format JSON"
            >
              <AlignLeft className="w-3 h-3" />
              <span>Format</span>
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
              title="Clear"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Line numbers */}
          <div className="py-4 px-3 bg-zinc-900/30 text-zinc-600 text-sm font-mono select-none text-right border-r border-zinc-800/50 overflow-hidden">
            {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
              <div key={i + 1} className="leading-6">{i + 1}</div>
            ))}
          </div>
          {/* Editor */}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your JSON sample here..."
            className="flex-1 p-4 bg-transparent text-zinc-100 font-mono text-sm leading-6 resize-none focus:outline-none placeholder:text-zinc-600"
            spellCheck={false}
          />
        </div>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
