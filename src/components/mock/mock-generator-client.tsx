'use client';

import { useMemo } from 'react';
import { JsonInput } from '@/components/editor/json-input';
import { SchemaView } from '@/components/editor/schema-view';
import { DataPreview } from '@/components/output/data-preview';
import { FormatSelector } from '@/components/output/format-selector';
import { ExportActions } from '@/components/output/export-actions';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { AILoadingOverlay } from '@/components/ui/ai-loading-overlay';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { useSchemaStore } from '@/store/schema-store';
import { useGeneratorStore } from '@/store/generator-store';
import { useExportStore } from '@/store/export-store';
import { useSchemaInference } from '@/hooks/use-schema-inference';
import { useMockGeneration } from '@/hooks/use-mock-generation';
import { useExport } from '@/hooks/use-export';
import type { JsonSchema } from '@/lib/types';
import { Database } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface SchemaField {
  name: string;
  type: string;
  semanticType?: string;
  children?: SchemaField[];
  isArray?: boolean;
}

function getSchemaFieldCount(schema: JsonSchema | null): number {
  if (!schema) return 0;
  // Handle array schema - count fields from items
  if (schema.type === 'array' && schema.items && !Array.isArray(schema.items)) {
    return Object.keys(schema.items.properties || {}).length;
  }
  return Object.keys(schema.properties || {}).length;
}

function convertSchemaToFields(schema: JsonSchema | null): SchemaField[] {
  if (!schema) return [];

  // Handle array schema - extract fields from items
  let targetSchema = schema;
  if (schema.type === 'array' && schema.items && !Array.isArray(schema.items)) {
    targetSchema = schema.items;
  }

  if (!targetSchema.properties) return [];

  return Object.entries(targetSchema.properties).map(([name, propSchema]) => {
    const type = Array.isArray(propSchema.type) ? propSchema.type[0] : propSchema.type;
    const field: SchemaField = {
      name,
      type: type || 'unknown',
    };

    // Add semantic type if available
    if (propSchema['x-faker']) {
      field.semanticType = propSchema['x-faker'].method;
    }

    // Handle arrays
    if (type === 'array' && propSchema.items) {
      field.isArray = true;
      const itemSchema = Array.isArray(propSchema.items) ? propSchema.items[0] : propSchema.items;
      if (itemSchema.properties) {
        field.children = convertSchemaToFields(itemSchema);
      }
    }

    // Handle nested objects
    if (type === 'object' && propSchema.properties) {
      field.children = convertSchemaToFields(propSchema);
    }

    return field;
  });
}

export function MockGeneratorClient() {
  const { inputJson, setInputJson, schema, parseError } = useSchemaStore();
  const { count, setCount, generatedData, isGenerating } = useGeneratorStore();
  const { format, setFormat } = useExportStore();

  const { isUsingAI, analyzeWithAI, cancelAIAnalysis, hasAIEnhancement, aiPreference, setAIPreference } = useSchemaInference();
  const { generate } = useMockGeneration({
    analyzeWithAI,
    aiPreference,
    hasAIEnhancement
  });
  const { exportData } = useExport();

  // Convert schema to fields for SchemaView
  const schemaFields = useMemo(() => convertSchemaToFields(schema), [schema]);

  // Export data for preview
  const exportedData = useMemo(() => {
    if (!generatedData || generatedData.length === 0) return null;
    const result = exportData();
    return result?.content || null;
  }, [generatedData, exportData]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* AI Loading Overlay */}
      <AILoadingOverlay isVisible={isUsingAI} onCancel={cancelAIAnalysis} />

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <Database className="w-5 h-5" />
              Mock Data Generator
            </h1>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* Count Button Group */}
            <div className="inline-flex rounded-md border border-border overflow-hidden">
              {[10, 50, 100, 500].map((preset, index) => (
                <button
                  key={preset}
                  onClick={() => setCount(preset)}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    index < 3 ? 'border-r border-border' : ''
                  } ${
                    count === preset
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {preset}
                </button>
              ))}
              <input
                type="number"
                value={[10, 50, 100, 500].includes(count) ? '' : count}
                onChange={(e) => setCount(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))}
                onFocus={(e) => { if ([10, 50, 100, 500].includes(count)) e.target.value = String(count); }}
                min={1}
                max={1000}
                placeholder="..."
                className={`w-14 px-2 py-1.5 text-sm text-center border-l border-border outline-none placeholder:text-muted-foreground ${
                  ![10, 50, 100, 500].includes(count)
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-muted-foreground'
                }`}
              />
            </div>
            {/* AI Switch */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 border border-border">
              <Switch
                id="ai-mode"
                checked={aiPreference}
                onCheckedChange={setAIPreference}
                disabled={!schema}
                aria-label={aiPreference ? 'AI analysis enabled' : 'AI analysis disabled'}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted border border-border"
              />
              <label
                htmlFor="ai-mode"
                className={`text-sm cursor-pointer select-none whitespace-nowrap ${
                  aiPreference ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {isUsingAI ? 'Analyzing…' : 'AI Analysis'}
              </label>
            </div>
            {/* Generate Button */}
            <Button onClick={generate} loading={isGenerating} disabled={!schema}>
              Generate
            </Button>
          </div>
        </div>
      </header>

      {/* Main content - Resizable split layout */}
      <main className="h-[calc(100vh-65px)] pb-12">
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-full"
          defaultLayout={{ "input-panel": 40, "output-panel": 60 }}
        >
          {/* Left panel - JSON Input */}
          <ResizablePanel id="input-panel" minSize="25%" maxSize="60%">
            <div className="h-full p-4 flex flex-col">
              <JsonInput value={inputJson} onChange={setInputJson} error={parseError} />
            </div>
          </ResizablePanel>

          {/* Resizable Handle */}
          <ResizableHandle withHandle className="bg-border hover:bg-border/80 transition-colors" />

          {/* Right panel - Schema & Output */}
          <ResizablePanel id="output-panel" minSize="40%">
            <div className="h-full flex flex-col p-4">
              {/* Format tabs */}
              <div className="mb-4">
                <FormatSelector value={format} onChange={setFormat} />
              </div>

              {/* Content area */}
              <div className="flex-1 min-h-0 flex flex-col">
                {exportedData ? (
                  <DataPreview data={exportedData} format={format} />
                ) : (
                  <SchemaView schema={schemaFields} />
                )}
              </div>

              {/* Export actions */}
              {exportedData && (
                <div className="mt-4">
                  <ExportActions
                    data={exportedData}
                    format={format}
                    recordCount={generatedData.length}
                  />
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      {/* Status bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 bg-card border-t border-border px-6 py-2.5 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {schema ? (
            <>
              <span className="text-primary font-medium">{getSchemaFieldCount(schema)}</span>
              <span className="text-muted-foreground"> fields detected</span>
            </>
          ) : (
            <span className="text-muted-foreground">Paste JSON to get started</span>
          )}
        </span>
        {hasAIEnhancement && (
          <span className="text-xs text-primary/80 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI Enhanced
          </span>
        )}
      </footer>
    </div>
  );
}
