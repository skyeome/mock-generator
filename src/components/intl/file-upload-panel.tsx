'use client';

import { useCallback, useState } from 'react';
import { Upload, FileJson, X } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { clsx } from 'clsx';

interface FileUploadPanelProps {
  label: string;
  locale: string;
  onLocaleChange: (locale: string) => void;
  onFileContent: (content: string) => void;
  error?: string | null;
  fileName?: string;
}

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: 'Korean' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
];

export function FileUploadPanel({
  label,
  locale,
  onLocaleChange,
  onFileContent,
  error,
  fileName,
}: FileUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileRead = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileContent(content);
      };
      reader.readAsText(file);
    },
    [onFileContent]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const jsonFile = files.find((f) => f.name.endsWith('.json'));

      if (jsonFile) {
        handleFileRead(jsonFile);
      }
    },
    [handleFileRead]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileRead(file);
      }
    },
    [handleFileRead]
  );

  const handleClear = useCallback(() => {
    onFileContent('');
  }, [onFileContent]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">
          {label}
        </label>
        <Select
          value={locale}
          onChange={(e) => onLocaleChange(e.target.value)}
          options={LOCALES}
          className="w-40"
        />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          'relative border-2 border-dashed rounded-lg p-6 transition-all',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/50',
          error && 'border-destructive'
        )}
      >
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id={`file-input-${label}`}
        />

        {fileName ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileJson className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground">JSON file loaded</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="w-10 h-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop JSON file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Accepts .json files only
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-2 bg-destructive/10 border border-destructive/50 rounded text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
