'use client';

import { useMemo } from 'react';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

interface DiffOperation {
  type: 'MISSING' | 'ORPHANED' | 'TYPE_MISMATCH' | 'VALUE_DIFF' | 'EQUAL';
  keyPath: string;
  sourceValue: unknown;
  targetValue: unknown;
}

interface KeyListProps {
  operations: DiffOperation[];
  selectedKeys: string[];
  onToggleKey: (key: string) => void;
  onSelectAllMissing: () => void;
  onClearSelection: () => void;
}

const typeIcons = {
  MISSING: XCircle,
  ORPHANED: AlertTriangle,
  TYPE_MISMATCH: AlertCircle,
  VALUE_DIFF: AlertCircle,
  EQUAL: CheckCircle,
};

const typeColors = {
  MISSING: 'text-destructive',
  ORPHANED: 'text-yellow-500',
  TYPE_MISMATCH: 'text-blue-500',
  VALUE_DIFF: 'text-orange-500',
  EQUAL: 'text-green-500',
};

const typeLabels = {
  MISSING: 'Missing',
  ORPHANED: 'Orphaned',
  TYPE_MISMATCH: 'Type Mismatch',
  VALUE_DIFF: 'Different Value',
  EQUAL: 'Equal',
};

export function KeyList({
  operations,
  selectedKeys,
  onToggleKey,
  onSelectAllMissing,
  onClearSelection,
}: KeyListProps) {
  const grouped = useMemo(() => {
    const groups: Record<string, DiffOperation[]> = {
      MISSING: [],
      ORPHANED: [],
      TYPE_MISMATCH: [],
      VALUE_DIFF: [],
      EQUAL: [],
    };

    operations.forEach((op) => {
      groups[op.type].push(op);
    });

    return groups;
  }, [operations]);

  const missingCount = grouped.MISSING.length;
  const orphanedCount = grouped.ORPHANED.length;

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <h3 className="text-sm font-semibold text-foreground">Translation Keys</h3>
        <div className="flex items-center gap-3 mt-2 text-xs">
          <span className="text-muted-foreground">
            {operations.length} total keys
          </span>
          {missingCount > 0 && (
            <span className="text-destructive font-medium">
              {missingCount} missing
            </span>
          )}
          {orphanedCount > 0 && (
            <span className="text-yellow-500 font-medium">
              {orphanedCount} orphaned
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onSelectAllMissing}
          disabled={missingCount === 0}
        >
          Select All Missing ({missingCount})
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearSelection}
          disabled={selectedKeys.length === 0}
        >
          Clear ({selectedKeys.length})
        </Button>
      </div>

      {/* Key List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {(['MISSING', 'ORPHANED', 'TYPE_MISMATCH', 'VALUE_DIFF', 'EQUAL'] as const).map(
            (type) => {
              const items = grouped[type];
              if (items.length === 0) return null;

              const Icon = typeIcons[type];
              const color = typeColors[type];
              const label = typeLabels[type];

              return (
                <div key={type} className="mb-4">
                  <div className="px-2 py-1 flex items-center gap-2 mb-1">
                    <Icon className={clsx('w-4 h-4', color)} />
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                      {label} ({items.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {items.map((op) => {
                      const isSelected = selectedKeys.includes(op.keyPath);
                      return (
                        <label
                          key={op.keyPath}
                          className={clsx(
                            'flex items-start gap-2 px-3 py-2 rounded cursor-pointer transition-colors',
                            isSelected
                              ? 'bg-primary/10 border border-primary/50'
                              : 'hover:bg-muted border border-transparent'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => onToggleKey(op.keyPath)}
                            className="mt-1 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground font-mono truncate">
                              {op.keyPath}
                            </p>
                            <div className="mt-1 text-xs space-y-0.5">
                              <p className="text-muted-foreground truncate">
                                <span className="font-semibold">Source:</span>{' '}
                                {JSON.stringify(op.sourceValue)}
                              </p>
                              {op.targetValue !== undefined && (
                                <p className="text-muted-foreground truncate">
                                  <span className="font-semibold">Target:</span>{' '}
                                  {JSON.stringify(op.targetValue)}
                                </p>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
