import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FileUploadPanel } from '@/components/intl/file-upload-panel';

class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null;

  readAsText() {
    if (this.onload) {
      this.onload({ target: { result: '{}' } } as ProgressEvent<FileReader>);
    }
  }
}

describe('FileUploadPanel', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'FileReader', {
      writable: true,
      value: MockFileReader,
    });
  });

  it('detects locale from uploaded file name and emits content', () => {
    const onLocaleChange = vi.fn();
    const onFileContent = vi.fn();

    const { container } = render(
      <FileUploadPanel
        label="Source Language"
        locale="ko"
        onLocaleChange={onLocaleChange}
        onFileContent={onFileContent}
      />
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['{}'], 'messages.en.json', { type: 'application/json' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onLocaleChange).toHaveBeenCalledWith('en');
    expect(onFileContent).toHaveBeenCalledWith('{}');
  });
});
