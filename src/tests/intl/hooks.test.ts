import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIntlSync } from '@/hooks/use-intl-sync';
import { useIntlSyncStore } from '@/store/intl-store';
import type { DiffResult } from '@/store/intl-store';

// Mock the imported functions
vi.mock('@/lib/intl/diff', () => ({
  compareJson: vi.fn((source, target) => ({
    operations: [
      { type: 'MISSING', keyPath: 'new.key', sourceValue: 'New Key', targetValue: undefined },
      { type: 'EQUAL', keyPath: 'existing.key', sourceValue: 'Same', targetValue: 'Same' },
    ],
    stats: { missing: 1, orphaned: 0, typeMismatch: 0, equal: 1 },
    sourceKeyOrder: ['new.key', 'existing.key'],
    targetKeyOrder: ['existing.key'],
  })),
}));

vi.mock('@/lib/intl/mask', () => ({
  maskVariables: vi.fn((text) => ({
    maskedText: text.replace(/\{[^}]+\}/g, '__MASK__'),
    variables: [{ placeholder: '__MASK__', original: '{count}' }],
  })),
  unmaskVariables: vi.fn((text, variables) => {
    let result = text;
    for (const v of variables) {
      result = result.replace(v.placeholder, v.original);
    }
    return result;
  }),
}));

vi.mock('@/lib/intl/validate', () => ({
  validateTranslations: vi.fn((translations) => {
    const errors = [];
    for (const t of translations) {
      if (t.translated.length > 100) {
        errors.push({
          keyPath: t.key,
          type: 'length_anomaly',
          message: 'Translation too long',
        });
      }
    }
    return errors;
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('use-intl-sync', () => {
  beforeEach(() => {
    useIntlSyncStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should return store state and actions', () => {
    const { result } = renderHook(() => useIntlSync());

    expect(result.current.sourceJson).toBe('');
    expect(result.current.targetJson).toBe('');
    expect(result.current.sourceLocale).toBe('en');
    expect(result.current.targetLocale).toBe('ko');
    expect(typeof result.current.runDiff).toBe('function');
    expect(typeof result.current.translateSelected).toBe('function');
    expect(typeof result.current.validateAll).toBe('function');
    expect(typeof result.current.exportResult).toBe('function');
  });

  describe('runDiff', () => {
    it('should update diffResult when both source and target are valid', () => {
      const { result } = renderHook(() => useIntlSync());

      act(() => {
        result.current.setSourceJson('{"new":{"key":"New Key"},"existing":{"key":"Same"}}');
        result.current.setTargetJson('{"existing":{"key":"Same"}}');
      });

      act(() => {
        result.current.runDiff();
      });

      expect(result.current.diffResult).toBeTruthy();
      expect(result.current.diffResult?.operations).toHaveLength(2);
      expect(result.current.diffResult?.stats.missing).toBe(1);
    });

    it('should set diffResult to null when source is not parsed', () => {
      const { result } = renderHook(() => useIntlSync());

      act(() => {
        result.current.setTargetJson('{"key":"value"}');
      });

      act(() => {
        result.current.runDiff();
      });

      expect(result.current.diffResult).toBeNull();
    });

    it('should set diffResult to null when target is not parsed', () => {
      const { result } = renderHook(() => useIntlSync());

      act(() => {
        result.current.setSourceJson('{"key":"value"}');
      });

      act(() => {
        result.current.runDiff();
      });

      expect(result.current.diffResult).toBeNull();
    });
  });

  describe('translateSelected', () => {
    it('should update translations for selected keys', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ translatedText: '새로운 키' }),
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useIntlSync());

      const diffResult: DiffResult = {
        operations: [
          { type: 'MISSING', keyPath: 'new.key', sourceValue: 'New Key', targetValue: undefined },
        ],
        stats: { missing: 1, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: ['new.key'],
        targetKeyOrder: [],
      };

      act(() => {
        result.current.setDiffResult(diffResult);
        result.current.setSelectedKeys(['new.key']);
      });

      await act(async () => {
        await result.current.translateSelected();
      });

      expect(result.current.translations).toHaveLength(1);
      expect(result.current.translations[0].key).toBe('new.key');
      expect(result.current.translations[0].status).toBe('completed');
      expect(result.current.isTranslating).toBe(false);
      expect(result.current.translationProgress).toBe(100);
    });

    it('should handle translation API errors gracefully', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useIntlSync());

      const diffResult: DiffResult = {
        operations: [
          { type: 'MISSING', keyPath: 'error.key', sourceValue: 'Error Key', targetValue: undefined },
        ],
        stats: { missing: 1, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: ['error.key'],
        targetKeyOrder: [],
      };

      act(() => {
        result.current.setDiffResult(diffResult);
        result.current.setSelectedKeys(['error.key']);
      });

      await act(async () => {
        await result.current.translateSelected();
      });

      expect(result.current.translations[0].status).toBe('error');
      expect(result.current.isTranslating).toBe(false);
    });

    it('should not translate when no keys are selected', async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      const { result } = renderHook(() => useIntlSync());

      const diffResult: DiffResult = {
        operations: [],
        stats: { missing: 0, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: [],
        targetKeyOrder: [],
      };

      act(() => {
        result.current.setDiffResult(diffResult);
      });

      await act(async () => {
        await result.current.translateSelected();
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.translations).toHaveLength(0);
    });

    it('should process translations in batches', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ translatedText: 'translated' }),
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useIntlSync());

      const operations = Array.from({ length: 12 }, (_, i) => ({
        type: 'MISSING' as const,
        keyPath: `key${i}`,
        sourceValue: `Value ${i}`,
        targetValue: undefined,
      }));

      const diffResult: DiffResult = {
        operations,
        stats: { missing: 12, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: operations.map(op => op.keyPath),
        targetKeyOrder: [],
      };

      act(() => {
        result.current.setDiffResult(diffResult);
        result.current.setSelectedKeys(operations.map(op => op.keyPath));
      });

      await act(async () => {
        await result.current.translateSelected();
      });

      expect(result.current.translations).toHaveLength(12);
      expect(mockFetch).toHaveBeenCalledTimes(12);
    });
  });

  describe('validateAll', () => {
    it('should set validation errors', () => {
      const { result } = renderHook(() => useIntlSync());

      act(() => {
        result.current.setSourceJson('{"test":"value"}');
        result.current.setTranslations([
          {
            key: 'test',
            original: 'value',
            translated: 'a'.repeat(101),
            status: 'completed',
          },
        ]);
      });

      act(() => {
        result.current.validateAll();
      });

      expect(result.current.validationErrors).toHaveLength(1);
      expect(result.current.validationErrors[0].type).toBe('length_anomaly');
    });

    it('should clear validation errors when no issues', () => {
      const { result } = renderHook(() => useIntlSync());

      act(() => {
        result.current.setSourceJson('{"test":"value"}');
        result.current.setTranslations([
          {
            key: 'test',
            original: 'value',
            translated: 'short',
            status: 'completed',
          },
        ]);
      });

      act(() => {
        result.current.validateAll();
      });

      expect(result.current.validationErrors).toHaveLength(0);
    });

    it('should not validate when no translations exist', () => {
      const { result } = renderHook(() => useIntlSync());

      act(() => {
        result.current.setSourceJson('{"test":"value"}');
      });

      act(() => {
        result.current.validateAll();
      });

      expect(result.current.validationErrors).toHaveLength(0);
    });
  });

  describe('exportResult', () => {
    it('should return merged JSON with translations', () => {
      const { result } = renderHook(() => useIntlSync());

      const diffResult: DiffResult = {
        operations: [
          { type: 'MISSING', keyPath: 'new.key', sourceValue: 'New', targetValue: undefined },
        ],
        stats: { missing: 1, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: ['new.key', 'existing.key'],
        targetKeyOrder: ['existing.key'],
      };

      act(() => {
        result.current.setTargetJson('{"existing":{"key":"Existing Value"}}');
        result.current.setDiffResult(diffResult);
        result.current.setTranslations([
          {
            key: 'new.key',
            original: 'New',
            translated: '새로운 키',
            status: 'completed',
          },
        ]);
      });

      const exported = result.current.exportResult();

      expect(exported).toBeTruthy();
      const parsed = JSON.parse(exported);
      expect(parsed.new.key).toBe('새로운 키');
      expect(parsed.existing.key).toBe('Existing Value');
    });

    it('should preserve key order from source', () => {
      const { result } = renderHook(() => useIntlSync());

      const diffResult: DiffResult = {
        operations: [],
        stats: { missing: 0, orphaned: 0, typeMismatch: 0, equal: 2 },
        sourceKeyOrder: ['z', 'a', 'm'],
        targetKeyOrder: ['a', 'm', 'z'],
      };

      act(() => {
        result.current.setTargetJson('{"a":"A","m":"M","z":"Z"}');
        result.current.setDiffResult(diffResult);
      });

      const exported = result.current.exportResult();
      const keys = Object.keys(JSON.parse(exported));

      expect(keys).toEqual(['z', 'a', 'm']);
    });

    it('should return empty string when targetParsed is null', () => {
      const { result } = renderHook(() => useIntlSync());

      const exported = result.current.exportResult();

      expect(exported).toBe('');
    });

    it('should return empty string when diffResult is null', () => {
      const { result } = renderHook(() => useIntlSync());

      act(() => {
        result.current.setTargetJson('{"test":"value"}');
      });

      const exported = result.current.exportResult();

      expect(exported).toBe('');
    });

    it('should skip translations with non-completed status', () => {
      const { result } = renderHook(() => useIntlSync());

      const diffResult: DiffResult = {
        operations: [],
        stats: { missing: 0, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: ['key1', 'key2'],
        targetKeyOrder: [],
      };

      act(() => {
        result.current.setTargetJson('{}');
        result.current.setDiffResult(diffResult);
        result.current.setTranslations([
          { key: 'key1', original: 'Original 1', translated: 'Translated 1', status: 'completed' },
          { key: 'key2', original: 'Original 2', translated: 'Translated 2', status: 'error' },
        ]);
      });

      const exported = result.current.exportResult();
      const parsed = JSON.parse(exported);

      expect(parsed.key1).toBe('Translated 1');
      expect(parsed.key2).toBeUndefined();
    });
  });
});
