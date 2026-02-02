import { describe, it, expect } from 'vitest';
import { compareJson, extractKeyOrder } from '@/lib/intl/diff/compare';

describe('compareJson', () => {
  it('should detect missing keys', () => {
    const source = { name: 'John', age: 30 };
    const target = { name: 'John' };

    const result = compareJson(source, target);

    expect(result.operations).toContainEqual(
      expect.objectContaining({
        type: 'MISSING',
        keyPath: 'age',
        sourceValue: 30,
        targetValue: undefined,
      })
    );
    expect(result.stats.missing).toBe(1);
  });

  it('should detect orphaned keys', () => {
    const source = { name: 'John' };
    const target = { name: 'John', age: 30 };

    const result = compareJson(source, target);

    expect(result.operations).toContainEqual(
      expect.objectContaining({
        type: 'ORPHANED',
        keyPath: 'age',
        sourceValue: undefined,
        targetValue: 30,
      })
    );
    expect(result.stats.orphaned).toBe(1);
  });

  it('should handle nested objects', () => {
    const source = {
      user: {
        profile: {
          name: 'John',
          email: 'john@example.com',
        },
      },
    };
    const target = {
      user: {
        profile: {
          name: 'John',
        },
      },
    };

    const result = compareJson(source, target);

    expect(result.operations).toContainEqual(
      expect.objectContaining({
        type: 'MISSING',
        keyPath: 'user.profile.email',
        sourceValue: 'john@example.com',
      })
    );
    expect(result.stats.missing).toBe(1);
  });

  it('should detect type mismatches', () => {
    const source = { count: 42 };
    const target = { count: '42' };

    const result = compareJson(source, target);

    expect(result.operations).toContainEqual(
      expect.objectContaining({
        type: 'TYPE_MISMATCH',
        keyPath: 'count',
        sourceValue: 42,
        targetValue: '42',
      })
    );
    expect(result.stats.typeMismatch).toBe(1);
  });

  it('should handle arrays', () => {
    const source = { tags: ['a', 'b', 'c'] };
    const target = { tags: ['a', 'b'] };

    const result = compareJson(source, target);

    expect(result.operations).toContainEqual(
      expect.objectContaining({
        type: 'VALUE_DIFF',
        keyPath: 'tags',
      })
    );
  });

  it('should return stats correctly', () => {
    const source = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
      phone: '123',
    };
    const target = {
      name: 'John',
      age: '30',
      city: 'NYC',
    };

    const result = compareJson(source, target);

    expect(result.stats.missing).toBe(2); // email, phone
    expect(result.stats.orphaned).toBe(1); // city
    expect(result.stats.typeMismatch).toBe(1); // age
    expect(result.stats.equal).toBe(1); // name
  });

  it('should handle empty objects', () => {
    const source = {};
    const target = {};

    const result = compareJson(source, target);

    expect(result.operations).toHaveLength(0);
    expect(result.stats.equal).toBe(0);
    expect(result.stats.missing).toBe(0);
  });

  it('should handle deeply nested structures', () => {
    const source = {
      a: {
        b: {
          c: {
            d: 'value',
          },
        },
      },
    };
    const target = {
      a: {
        b: {
          c: {},
        },
      },
    };

    const result = compareJson(source, target);

    expect(result.operations).toContainEqual(
      expect.objectContaining({
        type: 'MISSING',
        keyPath: 'a.b.c.d',
        sourceValue: 'value',
      })
    );
  });
});

describe('extractKeyOrder', () => {
  it('should extract top-level keys', () => {
    const obj = { name: 'John', age: 30, email: 'test@test.com' };
    const keys = extractKeyOrder(obj);

    expect(keys).toEqual(['name', 'age', 'email']);
  });

  it('should extract nested keys with dot notation', () => {
    const obj = {
      user: {
        profile: {
          name: 'John',
        },
      },
    };
    const keys = extractKeyOrder(obj);

    expect(keys).toContain('user');
    expect(keys).toContain('user.profile');
    expect(keys).toContain('user.profile.name');
  });

  it('should handle arrays', () => {
    const obj = {
      items: ['a', 'b'],
      nested: {
        list: [1, 2, 3],
      },
    };
    const keys = extractKeyOrder(obj);

    expect(keys).toContain('items');
    expect(keys).toContain('nested');
    expect(keys).toContain('nested.list');
  });

  it('should handle empty objects', () => {
    const obj = {};
    const keys = extractKeyOrder(obj);

    expect(keys).toEqual([]);
  });

  it('should preserve key order', () => {
    const obj = { z: 1, a: 2, m: 3 };
    const keys = extractKeyOrder(obj);

    expect(keys).toEqual(['z', 'a', 'm']);
  });
});
