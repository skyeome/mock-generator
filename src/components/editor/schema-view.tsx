'use client';

import { useState } from 'react';

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
      <div className="flex items-center gap-2 py-1.5 px-3 hover:bg-zinc-900/50">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-500 hover:text-zinc-300 w-4 h-4 flex items-center justify-center"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}

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
      <div className="h-full flex items-center justify-center text-zinc-500">
        <p>No schema detected. Paste valid JSON to see the inferred schema.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-950 rounded-lg border border-zinc-800 p-4">
      <div className="text-zinc-400 text-sm mb-4 font-semibold">Inferred Schema</div>
      {schema.map((field, idx) => (
        <SchemaFieldItem key={idx} field={field} />
      ))}
    </div>
  );
}
