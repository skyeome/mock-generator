'use client';

import { useCallback, useEffect, useRef } from 'react';
import { minifyJson, prettifyJson } from '@/lib/json-validator/format';
import { validateJson } from '@/lib/json-validator/validate';
import { useJsonValidatorStore } from '@/store/json-validator-store';

const VALIDATION_DEBOUNCE_MS = 300;

export function useJsonValidator() {
  const { input, validationResult, setInput, setValidationResult, reset } = useJsonValidatorStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!input.trim()) {
        useJsonValidatorStore.setState({ validationResult: null });
        return;
      }

      setValidationResult(validateJson(input));
    }, VALIDATION_DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [input, setValidationResult]);

  const prettify = useCallback(() => {
    const result = prettifyJson(input);

    if (result.success) {
      setInput(result.output);
    }
  }, [input, setInput]);

  const minify = useCallback(() => {
    const result = minifyJson(input);

    if (result.success) {
      setInput(result.output);
    }
  }, [input, setInput]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(input);
      return true;
    } catch {
      return false;
    }
  }, [input]);

  return {
    input,
    setInput,
    validationResult,
    isValid: validationResult?.valid ?? false,
    errors: validationResult?.errors ?? [],
    prettify,
    minify,
    copyToClipboard,
    reset,
  };
}
