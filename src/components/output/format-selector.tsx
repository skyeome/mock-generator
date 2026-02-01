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
    <div className="flex border-b border-border">
      {formats.map((format) => (
        <button
          key={format.value}
          onClick={() => onChange(format.value)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            value === format.value
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {format.label}
        </button>
      ))}
    </div>
  );
}
