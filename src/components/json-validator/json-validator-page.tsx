'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useJsonValidator } from '@/hooks/use-json-validator';
import { ControlBar } from '@/components/json-validator/control-bar';
import { ErrorPanel, type EditorValidationError } from '@/components/json-validator/error-panel';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

interface EditorMarker {
  startLineNumber: number;
  startColumn: number;
  message: string;
  severity: number;
}

function normalizeMarkerMessage(message: string): string {
  return message.replace(/\s+/g, ' ').trim();
}

export function JsonValidatorPage() {
  const { input, setInput, prettify, minify, copyToClipboard, reset } = useJsonValidator();
  const [copied, setCopied] = useState(false);
  const [editorErrors, setEditorErrors] = useState<EditorValidationError[]>([]);

  const hasInput = input.trim().length > 0;
  const isValid = hasInput && editorErrors.length === 0;

  const statusLabel = useMemo(() => {
    if (!hasInput) {
      return {
        text: 'Waiting for input',
        variant: 'secondary' as const,
      };
    }

    if (isValid) {
      return {
        text: 'Valid JSON',
        variant: 'success' as const,
      };
    }

    return {
      text: `${editorErrors.length} error${editorErrors.length === 1 ? '' : 's'}`,
      variant: 'error' as const,
    };
  }, [editorErrors.length, hasInput, isValid]);

  const handleValidate = (markers: EditorMarker[]) => {
    const errors = markers
      .filter((marker) => marker.severity === 8)
      .map((marker) => ({
        line: marker.startLineNumber,
        column: marker.startColumn,
        message: normalizeMarkerMessage(marker.message),
      }));

    setEditorErrors(errors);
  };

  const handleCopy = async () => {
    const didCopy = await copyToClipboard();

    if (!didCopy) {
      return;
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-xl text-foreground">JSON Validator</CardTitle>
          <Badge variant={statusLabel.variant}>{statusLabel.text}</Badge>
        </div>
        <CardDescription className="text-muted-foreground">
          Validate, format, and quickly fix JSON payloads.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ControlBar
          canFormat={isValid}
          canCopy={hasInput}
          canReset={hasInput}
          copied={copied}
          onPrettify={prettify}
          onMinify={minify}
          onCopy={handleCopy}
          onReset={reset}
        />

        <div className="overflow-hidden rounded-lg border border-border">
          <MonacoEditor
            height="420px"
            language="json"
            value={input}
            onChange={(value) => setInput(value ?? '')}
            onValidate={handleValidate}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              automaticLayout: true,
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        <ErrorPanel hasInput={hasInput} isValid={isValid} errors={editorErrors} />
      </CardContent>
    </Card>
  );
}
