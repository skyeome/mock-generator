'use client';

import { useState } from 'react';

export interface ValidationIssue {
  keyPath: string;
  type: 'variable_missing' | 'variable_extra' | 'length_anomaly' | 'schema_error';
  severity: 'warning' | 'error';
  message: string;
  details?: {
    expected?: string[];
    actual?: string[];
    ratio?: number;
  };
}

interface ValidationPanelProps {
  issues: ValidationIssue[];
  onNavigate: (keyPath: string) => void;
}

export function ValidationPanel({ issues, onNavigate }: ValidationPanelProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  const toggleExpand = (keyPath: string) => {
    setExpandedIssues(prev => {
      const next = new Set(prev);
      if (next.has(keyPath)) {
        next.delete(keyPath);
      } else {
        next.add(keyPath);
      }
      return next;
    });
  };

  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  // Group issues by type
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.type]) {
      acc[issue.type] = [];
    }
    acc[issue.type].push(issue);
    return acc;
  }, {} as Record<string, ValidationIssue[]>);

  const typeLabels: Record<string, string> = {
    variable_missing: 'Variable Issues',
    variable_extra: 'Variable Issues',
    length_anomaly: 'Length Anomalies',
    schema_error: 'Schema Errors',
  };

  const typeIcons: Record<string, string> = {
    variable_missing: '🔤',
    variable_extra: '🔤',
    length_anomaly: '📏',
    schema_error: '⚠️',
  };

  if (issues.length === 0) {
    return (
      <div className="p-4 text-center text-green-600">
        ✓ All checks passed
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Summary header */}
      <div className="flex gap-4 text-sm font-medium">
        {warningCount > 0 && (
          <span className="text-yellow-600">
            ⚠ {warningCount} {warningCount === 1 ? 'warning' : 'warnings'}
          </span>
        )}
        {errorCount > 0 && (
          <span className="text-red-600">
            ✗ {errorCount} {errorCount === 1 ? 'error' : 'errors'}
          </span>
        )}
      </div>

      {/* Group issues by type */}
      {Object.entries(groupedIssues).map(([type, typeIssues]) => (
        <div key={type} className="space-y-2">
          <h3 className="font-medium text-sm text-gray-700">
            {typeLabels[type] || type}
          </h3>
          <div className="space-y-1">
            {typeIssues.map((issue, idx) => (
              <div key={`${issue.keyPath}-${idx}`} className="border rounded-md">
                {/* Issue row */}
                <button
                  onClick={() => onNavigate(issue.keyPath)}
                  className="w-full px-3 py-2 flex items-start gap-2 hover:bg-gray-50 text-left"
                >
                  <span className="text-lg">{typeIcons[issue.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-blue-600 truncate">
                      {issue.keyPath}
                    </div>
                    <div className="text-sm text-gray-600">{issue.message}</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      issue.severity === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {issue.severity}
                  </span>
                </button>

                {/* Details section (expandable) */}
                {issue.details && (
                  <>
                    <button
                      onClick={() => toggleExpand(issue.keyPath)}
                      className="w-full px-3 py-1 text-xs text-gray-500 hover:bg-gray-50 text-left border-t"
                      aria-label="expand details"
                    >
                      {expandedIssues.has(issue.keyPath) ? '▼' : '▶'} Details
                    </button>
                    {expandedIssues.has(issue.keyPath) && (
                      <div className="px-3 py-2 bg-gray-50 text-xs space-y-1 border-t">
                        {issue.details.expected && (
                          <div>
                            <div className="font-medium">Expected:</div>
                            <div className="font-mono text-gray-700">
                              {issue.details.expected.join(', ')}
                            </div>
                          </div>
                        )}
                        {issue.details.actual && (
                          <div>
                            <div className="font-medium">Actual:</div>
                            <div className="font-mono text-gray-700">
                              {issue.details.actual.join(', ')}
                            </div>
                          </div>
                        )}
                        {issue.details.ratio !== undefined && (
                          <div>
                            <div className="font-medium">Ratio:</div>
                            <div className="font-mono text-gray-700">
                              {issue.details.ratio.toFixed(2)}x
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
