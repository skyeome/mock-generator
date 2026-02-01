'use client';

import { useMemo } from 'react';
import { JsonInput } from '@/components/editor/json-input';
import { SchemaView } from '@/components/editor/schema-view';
import { DataPreview } from '@/components/output/data-preview';
import { FormatSelector } from '@/components/output/format-selector';
import { ExportActions } from '@/components/output/export-actions';
import { Button } from '@/components/ui/button';
import { useSchemaStore } from '@/store/schema-store';
import { useGeneratorStore } from '@/store/generator-store';
import { useExportStore } from '@/store/export-store';
import { useSchemaInference } from '@/hooks/use-schema-inference';
import { useMockGeneration } from '@/hooks/use-mock-generation';
import { useExport } from '@/hooks/use-export';
import type { JsonSchema } from '@/lib/types';

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

export default function Home() {
  const { inputJson, setInputJson, schema, parseError } = useSchemaStore();
  const { count, setCount, generatedData, isGenerating } = useGeneratorStore();
  const { format, setFormat } = useExportStore();

  useSchemaInference();
  const { generate } = useMockGeneration();
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
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-bold text-emerald-400">Mock Data Generator</h1>
      </header>

      {/* Main content - split layout */}
      <main className="flex h-[calc(100vh-65px)]">
        {/* Left panel - JSON Input */}
        <div className="w-2/5 p-4 border-r border-zinc-800">
          <JsonInput value={inputJson} onChange={setInputJson} error={parseError} />
        </div>

        {/* Right panel - Schema & Output */}
        <div className="flex-1 flex flex-col p-4">
          {/* Tabs and controls */}
          <div className="flex items-center justify-between mb-4">
            <FormatSelector value={format} onChange={setFormat} />
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min={1}
                max={1000}
                className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
              />
              <Button onClick={generate} loading={isGenerating} disabled={!schema}>
                Generate
              </Button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            {exportedData ? (
              <DataPreview data={exportedData} format={format} />
            ) : (
              <SchemaView schema={schemaFields} />
            )}
          </div>

          {/* Export actions */}
          {exportedData && (
            <ExportActions
              data={exportedData}
              format={format}
              recordCount={generatedData.length}
            />
          )}
        </div>
      </main>

      {/* Status bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500">
        {schema ? `Schema detected: ${getSchemaFieldCount(schema)} fields` : 'Paste JSON to get started'}
      </footer>
    </div>
  );
}
