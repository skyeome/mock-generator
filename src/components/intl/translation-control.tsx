'use client';

import { useState } from 'react';

export interface TranslationControlProps {
  selectedKey: string | null;
  sourceValue: string;
  targetValue: string;
  onRegenerate: (options: { context?: string; tone?: 'formal' | 'casual' }) => void;
  onApply: (newValue: string) => void;
  isLoading: boolean;
}

export function TranslationControl({
  selectedKey,
  sourceValue,
  targetValue,
  onRegenerate,
  onApply,
  isLoading,
}: TranslationControlProps) {
  const [context, setContext] = useState('');
  const [tone, setTone] = useState<'formal' | 'casual'>('formal');

  const handleRegenerate = () => {
    onRegenerate({
      context: context || undefined,
      tone,
    });
  };

  const handleApply = () => {
    onApply(targetValue);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      {/* Selected Key Info */}
      <div className="space-y-2">
        <div className="font-medium text-sm text-gray-700">
          Selected Key: <span className="font-mono text-blue-600">{selectedKey}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold text-gray-600">Source:</div>
            <div className="text-gray-800">{sourceValue}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-600">Target:</div>
            <div className="text-gray-800">{targetValue}</div>
          </div>
        </div>
      </div>

      {/* Context Hint */}
      <div>
        <label htmlFor="context-hint" className="block text-sm font-medium text-gray-700 mb-1">
          Context Hint
        </label>
        <textarea
          id="context-hint"
          placeholder="Add context about this translation..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tone Selector */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Tone</div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tone"
              value="formal"
              checked={tone === 'formal'}
              onChange={(e) => setTone(e.target.value as 'formal')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Formal</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tone"
              value="casual"
              checked={tone === 'casual'}
              onChange={(e) => setTone(e.target.value as 'casual')}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm">Casual</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleRegenerate}
          disabled={!selectedKey || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isLoading ? 'Regenerating...' : 'Regenerate'}
        </button>
        <button
          onClick={handleApply}
          disabled={!selectedKey}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        >
          Apply
        </button>
        <button
          onClick={() => {
            setContext('');
            setTone('formal');
          }}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
