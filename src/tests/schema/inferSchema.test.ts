import { describe, it, expect } from 'vitest';
import { inferSchema, detectFormat, mergeSchemas } from '@/lib/schema/inferSchema';
import type { JsonSchema } from '@/lib/types';

describe('inferSchema', () => {
  describe('primitive types', () => {
    it('should infer null type', () => {
      const schema = inferSchema(null);
      expect(schema.type).toBe('null');
    });

    it('should infer boolean type for true', () => {
      const schema = inferSchema(true);
      expect(schema.type).toBe('boolean');
    });

    it('should infer boolean type for false', () => {
      const schema = inferSchema(false);
      expect(schema.type).toBe('boolean');
    });

    it('should infer integer type for whole numbers', () => {
      const schema = inferSchema(42);
      expect(schema.type).toBe('integer');
    });

    it('should infer number type for floating point', () => {
      const schema = inferSchema(3.14);
      expect(schema.type).toBe('number');
    });

    it('should infer string type', () => {
      const schema = inferSchema('hello');
      expect(schema.type).toBe('string');
    });

    it('should infer integer for negative whole numbers', () => {
      const schema = inferSchema(-100);
      expect(schema.type).toBe('integer');
    });

    it('should infer number for negative decimals', () => {
      const schema = inferSchema(-3.14);
      expect(schema.type).toBe('number');
    });

    it('should infer integer for zero', () => {
      const schema = inferSchema(0);
      expect(schema.type).toBe('integer');
    });
  });

  describe('string format detection', () => {
    it('should detect email format', () => {
      const schema = inferSchema('user@example.com');
      expect(schema.type).toBe('string');
      expect(schema.format).toBe('email');
    });

    it('should detect uuid format', () => {
      const schema = inferSchema('550e8400-e29b-41d4-a716-446655440000');
      expect(schema.type).toBe('string');
      expect(schema.format).toBe('uuid');
    });

    it('should detect date-time format', () => {
      const schema = inferSchema('2024-01-15T10:30:00Z');
      expect(schema.type).toBe('string');
      expect(schema.format).toBe('date-time');
    });

    it('should detect date format', () => {
      const schema = inferSchema('2024-01-15');
      expect(schema.type).toBe('string');
      expect(schema.format).toBe('date');
    });

    it('should detect uri format for http', () => {
      const schema = inferSchema('https://example.com/path');
      expect(schema.type).toBe('string');
      expect(schema.format).toBe('uri');
    });

    it('should detect ipv4 format', () => {
      const schema = inferSchema('192.168.1.1');
      expect(schema.type).toBe('string');
      expect(schema.format).toBe('ipv4');
    });

    it('should not add format for regular strings', () => {
      const schema = inferSchema('just a regular string');
      expect(schema.type).toBe('string');
      expect(schema.format).toBeUndefined();
    });
  });

  describe('object inference', () => {
    it('should infer empty object', () => {
      const schema = inferSchema({});
      expect(schema.type).toBe('object');
      expect(schema.properties).toEqual({});
    });

    it('should infer object with single property', () => {
      const schema = inferSchema({ name: 'John' });
      expect(schema.type).toBe('object');
      expect(schema.properties).toBeDefined();
      expect(schema.properties!.name.type).toBe('string');
    });

    it('should infer object with multiple properties', () => {
      const schema = inferSchema({
        name: 'John',
        age: 30,
        active: true,
      });
      expect(schema.type).toBe('object');
      expect(schema.properties!.name.type).toBe('string');
      expect(schema.properties!.age.type).toBe('integer');
      expect(schema.properties!.active.type).toBe('boolean');
    });

    it('should mark non-null fields as required', () => {
      const schema = inferSchema({
        name: 'John',
        email: 'john@example.com',
      });
      expect(schema.required).toContain('name');
      expect(schema.required).toContain('email');
    });

    it('should handle nested objects', () => {
      const schema = inferSchema({
        user: {
          name: 'John',
          address: {
            city: 'Seoul',
          },
        },
      });
      expect(schema.type).toBe('object');
      expect(schema.properties!.user.type).toBe('object');
      expect(schema.properties!.user.properties!.name.type).toBe('string');
      expect(schema.properties!.user.properties!.address.type).toBe('object');
      expect(schema.properties!.user.properties!.address.properties!.city.type).toBe('string');
    });
  });

  describe('array inference', () => {
    it('should infer empty array', () => {
      const schema = inferSchema([]);
      expect(schema.type).toBe('array');
      expect((schema.items as JsonSchema).type).toBe('null');
    });

    it('should infer array of strings', () => {
      const schema = inferSchema(['a', 'b', 'c']);
      expect(schema.type).toBe('array');
      expect((schema.items as JsonSchema).type).toBe('string');
    });

    it('should infer array of numbers', () => {
      const schema = inferSchema([1, 2, 3]);
      expect(schema.type).toBe('array');
      expect((schema.items as JsonSchema).type).toBe('integer');
    });

    it('should infer array of objects', () => {
      const schema = inferSchema([
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ]);
      expect(schema.type).toBe('array');
      expect((schema.items as JsonSchema).type).toBe('object');
      expect((schema.items as JsonSchema).properties!.name.type).toBe('string');
      expect((schema.items as JsonSchema).properties!.age.type).toBe('integer');
    });

    it('should handle mixed types in array', () => {
      const schema = inferSchema([1, 'hello', true]);
      expect(schema.type).toBe('array');
      const itemType = (schema.items as JsonSchema).type;
      expect(Array.isArray(itemType)).toBe(true);
      expect(itemType).toContain('integer');
      expect(itemType).toContain('string');
      expect(itemType).toContain('boolean');
    });

    it('should handle array of arrays', () => {
      const schema = inferSchema([[1, 2], [3, 4]]);
      expect(schema.type).toBe('array');
      expect((schema.items as JsonSchema).type).toBe('array');
      expect(((schema.items as JsonSchema).items as JsonSchema).type).toBe('integer');
    });
  });

  describe('complex scenarios', () => {
    it('should infer schema for user profile', () => {
      const sample = {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        email: 'user@example.com',
        name: 'John Doe',
        age: 28,
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        tags: ['developer', 'designer'],
        address: {
          city: 'Seoul',
          zipCode: '06000',
        },
      };

      const schema = inferSchema(sample);

      expect(schema.type).toBe('object');
      expect(schema.properties!.id.format).toBe('uuid');
      expect(schema.properties!.email.format).toBe('email');
      expect(schema.properties!.name.type).toBe('string');
      expect(schema.properties!.age.type).toBe('integer');
      expect(schema.properties!.isActive.type).toBe('boolean');
      expect(schema.properties!.createdAt.format).toBe('date-time');
      expect(schema.properties!.tags.type).toBe('array');
      expect(schema.properties!.address.type).toBe('object');
    });

    it('should handle nullable values in objects', () => {
      const schema = inferSchema({
        name: 'John',
        nickname: null,
      });
      expect(schema.properties!.name.type).toBe('string');
      expect(schema.properties!.nickname.type).toBe('null');
    });
  });
});

describe('detectFormat', () => {
  it('should return undefined for non-matching strings', () => {
    expect(detectFormat('hello world')).toBeUndefined();
  });

  it('should detect various email formats', () => {
    expect(detectFormat('test@example.com')).toBe('email');
    expect(detectFormat('user.name@domain.co.kr')).toBe('email');
    expect(detectFormat('user+tag@example.org')).toBe('email');
  });

  it('should detect UUID formats', () => {
    expect(detectFormat('550e8400-e29b-41d4-a716-446655440000')).toBe('uuid');
    expect(detectFormat('550E8400-E29B-41D4-A716-446655440000')).toBe('uuid'); // uppercase
  });

  it('should detect date formats', () => {
    expect(detectFormat('2024-01-15')).toBe('date');
    expect(detectFormat('2024-12-31')).toBe('date');
  });

  it('should detect date-time formats', () => {
    expect(detectFormat('2024-01-15T10:30:00Z')).toBe('date-time');
    expect(detectFormat('2024-01-15T10:30:00+09:00')).toBe('date-time');
    expect(detectFormat('2024-01-15T10:30:00.123Z')).toBe('date-time');
  });

  it('should detect URI formats', () => {
    expect(detectFormat('http://example.com')).toBe('uri');
    expect(detectFormat('https://example.com/path?query=1')).toBe('uri');
  });

  it('should detect IPv4 formats', () => {
    expect(detectFormat('192.168.1.1')).toBe('ipv4');
    expect(detectFormat('10.0.0.1')).toBe('ipv4');
    expect(detectFormat('255.255.255.255')).toBe('ipv4');
  });
});

describe('mergeSchemas', () => {
  it('should return null type for empty array', () => {
    const merged = mergeSchemas([]);
    expect(merged.type).toBe('null');
  });

  it('should return the schema for single element', () => {
    const schema: JsonSchema = { type: 'string' };
    const merged = mergeSchemas([schema]);
    expect(merged).toEqual(schema);
  });

  it('should merge same types', () => {
    const schemas: JsonSchema[] = [
      { type: 'string' },
      { type: 'string' },
    ];
    const merged = mergeSchemas(schemas);
    expect(merged.type).toBe('string');
  });

  it('should create union for different types', () => {
    const schemas: JsonSchema[] = [
      { type: 'string' },
      { type: 'integer' },
    ];
    const merged = mergeSchemas(schemas);
    expect(Array.isArray(merged.type)).toBe(true);
    expect(merged.type).toContain('string');
    expect(merged.type).toContain('integer');
  });

  it('should merge object properties', () => {
    const schemas: JsonSchema[] = [
      { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] },
      { type: 'object', properties: { a: { type: 'string' }, b: { type: 'integer' } }, required: ['a', 'b'] },
    ];
    const merged = mergeSchemas(schemas);
    expect(merged.type).toBe('object');
    expect(merged.properties!.a.type).toBe('string');
    expect(merged.properties!.b.type).toBe('integer');
  });

  it('should compute intersection of required fields', () => {
    const schemas: JsonSchema[] = [
      { type: 'object', properties: { a: { type: 'string' }, b: { type: 'integer' } }, required: ['a', 'b'] },
      { type: 'object', properties: { a: { type: 'string' }, c: { type: 'boolean' } }, required: ['a', 'c'] },
    ];
    const merged = mergeSchemas(schemas);
    expect(merged.required).toContain('a');
    expect(merged.required).not.toContain('b');
    expect(merged.required).not.toContain('c');
  });
});
