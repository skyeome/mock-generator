import { describe, it, expect } from 'vitest';
import { detectLengthAnomaly } from '@/lib/intl/validation/anomaly';

describe('detectLengthAnomaly', () => {
  it('should pass for reasonable length ratio', () => {
    const source = 'Hello world';
    const target = 'Bonjour le monde';

    const result = detectLengthAnomaly(source, target);

    expect(result.isAnomaly).toBe(false);
    expect(result.ratio).toBeLessThan(5);
    expect(result.sourceLength).toBe(11);
    expect(result.targetLength).toBe(16);
  });

  it('should flag when target is 5x longer', () => {
    const source = 'Hi';
    const target = 'This is a very long translation that is five times longer';

    const result = detectLengthAnomaly(source, target);

    expect(result.isAnomaly).toBe(true);
    expect(result.ratio).toBeGreaterThan(5);
  });

  it('should handle empty source string', () => {
    const source = '';
    const target = 'Some text';

    const result = detectLengthAnomaly(source, target);

    expect(result.isAnomaly).toBe(true);
    expect(result.ratio).toBe(Infinity);
    expect(result.sourceLength).toBe(0);
    expect(result.targetLength).toBe(9);
  });

  it('should handle empty target string', () => {
    const source = 'Some text';
    const target = '';

    const result = detectLengthAnomaly(source, target);

    expect(result.isAnomaly).toBe(false);
    expect(result.ratio).toBe(0);
    expect(result.sourceLength).toBe(9);
    expect(result.targetLength).toBe(0);
  });

  it('should handle both empty strings', () => {
    const source = '';
    const target = '';

    const result = detectLengthAnomaly(source, target);

    expect(result.isAnomaly).toBe(false);
    expect(result.sourceLength).toBe(0);
    expect(result.targetLength).toBe(0);
  });

  it('should use configurable threshold', () => {
    const source = 'Hi';
    const target = 'Hello there friend';

    // With default threshold (5x)
    const resultDefault = detectLengthAnomaly(source, target);
    expect(resultDefault.isAnomaly).toBe(true);

    // With higher threshold (10x)
    const resultHighThreshold = detectLengthAnomaly(source, target, { threshold: 10 });
    expect(resultHighThreshold.isAnomaly).toBe(false);

    // With lower threshold (2x)
    const resultLowThreshold = detectLengthAnomaly(source, target, { threshold: 2 });
    expect(resultLowThreshold.isAnomaly).toBe(true);
  });

  it('should calculate ratio correctly', () => {
    const source = 'abc';
    const target = 'abcdef';

    const result = detectLengthAnomaly(source, target);

    expect(result.ratio).toBe(2);
    expect(result.sourceLength).toBe(3);
    expect(result.targetLength).toBe(6);
  });

  it('should pass when target is exactly at threshold', () => {
    const source = 'ab';
    const target = 'a'.repeat(10); // Exactly 5x

    const result = detectLengthAnomaly(source, target);

    expect(result.isAnomaly).toBe(false);
    expect(result.ratio).toBe(5);
  });

  it('should flag when target exceeds threshold by 1 char', () => {
    const source = 'ab';
    const target = 'a'.repeat(11); // 5.5x

    const result = detectLengthAnomaly(source, target);

    expect(result.isAnomaly).toBe(true);
    expect(result.ratio).toBe(5.5);
  });

  it('should handle very long strings', () => {
    const source = 'a'.repeat(100);
    const target = 'b'.repeat(600);

    const result = detectLengthAnomaly(source, target);

    expect(result.isAnomaly).toBe(true);
    expect(result.ratio).toBe(6);
  });

  it('should handle Unicode characters correctly', () => {
    const source = '你好';
    const target = 'Hello there';

    const result = detectLengthAnomaly(source, target);

    expect(result.sourceLength).toBe(2);
    expect(result.targetLength).toBe(11);
    expect(result.ratio).toBe(5.5);
    expect(result.isAnomaly).toBe(true);
  });
});
