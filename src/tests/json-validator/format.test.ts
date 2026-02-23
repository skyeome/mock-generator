import { describe, expect, it } from 'vitest';
import { minifyJson, prettifyJson } from '@/lib/json-validator/format';

describe('prettifyJson', () => {
  it('formats valid JSON with two-space indentation', () => {
    const input = '{"name":"Alice","meta":{"active":true}}';
    const result = prettifyJson(input);

    expect(result).toEqual({
      success: true,
      output: '{\n  "name": "Alice",\n  "meta": {\n    "active": true\n  }\n}',
    });
  });

  it('does not append a trailing newline', () => {
    const result = prettifyJson('{"x":1}');

    expect(result.success).toBe(true);
    expect(result.output.endsWith('\n')).toBe(false);
  });

  it('returns stable error for invalid JSON', () => {
    const result = prettifyJson('{"name":}');

    expect(result).toEqual({
      success: false,
      output: '',
      error: 'Invalid JSON syntax',
    });
  });
});

describe('minifyJson', () => {
  it('minifies valid JSON', () => {
    const input = '{\n  "name": "Alice",\n  "meta": {\n    "active": true\n  }\n}';
    const result = minifyJson(input);

    expect(result).toEqual({
      success: true,
      output: '{"name":"Alice","meta":{"active":true}}',
    });
  });

  it('returns stable error for invalid JSON', () => {
    const result = minifyJson('{"name":}');

    expect(result).toEqual({
      success: false,
      output: '',
      error: 'Invalid JSON syntax',
    });
  });
});
