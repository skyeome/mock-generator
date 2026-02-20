import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { I18nSyncPage } from '@/components/intl/i18n-sync-page';
import { useIntlSync } from '@/hooks/use-intl-sync';
import type { Mock } from 'vitest';

vi.mock('@/hooks/use-intl-sync', () => ({
  useIntlSync: vi.fn(),
}));

vi.mock('@/components/intl/file-upload-panel', () => ({
  FileUploadPanel: ({ label }: { label: string }) => <div>{label}</div>,
}));

vi.mock('@/components/intl/diff-viewer', () => ({
  DiffViewer: () => <div data-testid="diff-viewer" />, 
}));

vi.mock('@/components/intl/export-panel', () => ({
  ExportPanel: () => <div data-testid="export-panel" />,
}));

const useIntlSyncMock = useIntlSync as unknown as Mock;

function createIntlMock(overrides: Record<string, unknown> = {}) {
  const base = {
    sourceParsed: null,
    targetParsed: null,
    sourceJson: '',
    targetJson: '',
    sourceLocale: 'en',
    targetLocale: 'ko',
    sourceError: null,
    targetError: null,
    diffResult: null,
    selectedKeys: [] as string[],
    isTranslating: false,
    translationProgress: 0,
    runDiff: vi.fn(),
    setSourceJson: vi.fn(),
    setTargetJson: vi.fn(),
    setSourceLocale: vi.fn(),
    setTargetLocale: vi.fn(),
    toggleKeySelection: vi.fn(),
    selectAllMissing: vi.fn(),
    clearSelection: vi.fn(),
    translateSelected: vi.fn().mockResolvedValue(undefined),
    translateAllMissing: vi.fn().mockResolvedValue(undefined),
    exportResult: vi.fn().mockReturnValue('{"hello":"안녕"}'),
  };

  return { ...base, ...overrides };
}

describe('I18nSyncPage', () => {
  it('does not show action section when source/target files are not loaded', () => {
    useIntlSyncMock.mockReturnValue(createIntlMock());

    render(<I18nSyncPage />);

    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });

  it('shows action buttons and calls bulk translation handlers', async () => {
    const user = userEvent.setup();
    const intl = createIntlMock({
      sourceJson: '{"hello":"Hello"}',
      targetJson: '{"hello":""}',
      diffResult: {
        operations: [{ type: 'MISSING', keyPath: 'hello', sourceValue: 'Hello', targetValue: '' }],
        stats: { missing: 2, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: ['hello'],
        targetKeyOrder: ['hello'],
      },
    });
    useIntlSyncMock.mockReturnValue(intl);

    render(<I18nSyncPage />);

    const selectAllButton = screen.getByRole('button', { name: /select all missing/i });
    const translateAllButton = screen.getByRole('button', { name: /translate all missing/i });
    const clearSelectionButton = screen.getByRole('button', { name: /clear selection/i });
    const translateSelectedButton = screen.getByRole('button', { name: /translate selected/i });

    expect(selectAllButton).toBeEnabled();
    expect(translateAllButton).toBeEnabled();
    expect(clearSelectionButton).toBeDisabled();
    expect(translateSelectedButton).toBeDisabled();

    await user.click(selectAllButton);
    await user.click(translateAllButton);

    expect(intl.selectAllMissing).toHaveBeenCalled();
    expect(intl.translateAllMissing).toHaveBeenCalled();
  });

  it('translates selected keys and updates exported target JSON', async () => {
    const user = userEvent.setup();
    const intl = createIntlMock({
      sourceJson: '{"hello":"Hello"}',
      targetJson: '{"hello":""}',
      selectedKeys: ['hello'],
      diffResult: {
        operations: [{ type: 'MISSING', keyPath: 'hello', sourceValue: 'Hello', targetValue: '' }],
        stats: { missing: 1, orphaned: 0, typeMismatch: 0, equal: 0 },
        sourceKeyOrder: ['hello'],
        targetKeyOrder: ['hello'],
      },
      exportResult: vi.fn().mockReturnValue('{"hello":"안녕"}'),
    });
    useIntlSyncMock.mockReturnValue(intl);

    render(<I18nSyncPage />);

    const translateSelectedButton = screen.getByRole('button', { name: /translate selected/i });
    await user.click(translateSelectedButton);

    expect(intl.translateSelected).toHaveBeenCalled();
    expect(intl.exportResult).toHaveBeenCalled();
    expect(intl.setTargetJson).toHaveBeenCalledWith('{"hello":"안녕"}');
    expect(intl.clearSelection).toHaveBeenCalled();
  });
});
