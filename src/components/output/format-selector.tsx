'use client';

type ExportFormat = 'json' | 'csv' | 'sql' | 'typescript';

interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

const formats: { value: ExportFormat; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'csv', label: 'CSV' },
  { value: 'sql', label: 'SQL' },
  { value: 'typescript', label: 'TypeScript' },
];

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="flex border-b border-zinc-700">
      {formats.map((format) => (
        <button
          key={format.value}
          onClick={() => onChange(format.value)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            value === format.value
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {format.label}
        </button>
      ))}
    </div>
  );
}
