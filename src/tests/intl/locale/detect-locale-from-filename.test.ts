import { describe, expect, it } from 'vitest';
import { detectLocaleFromFileName } from '@/lib/intl/locale/detectLocaleFromFileName';

describe('detectLocaleFromFileName', () => {
  it('returns direct locale code for simple filename', () => {
    expect(detectLocaleFromFileName('en.json')).toBe('en');
    expect(detectLocaleFromFileName('ko.json')).toBe('ko');
  });

  it('handles mixed case and regional variants', () => {
    expect(detectLocaleFromFileName('EN.json')).toBe('en');
    expect(detectLocaleFromFileName('ko-KR.json')).toBe('ko');
    expect(detectLocaleFromFileName('pt_BR.json')).toBe('pt');
  });

  it('detects locale from dot and underscore separated names', () => {
    expect(detectLocaleFromFileName('messages.en.json')).toBe('en');
    expect(detectLocaleFromFileName('common_zh-CN.json')).toBe('zh');
    expect(detectLocaleFromFileName('foo.bar.ja.json')).toBe('ja');
  });

  it('returns null when locale cannot be inferred', () => {
    expect(detectLocaleFromFileName('messages.json')).toBeNull();
    expect(detectLocaleFromFileName('README.md')).toBeNull();
  });
});
