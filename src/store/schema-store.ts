import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JsonSchema } from '@/lib/types';

interface SchemaState {
  // Input
  inputJson: string;
  setInputJson: (json: string) => void;

  // Parsed schema
  schema: JsonSchema | null;
  setSchema: (schema: JsonSchema | null) => void;

  // Error
  parseError: string | null;
  setParseError: (error: string | null) => void;

  // Actions
  reset: () => void;
}

export const useSchemaStore = create<SchemaState>()(
  persist(
    (set) => ({
      inputJson: '',
      setInputJson: (inputJson) => set({ inputJson }),

      schema: null,
      setSchema: (schema) => set({ schema }),

      parseError: null,
      setParseError: (parseError) => set({ parseError }),

      reset: () => set({ inputJson: '', schema: null, parseError: null }),
    }),
    {
      name: 'mock-generator-schema',
      partialize: (state) => ({ inputJson: state.inputJson }),
    }
  )
);
