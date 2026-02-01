'use client';

import { useState, useCallback } from 'react';

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
      <div className="flex-1 flex bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
        {/* Line numbers */}
        <div className="py-4 px-3 bg-zinc-900 text-zinc-500 text-sm font-mono select-none text-right">
          {Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>
        {/* Editor */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste your JSON sample here..."
          className="flex-1 p-4 bg-transparent text-zinc-100 font-mono text-sm resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2 mt-3">
        <button onClick={handleFormat} className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded text-sm">
          Format JSON
        </button>
        <button onClick={handleClear} className="px-3 py-1.5 bg-transparent hover:bg-zinc-800 text-zinc-400 rounded text-sm">
          Clear
        </button>
      </div>
    </div>
  );
}
