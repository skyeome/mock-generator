import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchableSelect } from '@/components/ui/searchable-select';

const OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ko', label: 'Korean' },
  { value: 'ja', label: 'Japanese' },
];

describe('SearchableSelect', () => {
  it('opens dropdown and focuses search input', async () => {
    const user = userEvent.setup();

    render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} />);

    await user.click(screen.getByRole('button', { name: /select/i }));

    const input = screen.getByPlaceholderText(/search language/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('filters options by search term', async () => {
    const user = userEvent.setup();

    render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} />);

    await user.click(screen.getByRole('button', { name: /select/i }));
    await user.type(screen.getByPlaceholderText(/search language/i), 'kor');

    expect(screen.getByRole('button', { name: 'Korean' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'English' })).not.toBeInTheDocument();
  });

  it('selects option and closes dropdown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchableSelect value="" onChange={onChange} options={OPTIONS} />);

    await user.click(screen.getByRole('button', { name: /select/i }));
    await user.click(screen.getByRole('button', { name: 'Korean' }));

    expect(onChange).toHaveBeenCalledWith('ko');
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/search language/i)).not.toBeInTheDocument();
    });
  });

  it('closes when clicking outside and clears search', async () => {
    const user = userEvent.setup();

    render(<SearchableSelect value="" onChange={vi.fn()} options={OPTIONS} />);

    await user.click(screen.getByRole('button', { name: /select/i }));
    await user.type(screen.getByPlaceholderText(/search language/i), 'ja');

    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/search language/i)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /select/i }));
    expect(screen.getByPlaceholderText(/search language/i)).toHaveValue('');
  });
});
