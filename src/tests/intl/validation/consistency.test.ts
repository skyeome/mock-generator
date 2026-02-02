import { describe, it, expect } from 'vitest';
import { checkVariableConsistency } from '@/lib/intl/validation/consistency';

describe('checkVariableConsistency', () => {
  it('should pass when all variables present', () => {
    const source = 'Hello {name}, you have {count} messages';
    const target = 'Bonjour {name}, vous avez {count} messages';

    const result = checkVariableConsistency(source, target);

    expect(result.isConsistent).toBe(true);
    expect(result.missingInTarget).toHaveLength(0);
    expect(result.extraInTarget).toHaveLength(0);
  });

  it('should fail when variable is missing', () => {
    const source = 'Hello {name}, you have {count} messages';
    const target = 'Bonjour {name}, vous avez des messages';

    const result = checkVariableConsistency(source, target);

    expect(result.isConsistent).toBe(false);
    expect(result.missingInTarget).toContain('{count}');
    expect(result.extraInTarget).toHaveLength(0);
  });

  it('should detect extra variables in target', () => {
    const source = 'Hello {name}';
    const target = 'Bonjour {name}, {greeting}';

    const result = checkVariableConsistency(source, target);

    expect(result.isConsistent).toBe(false);
    expect(result.missingInTarget).toHaveLength(0);
    expect(result.extraInTarget).toContain('{greeting}');
  });

  it('should handle multiple variable formats', () => {
    const source = 'User {{name}} has $count items at :time with %status';
    const target = 'Utilisateur {{name}} a $count éléments à :time avec %status';

    const result = checkVariableConsistency(source, target);

    expect(result.isConsistent).toBe(true);
    expect(result.missingInTarget).toHaveLength(0);
    expect(result.extraInTarget).toHaveLength(0);
  });

  it('should handle HTML tags', () => {
    const source = 'Click <strong>here</strong> to continue';
    const target = 'Cliquez <strong>ici</strong> pour continuer';

    const result = checkVariableConsistency(source, target);

    expect(result.isConsistent).toBe(true);
  });

  it('should detect missing HTML tags', () => {
    const source = 'Click <strong>here</strong> to continue';
    const target = 'Cliquez ici pour continuer';

    const result = checkVariableConsistency(source, target);

    expect(result.isConsistent).toBe(false);
    expect(result.missingInTarget).toContain('<strong>');
    expect(result.missingInTarget).toContain('</strong>');
  });

  it('should handle strings with no variables', () => {
    const source = 'Hello world';
    const target = 'Bonjour le monde';

    const result = checkVariableConsistency(source, target);

    expect(result.isConsistent).toBe(true);
    expect(result.missingInTarget).toHaveLength(0);
    expect(result.extraInTarget).toHaveLength(0);
  });

  it('should handle self-closing HTML tags', () => {
    const source = 'Line break<br/>here';
    const target = 'Saut de ligne<br/>ici';

    const result = checkVariableConsistency(source, target);

    expect(result.isConsistent).toBe(true);
  });

  it('should detect multiple missing variables', () => {
    const source = '{greeting} {name}, you have {count} messages from {sender}';
    const target = 'Bonjour {name}';

    const result = checkVariableConsistency(source, target);

    expect(result.isConsistent).toBe(false);
    expect(result.missingInTarget).toHaveLength(3);
    expect(result.missingInTarget).toContain('{greeting}');
    expect(result.missingInTarget).toContain('{count}');
    expect(result.missingInTarget).toContain('{sender}');
  });

  it('should handle mixed variable formats and HTML', () => {
    const source = '<p>User {{name}} has {count} items</p>';
    const target = '<p>Utilisateur {{name}} a {count} éléments</p>';

    const result = checkVariableConsistency(source, target);

    expect(result.isConsistent).toBe(true);
  });
});
