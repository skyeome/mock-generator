import { describe, expect, it } from 'vitest';
import { validateJson } from '@/lib/json-validator/validate';

describe('validateJson', () => {
  it('returns valid true for valid JSON', () => {
    const result = validateJson('{"name":"Alice","age":30}');

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns error for invalid JSON with stable message', () => {
    const result = validateJson('{"name":}');

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatchObject({
      message: 'Invalid JSON syntax',
    });
  });

  it('extracts offset from parse error when available', () => {
    const input = '{"a":1,,"b":2}';
    const result = validateJson(input);

    expect(result.valid).toBe(false);
    expect(result.errors[0].offset).toBe(7);
  });

  it('computes line and column from offset for LF input', () => {
    const input = '{\n  "a":1,,\n  "b":2\n}';
    const result = validateJson(input);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatchObject({
      offset: 10,
      line: 2,
      column: 9,
    });
  });

  it('computes line and column from offset for CRLF input', () => {
    const input = '{\r\n  "a":1,,\r\n  "b":2\r\n}';
    const result = validateJson(input);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatchObject({
      offset: 11,
      line: 2,
      column: 9,
    });
  });
});
