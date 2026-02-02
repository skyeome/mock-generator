'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, AlertTriangle, XCircle, RefreshCw, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clsx } from 'clsx';

interface DiffOperation {
  type: 'MISSING' | 'ORPHANED' | 'TYPE_MISMATCH' | 'VALUE_DIFF' | 'EQUAL';
  keyPath: string;
  sourceValue: unknown;
  targetValue: unknown;
}

interface ValidationResult {
  keyPath: string;
  severity: 'error' | 'warning';
  message: string;
}

interface KeyTreeProps {
  operations: DiffOperation[];
  selectedKeys: string[];
  onToggleKey: (key: string) => void;
  onSelectKey: (key: string) => void;
  validationResults?: ValidationResult[];
}

interface TreeNode {
  name: string;
  fullPath: string;
  children: Map<string, TreeNode>;
  operation?: DiffOperation;
  isLeaf: boolean;
}

const typeColors = {
  MISSING: 'text-destructive',
  ORPHANED: 'text-yellow-500',
  TYPE_MISMATCH: 'text-muted-foreground',
  VALUE_DIFF: 'text-muted-foreground',
  EQUAL: 'text-green-500',
};

const typeIcons = {
  MISSING: XCircle,
  ORPHANED: AlertTriangle,
  TYPE_MISMATCH: RefreshCw,
  VALUE_DIFF: ArrowLeftRight,
  EQUAL: CheckCircle2,
};

export function KeyTree({
  operations,
  selectedKeys,
  onToggleKey,
  onSelectKey,
  validationResults = [],
}: KeyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build tree structure from flat keys
  const tree = useMemo(() => {
    const root = new Map<string, TreeNode>();

    operations.forEach((operation) => {
      const parts = operation.keyPath.split('.');
      let currentLevel = root;

      parts.forEach((part, index) => {
        const isLastPart = index === parts.length - 1;
        const fullPath = parts.slice(0, index + 1).join('.');

        if (!currentLevel.has(part)) {
          currentLevel.set(part, {
            name: part,
            fullPath,
            children: new Map(),
            operation: isLastPart ? operation : undefined,
            isLeaf: isLastPart,
          });
        }

        if (!isLastPart) {
          currentLevel = currentLevel.get(part)!.children;
        }
      });
    });

    return root;
  }, [operations]);

  // Create validation map for quick lookup
  const validationMap = useMemo(() => {
    const map = new Map<string, ValidationResult>();
    validationResults.forEach((result) => {
      map.set(result.keyPath, result);
    });
    return map;
  }, [validationResults]);

  const toggleExpand = (path: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.fullPath);
    const hasChildren = node.children.size > 0;
    const isSelected = selectedKeys.includes(node.fullPath);
    const validation = validationMap.get(node.fullPath);

    // Get operation type for styling
    const operation = node.operation;
    const TypeIcon = operation ? typeIcons[operation.type] : null;
    const typeColor = operation ? typeColors[operation.type] : '';

    return (
      <div key={node.fullPath} className="select-none">
        <div
          className={clsx(
            'flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors',
            isSelected && 'bg-primary/10 border border-primary/50',
            !isSelected && 'hover:bg-muted'
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.fullPath)}
              className="p-0 hover:bg-accent rounded transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}

          {/* Checkbox (only for leaf nodes) */}
          {node.isLeaf && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleKey(node.fullPath)}
              onClick={(e) => e.stopPropagation()}
              className="cursor-pointer"
              aria-label={`Select ${node.fullPath}`}
            />
          )}

          {/* Node Name */}
          <div
            className="flex-1 flex items-center gap-2 min-w-0"
            onClick={() => node.isLeaf && onSelectKey(node.fullPath)}
          >
            {/* Operation Type Icon */}
            {TypeIcon && (
              <TypeIcon
                className={clsx('w-4 h-4 flex-shrink-0', typeColor)}
                data-testid={`operation-icon-${operation?.type.toLowerCase()}`}
              />
            )}

            {/* Node Text */}
            <span
              className={clsx(
                'text-sm font-mono truncate',
                node.isLeaf ? 'font-medium' : 'font-semibold',
                !hasChildren && 'ml-5' // Indent leaf nodes without expand button
              )}
            >
              {node.name}
            </span>

            {/* Validation Icon */}
            {validation && (
              <div className="flex-shrink-0" title={validation.message}>
                {validation.severity === 'error' ? (
                  <XCircle
                    className="w-4 h-4 text-destructive"
                    data-testid="validation-icon-error"
                  />
                ) : (
                  <AlertTriangle
                    className="w-4 h-4 text-yellow-500"
                    data-testid="validation-icon-warning"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div>
            {Array.from(node.children.values()).map((child) =>
              renderNode(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Auto-expand all nodes initially
  useMemo(() => {
    const allPaths = new Set<string>();
    const collectPaths = (nodes: Map<string, TreeNode>) => {
      nodes.forEach((node) => {
        if (node.children.size > 0) {
          allPaths.add(node.fullPath);
          collectPaths(node.children);
        }
      });
    };
    collectPaths(tree);
    setExpandedNodes(allPaths);
  }, [tree]);

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {Array.from(tree.values()).map((node) => renderNode(node, 0))}
      </div>
    </ScrollArea>
  );
}
