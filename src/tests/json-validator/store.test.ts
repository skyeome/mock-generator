import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { JsonValidationResult } from '@/lib/json-validator/types';
import { useJsonValidatorStore } from '@/store/json-validator-store';

describe('json-validator-store', () => {
  beforeEach(() => {
    useJsonValidatorStore.getState().reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default state', () => {
    const state = useJsonValidatorStore.getState();

    expect(state.input).toBe('');
    expect(state.validationResult).toBeNull();
  });

  it('sets input', () => {
    useJsonValidatorStore.getState().setInput('{"name":"Alice"}');

    expect(useJsonValidatorStore.getState().input).toBe('{"name":"Alice"}');
  });

  it('sets validation result', () => {
    const validationResult: JsonValidationResult = {
      valid: false,
      errors: [
        {
          message: 'Invalid JSON syntax',
          line: 1,
          column: 10,
          offset: 9,
        },
      ],
    };

    useJsonValidatorStore.getState().setValidationResult(validationResult);

    expect(useJsonValidatorStore.getState().validationResult).toEqual(validationResult);
  });

  it('resets state', () => {
    const validationResult: JsonValidationResult = {
      valid: true,
      errors: [],
    };

    useJsonValidatorStore.getState().setInput('{"valid":true}');
    useJsonValidatorStore.getState().setValidationResult(validationResult);
    useJsonValidatorStore.getState().reset();

    const state = useJsonValidatorStore.getState();
    expect(state.input).toBe('');
    expect(state.validationResult).toBeNull();
  });

  it('does not persist to localStorage when input changes', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    useJsonValidatorStore.getState().setInput('{"privacy":"first"}');

    expect(setItemSpy).not.toHaveBeenCalled();
  });
});
