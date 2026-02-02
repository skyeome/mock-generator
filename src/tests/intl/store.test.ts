import { describe, it, expect, beforeEach } from 'vitest';
import { useIntlSyncStore } from '@/store/intl-store';
import type { DiffResult } from '@/store/intl-store';

describe('intl-store', () => {
  beforeEach(() => {
    useIntlSyncStore.getState().reset();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const state = useIntlSyncStore.getState();

      expect(state.sourceJson).toBe('');
      expect(state.sourceLocale).toBe('en');
      expect(state.sourceParsed).toBeNull();
      expect(state.sourceError).toBeNull();

      expect(state.targetJson).toBe('');
      expect(state.targetLocale).toBe('ko');
      expect(state.targetParsed).toBeNull();
      expect(state.targetError).toBeNull();

      expect(state.diffResult).toBeNull();
      expect(state.translations).toEqual([]);
      expect(state.isTranslating).toBe(false);
      expect(state.translationProgress).toBe(0);
      expect(state.validationErrors).toEqual([]);
      expect(state.selectedKeys).toEqual([]);
      expect(state.viewMode).toBe('diff');
    });
  });

  describe('setSourceJson', () => {
    it('should parse valid JSON on setSourceJson', () => {
      const validJson = '{"hello": "world", "foo": "bar"}';

      useIntlSyncStore.getState().setSourceJson(validJson);

      const state = useIntlSyncStore.getState();
      expect(state.sourceJson).toBe(validJson);
      expect(state.sourceParsed).toEqual({ hello: 'world', foo: 'bar' });
      expect(state.sourceError).toBeNull();
    });

    it('should set error on invalid JSON', () => {
      const invalidJson = '{invalid json}';

      useIntlSyncStore.getState().setSourceJson(invalidJson);

      const state = useIntlSyncStore.getState();
      expect(state.sourceJson).toBe(invalidJson);
      expect(state.sourceParsed).toBeNull();
      expect(state.sourceError).toBeTruthy();
      expect(state.sourceError).toContain('JSON');
    });

    it('should handle empty string', () => {
      useIntlSyncStore.getState().setSourceJson('');

      const state = useIntlSyncStore.getState();
      expect(state.sourceJson).toBe('');
      expect(state.sourceParsed).toBeNull();
      expect(state.sourceError).toBeNull();
    });
  });

  describe('setTargetJson', () => {
    it('should parse valid JSON on setTargetJson', () => {
      const validJson = '{"hello": "안녕하세요"}';

      useIntlSyncStore.getState().setTargetJson(validJson);

      const state = useIntlSyncStore.getState();
      expect(state.targetJson).toBe(validJson);
      expect(state.targetParsed).toEqual({ hello: '안녕하세요' });
      expect(state.targetError).toBeNull();
    });

    it('should set error on invalid JSON', () => {
      const invalidJson = '{"unclosed"';

      useIntlSyncStore.getState().setTargetJson(invalidJson);

      const state = useIntlSyncStore.getState();
      expect(state.targetJson).toBe(invalidJson);
      expect(state.targetParsed).toBeNull();
      expect(state.targetError).toBeTruthy();
    });
  });

  describe('locale management', () => {
    it('should set source locale', () => {
      useIntlSyncStore.getState().setSourceLocale('ja');

      expect(useIntlSyncStore.getState().sourceLocale).toBe('ja');
    });

    it('should set target locale', () => {
      useIntlSyncStore.getState().setTargetLocale('zh');

      expect(useIntlSyncStore.getState().targetLocale).toBe('zh');
    });
  });

  describe('key selection', () => {
    it('should toggle key selection', () => {
      const { toggleKeySelection } = useIntlSyncStore.getState();

      toggleKeySelection('key1');
      expect(useIntlSyncStore.getState().selectedKeys).toEqual(['key1']);

      toggleKeySelection('key2');
      expect(useIntlSyncStore.getState().selectedKeys).toEqual(['key1', 'key2']);

      toggleKeySelection('key1');
      expect(useIntlSyncStore.getState().selectedKeys).toEqual(['key2']);
    });

    it('should select all missing keys', () => {
      const diffResult: DiffResult = {
        operations: [
          { type: 'MISSING', keyPath: 'missing1', sourceValue: 'value1', targetValue: undefined },
          { type: 'MISSING', keyPath: 'missing2', sourceValue: 'value2', targetValue: undefined },
          { type: 'EQUAL', keyPath: 'equal1', sourceValue: 'value3', targetValue: 'value3' },
          { type: 'ORPHANED', keyPath: 'orphaned1', sourceValue: undefined, targetValue: 'value4' },
        ],
        stats: { missing: 2, orphaned: 1, typeMismatch: 0, equal: 1 },
        sourceKeyOrder: ['missing1', 'missing2', 'equal1'],
        targetKeyOrder: ['equal1', 'orphaned1'],
      };

      useIntlSyncStore.getState().setDiffResult(diffResult);
      useIntlSyncStore.getState().selectAllMissing();

      expect(useIntlSyncStore.getState().selectedKeys).toEqual(['missing1', 'missing2']);
    });

    it('should clear selection', () => {
      useIntlSyncStore.getState().setSelectedKeys(['key1', 'key2', 'key3']);
      useIntlSyncStore.getState().clearSelection();

      expect(useIntlSyncStore.getState().selectedKeys).toEqual([]);
    });

    it('should handle selectAllMissing with no diffResult', () => {
      useIntlSyncStore.getState().selectAllMissing();

      expect(useIntlSyncStore.getState().selectedKeys).toEqual([]);
    });
  });

  describe('translation management', () => {
    it('should update translation', () => {
      const translations = [
        { key: 'hello', original: 'Hello', translated: '', status: 'pending' as const },
        { key: 'world', original: 'World', translated: '', status: 'pending' as const },
      ];

      useIntlSyncStore.getState().setTranslations(translations);
      useIntlSyncStore.getState().updateTranslation('hello', '안녕하세요');

      const state = useIntlSyncStore.getState();
      expect(state.translations[0]).toEqual({
        key: 'hello',
        original: 'Hello',
        translated: '안녕하세요',
        status: 'completed',
      });
      expect(state.translations[1]).toEqual(translations[1]);
    });

    it('should set translation progress', () => {
      useIntlSyncStore.getState().setTranslationProgress(75);

      expect(useIntlSyncStore.getState().translationProgress).toBe(75);
    });

    it('should set isTranslating flag', () => {
      useIntlSyncStore.getState().setIsTranslating(true);
      expect(useIntlSyncStore.getState().isTranslating).toBe(true);

      useIntlSyncStore.getState().setIsTranslating(false);
      expect(useIntlSyncStore.getState().isTranslating).toBe(false);
    });
  });

  describe('validation management', () => {
    it('should set validation errors', () => {
      const errors = [
        { keyPath: 'user.name', type: 'variable_mismatch' as const, message: 'Variables do not match' },
        { keyPath: 'user.email', type: 'length_anomaly' as const, message: 'Translation too long' },
      ];

      useIntlSyncStore.getState().setValidationErrors(errors);

      expect(useIntlSyncStore.getState().validationErrors).toEqual(errors);
    });
  });

  describe('view mode', () => {
    it('should set view mode', () => {
      useIntlSyncStore.getState().setViewMode('edit');
      expect(useIntlSyncStore.getState().viewMode).toBe('edit');

      useIntlSyncStore.getState().setViewMode('preview');
      expect(useIntlSyncStore.getState().viewMode).toBe('preview');

      useIntlSyncStore.getState().setViewMode('diff');
      expect(useIntlSyncStore.getState().viewMode).toBe('diff');
    });
  });

  describe('reset', () => {
    it('should reset state to initial values', () => {
      // Modify state
      useIntlSyncStore.getState().setSourceJson('{"test": "value"}');
      useIntlSyncStore.getState().setTargetLocale('fr');
      useIntlSyncStore.getState().setSelectedKeys(['key1', 'key2']);
      useIntlSyncStore.getState().setViewMode('edit');

      // Reset
      useIntlSyncStore.getState().reset();

      // Verify all reset
      const state = useIntlSyncStore.getState();
      expect(state.sourceJson).toBe('');
      expect(state.targetLocale).toBe('ko');
      expect(state.selectedKeys).toEqual([]);
      expect(state.viewMode).toBe('diff');
    });
  });

  describe('diffResult management', () => {
    it('should set diff result', () => {
      const diffResult: DiffResult = {
        operations: [
          { type: 'MISSING', keyPath: 'new.key', sourceValue: 'New Key', targetValue: undefined },
        ],
        stats: { missing: 1, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: ['new.key'],
        targetKeyOrder: [],
      };

      useIntlSyncStore.getState().setDiffResult(diffResult);

      expect(useIntlSyncStore.getState().diffResult).toEqual(diffResult);
    });

    it('should clear diff result', () => {
      const diffResult: DiffResult = {
        operations: [],
        stats: { missing: 0, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: [],
        targetKeyOrder: [],
      };

      useIntlSyncStore.getState().setDiffResult(diffResult);
      useIntlSyncStore.getState().setDiffResult(null);

      expect(useIntlSyncStore.getState().diffResult).toBeNull();
    });
  });
});
