import { describe, it, expect } from 'vitest';
import { exportToJson, exportToCsv, exportToSql, exportToTypeScript } from '@/lib/export';

describe('exportToJson', () => {
  it('should export data as formatted JSON string', () => {
    const data = [{ name: 'John', age: 30 }];
    const result = exportToJson(data);
    expect(result).toBe(JSON.stringify(data, null, 2));
  });

  it('should handle empty array', () => {
    const result = exportToJson([]);
    expect(result).toBe('[]');
  });

  it('should handle nested objects', () => {
    const data = [{ user: { name: 'John', address: { city: 'Seoul' } } }];
    const result = exportToJson(data);
    expect(result).toContain('"user"');
    expect(result).toContain('"address"');
    expect(result).toContain('"city"');
  });

  it('should handle special characters', () => {
    const data = [{ message: 'Hello "World"\nNew line' }];
    const result = exportToJson(data);
    expect(JSON.parse(result)).toEqual(data);
  });

  it('should respect indentation option', () => {
    const data = [{ name: 'John' }];
    const result = exportToJson(data, { indent: 4 });
    expect(result).toBe(JSON.stringify(data, null, 4));
  });
});

describe('exportToCsv', () => {
  it('should export data as CSV with headers', () => {
    const data = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ];
    const result = exportToCsv(data);
    const lines = result.split('\n');
    expect(lines[0]).toBe('name,age');
    expect(lines[1]).toBe('John,30');
    expect(lines[2]).toBe('Jane,25');
  });

  it('should handle empty array', () => {
    const result = exportToCsv([]);
    expect(result).toBe('');
  });

  it('should escape quotes in values', () => {
    const data = [{ message: 'Hello "World"' }];
    const result = exportToCsv(data);
    expect(result).toContain('"Hello ""World"""');
  });

  it('should escape commas in values', () => {
    const data = [{ address: 'Seoul, Korea' }];
    const result = exportToCsv(data);
    expect(result).toContain('"Seoul, Korea"');
  });

  it('should escape newlines in values', () => {
    const data = [{ text: 'Line1\nLine2' }];
    const result = exportToCsv(data);
    expect(result).toContain('"Line1\nLine2"');
  });

  it('should flatten nested objects', () => {
    const data = [{ user: { name: 'John', age: 30 } }];
    const result = exportToCsv(data);
    const lines = result.split('\n');
    expect(lines[0]).toContain('user.name');
    expect(lines[0]).toContain('user.age');
    expect(lines[1]).toContain('John');
    expect(lines[1]).toContain('30');
  });

  it('should handle arrays in values as JSON', () => {
    const data = [{ tags: ['a', 'b', 'c'] }];
    const result = exportToCsv(data);
    // Arrays are serialized as JSON and then escaped for CSV (quotes doubled)
    expect(result).toContain('tags');
    // The JSON is wrapped in CSV quotes with internal quotes escaped
    expect(result).toMatch(/"\[.*\]"/);
  });

  it('should respect custom delimiter', () => {
    const data = [{ name: 'John', age: 30 }];
    const result = exportToCsv(data, { delimiter: ';' });
    expect(result).toContain('name;age');
    expect(result).toContain('John;30');
  });

  it('should optionally exclude headers', () => {
    const data = [{ name: 'John', age: 30 }];
    const result = exportToCsv(data, { includeHeader: false });
    expect(result).toBe('John,30');
  });
});

describe('exportToSql', () => {
  it('should export data as SQL INSERT statements', () => {
    const data = [{ name: 'John', age: 30 }];
    const result = exportToSql(data, { tableName: 'users' });
    expect(result).toContain("INSERT INTO users");
    expect(result).toContain("name");
    expect(result).toContain("age");
    expect(result).toContain("'John'");
    expect(result).toContain("30");
  });

  it('should handle empty array', () => {
    const result = exportToSql([], { tableName: 'users' });
    expect(result).toBe('');
  });

  it('should escape single quotes in strings', () => {
    const data = [{ name: "O'Brien" }];
    const result = exportToSql(data, { tableName: 'users' });
    expect(result).toContain("O''Brien");
  });

  it('should handle null values', () => {
    const data = [{ name: 'John', nickname: null }];
    const result = exportToSql(data, { tableName: 'users' });
    expect(result).toContain('NULL');
  });

  it('should handle boolean values', () => {
    const data = [{ name: 'John', active: true }];
    const result = exportToSql(data, { tableName: 'users' });
    expect(result).toMatch(/TRUE|1|true/i);
  });

  it('should batch multiple records', () => {
    const data = [
      { name: 'John' },
      { name: 'Jane' },
      { name: 'Bob' },
    ];
    const result = exportToSql(data, { tableName: 'users' });
    expect(result).toContain("INSERT INTO users");
    expect(result).toContain("'John'");
    expect(result).toContain("'Jane'");
    expect(result).toContain("'Bob'");
  });

  it('should support PostgreSQL dialect', () => {
    const data = [{ active: true }];
    const result = exportToSql(data, { tableName: 'users', dialect: 'postgresql' });
    expect(result).toContain('TRUE');
  });

  it('should support MySQL dialect', () => {
    const data = [{ active: true }];
    const result = exportToSql(data, { tableName: 'users', dialect: 'mysql' });
    expect(result).toMatch(/TRUE|1/);
  });

  it('should support SQLite dialect', () => {
    const data = [{ active: true }];
    const result = exportToSql(data, { tableName: 'users', dialect: 'sqlite' });
    expect(result).toMatch(/1/);
  });

  it('should handle nested objects as JSON', () => {
    const data = [{ user: { name: 'John' } }];
    const result = exportToSql(data, { tableName: 'records' });
    expect(result).toContain('{"name":"John"}');
  });
});

describe('exportToTypeScript', () => {
  it('should generate TypeScript interface from data', () => {
    const data = [{ name: 'John', age: 30, active: true }];
    const result = exportToTypeScript(data, { interfaceName: 'User' });
    expect(result).toContain('interface User');
    expect(result).toContain('name: string');
    expect(result).toContain('age: number');
    expect(result).toContain('active: boolean');
  });

  it('should handle nested objects', () => {
    const data = [{ user: { name: 'John', email: 'john@example.com' } }];
    const result = exportToTypeScript(data, { interfaceName: 'Data' });
    expect(result).toContain('user: {');
    expect(result).toContain('name: string');
    expect(result).toContain('email: string');
  });

  it('should handle arrays', () => {
    const data = [{ tags: ['a', 'b'] }];
    const result = exportToTypeScript(data, { interfaceName: 'Item' });
    expect(result).toContain('tags: string[]');
  });

  it('should handle null values as optional', () => {
    const data = [{ name: 'John', nickname: null }];
    const result = exportToTypeScript(data, { interfaceName: 'User' });
    expect(result).toMatch(/nickname\??:\s*(null|unknown)/);
  });

  it('should handle empty array', () => {
    const result = exportToTypeScript([], { interfaceName: 'Empty' });
    expect(result).toContain('interface Empty');
  });

  it('should use export keyword by default', () => {
    const data = [{ name: 'John' }];
    const result = exportToTypeScript(data, { interfaceName: 'User' });
    expect(result).toContain('export interface User');
  });

  it('should handle mixed number types', () => {
    const data = [{ count: 42, price: 9.99 }];
    const result = exportToTypeScript(data, { interfaceName: 'Product' });
    expect(result).toContain('count: number');
    expect(result).toContain('price: number');
  });

  it('should handle date strings', () => {
    const data = [{ createdAt: '2024-01-15T10:30:00Z' }];
    const result = exportToTypeScript(data, { interfaceName: 'Record' });
    expect(result).toContain('createdAt: string');
  });
});
