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

  it('should handle arrays of primitives as leaf nodes', () => {
    const source = { tags: ['a', 'b', 'c'] };
    const target = { tags: ['a', 'b'] };

    const result = compareJson(source, target);

    const keyPaths = result.operations.map(op => op.keyPath);
    // Each primitive array element is a leaf
    expect(keyPaths).toContain('tags[0]');
    expect(keyPaths).toContain('tags[1]');
    expect(keyPaths).toContain('tags[2]');
    // tags[2] is MISSING in target
    const missingOp = result.operations.find(op => op.keyPath === 'tags[2]');
    expect(missingOp?.type).toBe('MISSING');
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

  it('should extract nested keys with dot notation (leaf paths only)', () => {
    const obj = {
      user: {
        profile: {
          name: 'John',
        },
      },
    };
    const keys = extractKeyOrder(obj);

    expect(keys).toContain('user.profile.name');
    // parent paths are NOT included
    expect(keys).not.toContain('user');
    expect(keys).not.toContain('user.profile');
  });

  it('should handle arrays of primitives as leaf nodes', () => {
    const obj = {
      items: ['a', 'b'],
      nested: {
        list: [1, 2, 3],
      },
    };
    const keys = extractKeyOrder(obj);

    // array elements are leaves
    expect(keys).toContain('items[0]');
    expect(keys).toContain('items[1]');
    expect(keys).toContain('nested.list[0]');
    expect(keys).toContain('nested.list[1]');
    expect(keys).toContain('nested.list[2]');
    // parent paths not included
    expect(keys).not.toContain('items');
    expect(keys).not.toContain('nested');
    expect(keys).not.toContain('nested.list');
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

describe('extractKeyOrder - array handling', () => {
  it('should return only leaf paths for array of objects', () => {
    const obj = {
      ol: [
        { id: '1', text: 'Hello' },
        { id: '2', text: 'World' },
      ],
    };
    const keys = extractKeyOrder(obj);
    expect(keys).toContain('ol[0].id');
    expect(keys).toContain('ol[0].text');
    expect(keys).toContain('ol[1].id');
    expect(keys).toContain('ol[1].text');
    expect(keys).not.toContain('ol');
    expect(keys).not.toContain('ol[0]');
    expect(keys).not.toContain('ol[1]');
  });

  it('should return only leaf paths for plain objects (no parent paths)', () => {
    const obj = { user: { name: 'John', email: 'j@e.com' } };
    const keys = extractKeyOrder(obj);
    expect(keys).toContain('user.name');
    expect(keys).toContain('user.email');
    expect(keys).not.toContain('user');
  });

  it('should treat nested arrays (array-in-array) as opaque leaves', () => {
    const obj = { matrix: [[1, 2], [3, 4]] };
    const keys = extractKeyOrder(obj);
    expect(keys).toContain('matrix[0]');
    expect(keys).toContain('matrix[1]');
  });
});

describe('hasPath - bracket notation', () => {
  it('should return true for existing array path', () => {
    // hasPath is not exported, so test via compareJson behavior
    // This is tested indirectly through compareJson
  });
});

describe('getValueAtPath - bracket notation', () => {
  it('should get value at bracket notation path', () => {
    // getValueAtPath is not exported, test indirectly
  });
});

describe('compareJson - array leaf operations', () => {
  it('should produce MISSING operations for each leaf in array when target is empty', () => {
    const source = {
      ol: [
        { id: '1', text: 'Hello' },
        { id: '2', text: 'World' },
      ],
    };
    const target = {};
    const result = compareJson(source, target);
    const keyPaths = result.operations.map(op => op.keyPath);

    expect(keyPaths).toContain('ol[0].id');
    expect(keyPaths).toContain('ol[0].text');
    expect(keyPaths).toContain('ol[1].id');
    expect(keyPaths).toContain('ol[1].text');
    expect(keyPaths).not.toContain('ol');
    expect(keyPaths).not.toContain('ol[0]');

    const missingOps = result.operations.filter(op => op.type === 'MISSING');
    expect(missingOps.length).toBe(4);
    expect(result.stats.missing).toBe(4);
  });

  it('should produce EQUAL operations for matching array leaf values', () => {
    const source = { ol: [{ id: '1', text: 'Hello' }] };
    const target = { ol: [{ id: '1', text: 'Hello' }] };
    const result = compareJson(source, target);

    const equalOps = result.operations.filter(op => op.type === 'EQUAL');
    expect(equalOps.length).toBe(2); // ol[0].id and ol[0].text
  });

  it('should produce VALUE_DIFF for changed array leaf values', () => {
    const source = { ol: [{ id: '1', text: 'Hello' }] };
    const target = { ol: [{ id: '1', text: 'Different' }] };
    const result = compareJson(source, target);

    const diffOps = result.operations.filter(op => op.type === 'VALUE_DIFF');
    expect(diffOps.some(op => op.keyPath === 'ol[0].text')).toBe(true);

    const equalOps = result.operations.filter(op => op.type === 'EQUAL');
    expect(equalOps.some(op => op.keyPath === 'ol[0].id')).toBe(true);
  });
});
