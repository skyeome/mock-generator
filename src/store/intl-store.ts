import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'diff' | 'edit' | 'preview';

export interface DiffOperation {
  type: 'MISSING' | 'ORPHANED' | 'TYPE_MISMATCH' | 'VALUE_DIFF' | 'EQUAL';
  keyPath: string;
  sourceValue: unknown;
  targetValue: unknown;
}

export interface DiffResult {
  operations: DiffOperation[];
  stats: {
    missing: number;
    orphaned: number;
    typeMismatch: number;
    equal: number;
  };
  sourceKeyOrder: string[];
  targetKeyOrder: string[];
}

export interface TranslationEntry {
  key: string;
  original: string;
  translated: string;
  status: 'pending' | 'translating' | 'completed' | 'error';
}

export interface ValidationError {
  keyPath: string;
  type: 'variable_mismatch' | 'length_anomaly' | 'schema_error';
  message: string;
}

export interface IntlSyncState {
  // Source file (reference)
  sourceJson: string;
  sourceLocale: string;
  sourceParsed: Record<string, unknown> | null;
  sourceError: string | null;

  // Target file (to be synced)
  targetJson: string;
  targetLocale: string;
  targetParsed: Record<string, unknown> | null;
  targetError: string | null;

  // Diff results
  diffResult: DiffResult | null;

  // Translation state
  translations: TranslationEntry[];
  isTranslating: boolean;
  translationProgress: number;

  // Validation state
  validationErrors: ValidationError[];

  // UI state
  selectedKeys: string[];
  viewMode: ViewMode;

  // Actions
  setSourceJson: (json: string) => void;
  setTargetJson: (json: string) => void;
  setSourceLocale: (locale: string) => void;
  setTargetLocale: (locale: string) => void;
  setDiffResult: (result: DiffResult | null) => void;
  setTranslations: (translations: TranslationEntry[]) => void;
  updateTranslation: (key: string, translated: string) => void;
  setIsTranslating: (isTranslating: boolean) => void;
  setTranslationProgress: (progress: number) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  setSelectedKeys: (keys: string[]) => void;
  toggleKeySelection: (key: string) => void;
  selectAllMissing: () => void;
  clearSelection: () => void;
  setViewMode: (mode: ViewMode) => void;
  reset: () => void;
}

const initialState = {
  sourceJson: '',
  sourceLocale: 'en',
  sourceParsed: null,
  sourceError: null,
  targetJson: '',
  targetLocale: 'ko',
  targetParsed: null,
  targetError: null,
  diffResult: null,
  translations: [],
  isTranslating: false,
  translationProgress: 0,
  validationErrors: [],
  selectedKeys: [],
  viewMode: 'diff' as ViewMode,
};

export const useIntlSyncStore = create<IntlSyncState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSourceJson: (json) => {
        try {
          const parsed = json ? JSON.parse(json) : null;
          set({ sourceJson: json, sourceParsed: parsed, sourceError: null });
        } catch (e) {
          set({ sourceJson: json, sourceParsed: null, sourceError: (e as Error).message });
        }
      },

      setTargetJson: (json) => {
        try {
          const parsed = json ? JSON.parse(json) : null;
          set({ targetJson: json, targetParsed: parsed, targetError: null });
        } catch (e) {
          set({ targetJson: json, targetParsed: null, targetError: (e as Error).message });
        }
      },

      setSourceLocale: (locale) => set({ sourceLocale: locale }),
      setTargetLocale: (locale) => set({ targetLocale: locale }),
      setDiffResult: (result) => set({ diffResult: result }),
      setTranslations: (translations) => set({ translations }),

      updateTranslation: (key, translated) => {
        const translations = get().translations.map(t =>
          t.key === key ? { ...t, translated, status: 'completed' as const } : t
        );
        set({ translations });
      },

      setIsTranslating: (isTranslating) => set({ isTranslating }),
      setTranslationProgress: (progress) => set({ translationProgress: progress }),
      setValidationErrors: (errors) => set({ validationErrors: errors }),
      setSelectedKeys: (keys) => set({ selectedKeys: keys }),

      toggleKeySelection: (key) => {
        const { selectedKeys } = get();
        const newKeys = selectedKeys.includes(key)
          ? selectedKeys.filter(k => k !== key)
          : [...selectedKeys, key];
        set({ selectedKeys: newKeys });
      },

      selectAllMissing: () => {
        const { diffResult } = get();
        if (!diffResult) return;
        const missingKeys = diffResult.operations
          .filter(op => op.type === 'MISSING')
          .map(op => op.keyPath);
        set({ selectedKeys: missingKeys });
      },

      clearSelection: () => set({ selectedKeys: [] }),
      setViewMode: (mode) => set({ viewMode: mode }),
      reset: () => set(initialState),
    }),
    {
      name: 'intl-sync-storage',
      partialize: (state) => ({
        sourceLocale: state.sourceLocale,
        targetLocale: state.targetLocale,
      }),
    }
  )
);
