'use client';

import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportPanelProps {
  onExport: () => string;
  disabled?: boolean;
}

export function ExportPanel({ onExport, disabled }: ExportPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const content = onExport();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'translation-result.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const content = onExport();
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-muted border-t border-border rounded-b-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">Export Result</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleCopy}
          disabled={disabled}
          variant="secondary"
          size="sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </>
          )}
        </Button>
        <Button onClick={handleDownload} disabled={disabled} size="sm">
          <Download className="w-4 h-4 mr-2" />
          Download JSON
        </Button>
      </div>
    </div>
  );
}
