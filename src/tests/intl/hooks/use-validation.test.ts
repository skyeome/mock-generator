import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useValidation } from '@/hooks/use-validation';
import { act } from 'react';

describe('useValidation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('returns empty issues for valid JSON pair', async () => {
    const sourceContent = JSON.stringify({
      greeting: 'Hello {name}',
      farewell: 'Goodbye'
    });
    const targetContent = JSON.stringify({
      greeting: 'Hola {name}',
      farewell: 'Adiós'
    });

    const { result } = renderHook(() => useValidation(sourceContent, targetContent));

    // Advance timers past debounce delay
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.issues).toHaveLength(0);
  });

  it('detects missing variables', async () => {
    const sourceContent = JSON.stringify({
      message: 'Hello {name}, you have {count} items'
    });
    const targetContent = JSON.stringify({
      message: 'Hola {name}'
    });

    const { result } = renderHook(() => useValidation(sourceContent, targetContent));

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.issues).toHaveLength(1);
    expect(result.current.issues[0]).toMatchObject({
      keyPath: 'message',
      type: 'variable_missing',
      severity: 'error'
    });
    expect(result.current.issues[0].details?.expected).toContain('{count}');
  });

  it('detects extra variables', async () => {
    const sourceContent = JSON.stringify({
      message: 'Hello {name}'
    });
    const targetContent = JSON.stringify({
      message: 'Hola {name}, tu edad es {age}'
    });

    const { result } = renderHook(() => useValidation(sourceContent, targetContent));

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.issues).toHaveLength(1);
    expect(result.current.issues[0]).toMatchObject({
      keyPath: 'message',
      type: 'variable_extra',
      severity: 'error'
    });
    expect(result.current.issues[0].details?.actual).toContain('{age}');
  });

  it('detects length anomalies', async () => {
    const sourceContent = JSON.stringify({
      short: 'Hi'
    });
    const targetContent = JSON.stringify({
      short: 'This is an extremely long translation that is way too long compared to source'
    });

    const { result } = renderHook(() => useValidation(sourceContent, targetContent));

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.issues).toHaveLength(1);
    expect(result.current.issues[0]).toMatchObject({
      keyPath: 'short',
      type: 'length_anomaly',
      severity: 'warning'
    });
    expect(result.current.issues[0].details?.ratio).toBeGreaterThan(5);
  });

  it('handles invalid JSON gracefully', async () => {
    const sourceContent = 'invalid json {';
    const targetContent = JSON.stringify({ message: 'Valid' });

    const { result } = renderHook(() => useValidation(sourceContent, targetContent));

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.issues).toHaveLength(1);
    expect(result.current.issues[0]).toMatchObject({
      type: 'schema_error',
      severity: 'error'
    });
  });

  it('debounces rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ source, target }) => useValidation(source, target),
      {
        initialProps: {
          source: JSON.stringify({ msg: 'Hello {name}' }),
          target: JSON.stringify({ msg: 'Hola' })
        }
      }
    );

    expect(result.current.isValidating).toBe(true);

    // Change source before debounce completes
    await act(async () => {
      rerender({
        source: JSON.stringify({ msg: 'Hi {name}' }),
        target: JSON.stringify({ msg: 'Hola' })
      });
    });

    // Should still be validating
    expect(result.current.isValidating).toBe(true);

    // Advance timers past debounce delay (500ms)
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isValidating).toBe(false);
    // Should have detected missing variable after debounce
    expect(result.current.issues.length).toBeGreaterThan(0);
  });

  it('handles nested JSON structures', async () => {
    const sourceContent = JSON.stringify({
      user: {
        profile: {
          greeting: 'Hello {name}'
        }
      }
    });
    const targetContent = JSON.stringify({
      user: {
        profile: {
          greeting: 'Hola'
        }
      }
    });

    const { result } = renderHook(() => useValidation(sourceContent, targetContent));

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.issues).toHaveLength(1);
    expect(result.current.issues[0].keyPath).toBe('user.profile.greeting');
  });

  it('detects both variable and length issues on same key', async () => {
    const sourceContent = JSON.stringify({
      message: 'Hi'
    });
    const targetContent = JSON.stringify({
      message: 'This is an extremely long translation with extra {variable} that should trigger both checks'
    });

    const { result } = renderHook(() => useValidation(sourceContent, targetContent));

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isValidating).toBe(false);
    // Should have both variable_extra and length_anomaly issues
    expect(result.current.issues.length).toBeGreaterThanOrEqual(2);
    const issueTypes = result.current.issues.map(i => i.type);
    expect(issueTypes).toContain('variable_extra');
    expect(issueTypes).toContain('length_anomaly');
  });

  it('handles empty content', async () => {
    const { result } = renderHook(() => useValidation('', ''));

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isValidating).toBe(false);
    expect(result.current.issues).toHaveLength(0);
  });
});
