import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GeneratorConfig } from '@/lib/types';

interface GeneratorState {
  // Configuration
  count: number;
  setCount: (count: number) => void;

  seed: number | undefined;
  setSeed: (seed: number | undefined) => void;

  locale: string;
  setLocale: (locale: string) => void;

  // Generated data
  generatedData: unknown[];
  setGeneratedData: (data: unknown[]) => void;

  // Generation state
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;

  // Actions
  getConfig: () => GeneratorConfig;
  reset: () => void;
}

const DEFAULT_COUNT = 10;
const DEFAULT_LOCALE = 'en';

export const useGeneratorStore = create<GeneratorState>()(
  persist(
    (set, get) => ({
      count: DEFAULT_COUNT,
      setCount: (count) => set({ count }),

      seed: undefined,
      setSeed: (seed) => set({ seed }),

      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),

      generatedData: [],
      setGeneratedData: (generatedData) => set({ generatedData }),

      isGenerating: false,
      setIsGenerating: (isGenerating) => set({ isGenerating }),

      getConfig: () => {
        const state = get();
        return {
          count: state.count,
          seed: state.seed,
          locale: state.locale,
        };
      },

      reset: () => set({
        count: DEFAULT_COUNT,
        seed: undefined,
        locale: DEFAULT_LOCALE,
        generatedData: [],
        isGenerating: false,
      }),
    }),
    {
      name: 'mock-generator-config',
      partialize: (state) => ({
        count: state.count,
        seed: state.seed,
        locale: state.locale,
      }),
    }
  )
);
