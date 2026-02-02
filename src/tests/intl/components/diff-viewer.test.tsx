import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiffViewer } from '@/components/intl/diff-viewer';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'light' })
}));

// Mock Monaco Editor (it's heavy and doesn't work well in jsdom)
vi.mock('@monaco-editor/react', () => ({
  DiffEditor: ({ original, modified }: { original: string; modified: string }) => (
    <div data-testid="mock-diff-editor">
      <div data-testid="original">{original}</div>
      <div data-testid="modified">{modified}</div>
    </div>
  )
}));

describe('DiffViewer', () => {
  const defaultProps = {
    source: '{"hello": "Hello"}',
    target: '{"hello": "Hola"}'
  };

  it('should render the diff editor', () => {
    render(<DiffViewer {...defaultProps} />);
    expect(screen.getByTestId('monaco-diff-editor')).toBeInTheDocument();
  });

  it('should pass source and target to editor', () => {
    render(<DiffViewer {...defaultProps} />);
    expect(screen.getByTestId('original')).toHaveTextContent(defaultProps.source);
    expect(screen.getByTestId('modified')).toHaveTextContent(defaultProps.target);
  });

  it('should render with custom height', () => {
    render(<DiffViewer {...defaultProps} height="600px" />);
    const container = screen.getByTestId('monaco-diff-editor');
    expect(container).toHaveStyle({ height: '600px' });
  });
});
