'use client';

import { useCallback } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface DiffViewerProps {
  source: string;
  target: string;
  onTargetChange?: (value: string) => void;
  onKeySelect?: (keyPath: string) => void;
  readOnly?: boolean;
  height?: string | number;
}

export function DiffViewer({
  source,
  target,
  onTargetChange,
  onKeySelect,
  readOnly = false,
  height = '400px'
}: DiffViewerProps) {
  const { resolvedTheme } = useTheme();

  const handleEditorMount = useCallback((editor: any) => {
    // Add click handler for key selection
    const modifiedEditor = editor.getModifiedEditor();

    modifiedEditor.onMouseDown((e: any) => {
      if (!onKeySelect || !e.target.position) return;

      const model = modifiedEditor.getModel();
      if (!model) return;

      const line = model.getLineContent(e.target.position.lineNumber);
      const keyMatch = line.match(/"([^"]+)":/);
      if (keyMatch) {
        onKeySelect(keyMatch[1]);
      }
    });

    // Handle changes to modified editor
    if (onTargetChange) {
      modifiedEditor.onDidChangeModelContent(() => {
        const value = modifiedEditor.getValue();
        onTargetChange(value);
      });
    }
  }, [onKeySelect, onTargetChange]);

  return (
    <div
      data-testid="monaco-diff-editor"
      className="border rounded-lg overflow-hidden"
      style={{ height }}
    >
      <DiffEditor
        original={source}
        modified={target}
        language="json"
        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          readOnly,
          renderSideBySide: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          folding: true,
          lineNumbers: 'on',
          wordWrap: 'on',
          fontSize: 13,
          automaticLayout: true,
          originalEditable: false,
        }}
        onMount={handleEditorMount}
      />
    </div>
  );
}
