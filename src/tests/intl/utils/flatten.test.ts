import { describe, it, expect } from 'vitest';
import { flattenJson, unflattenJson, getNestedValue, setNestedValue, parsePath } from '@/lib/intl/utils/flatten';

describe('flattenJson', () => {
  it('should flatten nested object', () => {
    const obj = {
      user: {
        name: 'John',
        profile: {
          age: 30,
        },
      },
      active: true,
    };

    const result = flattenJson(obj);

    expect(result.get('user.name')).toBe('John');
    expect(result.get('user.profile.age')).toBe(30);
    expect(result.get('active')).toBe(true);
    expect(result.size).toBe(3);
  });

  it('should handle arrays as values', () => {
    const obj = {
      tags: ['tag1', 'tag2'],
      user: {
        roles: ['admin', 'user'],
      },
    };

    const result = flattenJson(obj);

    expect(result.get('tags')).toEqual(['tag1', 'tag2']);
    expect(result.get('user.roles')).toEqual(['admin', 'user']);
  });

  it('should handle empty object', () => {
    const obj = {};
    const result = flattenJson(obj);

    expect(result.size).toBe(0);
  });

  it('should handle single level object', () => {
    const obj = {
      name: 'John',
      age: 30,
    };

    const result = flattenJson(obj);

    expect(result.get('name')).toBe('John');
    expect(result.get('age')).toBe(30);
    expect(result.size).toBe(2);
  });

  it('should handle deep nesting (10 levels)', () => {
    const obj = {
      l1: {
        l2: {
          l3: {
            l4: {
              l5: {
                l6: {
                  l7: {
                    l8: {
                      l9: {
                        l10: 'deep value',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = flattenJson(obj);

    expect(result.get('l1.l2.l3.l4.l5.l6.l7.l8.l9.l10')).toBe('deep value');
  });

  it('should use custom prefix', () => {
    const obj = {
      name: 'John',
      nested: {
        value: 42,
      },
    };

    const result = flattenJson(obj, 'root');

    expect(result.get('root.name')).toBe('John');
    expect(result.get('root.nested.value')).toBe(42);
  });
});

describe('unflattenJson', () => {
  it('should unflatten to original structure', () => {
    const map = new Map<string, unknown>([
      ['user.name', 'John'],
      ['user.profile.age', 30],
      ['active', true],
    ]);

    const result = unflattenJson(map);

    expect(result).toEqual({
      user: {
        name: 'John',
        profile: {
          age: 30,
        },
      },
      active: true,
    });
  });

  it('should handle empty map', () => {
    const map = new Map<string, unknown>();
    const result = unflattenJson(map);

    expect(result).toEqual({});
  });

  it('should handle single level keys', () => {
    const map = new Map<string, unknown>([
      ['name', 'John'],
      ['age', 30],
    ]);

    const result = unflattenJson(map);

    expect(result).toEqual({
      name: 'John',
      age: 30,
    });
  });

  it('should handle deep nesting (10 levels)', () => {
    const map = new Map<string, unknown>([
      ['l1.l2.l3.l4.l5.l6.l7.l8.l9.l10', 'deep value'],
    ]);

    const result = unflattenJson(map);

    expect(result).toEqual({
      l1: {
        l2: {
          l3: {
            l4: {
              l5: {
                l6: {
                  l7: {
                    l8: {
                      l9: {
                        l10: 'deep value',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  it('should roundtrip flatten/unflatten', () => {
    const original = {
      user: {
        name: 'John',
        profile: {
          age: 30,
          bio: 'Developer',
        },
      },
      settings: {
        theme: 'dark',
        notifications: true,
      },
    };

    const flattened = flattenJson(original);
    const unflattened = unflattenJson(flattened);

    expect(unflattened).toEqual(original);
  });
});

describe('getNestedValue', () => {
  const obj = {
    user: {
      name: 'John',
      profile: {
        age: 30,
        bio: 'Developer',
      },
    },
    active: true,
  };

  it('should get nested value by path', () => {
    expect(getNestedValue(obj, 'user.name')).toBe('John');
    expect(getNestedValue(obj, 'user.profile.age')).toBe(30);
    expect(getNestedValue(obj, 'active')).toBe(true);
  });

  it('should return undefined for non-existent path', () => {
    expect(getNestedValue(obj, 'user.email')).toBeUndefined();
    expect(getNestedValue(obj, 'nonexistent.path')).toBeUndefined();
  });

  it('should handle single level path', () => {
    expect(getNestedValue(obj, 'active')).toBe(true);
  });

  it('should handle empty path', () => {
    expect(getNestedValue(obj, '')).toEqual(obj);
  });

  it('should handle deep nesting (10 levels)', () => {
    const deepObj = {
      l1: {
        l2: {
          l3: {
            l4: {
              l5: {
                l6: {
                  l7: {
                    l8: {
                      l9: {
                        l10: 'deep value',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    expect(getNestedValue(deepObj, 'l1.l2.l3.l4.l5.l6.l7.l8.l9.l10')).toBe('deep value');
  });
});

describe('setNestedValue', () => {
  it('should set nested value by path', () => {
    const obj: Record<string, unknown> = {
      user: {
        name: 'John',
        profile: {
          age: 30,
        },
      },
    };

    setNestedValue(obj, 'user.profile.age', 31);
    expect(getNestedValue(obj, 'user.profile.age')).toBe(31);

    setNestedValue(obj, 'user.name', 'Jane');
    expect(getNestedValue(obj, 'user.name')).toBe('Jane');
  });

  it('should create nested structure if not exists', () => {
    const obj: Record<string, unknown> = {};

    setNestedValue(obj, 'user.profile.age', 30);

    expect(obj).toEqual({
      user: {
        profile: {
          age: 30,
        },
      },
    });
  });

  it('should handle single level path', () => {
    const obj: Record<string, unknown> = {
      name: 'John',
    };

    setNestedValue(obj, 'name', 'Jane');
    expect(obj.name).toBe('Jane');
  });

  it('should create new key at root level', () => {
    const obj: Record<string, unknown> = {};

    setNestedValue(obj, 'name', 'John');
    expect(obj.name).toBe('John');
  });

  it('should handle deep nesting (10 levels)', () => {
    const obj: Record<string, unknown> = {};

    setNestedValue(obj, 'l1.l2.l3.l4.l5.l6.l7.l8.l9.l10', 'deep value');

    expect(getNestedValue(obj, 'l1.l2.l3.l4.l5.l6.l7.l8.l9.l10')).toBe('deep value');
  });

  it('should overwrite existing value', () => {
    const obj: Record<string, unknown> = {
      user: {
        name: 'John',
      },
    };

    setNestedValue(obj, 'user.name', 'Jane');
    expect(getNestedValue(obj, 'user.name')).toBe('Jane');
  });
});

describe('parsePath', () => {
  it('should parse dot notation path', () => {
    expect(parsePath('a.b.c')).toEqual(['a', 'b', 'c']);
  });

  it('should parse bracket notation path', () => {
    expect(parsePath('items[0].name')).toEqual(['items', '0', 'name']);
  });

  it('should parse consecutive brackets', () => {
    expect(parsePath('matrix[0][1]')).toEqual(['matrix', '0', '1']);
  });

  it('should parse complex nested path', () => {
    expect(parsePath('certification.ol[0].title')).toEqual(['certification', 'ol', '0', 'title']);
  });

  it('should handle single key', () => {
    expect(parsePath('name')).toEqual(['name']);
  });

  it('should handle single index', () => {
    expect(parsePath('[0]')).toEqual(['0']);
  });

  it('should handle empty path', () => {
    expect(parsePath('')).toEqual([]);
  });

  it('should throw error for unclosed bracket', () => {
    expect(() => parsePath('items[0')).toThrow('Unclosed bracket in path: items[0');
  });
});

describe('getNestedValue with bracket notation', () => {
  it('should get value from array by index', () => {
    const obj = { items: ['a', 'b', 'c'] };
    expect(getNestedValue(obj, 'items[0]')).toBe('a');
    expect(getNestedValue(obj, 'items[2]')).toBe('c');
  });

  it('should get value from nested array of objects', () => {
    const obj = {
      certification: {
        ol: [
          { title: 'AWS Certified', desc: 'Cloud cert' },
          { title: 'GCP Associate', desc: 'Google cert' },
        ],
      },
    };
    expect(getNestedValue(obj, 'certification.ol[0].title')).toBe('AWS Certified');
    expect(getNestedValue(obj, 'certification.ol[1].desc')).toBe('Google cert');
  });

  it('should get value from 2D array', () => {
    const obj = { matrix: [['a', 'b'], ['c', 'd']] };
    expect(getNestedValue(obj, 'matrix[0][0]')).toBe('a');
    expect(getNestedValue(obj, 'matrix[1][1]')).toBe('d');
  });

  it('should return undefined for out of bounds index', () => {
    const obj = { items: ['a', 'b'] };
    expect(getNestedValue(obj, 'items[5]')).toBeUndefined();
  });

  it('should return undefined for negative index', () => {
    const obj = { items: ['a', 'b'] };
    expect(getNestedValue(obj, 'items[-1]')).toBeUndefined();
  });

  it('should return undefined for invalid index', () => {
    const obj = { items: ['a', 'b'] };
    expect(getNestedValue(obj, 'items[abc]')).toBeUndefined();
  });
});

describe('setNestedValue with bracket notation', () => {
  it('should set value in array by index', () => {
    const obj: Record<string, unknown> = { items: ['a', 'b', 'c'] };
    setNestedValue(obj, 'items[1]', 'updated');
    expect(obj.items).toEqual(['a', 'updated', 'c']);
  });

  it('should create array when setting with index notation', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'items[0]', 'first');
    expect(obj.items).toEqual(['first']);
  });

  it('should set nested value in array of objects', () => {
    const obj: Record<string, unknown> = {
      certification: { ol: [{ title: 'Original' }] },
    };
    setNestedValue(obj, 'certification.ol[0].title', 'Updated');
    expect((obj.certification as any).ol[0].title).toBe('Updated');
  });

  it('should create nested structure with arrays', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'certification.ol[0].title', 'New Title');
    expect(obj).toEqual({
      certification: {
        ol: [{ title: 'New Title' }],
      },
    });
  });

  it('should handle 2D array creation', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'matrix[0][0]', 'value');
    expect(obj).toEqual({
      matrix: [['value']],
    });
  });

  it('should expand array when setting higher index', () => {
    const obj: Record<string, unknown> = { items: ['a'] };
    setNestedValue(obj, 'items[3]', 'd');
    expect((obj.items as unknown[]).length).toBe(4);
    expect((obj.items as unknown[])[3]).toBe('d');
    expect((obj.items as unknown[])[1]).toBeUndefined();
    expect((obj.items as unknown[])[2]).toBeUndefined();
  });

  it('should handle mixed dot and bracket notation', () => {
    const obj: Record<string, unknown> = {};
    setNestedValue(obj, 'users[0].profile.settings[1].value', 'test');
    expect(obj).toEqual({
      users: [{
        profile: {
          settings: [undefined, { value: 'test' }],
        },
      }],
    });
  });
});
