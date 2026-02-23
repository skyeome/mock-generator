import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { JsonValidationResult } from '@/lib/json-validator/types';
import { useJsonValidator } from '@/hooks/use-json-validator';
import { useJsonValidatorStore } from '@/store/json-validator-store';
import { minifyJson, prettifyJson } from '@/lib/json-validator/format';
import { validateJson } from '@/lib/json-validator/validate';

vi.mock('@/lib/json-validator/validate', () => ({
  validateJson: vi.fn(),
}));

vi.mock('@/lib/json-validator/format', () => ({
  prettifyJson: vi.fn(),
  minifyJson: vi.fn(),
}));

describe('useJsonValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useJsonValidatorStore.getState().reset();
    vi.mocked(validateJson).mockReturnValue({
      valid: true,
      errors: [],
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('debounces validation for 300ms before running', () => {
    renderHook(() => useJsonValidator());

    act(() => {
      useJsonValidatorStore.getState().setInput('{"name":"Alice"}');
    });

    expect(validateJson).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(validateJson).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(validateJson).toHaveBeenCalledTimes(1);
    expect(validateJson).toHaveBeenCalledWith('{"name":"Alice"}');
  });

  it('prettify updates input when formatting succeeds', () => {
    const formatted = '{\n  "name": "Alice"\n}';
    vi.mocked(prettifyJson).mockReturnValue({
      success: true,
      output: formatted,
    });

    const { result } = renderHook(() => useJsonValidator());

    act(() => {
      result.current.setInput('{"name":"Alice"}');
      result.current.prettify();
    });

    expect(useJsonValidatorStore.getState().input).toBe(formatted);
  });

  it('prettify keeps input unchanged when formatting fails', () => {
    const original = '{"name":}';
    vi.mocked(prettifyJson).mockReturnValue({
      success: false,
      output: '',
      error: 'Invalid JSON syntax',
    });

    const { result } = renderHook(() => useJsonValidator());

    act(() => {
      result.current.setInput(original);
      result.current.prettify();
    });

    expect(useJsonValidatorStore.getState().input).toBe(original);
  });

  it('minify updates input when formatting succeeds', () => {
    const minified = '{"name":"Alice"}';
    vi.mocked(minifyJson).mockReturnValue({
      success: true,
      output: minified,
    });

    const { result } = renderHook(() => useJsonValidator());

    act(() => {
      result.current.setInput('{\n  "name": "Alice"\n}');
      result.current.minify();
    });

    expect(useJsonValidatorStore.getState().input).toBe(minified);
  });

  it('minify keeps input unchanged when formatting fails', () => {
    const original = '{"name":}';
    vi.mocked(minifyJson).mockReturnValue({
      success: false,
      output: '',
      error: 'Invalid JSON syntax',
    });

    const { result } = renderHook(() => useJsonValidator());

    act(() => {
      result.current.setInput(original);
      result.current.minify();
    });

    expect(useJsonValidatorStore.getState().input).toBe(original);
  });

  it('copyToClipboard returns true when clipboard write succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const { result } = renderHook(() => useJsonValidator());

    act(() => {
      result.current.setInput('{"name":"Alice"}');
    });

    await expect(result.current.copyToClipboard()).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('{"name":"Alice"}');
  });

  it('copyToClipboard returns false when clipboard write fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    const { result } = renderHook(() => useJsonValidator());

    act(() => {
      result.current.setInput('{"name":"Alice"}');
    });

    await expect(result.current.copyToClipboard()).resolves.toBe(false);
  });

  it('reset clears input and validationResult', () => {
    const validationResult: JsonValidationResult = {
      valid: false,
      errors: [
        {
          message: 'Invalid JSON syntax',
          line: 1,
          column: 3,
          offset: 2,
        },
      ],
    };

    const { result } = renderHook(() => useJsonValidator());

    act(() => {
      result.current.setInput('{"name":}');
      useJsonValidatorStore.getState().setValidationResult(validationResult);
      result.current.reset();
    });

    expect(result.current.input).toBe('');
    expect(result.current.validationResult).toBeNull();
  });

  it('computes isValid and errors from validationResult', () => {
    const validResult: JsonValidationResult = {
      valid: true,
      errors: [],
    };

    const invalidResult: JsonValidationResult = {
      valid: false,
      errors: [
        {
          message: 'Invalid JSON syntax',
          line: 1,
          column: 9,
          offset: 8,
        },
      ],
    };

    const { result } = renderHook(() => useJsonValidator());

    act(() => {
      useJsonValidatorStore.getState().setValidationResult(validResult);
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toEqual([]);

    act(() => {
      useJsonValidatorStore.getState().setValidationResult(invalidResult);
    });

    expect(result.current.isValid).toBe(false);
    expect(result.current.errors).toEqual(invalidResult.errors);
  });
});
