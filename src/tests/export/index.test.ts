import { describe, it, expect } from 'vitest';
import {
  exportToJson,
  exportToCsv,
  exportToSql,
  exportToTypeScript,
} from '@/lib/export/index';

describe('export/index barrel exports', () => {
  describe('exportToJson re-export', () => {
    it('should export functional exportToJson', () => {
      const data = [{ name: 'Test', value: 42 }];
      const result = exportToJson(data);
      expect(result).toBe(JSON.stringify(data, null, 2));
    });

    it('should accept options parameter', () => {
      const data = [{ key: 'value' }];
      const result = exportToJson(data, { indent: 4 });
      expect(result).toBe(JSON.stringify(data, null, 4));
    });
  });

  describe('exportToCsv re-export', () => {
    it('should export functional exportToCsv', () => {
      const data = [{ name: 'Alice', age: 30 }];
      const result = exportToCsv(data);
      expect(result).toContain('name,age');
      expect(result).toContain('Alice,30');
    });

    it('should accept options parameter', () => {
      const data = [{ a: 1, b: 2 }];
      const result = exportToCsv(data, { delimiter: ';' });
      expect(result).toContain('a;b');
      expect(result).toContain('1;2');
    });
  });

  describe('exportToSql re-export', () => {
    it('should export functional exportToSql', () => {
      const data = [{ id: 1, name: 'Test' }];
      const result = exportToSql(data, { tableName: 'test_table' });
      expect(result).toContain('INSERT INTO test_table');
      expect(result).toContain("'Test'");
    });

    it('should accept options parameter with dialect', () => {
      const data = [{ active: true }];
      const result = exportToSql(data, { tableName: 'users', dialect: 'postgresql' });
      expect(result).toContain('TRUE');
    });
  });

  describe('exportToTypeScript re-export', () => {
    it('should export functional exportToTypeScript', () => {
      const data = [{ name: 'John', age: 25 }];
      const result = exportToTypeScript(data, { interfaceName: 'Person' });
      expect(result).toContain('export interface Person');
      expect(result).toContain('name: string');
      expect(result).toContain('age: number');
    });

    it('should accept options parameter', () => {
      const data = [{ id: 1 }];
      const result = exportToTypeScript(data, { interfaceName: 'Entity' });
      expect(result).toContain('interface Entity');
    });
  });

  describe('type exports', () => {
    it('should export all function types', () => {
      // Type-level test - if this compiles, the types are exported
      type Exports = {
        exportToJson: typeof exportToJson;
        exportToCsv: typeof exportToCsv;
        exportToSql: typeof exportToSql;
        exportToTypeScript: typeof exportToTypeScript;
      };

      const exports: Exports = {
        exportToJson,
        exportToCsv,
        exportToSql,
        exportToTypeScript,
      };

      // Verify all exports are functions
      expect(typeof exports.exportToJson).toBe('function');
      expect(typeof exports.exportToCsv).toBe('function');
      expect(typeof exports.exportToSql).toBe('function');
      expect(typeof exports.exportToTypeScript).toBe('function');
    });
  });

  describe('integration - all exports work together', () => {
    it('should be able to convert same data to all formats', () => {
      const data = [
        { id: 1, name: 'Alice', active: true },
        { id: 2, name: 'Bob', active: false },
      ];

      const json = exportToJson(data);
      const csv = exportToCsv(data);
      const sql = exportToSql(data, { tableName: 'users' });
      const ts = exportToTypeScript(data, { interfaceName: 'User' });

      // Verify all formats produce non-empty output
      expect(json.length).toBeGreaterThan(0);
      expect(csv.length).toBeGreaterThan(0);
      expect(sql.length).toBeGreaterThan(0);
      expect(ts.length).toBeGreaterThan(0);

      // Verify each format has expected content
      expect(json).toContain('Alice');
      expect(csv).toContain('Alice');
      expect(sql).toContain('Alice');
      expect(ts).toContain('name: string');
    });
  });
});
