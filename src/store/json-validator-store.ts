import { create } from 'zustand';
import type { JsonValidationResult } from '@/lib/json-validator/types';

interface JsonValidatorState {
  input: string;
  validationResult: JsonValidationResult | null;
  setInput: (input: string) => void;
  setValidationResult: (result: JsonValidationResult) => void;
  reset: () => void;
}

export const useJsonValidatorStore = create<JsonValidatorState>((set) => ({
  input: '',
  validationResult: null,
  setInput: (input) => set({ input }),
  setValidationResult: (validationResult) => set({ validationResult }),
  reset: () => set({ input: '', validationResult: null }),
}));
