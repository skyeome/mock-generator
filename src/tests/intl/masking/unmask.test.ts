import { describe, it, expect } from 'vitest';
import { unmaskVariables } from '@/lib/intl/masking/unmask';

describe('unmaskVariables', () => {
  it('should restore masked variables', () => {
    const masked = 'Hello __VAR_0__!';
    const tokens = ['{{name}}'];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('Hello {{name}}!');
  });

  it('should handle HTML tags', () => {
    const masked = '__VAR_0__Bold text__VAR_1__';
    const tokens = ['<b>', '</b>'];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('<b>Bold text</b>');
  });

  it('should restore multiple variables in order', () => {
    const masked = '__VAR_0__ __VAR_1__ __VAR_2__ __VAR_3__ __VAR_4__';
    const tokens = ['{{first}}', '{second}', '$third', ':fourth', '%fifth'];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('{{first}} {second} $third :fourth %fifth');
  });

  it('should handle no variables', () => {
    const masked = 'Just plain text';
    const tokens: string[] = [];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('Just plain text');
  });

  it('should throw on token count mismatch - too few tokens', () => {
    const masked = 'Hello __VAR_0__ and __VAR_1__';
    const tokens = ['{{name}}'];

    expect(() => unmaskVariables(masked, tokens)).toThrow(/variable count mismatch/i);
  });

  it('should throw on token count mismatch - too many tokens', () => {
    const masked = 'Hello __VAR_0__';
    const tokens = ['{{name}}', '{extra}'];

    expect(() => unmaskVariables(masked, tokens)).toThrow(/variable count mismatch/i);
  });

  it('should throw on token index out of bounds', () => {
    const masked = 'Hello __VAR_5__';
    const tokens = ['{{name}}'];

    expect(() => unmaskVariables(masked, tokens)).toThrow(/token index 5 out of bounds/i);
  });

  it('should handle complex nested structures', () => {
    const masked = '__VAR_0____VAR_1__ has __VAR_2__ items__VAR_3__';
    const tokens = ['<div>', '{{user}}', '{count}', '</div>'];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('<div>{{user}} has {count} items</div>');
  });

  it('should handle HTML tags with attributes', () => {
    const masked = '__VAR_0__Link__VAR_1__';
    const tokens = ['<a href="url">', '</a>'];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('<a href="url">Link</a>');
  });

  it('should handle self-closing tags', () => {
    const masked = 'Line break __VAR_0__ here';
    const tokens = ['<br/>'];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('Line break <br/> here');
  });

  it('should handle empty masked string', () => {
    const masked = '';
    const tokens: string[] = [];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('');
  });

  it('should handle only variables', () => {
    const masked = '__VAR_0__';
    const tokens = ['{{name}}'];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('{{name}}');
  });

  it('should handle sequential variable indices', () => {
    const masked = '__VAR_0____VAR_1____VAR_2__';
    const tokens = ['{{a}}', '{{b}}', '{{c}}'];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('{{a}}{{b}}{{c}}');
  });

  it('should preserve text between variables', () => {
    const masked = 'Start __VAR_0__ middle __VAR_1__ end';
    const tokens = ['{{first}}', '{{second}}'];
    const result = unmaskVariables(masked, tokens);

    expect(result).toBe('Start {{first}} middle {{second}} end');
  });
});
