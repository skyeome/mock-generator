import { describe, it, expect } from 'vitest';
import { reorderKeys } from '@/lib/intl/diff/reorder';

describe('reorderKeys', () => {
  it('should reorder target to match source order', () => {
    const source = {
      name: 'John',
      age: 30,
      email: 'john@example.com',
    };

    const target = {
      email: 'jane@example.com',
      name: 'Jane',
      age: 25,
    };

    const result = reorderKeys(target, source);

    expect(Object.keys(result)).toEqual(['name', 'age', 'email']);
    expect(result).toEqual({
      name: 'Jane',
      age: 25,
      email: 'jane@example.com',
    });
  });

  it('should preserve orphaned keys at the end', () => {
    const source = {
      name: 'John',
      age: 30,
    };

    const target = {
      email: 'jane@example.com',
      name: 'Jane',
      age: 25,
      country: 'USA',
    };

    const result = reorderKeys(target, source);

    expect(Object.keys(result)).toEqual(['name', 'age', 'email', 'country']);
    expect(result).toEqual({
      name: 'Jane',
      age: 25,
      email: 'jane@example.com',
      country: 'USA',
    });
  });

  it('should handle nested objects', () => {
    const source = {
      user: {
        name: 'John',
        profile: {
          age: 30,
          bio: 'Developer',
        },
      },
      settings: {
        theme: 'dark',
      },
    };

    const target = {
      settings: {
        theme: 'light',
        notifications: true,
      },
      user: {
        profile: {
          bio: 'Engineer',
          age: 25,
          avatar: 'url',
        },
        name: 'Jane',
      },
    };

    const result = reorderKeys(target, source);

    expect(Object.keys(result)).toEqual(['user', 'settings']);
    expect(Object.keys(result.user)).toEqual(['name', 'profile']);
    expect(Object.keys(result.user.profile)).toEqual(['age', 'bio', 'avatar']);
    expect(Object.keys(result.settings)).toEqual(['theme', 'notifications']);
  });

  it('should handle empty objects', () => {
    const source = {};
    const target = {
      name: 'Jane',
      age: 25,
    };

    const result = reorderKeys(target, source);

    expect(Object.keys(result)).toEqual(['name', 'age']);
    expect(result).toEqual(target);
  });

  it('should handle when target is empty', () => {
    const source = {
      name: 'John',
      age: 30,
    };
    const target = {};

    const result = reorderKeys(target, source);

    expect(result).toEqual({});
  });

  it('should preserve non-object values', () => {
    const source = {
      name: 'John',
      tags: ['tag1', 'tag2'],
      count: 5,
      active: true,
      metadata: null,
    };

    const target = {
      active: false,
      count: 10,
      metadata: null,
      name: 'Jane',
      tags: ['tag3'],
    };

    const result = reorderKeys(target, source);

    expect(Object.keys(result)).toEqual(['name', 'tags', 'count', 'active', 'metadata']);
    expect(result).toEqual({
      name: 'Jane',
      tags: ['tag3'],
      count: 10,
      active: false,
      metadata: null,
    });
  });
});
