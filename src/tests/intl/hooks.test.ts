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
    it('should call API with batch entries format, not single text field', async () => {
      // Mock fetch to capture the request
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          translations: {
            greeting: '안녕하세요',
            farewell: '안녕히 가세요',
          },
        }),
      });
      global.fetch = fetchSpy;

      const { result } = renderHook(() => useIntlSync());

      // Setup diffResult with MISSING operations
      const diffResult: DiffResult = {
        operations: [
          { type: 'MISSING', keyPath: 'greeting', sourceValue: 'Hello', targetValue: undefined },
          { type: 'MISSING', keyPath: 'farewell', sourceValue: 'Goodbye', targetValue: undefined },
        ],
        stats: { missing: 2, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: ['greeting', 'farewell'],
        targetKeyOrder: [],
      };

      act(() => {
        result.current.setSourceJson('{"greeting":"Hello","farewell":"Goodbye"}');
        result.current.setTargetJson('{}');
        result.current.setDiffResult(diffResult);
        result.current.setSelectedKeys(['greeting', 'farewell']);
      });

      await act(async () => {
        await result.current.translateSelected();
      });

      // Verify API was called
      expect(fetchSpy).toHaveBeenCalled();

      // Get the first API call
      const firstCall = fetchSpy.mock.calls[0];
      const requestBody = JSON.parse(firstCall[1]?.body as string);

      // CRITICAL: API must receive 'entries' array, NOT 'text' field
      // This test SHOULD FAIL because current implementation sends 'text' field
      expect(requestBody).toHaveProperty('entries');
      expect(requestBody).not.toHaveProperty('text');
      expect(requestBody.entries).toBeInstanceOf(Array);
      expect(requestBody.entries.length).toBeGreaterThan(0);
      expect(requestBody.entries[0]).toHaveProperty('key');
      expect(requestBody.entries[0]).toHaveProperty('value');
    });

    it('should update translations for selected keys', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          translations: {
            'new.key': '새로운 키',
          },
        }),
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
        result.current.setSourceJson(JSON.stringify({ new: { key: 'New Key' } }));
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
        result.current.setSourceJson(JSON.stringify({ error: { key: 'Error Key' } }));
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

    it('should send all entries in a single API call', async () => {
      const mockFetch = vi.fn().mockImplementation(async (url, options) => {
        const body = JSON.parse(options.body);
        const translations = Object.fromEntries(
          body.entries.map((entry: { key: string; value: string }) => [entry.key, `translated-${entry.value}`])
        );
        return {
          ok: true,
          json: async () => ({
            success: true,
            translations,
          }),
        };
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

      const sourceData = Object.fromEntries(
        operations.map((op, i) => [`key${i}`, `Value ${i}`])
      );

      act(() => {
        result.current.setSourceJson(JSON.stringify(sourceData));
        result.current.setDiffResult(diffResult);
        result.current.setSelectedKeys(operations.map(op => op.keyPath));
      });

      await act(async () => {
        await result.current.translateSelected();
      });

      expect(result.current.translations).toHaveLength(12);
      // All entries are sent in a single API call
      expect(mockFetch).toHaveBeenCalledTimes(1);
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
        result.current.setSourceJson(JSON.stringify({ new: { key: 'New' }, existing: { key: 'Existing' } }));
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
        result.current.setSourceJson(JSON.stringify({ z: 'Z', a: 'A', m: 'M' }));
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
        result.current.setSourceJson(JSON.stringify({ key1: 'Original 1', key2: 'Original 2' }));
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

  describe('useIntlSync with complex structures', () => {
    it('should preserve array structure through translation flow', async () => {
      // Override compareJson mock for this specific test
      const { compareJson } = await import('@/lib/intl/diff');
      vi.mocked(compareJson).mockReturnValueOnce({
        operations: [
          {
            type: 'MISSING',
            keyPath: 'certification.ol',
            sourceValue: [
              { title: 'AWS Certified', desc: 'Cloud cert' },
              { title: 'GCP Associate', desc: 'Google cert' },
            ],
            targetValue: undefined
          },
        ],
        stats: { missing: 1, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: ['certification.ol'],
        targetKeyOrder: [],
      });

      const mockFetch = vi.fn().mockImplementation(async (url, options) => {
        const body = JSON.parse(options.body);
        // Return translated version for batch entries
        const translations = Object.fromEntries(
          body.entries.map((entry: { key: string; value: string }) => {
            const translated = entry.value
              .replace('AWS Certified', 'AWS 인증')
              .replace('Cloud cert', '클라우드 자격증')
              .replace('GCP Associate', 'GCP 어소시에이트')
              .replace('Google cert', '구글 자격증');
            return [entry.key, translated];
          })
        );
        return {
          ok: true,
          json: async () => ({
            success: true,
            translations,
          }),
        };
      });
      global.fetch = mockFetch;

      const { result } = renderHook(() => useIntlSync());

      const sourceData = {
        certification: {
          ol: [
            { title: 'AWS Certified', desc: 'Cloud cert' },
            { title: 'GCP Associate', desc: 'Google cert' },
          ],
        },
      };

      // Set up source with array structure - MUST set sourceParsed via setSourceJson
      act(() => {
        result.current.setSourceJson(JSON.stringify(sourceData));
        result.current.setTargetJson('{}');
      });

      act(() => {
        result.current.runDiff();
      });

      // Select the array key
      act(() => {
        result.current.setSelectedKeys(['certification.ol']);
      });

      await act(async () => {
        await result.current.translateSelected();
      });

      // Verify translations were created for flattened entries
      const translations = result.current.translations;
      expect(translations.length).toBeGreaterThan(0);

      // Verify we got 4 translations (2 items × 2 fields each)
      expect(translations.length).toBe(4);

      // Verify all translations completed successfully
      expect(translations.every(t => t.status === 'completed')).toBe(true);

      // Verify keys are flattened with array indices
      // Keys use dot notation for arrays: certification.ol.0.title, certification.ol.1.desc, etc.
      const keys = translations.map(t => t.key);

      // Check for array index patterns (either bracket [0] or dot .0. notation)
      const hasArrayIndices = keys.some(k => k.includes('[0]') || k.includes('.0.')) &&
                              keys.some(k => k.includes('[1]') || k.includes('.1.'));
      expect(hasArrayIndices).toBe(true);

      // Verify specific expected keys exist
      expect(keys).toContain('certification.ol.0.title');
      expect(keys).toContain('certification.ol.0.desc');
      expect(keys).toContain('certification.ol.1.title');
      expect(keys).toContain('certification.ol.1.desc');
    });

    it('should not convert array to "[object Object]" string', async () => {
      const { result } = renderHook(() => useIntlSync());

      // Set up source with array
      act(() => {
        result.current.setSourceJson(JSON.stringify({
          items: [{ name: 'Test' }],
        }));
      });

      // The original value should never be "[object Object]"
      const translations = result.current.translations;
      const hasObjectString = translations.some(t =>
        t.original.includes('[object Object]')
      );
      expect(hasObjectString).toBe(false);
    });
  });

  describe('exportResult with array structures', () => {
    it('should preserve array structure in exported JSON', async () => {
      // Override compareJson mock for this test to return array structure
      const { compareJson } = await import('@/lib/intl/diff');
      vi.mocked(compareJson).mockReturnValueOnce({
        operations: [
          { type: 'MISSING', keyPath: 'certification.ol', sourceValue: [
            { title: 'AWS Certified', desc: 'Cloud cert' },
            { title: 'GCP Associate', desc: 'Google cert' },
          ], targetValue: undefined },
        ],
        stats: { missing: 1, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: [
          'certification.ol[0].title',
          'certification.ol[0].desc',
          'certification.ol[1].title',
          'certification.ol[1].desc',
        ],
        targetKeyOrder: [],
      });

      const { result } = renderHook(() => useIntlSync());

      // Setup: source with array
      act(() => {
        result.current.setSourceJson(JSON.stringify({
          certification: {
            ol: [
              { title: 'AWS Certified', desc: 'Cloud cert' },
              { title: 'GCP Associate', desc: 'Google cert' },
            ],
          },
        }));
        result.current.setTargetJson('{}');
      });

      // Run diff to set up diffResult
      act(() => {
        result.current.runDiff();
      });

      // Simulate completed translations (as if translateSelected ran)
      act(() => {
        useIntlSyncStore.getState().setTranslations([
          { key: 'certification.ol[0].title', original: 'AWS Certified', translated: 'AWS 인증', status: 'completed' },
          { key: 'certification.ol[0].desc', original: 'Cloud cert', translated: '클라우드 인증', status: 'completed' },
          { key: 'certification.ol[1].title', original: 'GCP Associate', translated: 'GCP 어소시에이트', status: 'completed' },
          { key: 'certification.ol[1].desc', original: 'Google cert', translated: '구글 인증', status: 'completed' },
        ]);
      });

      // Export
      const exported = result.current.exportResult();
      const parsed = JSON.parse(exported);

      // CRITICAL ASSERTION: ol must be an array, not a string
      expect(Array.isArray(parsed.certification?.ol)).toBe(true);
      expect(parsed.certification.ol).toHaveLength(2);
      expect(parsed.certification.ol[0].title).toBe('AWS 인증');
      expect(parsed.certification.ol[1].desc).toBe('구글 인증');

      // Must NOT contain [object Object]
      expect(exported).not.toContain('[object Object]');
    });

    it('should preserve existing target translations when partially re-translating array items', async () => {
      const { compareJson } = await import('@/lib/intl/diff');
      vi.mocked(compareJson).mockReturnValueOnce({
        operations: [
          { type: 'VALUE_DIFF', keyPath: 'ol[0].text', sourceValue: 'English A', targetValue: 'Korean A' },
          { type: 'VALUE_DIFF', keyPath: 'ol[1].text', sourceValue: 'English B', targetValue: 'Korean B' },
        ],
        stats: { missing: 0, orphaned: 0, typeMismatch: 0, equal: 2 },
        sourceKeyOrder: ['ol[0].id', 'ol[0].text', 'ol[1].id', 'ol[1].text'],
        targetKeyOrder: ['ol[0].id', 'ol[0].text', 'ol[1].id', 'ol[1].text'],
      });

      const { result } = renderHook(() => useIntlSync());

      act(() => {
        result.current.setSourceJson(JSON.stringify({
          ol: [
            { id: 'cert-1', text: 'English A' },
            { id: 'cert-2', text: 'English B' },
          ],
        }));
        result.current.setTargetJson(JSON.stringify({
          ol: [
            { id: 'cert-1', text: 'Korean A' },
            { id: 'cert-2', text: 'Korean B' },
          ],
        }));
      });

      act(() => {
        result.current.runDiff();
      });

      // User only re-translates ol[0].text, NOT ol[1].text
      act(() => {
        useIntlSyncStore.getState().setTranslations([
          { key: 'ol[0].text', original: 'English A', translated: 'New Korean A', status: 'completed' },
        ]);
      });

      const exported = result.current.exportResult();
      const parsed = JSON.parse(exported);

      expect(parsed.ol[0].text).toBe('New Korean A');  // newly translated
      expect(parsed.ol[0].id).toBe('cert-1');           // preserved from structure
      // CRITICAL: ol[1].text must be from TARGET ("Korean B"), NOT source ("English B")
      expect(parsed.ol[1].text).toBe('Korean B');       // preserved from TARGET
      expect(parsed.ol[1].id).toBe('cert-2');           // preserved from structure
    });

    it('should handle basePath extraction correctly for nested arrays', () => {
      // Test the key transformation logic
      const testCases = [
        { key: 'certification.ol[0].title', basePath: 'certification.ol', expected: '[0].title' },
        { key: 'items[0]', basePath: 'items', expected: '[0]' },
        { key: 'matrix[0][1]', basePath: 'matrix', expected: '[0][1]' },
        { key: 'a.b.c[0].d', basePath: 'a.b.c', expected: '[0].d' },
      ];

      for (const { key, basePath, expected } of testCases) {
        const relativePath = key.substring(basePath.length);
        expect(relativePath).toBe(expected);
      }
    });
  });
});
