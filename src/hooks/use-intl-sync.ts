"use client";

import { useCallback } from "react";
import { useIntlSyncStore } from "@/store/intl-store";
import { compareJson } from "@/lib/intl/diff";
import { maskVariables, unmaskVariables } from "@/lib/intl/mask";
import { validateTranslations } from "@/lib/intl/validate";
import {
  flattenToEntries,
  reconstructFromEntries,
} from "@/lib/intl/translation/chunker";
import { setNestedValue, getNestedValue } from "@/lib/intl/utils/flatten";
import type { TranslationEntry } from "@/store/intl-store";

interface TranslateResponse {
  success: boolean;
  translations?: Record<string, string>;
  error?: string;
  fallback?: boolean;
  partial?: boolean;
  failedKeys?: string[];
  stats?: {
    totalChunks: number;
    successfulChunks: number;
  };
}

interface TranslateBatchOptions {
  requestRewardedAd: () => Promise<boolean>;
  entriesPerAd?: number;
}

const AD_DURATION_ESTIMATE_SECONDS = 8;
const TRANSLATION_ENTRY_ESTIMATE_SECONDS = 0.35;

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function estimateTranslationEtaSeconds(entries: number, adCount: number): number {
  return Math.max(
    3,
    Math.round(entries * TRANSLATION_ENTRY_ESTIMATE_SECONDS + adCount * AD_DURATION_ESTIMATE_SECONDS),
  );
}

export function useIntlSync() {
  const store = useIntlSyncStore();

  const translateBatch = useCallback(async (
    sourceLocale: string,
    targetLocale: string,
    batchEntries: Array<{ key: string; value: string }>,
    signal: AbortSignal,
  ): Promise<TranslateResponse> => {
    const response = await fetch("/api/intl/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLocale,
        targetLocale,
        entries: batchEntries,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error("Translation API failed");
    }

    return (await response.json()) as TranslateResponse;
  }, []);

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
    const {
      selectedKeys,
      diffResult,
      sourceLocale,
      targetLocale,
      sourceParsed,
    } = state;

    if (!diffResult || selectedKeys.length === 0 || !sourceParsed) {
      return;
    }

    state.setIsTranslating(true);
    state.setTranslationProgress(2);
    state.setTranslationStatusText("Preparing translation keys...");
    state.setTranslationEtaSeconds(null);
    let succeeded = false;

    try {
      // Prepare translation entries from selected missing keys
      const entries: TranslationEntry[] = [];

      for (const key of selectedKeys) {
        const operation = diffResult.operations.find(
          (op) => op.keyPath === key,
        );
        if (!operation) continue;

        const sourceValue = operation.sourceValue;

        // Handle complex structures (arrays/objects) by flattening
        if (typeof sourceValue === "object" && sourceValue !== null) {
          const flattened = flattenToEntries(
            sourceValue as Record<string, unknown>,
            key,
            { skipNonTranslatable: true }
          );
          for (const flatEntry of flattened) {
            entries.push({
              key: flatEntry.key,
              original: flatEntry.value,
              translated: "",
              status: "pending" as const,
            });
          }
        } else if (typeof sourceValue === "string") {
          // Handle simple string values
          entries.push({
            key,
            original: sourceValue,
            translated: "",
            status: "pending" as const,
          });
        }
        // Skip non-string, non-object values (numbers, booleans, null)
      }

      state.setTranslations(entries);

      if (entries.length === 0) {
        state.setTranslationStatusText("No translatable keys found.");
        return;
      }

      state.setTranslationEtaSeconds(estimateTranslationEtaSeconds(entries.length, 0));

      // Mask all entries at once
      const maskedEntries = entries.map((entry) => {
        const { maskedText } = maskVariables(entry.original);
        return { key: entry.key, value: maskedText };
      });

      const variablesMap = new Map(
        entries.map((entry) => {
          const { variables } = maskVariables(entry.original);
          return [entry.key, variables];
        }),
      );

      // Update all entries to translating status
      const currentState = useIntlSyncStore.getState();
      const updatingEntries = currentState.translations.map((t) => ({
        ...t,
        status: "translating" as const,
      }));
      currentState.setTranslations(updatingEntries);

      state.setTranslationProgress(12);
      state.setTranslationStatusText("Sending translation request...");

      try {
        // Single API call with all entries
        const controller = new AbortController();
        const data = await translateBatch(
          sourceLocale,
          targetLocale,
          maskedEntries,
          controller.signal,
        );

        if (!data.success || !data.translations) {
          throw new Error(data.error || "Translation failed");
        }

        state.setTranslationProgress(92);
        state.setTranslationStatusText("Applying translated values...");

        // Apply translations with unmasking
        for (const [key, translatedValue] of Object.entries(
          data.translations,
        )) {
          const variables = variablesMap.get(key) || [];
          const finalTranslation = unmaskVariables(
            translatedValue as string,
            variables,
          );
          useIntlSyncStore.getState().updateTranslation(key, finalTranslation);
        }

        succeeded = true;
        state.setTranslationStatusText("Translation complete.");
        state.setTranslationEtaSeconds(null);
      } catch (error) {
        console.error("Translation failed:", error);
        // Mark all entries as error
        const errorState = useIntlSyncStore.getState();
        const errorEntries = errorState.translations.map((t) => ({
          ...t,
          status: "error" as const,
        }));
        errorState.setTranslations(errorEntries);
        errorState.setTranslationStatusText("Translation failed. Please try again.");
        errorState.setTranslationEtaSeconds(null);
      }
    } finally {
      const finalState = useIntlSyncStore.getState();
      finalState.setIsTranslating(false);
      if (succeeded) {
        finalState.setTranslationProgress(100);
      }
    }
  }, [translateBatch]);

  const translateSelectedWithRewardedAds = useCallback(async (
    options: TranslateBatchOptions,
  ) => {
    const { requestRewardedAd, entriesPerAd = 40 } = options;
    const state = useIntlSyncStore.getState();
    const {
      selectedKeys,
      diffResult,
      sourceLocale,
      targetLocale,
      sourceParsed,
    } = state;

    if (!diffResult || selectedKeys.length === 0 || !sourceParsed) {
      return { success: false, cancelled: false };
    }

    state.setIsTranslating(true);
    state.setTranslationProgress(2);
    state.setTranslationStatusText("Preparing translation batches...");
    state.setTranslationEtaSeconds(null);
    let succeeded = false;

    try {
      const entries: TranslationEntry[] = [];

      for (const key of selectedKeys) {
        const operation = diffResult.operations.find((op) => op.keyPath === key);
        if (!operation) continue;

        const sourceValue = operation.sourceValue;

        if (typeof sourceValue === "object" && sourceValue !== null) {
          const flattened = flattenToEntries(
            sourceValue as Record<string, unknown>,
            key,
            { skipNonTranslatable: true }
          );
          for (const flatEntry of flattened) {
            entries.push({
              key: flatEntry.key,
              original: flatEntry.value,
              translated: "",
              status: "pending" as const,
            });
          }
        } else if (typeof sourceValue === "string") {
          entries.push({
            key,
            original: sourceValue,
            translated: "",
            status: "pending" as const,
          });
        }
      }

      if (entries.length === 0) {
        state.setTranslationStatusText("No translatable keys found.");
        return { success: true, cancelled: false };
      }

      state.setTranslations(entries);

      const maskedEntries = entries.map((entry) => {
        const { maskedText } = maskVariables(entry.original);
        return { key: entry.key, value: maskedText };
      });

      const variablesMap = new Map(
        entries.map((entry) => {
          const { variables } = maskVariables(entry.original);
          return [entry.key, variables];
        }),
      );

      const initialState = useIntlSyncStore.getState();
      initialState.setTranslations(
        initialState.translations.map((t) => ({
          ...t,
          status: "translating" as const,
        }))
      );

      const batches = chunkArray(maskedEntries, entriesPerAd);
      let completedEntries = 0;

      state.setTranslationEtaSeconds(estimateTranslationEtaSeconds(maskedEntries.length, batches.length));

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex += 1) {
        const batch = batches[batchIndex];
        const remainingEntries = maskedEntries.length - completedEntries;
        const remainingAds = batches.length - batchIndex;
        state.setTranslationEtaSeconds(estimateTranslationEtaSeconds(remainingEntries, remainingAds));
        state.setTranslationStatusText(
          `Ad ${batchIndex + 1}/${batches.length}: waiting for completion...`
        );
        state.setTranslationProgress(
          Math.max(8, Math.min(40, Math.round((batchIndex / batches.length) * 40)))
        );

        const controller = new AbortController();
        const batchPromise = translateBatch(
          sourceLocale,
          targetLocale,
          batch,
          controller.signal,
        );

        const adGranted = await requestRewardedAd();

        if (!adGranted) {
          controller.abort();
          await batchPromise.catch(() => undefined);

          const failState = useIntlSyncStore.getState();
          failState.setTranslations(
            failState.translations.map((entry) => (
              batch.some((item) => item.key === entry.key)
                ? { ...entry, status: "error" as const }
                : entry
            ))
          );
          failState.setTranslationStatusText("Ad closed early. Translation stopped to save resources.");
          failState.setTranslationEtaSeconds(null);

          return { success: false, cancelled: true };
        }

        state.setTranslationStatusText(`Translating batch ${batchIndex + 1}/${batches.length}...`);
        state.setTranslationProgress(
          Math.max(42, Math.min(90, Math.round((completedEntries / maskedEntries.length) * 90)))
        );

        let data: TranslateResponse;
        try {
          data = await batchPromise;
        } catch (error) {
          console.error("Translation batch failed:", error);

          const errorState = useIntlSyncStore.getState();
          errorState.setTranslations(
            errorState.translations.map((entry) => (
              batch.some((item) => item.key === entry.key)
                ? { ...entry, status: "error" as const }
                : entry
            ))
          );
          errorState.setTranslationStatusText(
            `Batch ${batchIndex + 1}/${batches.length} failed. Continuing with remaining batches...`
          );
          continue;
        }

        if (!data.success || !data.translations) {
          const errorState = useIntlSyncStore.getState();
          errorState.setTranslations(
            errorState.translations.map((entry) => (
              batch.some((item) => item.key === entry.key)
                ? { ...entry, status: "error" as const }
                : entry
            ))
          );
          errorState.setTranslationStatusText(
            `Batch ${batchIndex + 1}/${batches.length} returned no data. Continuing...`
          );
          continue;
        }

        for (const [key, translatedValue] of Object.entries(data.translations)) {
          const variables = variablesMap.get(key) || [];
          const finalTranslation = unmaskVariables(translatedValue, variables);
          useIntlSyncStore.getState().updateTranslation(key, finalTranslation);
        }

        completedEntries += batch.length;
        const progress = Math.min(95, Math.round((completedEntries / maskedEntries.length) * 100));
        useIntlSyncStore.getState().setTranslationProgress(progress);
        useIntlSyncStore.getState().setTranslationStatusText(
          `Completed batch ${batchIndex + 1}/${batches.length}.`
        );
      }

      succeeded = true;
      state.setTranslationStatusText("Translation complete.");
      state.setTranslationEtaSeconds(null);

      return { success: true, cancelled: false };
    } finally {
      const finalState = useIntlSyncStore.getState();
      finalState.setIsTranslating(false);
      if (succeeded) {
        finalState.setTranslationProgress(100);
      }
    }
  }, [translateBatch]);

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
      return "";
    }

    // Merge translations into target
    const merged = { ...targetParsed };

    // Group translations by basePath (parent path before array indices)
    const translationsByBasePath = new Map<string, TranslationEntry[]>();

    for (const translation of translations) {
      if (translation.status === "completed") {
        // CRITICAL: Extract basePath correctly
        // Example: "items[0].name" -> "items"
        // Example: "items[0].tags[1]" -> "items"
        // Example: "user.name" -> "user.name"
        const bracketIndex = translation.key.indexOf("[");
        const basePath =
          bracketIndex === -1
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
      const hasArrayNotation = entries.some((e) => e.key.includes("["));

      if (hasArrayNotation) {
        // Complex structure with arrays - use reconstructFromEntries
        // Use target as base if it exists (preserves existing target translations)
        // Fall back to source if target doesn't have the structure (MISSING case)
        const targetBase = getNestedValue(
          targetParsed as Record<string, unknown>,
          basePath,
        );
        const originalStructure = (targetBase !== undefined
          ? targetBase
          : getNestedValue(sourceParsed, basePath)) as Record<string, unknown>;

        // Convert TranslationEntry[] to the format expected by reconstructFromEntries
        // Remove basePath prefix to get relative path for reconstruction
        const entriesForReconstruct = entries.map((e) => ({
          key: e.key.substring(basePath.length),
          value: e.translated,
        }));

        const reconstructed = reconstructFromEntries(
          entriesForReconstruct,
          originalStructure,
        );

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

  const translateAllMissing = useCallback(async () => {
    const state = useIntlSyncStore.getState();
    state.selectAllMissing();
    await translateSelected();
    const exported = exportResult();
    if (exported) {
      state.setTargetJson(exported);
    }
    state.clearSelection();
  }, [translateSelected, exportResult]);

  return {
    ...store,
    runDiff,
    translateSelected,
    translateSelectedWithRewardedAds,
    translateAllMissing,
    validateAll,
    exportResult,
  };
}
