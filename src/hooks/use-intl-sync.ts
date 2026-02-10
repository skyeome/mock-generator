'use client';

import { useCallback } from 'react';
import { useIntlSyncStore } from '@/store/intl-store';
import { compareJson } from '@/lib/intl/diff';
import { maskVariables, unmaskVariables } from '@/lib/intl/mask';
import { validateTranslations } from '@/lib/intl/validate';
import { flattenToEntries, reconstructFromEntries } from '@/lib/intl/translation/chunker';
import { setNestedValue, getNestedValue } from '@/lib/intl/utils/flatten';
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
    const { selectedKeys, diffResult, sourceLocale, targetLocale, sourceParsed } = state;

    if (!diffResult || selectedKeys.length === 0 || !sourceParsed) {
      return;
    }

    state.setIsTranslating(true);
    state.setTranslationProgress(0);

    try {
      // Prepare translation entries from selected missing keys
      const entries: TranslationEntry[] = [];

      for (const key of selectedKeys) {
        const operation = diffResult.operations.find(op => op.keyPath === key);
        if (!operation) continue;

        const sourceValue = operation.sourceValue;

        // Handle complex structures (arrays/objects) by flattening
        if (typeof sourceValue === 'object' && sourceValue !== null) {
          const flattened = flattenToEntries(sourceValue as Record<string, unknown>, key);
          for (const flatEntry of flattened) {
            entries.push({
              key: flatEntry.key,
              original: flatEntry.value,
              translated: '',
              status: 'pending' as const,
            });
          }
        } else if (typeof sourceValue === 'string') {
          // Handle simple string values
          entries.push({
            key,
            original: sourceValue,
            translated: '',
            status: 'pending' as const,
          });
        }
        // Skip non-string, non-object values (numbers, booleans, null)
      }

      state.setTranslations(entries);

      // Process translations in batches
      const batchSize = 5;
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);

        try {
          // Update all batch entries to translating status
          const currentState = useIntlSyncStore.getState();
          const updatedEntries = currentState.translations.map(t =>
            batch.some(b => b.key === t.key) ? { ...t, status: 'translating' as const } : t
          );
          currentState.setTranslations(updatedEntries);

          // Build batch entries with masking applied per-entry
          const maskedEntries = batch.map(entry => {
            const { maskedText } = maskVariables(entry.original);
            return {
              key: entry.key,
              value: maskedText
            };
          });

          // Store variables map for unmasking
          const variablesMap = new Map(
            batch.map(entry => {
              const { variables } = maskVariables(entry.original);
              return [entry.key, variables];
            })
          );

          // Call translation API with batch format
          const response = await fetch('/api/intl/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceLocale,
              targetLocale,
              entries: maskedEntries,
            }),
          });

          if (!response.ok) {
            throw new Error('Translation API failed');
          }

          const data = await response.json();

          if (!data.success || !data.translations) {
            throw new Error(data.error || 'Translation failed');
          }

          // Apply translations with unmasking per-entry
          for (const [key, translatedValue] of Object.entries(data.translations)) {
            const variables = variablesMap.get(key) || [];
            const finalTranslation = unmaskVariables(translatedValue as string, variables);
            useIntlSyncStore.getState().updateTranslation(key, finalTranslation);
          }
        } catch (error) {
          console.error('Batch translation failed:', error);
          // Mark all batch entries as error
          const currentState = useIntlSyncStore.getState();
          const updatedEntries = currentState.translations.map(t =>
            batch.some(b => b.key === t.key) ? { ...t, status: 'error' as const } : t
          );
          currentState.setTranslations(updatedEntries);
        }

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
    const { targetParsed, translations, diffResult, sourceParsed } = state;

    if (!targetParsed || !diffResult || !sourceParsed) {
      return '';
    }

    // Merge translations into target
    const merged = { ...targetParsed };

    // Group translations by basePath (parent path before array indices)
    const translationsByBasePath = new Map<string, TranslationEntry[]>();

    for (const translation of translations) {
      if (translation.status === 'completed') {
        // CRITICAL: Extract basePath correctly
        // Example: "items[0].name" -> "items"
        // Example: "items[0].tags[1]" -> "items"
        // Example: "user.name" -> "user.name"
        const bracketIndex = translation.key.indexOf('[');
        const basePath = bracketIndex === -1
          ? translation.key
          : translation.key.substring(0, bracketIndex);

        if (!translationsByBasePath.has(basePath)) {
          translationsByBasePath.set(basePath, []);
        }
        translationsByBasePath.get(basePath)!.push(translation);
      }
    }

    // Process each basePath
    for (const [basePath, entries] of translationsByBasePath) {
      // Check if any entry has array notation
      const hasArrayNotation = entries.some(e => e.key.includes('['));

      if (hasArrayNotation) {
        // Complex structure with arrays - use reconstructFromEntries
        // Get original structure from sourceParsed
        const originalStructure = getNestedValue(sourceParsed, basePath) as Record<string, unknown>;

        // Convert TranslationEntry[] to the format expected by reconstructFromEntries
        // Remove basePath prefix to get relative path for reconstruction
        const entriesForReconstruct = entries.map(e => ({
          key: e.key.substring(basePath.length),
          value: e.translated
        }));

        const reconstructed = reconstructFromEntries(entriesForReconstruct, originalStructure);

        // Set the reconstructed value at basePath
        setNestedValue(merged, basePath, reconstructed);
      } else {
        // Simple string value - use setNestedValue directly
        for (const entry of entries) {
          setNestedValue(merged, entry.key, entry.translated);
        }
      }
    }

    // Reorder keys to match source
    const reordered: Record<string, unknown> = {};
    for (const key of diffResult.sourceKeyOrder) {
      const value = getNestedValue(merged, key);

      if (value !== undefined) {
        setNestedValue(reordered, key, value);
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
