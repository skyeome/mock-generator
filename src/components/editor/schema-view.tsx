'use client';

import { useState } from 'react';
import { FileJson, ChevronDown, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SchemaField {
  name: string;
  type: string;
  semanticType?: string;
  children?: SchemaField[];
  isArray?: boolean;
}

interface SchemaViewProps {
  schema: SchemaField[];
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    string: 'bg-green-900/50 text-green-300 border-green-700',
    number: 'bg-blue-900/50 text-blue-300 border-blue-700',
    boolean: 'bg-purple-900/50 text-purple-300 border-purple-700',
    array: 'bg-orange-900/50 text-orange-300 border-orange-700',
    object: 'bg-zinc-700 text-zinc-300 border-zinc-600',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${colors[type] || colors.object}`}>
      {type}
    </span>
  );
}

function SemanticBadge({ type }: { type: string }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs bg-indigo-900/50 text-indigo-300 border border-indigo-700">
      {type}
    </span>
  );
}

function SchemaFieldItem({ field, depth = 0 }: { field: SchemaField; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = field.children && field.children.length > 0;

  return (
    <div className="border-l border-zinc-800" style={{ marginLeft: `${depth * 16}px` }}>
      <div className="flex items-center gap-2 py-1.5 px-3 hover:bg-zinc-900/50 rounded-r transition-colors">
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-500 hover:text-zinc-300 w-4 h-4 flex items-center justify-center transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <span className="font-mono text-sm text-zinc-300">
          {field.name}
          {field.isArray && '[]'}
        </span>

        <TypeBadge type={field.type} />

        {field.semanticType && <SemanticBadge type={field.semanticType} />}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {field.children!.map((child, idx) => (
            <SchemaFieldItem key={idx} field={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SchemaView({ schema }: SchemaViewProps) {
  if (!schema || schema.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 bg-zinc-950 rounded-lg border border-zinc-800">
        <p>No schema detected. Paste valid JSON to see the inferred schema.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <FileJson className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Inferred Schema</h3>
        <span className="text-xs text-zinc-500">({schema.length} fields)</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {schema.map((field, idx) => (
            <SchemaFieldItem key={idx} field={field} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
