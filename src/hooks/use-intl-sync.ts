'use client';

import { useCallback } from 'react';
import { useIntlSyncStore } from '@/store/intl-store';
import { compareJson } from '@/lib/intl/diff';
import { maskVariables, unmaskVariables } from '@/lib/intl/mask';
import { validateTranslations } from '@/lib/intl/validate';
import type { TranslationEntry } from '@/store/intl-store';

export function useIntlSync() {
  const store = useIntlSyncStore();

  const runDiff = useCallback(() => {
    const state = useIntlSyncStore.getState();
    const { sourceParsed, targetParsed } = state;

    if (!sourceParsed || !targetParsed) {
      state.setDiffResult(null);
      return;
    }

    const diffResult = compareJson(sourceParsed, targetParsed);
    state.setDiffResult(diffResult);
  }, []);

  const translateSelected = useCallback(async () => {
    const state = useIntlSyncStore.getState();
    const { selectedKeys, diffResult, sourceLocale, targetLocale } = state;

    if (!diffResult || selectedKeys.length === 0) {
      return;
    }

    state.setIsTranslating(true);
    state.setTranslationProgress(0);

    try {
      // Prepare translation entries from selected missing keys
      const entries: TranslationEntry[] = selectedKeys.map(key => {
        const operation = diffResult.operations.find(op => op.keyPath === key);
        const originalValue = operation?.sourceValue as string || '';

        return {
          key,
          original: originalValue,
          translated: '',
          status: 'pending' as const,
        };
      });

      state.setTranslations(entries);

      // Process translations in batches
      const batchSize = 5;
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (entry) => {
            try {
              // Update status to translating
              const currentState = useIntlSyncStore.getState();
              const updatedEntries = currentState.translations.map(t =>
                t.key === entry.key ? { ...t, status: 'translating' as const } : t
              );
              currentState.setTranslations(updatedEntries);

              // Mask variables before translation
              const { maskedText, variables } = maskVariables(entry.original);

              // Call translation API
              const response = await fetch('/api/intl/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: maskedText,
                  sourceLocale,
                  targetLocale,
                }),
              });

              if (!response.ok) {
                throw new Error('Translation API failed');
              }

              const data = await response.json() as { translatedText: string };

              // Unmask variables
              const finalTranslation = unmaskVariables(data.translatedText, variables);

              // Update translation
              useIntlSyncStore.getState().updateTranslation(entry.key, finalTranslation);
            } catch (error) {
              console.error(`Translation failed for ${entry.key}:`, error);
              const currentState = useIntlSyncStore.getState();
              const updatedEntries = currentState.translations.map(t =>
                t.key === entry.key ? { ...t, status: 'error' as const } : t
              );
              currentState.setTranslations(updatedEntries);
            }
          })
        );

        // Update progress
        const progress = Math.min(((i + batchSize) / entries.length) * 100, 100);
        useIntlSyncStore.getState().setTranslationProgress(progress);
      }
    } finally {
      useIntlSyncStore.getState().setIsTranslating(false);
      useIntlSyncStore.getState().setTranslationProgress(100);
    }
  }, []);

  const validateAll = useCallback(() => {
    const state = useIntlSyncStore.getState();
    const { translations, sourceParsed } = state;

    if (!sourceParsed || translations.length === 0) {
      state.setValidationErrors([]);
      return;
    }

    const errors = validateTranslations(translations, sourceParsed);
    state.setValidationErrors(errors);
  }, []);

  const exportResult = useCallback(() => {
    const state = useIntlSyncStore.getState();
    const { targetParsed, translations, diffResult } = state;

    if (!targetParsed || !diffResult) {
      return '';
    }

    // Merge translations into target
    const merged = { ...targetParsed };

    for (const translation of translations) {
      if (translation.status === 'completed') {
        const keys = translation.key.split('.');
        let current: any = merged;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in current)) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = translation.translated;
      }
    }

    // Reorder keys to match source
    const reordered: Record<string, unknown> = {};
    for (const key of diffResult.sourceKeyOrder) {
      const keys = key.split('.');
      let sourceValue: any = merged;

      for (const k of keys) {
        sourceValue = sourceValue?.[k];
      }

      if (sourceValue !== undefined) {
        let current: any = reordered;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in current)) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = sourceValue;
      }
    }

    return JSON.stringify(reordered, null, 2);
  }, []);

  return {
    ...store,
    runDiff,
    translateSelected,
    validateAll,
    exportResult,
  };
}
