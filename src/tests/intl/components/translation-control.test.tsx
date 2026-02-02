import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TranslationControl } from '@/components/intl/translation-control';

describe('TranslationControl', () => {
  const defaultProps = {
    selectedKey: 'app.title',
    sourceValue: 'Hello World',
    targetValue: '안녕하세요',
    onRegenerate: vi.fn(),
    onApply: vi.fn(),
    isLoading: false,
  };

  it('renders with selected key info', () => {
    render(<TranslationControl {...defaultProps} />);

    expect(screen.getByText('app.title')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('shows "Regenerate" button when key is selected', () => {
    render(<TranslationControl {...defaultProps} />);

    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
  });

  it('shows context hint input field', () => {
    render(<TranslationControl {...defaultProps} />);

    const contextInput = screen.getByPlaceholderText(/add context about this translation/i);
    expect(contextInput).toBeInTheDocument();
    expect(contextInput.tagName).toBe('TEXTAREA');
  });

  it('shows tone selector (formal/casual)', () => {
    render(<TranslationControl {...defaultProps} />);

    expect(screen.getByLabelText(/formal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/casual/i)).toBeInTheDocument();
  });

  it('calls onRegenerate with context and tone when button clicked', () => {
    const onRegenerate = vi.fn();
    render(<TranslationControl {...defaultProps} onRegenerate={onRegenerate} />);

    // Fill context
    const contextInput = screen.getByPlaceholderText(/add context about this translation/i);
    fireEvent.change(contextInput, { target: { value: 'This is a greeting' } });

    // Select casual tone
    const casualRadio = screen.getByLabelText(/casual/i);
    fireEvent.click(casualRadio);

    // Click regenerate
    const regenerateBtn = screen.getByRole('button', { name: /regenerate/i });
    fireEvent.click(regenerateBtn);

    expect(onRegenerate).toHaveBeenCalledWith({
      context: 'This is a greeting',
      tone: 'casual',
    });
  });

  it('disables regenerate when no key selected', () => {
    render(<TranslationControl {...defaultProps} selectedKey={null} />);

    const regenerateBtn = screen.getByRole('button', { name: /regenerate/i });
    expect(regenerateBtn).toBeDisabled();
  });

  it('shows loading state during regeneration', () => {
    render(<TranslationControl {...defaultProps} isLoading={true} />);

    const regenerateBtn = screen.getByRole('button', { name: /regenerating/i });
    expect(regenerateBtn).toBeDisabled();
  });

  it('calls onApply when apply button clicked', () => {
    const onApply = vi.fn();
    render(<TranslationControl {...defaultProps} onApply={onApply} targetValue="New Translation" />);

    const applyBtn = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyBtn);

    expect(onApply).toHaveBeenCalledWith('New Translation');
  });

  it('defaults to formal tone', () => {
    render(<TranslationControl {...defaultProps} />);

    const formalRadio = screen.getByLabelText(/formal/i) as HTMLInputElement;
    expect(formalRadio.checked).toBe(true);
  });

  it('calls onRegenerate with undefined context when empty', () => {
    const onRegenerate = vi.fn();
    render(<TranslationControl {...defaultProps} onRegenerate={onRegenerate} />);

    // Leave context empty
    const regenerateBtn = screen.getByRole('button', { name: /regenerate/i });
    fireEvent.click(regenerateBtn);

    expect(onRegenerate).toHaveBeenCalledWith({
      context: undefined,
      tone: 'formal',
    });
  });

  it('resets context and tone when cancel button clicked', () => {
    const onRegenerate = vi.fn();
    render(<TranslationControl {...defaultProps} onRegenerate={onRegenerate} />);

    // Fill context and select casual
    const contextInput = screen.getByPlaceholderText(/add context about this translation/i);
    fireEvent.change(contextInput, { target: { value: 'Some context' } });
    const casualRadio = screen.getByLabelText(/casual/i);
    fireEvent.click(casualRadio);

    // Click cancel
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    // Verify reset
    expect((contextInput as HTMLTextAreaElement).value).toBe('');
    const formalRadio = screen.getByLabelText(/formal/i) as HTMLInputElement;
    expect(formalRadio.checked).toBe(true);
  });

  it('allows switching between formal and casual tone', () => {
    render(<TranslationControl {...defaultProps} />);

    const formalRadio = screen.getByLabelText(/formal/i) as HTMLInputElement;
    const casualRadio = screen.getByLabelText(/casual/i) as HTMLInputElement;

    // Default is formal
    expect(formalRadio.checked).toBe(true);
    expect(casualRadio.checked).toBe(false);

    // Switch to casual
    fireEvent.click(casualRadio);
    expect(formalRadio.checked).toBe(false);
    expect(casualRadio.checked).toBe(true);

    // Switch back to formal
    fireEvent.click(formalRadio);
    expect(formalRadio.checked).toBe(true);
    expect(casualRadio.checked).toBe(false);
  });
});
