import { describe, it, expect } from 'vitest';
import { validateI18nJson } from '@/lib/intl/validation/schema';

describe('validateI18nJson', () => {
  it('should accept valid flat JSON', () => {
    const validFlat = {
      greeting: 'Hello',
      farewell: 'Goodbye',
      welcome: 'Welcome'
    };

    const result = validateI18nJson(validFlat);

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept valid nested JSON', () => {
    const validNested = {
      common: {
        greeting: 'Hello',
        farewell: 'Goodbye'
      },
      auth: {
        login: {
          title: 'Login',
          submit: 'Sign In'
        }
      }
    };

    const result = validateI18nJson(validNested);

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject non-string leaf values', () => {
    const invalidNumber = {
      count: 42
    };

    const result = validateI18nJson(invalidNumber);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].path).toBe('count');
    expect(result.errors[0].message).toContain('string');
  });

  it('should reject array values', () => {
    const invalidArray = {
      items: ['one', 'two', 'three']
    };

    const result = validateI18nJson(invalidArray);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].path).toBe('items');
  });

  it('should return error paths for nested invalid values', () => {
    const invalidNested = {
      common: {
        greeting: 'Hello',
        count: 10
      },
      auth: {
        enabled: true
      }
    };

    const result = validateI18nJson(invalidNested);

    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(2);

    const paths = result.errors.map(e => e.path).sort();
    expect(paths).toContain('common.count');
    expect(paths).toContain('auth.enabled');
  });

  it('should reject deeply nested non-string values', () => {
    const deepInvalid = {
      level1: {
        level2: {
          level3: {
            value: null
          }
        }
      }
    };

    const result = validateI18nJson(deepInvalid);

    expect(result.success).toBe(false);
    expect(result.errors[0].path).toBe('level1.level2.level3.value');
  });

  it('should accept empty object', () => {
    const result = validateI18nJson({});

    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject non-object input', () => {
    const result = validateI18nJson('not an object');

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
