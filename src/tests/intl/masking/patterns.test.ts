import { describe, it, expect } from 'vitest';
import { VARIABLE_PATTERNS } from '@/lib/intl/masking/patterns';

describe('VARIABLE_PATTERNS', () => {
  describe('mustache pattern', () => {
    it('should match mustache variables {{name}}', () => {
      const text = 'Hello {{name}}!';
      const matches = text.match(VARIABLE_PATTERNS.mustache);
      expect(matches).toEqual(['{{name}}']);
    });

    it('should match multiple mustache variables', () => {
      const text = '{{firstName}} {{lastName}}';
      const matches = text.match(VARIABLE_PATTERNS.mustache);
      expect(matches).toEqual(['{{firstName}}', '{{lastName}}']);
    });

    it('should match mustache with spaces', () => {
      const text = '{{ name }}';
      const matches = text.match(VARIABLE_PATTERNS.mustache);
      expect(matches).toEqual(['{{ name }}']);
    });
  });

  describe('icu pattern', () => {
    it('should match ICU variables {name}', () => {
      const text = 'Hello {name}!';
      const matches = text.match(VARIABLE_PATTERNS.icu);
      expect(matches).toEqual(['{name}']);
    });

    it('should not match mustache variables', () => {
      const text = 'Hello {{name}}!';
      const matches = text.match(VARIABLE_PATTERNS.icu);
      expect(matches).toBeNull();
    });

    it('should match ICU with numbers', () => {
      const text = 'You have {count} items';
      const matches = text.match(VARIABLE_PATTERNS.icu);
      expect(matches).toEqual(['{count}']);
    });
  });

  describe('dollar pattern', () => {
    it('should match dollar variables $name', () => {
      const text = 'Hello $name!';
      const matches = text.match(VARIABLE_PATTERNS.dollar);
      expect(matches).toEqual(['$name']);
    });

    it('should match multiple dollar variables', () => {
      const text = '$firstName $lastName';
      const matches = text.match(VARIABLE_PATTERNS.dollar);
      expect(matches).toEqual(['$firstName', '$lastName']);
    });

    it('should match dollar variables with underscores', () => {
      const text = '$user_name';
      const matches = text.match(VARIABLE_PATTERNS.dollar);
      expect(matches).toEqual(['$user_name']);
    });

    it('should not match dollar signs alone', () => {
      const text = 'Price: $100';
      const matches = text.match(VARIABLE_PATTERNS.dollar);
      expect(matches).toBeNull();
    });
  });

  describe('colon pattern', () => {
    it('should match colon variables :name', () => {
      const text = 'Hello :name!';
      const matches = text.match(VARIABLE_PATTERNS.colon);
      expect(matches).toEqual([':name']);
    });

    it('should match multiple colon variables', () => {
      const text = ':firstName :lastName';
      const matches = text.match(VARIABLE_PATTERNS.colon);
      expect(matches).toEqual([':firstName', ':lastName']);
    });
  });

  describe('percent pattern', () => {
    it('should match percent variables %name', () => {
      const text = 'Hello %name!';
      const matches = text.match(VARIABLE_PATTERNS.percent);
      expect(matches).toEqual(['%name']);
    });

    it('should match multiple percent variables', () => {
      const text = '%firstName %lastName';
      const matches = text.match(VARIABLE_PATTERNS.percent);
      expect(matches).toEqual(['%firstName', '%lastName']);
    });
  });

  describe('htmlTag pattern', () => {
    it('should match HTML tags', () => {
      const text = '<b>Hello</b> world';
      const matches = text.match(VARIABLE_PATTERNS.htmlTag);
      expect(matches).toEqual(['<b>', '</b>']);
    });

    it('should match self-closing tags', () => {
      const text = 'Line break <br/> here';
      const matches = text.match(VARIABLE_PATTERNS.htmlTag);
      expect(matches).toEqual(['<br/>']);
    });

    it('should match tags with attributes', () => {
      const text = '<a href="url">Link</a>';
      const matches = text.match(VARIABLE_PATTERNS.htmlTag);
      expect(matches).toEqual(['<a href="url">', '</a>']);
    });
  });

  describe('all pattern', () => {
    it('should match mixed variable formats', () => {
      const text = 'Hello {{name}} and {count} users with $price';
      const matches = text.match(VARIABLE_PATTERNS.all);
      expect(matches).toEqual(['{{name}}', '{count}', '$price']);
    });

    it('should match HTML tags alongside variables', () => {
      const text = '<b>{{title}}</b> by {author}';
      const matches = text.match(VARIABLE_PATTERNS.all);
      expect(matches).toEqual(['<b>', '{{title}}', '</b>', '{author}']);
    });

    it('should not match ICU inside mustache', () => {
      const text = 'Mustache: {{name}}, ICU: {count}';
      const matches = text.match(VARIABLE_PATTERNS.all);
      expect(matches).toEqual(['{{name}}', '{count}']);

      // Verify {{...}} is treated as single token, not parsed as ICU
      expect(matches).not.toContain('{name');
    });

    it('should handle complex mixed text', () => {
      const text = '<div>Hello {{user}}, you have {count} items for $price :discount %tax</div>';
      const matches = text.match(VARIABLE_PATTERNS.all);
      expect(matches).toEqual([
        '<div>',
        '{{user}}',
        '{count}',
        '$price',
        ':discount',
        '%tax',
        '</div>'
      ]);
    });
  });
});
