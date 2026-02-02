import { describe, it, expect } from 'vitest';
import { maskVariables } from '@/lib/intl/masking/mask';

describe('maskVariables', () => {
  it('should mask mustache variables', () => {
    const text = 'Hello {{name}}!';
    const result = maskVariables(text);

    expect(result.masked).toBe('Hello __VAR_0__!');
    expect(result.tokens).toEqual(['{{name}}']);
  });

  it('should mask HTML tags', () => {
    const text = '<b>Bold text</b>';
    const result = maskVariables(text);

    expect(result.masked).toBe('__VAR_0__Bold text__VAR_1__');
    expect(result.tokens).toEqual(['<b>', '</b>']);
  });

  it('should handle mixed variable formats', () => {
    const text = 'Hello {{name}} with {count} items at $price';
    const result = maskVariables(text);

    expect(result.masked).toBe('Hello __VAR_0__ with __VAR_1__ items at __VAR_2__');
    expect(result.tokens).toEqual(['{{name}}', '{count}', '$price']);
  });

  it('should return empty tokens for plain text', () => {
    const text = 'Just plain text';
    const result = maskVariables(text);

    expect(result.masked).toBe('Just plain text');
    expect(result.tokens).toEqual([]);
  });

  it('should preserve token order', () => {
    const text = '{{first}} {second} $third :fourth %fifth';
    const result = maskVariables(text);

    expect(result.masked).toBe('__VAR_0__ __VAR_1__ __VAR_2__ __VAR_3__ __VAR_4__');
    expect(result.tokens).toEqual(['{{first}}', '{second}', '$third', ':fourth', '%fifth']);
  });

  it('should handle multiple occurrences of same variable', () => {
    const text = 'Hello {{name}}, goodbye {{name}}';
    const result = maskVariables(text);

    expect(result.masked).toBe('Hello __VAR_0__, goodbye __VAR_1__');
    expect(result.tokens).toEqual(['{{name}}', '{{name}}']);
  });

  it('should mask HTML tags with attributes', () => {
    const text = '<a href="url">Link</a>';
    const result = maskVariables(text);

    expect(result.masked).toBe('__VAR_0__Link__VAR_1__');
    expect(result.tokens).toEqual(['<a href="url">', '</a>']);
  });

  it('should handle self-closing HTML tags', () => {
    const text = 'Line break <br/> here';
    const result = maskVariables(text);

    expect(result.masked).toBe('Line break __VAR_0__ here');
    expect(result.tokens).toEqual(['<br/>']);
  });

  it('should handle complex nested structures', () => {
    const text = '<div>{{user}} has {count} items</div>';
    const result = maskVariables(text);

    expect(result.masked).toBe('__VAR_0____VAR_1__ has __VAR_2__ items__VAR_3__');
    expect(result.tokens).toEqual(['<div>', '{{user}}', '{count}', '</div>']);
  });

  it('should handle empty string', () => {
    const text = '';
    const result = maskVariables(text);

    expect(result.masked).toBe('');
    expect(result.tokens).toEqual([]);
  });

  it('should handle text with only variables', () => {
    const text = '{{name}}';
    const result = maskVariables(text);

    expect(result.masked).toBe('__VAR_0__');
    expect(result.tokens).toEqual(['{{name}}']);
  });

  it('should not confuse ICU with mustache', () => {
    const text = '{{mustache}} {icu}';
    const result = maskVariables(text);

    expect(result.masked).toBe('__VAR_0__ __VAR_1__');
    expect(result.tokens).toEqual(['{{mustache}}', '{icu}']);
  });
});
