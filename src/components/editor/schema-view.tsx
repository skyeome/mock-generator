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
    string: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50',
    number: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50',
    boolean: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/50',
    array: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/50',
    object: 'bg-secondary text-secondary-foreground border-border',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs border ${colors[type] || colors.object}`}>
      {type}
    </span>
  );
}

function SemanticBadge({ type }: { type: string }) {
  return (
    <span className="px-2 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/50">
      {type}
    </span>
  );
}

function SchemaFieldItem({ field, depth = 0 }: { field: SchemaField; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const hasChildren = field.children && field.children.length > 0;

  return (
    <div className="border-l border-border" style={{ marginLeft: `${depth * 16}px` }}>
      <div className="flex items-center gap-2 py-1.5 px-3 hover:bg-muted/50 rounded-r transition-colors">
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground hover:text-foreground w-4 h-4 flex items-center justify-center transition-colors"
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

        <span className="font-mono text-sm text-foreground">
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
      <div className="flex-1 flex items-center justify-center text-muted-foreground bg-card rounded-lg border border-border">
        <p>No schema detected. Paste valid JSON to see the inferred schema.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
        <FileJson className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Inferred Schema</h3>
        <span className="text-xs text-muted-foreground">({schema.length} fields)</span>
      </div>
      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="p-4">
          {schema.map((field, idx) => (
            <SchemaFieldItem key={idx} field={field} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
