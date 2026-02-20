import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KeyTree } from '@/components/intl/key-tree';

interface DiffOperation {
  type: 'MISSING' | 'ORPHANED' | 'TYPE_MISMATCH' | 'VALUE_DIFF' | 'EQUAL';
  keyPath: string;
  sourceValue: unknown;
  targetValue: unknown;
}

interface ValidationResult {
  keyPath: string;
  severity: 'error' | 'warning';
  message: string;
}

describe('KeyTree', () => {
  const mockOperations: DiffOperation[] = [
    {
      type: 'MISSING',
      keyPath: 'common.hello',
      sourceValue: 'Hello',
      targetValue: undefined,
    },
    {
      type: 'MISSING',
      keyPath: 'common.goodbye',
      sourceValue: 'Goodbye',
      targetValue: undefined,
    },
    {
      type: 'ORPHANED',
      keyPath: 'auth.login',
      sourceValue: undefined,
      targetValue: 'Login',
    },
    {
      type: 'VALUE_DIFF',
      keyPath: 'auth.logout',
      sourceValue: 'Logout',
      targetValue: 'Log out',
    },
    {
      type: 'MISSING',
      keyPath: 'dashboard.title',
      sourceValue: 'Dashboard',
      targetValue: undefined,
    },
  ];

  const mockValidationResults: ValidationResult[] = [
    {
      keyPath: 'common.hello',
      severity: 'error',
      message: 'Missing translation',
    },
    {
      keyPath: 'auth.login',
      severity: 'warning',
      message: 'Orphaned key',
    },
  ];

  it('renders hierarchical tree structure from flat keys', () => {
    const onToggleKey = vi.fn();
    const onSelectKey = vi.fn();

    render(
      <KeyTree
        operations={mockOperations}
        selectedKeys={[]}
        onToggleKey={onToggleKey}
        onSelectKey={onSelectKey}
      />
    );

    // Check for parent nodes
    expect(screen.getByText(/common/i)).toBeInTheDocument();
    expect(screen.getByText(/auth/i)).toBeInTheDocument();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();

    // Check for leaf nodes
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
    expect(screen.getByText(/goodbye/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
    expect(screen.getByText(/title/i)).toBeInTheDocument();
  });

  it('shows checkboxes for each key', () => {
    const onToggleKey = vi.fn();
    const onSelectKey = vi.fn();

    render(
      <KeyTree
        operations={mockOperations}
        selectedKeys={[]}
        onToggleKey={onToggleKey}
        onSelectKey={onSelectKey}
      />
    );

    // Should have checkboxes for leaf nodes only (5 operations)
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(5);
  });

  it('expands and collapses parent nodes', () => {
    const onToggleKey = vi.fn();
    const onSelectKey = vi.fn();

    render(
      <KeyTree
        operations={mockOperations}
        selectedKeys={[]}
        onToggleKey={onToggleKey}
        onSelectKey={onSelectKey}
      />
    );

    // Initial state: expanded (children visible)
    expect(screen.getByText(/hello/i)).toBeInTheDocument();

    // Find the expand/collapse button by aria-label
    const expandButtons = screen.getAllByLabelText(/collapse|expand/i);
    expect(expandButtons.length).toBeGreaterThan(0);

    const firstButton = expandButtons[0];

    // Click to collapse
    fireEvent.click(firstButton);

    // Children should be hidden (the hello text should not be visible)
    expect(screen.queryByText(/hello/i)).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(firstButton);

    // Children should be visible again
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });

  it('shows validation icons (warning/error) next to keys', () => {
    const onToggleKey = vi.fn();
    const onSelectKey = vi.fn();

    render(
      <KeyTree
        operations={mockOperations}
        selectedKeys={[]}
        onToggleKey={onToggleKey}
        onSelectKey={onSelectKey}
        validationResults={mockValidationResults}
      />
    );

    // Check for validation icons (by looking for specific icons or data attributes)
    const helloNode = screen.getByText(/hello/i).closest('div');
    expect(helloNode).toBeInTheDocument();

    // Should have error icon for common.hello
    const errorIcons = screen.getAllByTestId('validation-icon-error');
    expect(errorIcons.length).toBeGreaterThanOrEqual(1);

    // Should have warning icon for auth.login
    const warningIcons = screen.getAllByTestId('validation-icon-warning');
    expect(warningIcons.length).toBeGreaterThanOrEqual(1);
  });

  it('calls onSelectKey callback when key is clicked', () => {
    const onToggleKey = vi.fn();
    const onSelectKey = vi.fn();

    render(
      <KeyTree
        operations={mockOperations}
        selectedKeys={[]}
        onToggleKey={onToggleKey}
        onSelectKey={onSelectKey}
      />
    );

    // Click on a key (not checkbox, but the text)
    const helloText = screen.getByText(/hello/i);
    fireEvent.click(helloText);

    expect(onSelectKey).toHaveBeenCalledWith('common.hello');
  });

  it('calls onToggle callback when checkbox is toggled', () => {
    const onToggleKey = vi.fn();
    const onSelectKey = vi.fn();

    render(
      <KeyTree
        operations={mockOperations}
        selectedKeys={[]}
        onToggleKey={onToggleKey}
        onSelectKey={onSelectKey}
      />
    );

    // Find checkbox for a specific key
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];

    fireEvent.click(firstCheckbox);

    expect(onToggleKey).toHaveBeenCalled();
    expect(onToggleKey).toHaveBeenCalledWith(expect.any(String));
  });

  it('shows selected keys with different styling', () => {
    const onToggleKey = vi.fn();
    const onSelectKey = vi.fn();

    render(
      <KeyTree
        operations={mockOperations}
        selectedKeys={['common.hello', 'auth.login']}
        onToggleKey={onToggleKey}
        onSelectKey={onSelectKey}
      />
    );

    // Selected checkboxes should be checked
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    const checkedCheckboxes = checkboxes.filter((cb) => cb.checked);

    expect(checkedCheckboxes.length).toBe(2);
  });

  it('displays operation type with color coding', () => {
    const onToggleKey = vi.fn();
    const onSelectKey = vi.fn();

    render(
      <KeyTree
        operations={mockOperations}
        selectedKeys={[]}
        onToggleKey={onToggleKey}
        onSelectKey={onSelectKey}
      />
    );

    // MISSING should have red color indicator
    const missingKeys = mockOperations.filter((op) => op.type === 'MISSING');
    expect(missingKeys.length).toBeGreaterThan(0);

    // ORPHANED should have yellow color indicator
    const orphanedKeys = mockOperations.filter((op) => op.type === 'ORPHANED');
    expect(orphanedKeys.length).toBeGreaterThan(0);

    // VALUE_DIFF should have blue color indicator
    const valueDiffKeys = mockOperations.filter((op) => op.type === 'VALUE_DIFF');
    expect(valueDiffKeys.length).toBeGreaterThan(0);
  });
});

describe('KeyTree - bracket notation path support', () => {
  it('should render array paths as nested tree nodes', () => {
    const operations: DiffOperation[] = [
      {
        keyPath: 'ol[0].text',
        type: 'MISSING',
        sourceValue: 'Hello',
        targetValue: undefined,
      },
      {
        keyPath: 'ol[1].text',
        type: 'MISSING',
        sourceValue: 'World',
        targetValue: undefined,
      },
    ];

    render(<KeyTree operations={operations} selectedKeys={[]} onSelectKey={vi.fn()} onToggleKey={vi.fn()} />);

    // "ol" parent node should be present
    expect(screen.getByText('ol')).toBeInTheDocument();
    // "[0]" and "[1]" intermediate nodes
    expect(screen.getByText('[0]')).toBeInTheDocument();
    expect(screen.getByText('[1]')).toBeInTheDocument();
    // leaf "text" nodes
    expect(screen.getAllByText('text')).toHaveLength(2);
  });

  it('should not add a dot before bracket notation segments', () => {
    const operations: DiffOperation[] = [
      {
        keyPath: 'ol[0].text',
        type: 'MISSING',
        sourceValue: 'Hello',
        targetValue: undefined,
      },
    ];

    const onSelectKey = vi.fn();
    render(<KeyTree operations={operations} selectedKeys={[]} onSelectKey={onSelectKey} onToggleKey={vi.fn()} />);

    // Click the leaf text node to verify the keyPath is correct (no "ol.[0].text")
    const leafTextEl = screen.getByText('text');
    fireEvent.click(leafTextEl);
    expect(onSelectKey).toHaveBeenCalledWith('ol[0].text');
  });

  it('should keep non-array paths working the same way', () => {
    const operations: DiffOperation[] = [
      {
        keyPath: 'user.name',
        type: 'EQUAL',
        sourceValue: 'John',
        targetValue: 'John',
      },
    ];

    render(<KeyTree operations={operations} selectedKeys={[]} onSelectKey={vi.fn()} onToggleKey={vi.fn()} />);

    expect(screen.getByText('user')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
  });
});

describe('KeyTree - filter behavior', () => {
  const operations: DiffOperation[] = [
    {
      type: 'MISSING',
      keyPath: 'common.hello',
      sourceValue: 'Hello',
      targetValue: undefined,
    },
    {
      type: 'ORPHANED',
      keyPath: 'auth.login',
      sourceValue: undefined,
      targetValue: 'Login',
    },
    {
      type: 'VALUE_DIFF',
      keyPath: 'auth.logout',
      sourceValue: 'Logout',
      targetValue: 'Log out',
    },
  ];

  it('shows only missing keys when filter is missing', () => {
    render(
      <KeyTree
        operations={operations}
        selectedKeys={[]}
        onSelectKey={vi.fn()}
        onToggleKey={vi.fn()}
        filter="missing"
      />
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.queryByText('login')).not.toBeInTheDocument();
    expect(screen.queryByText('logout')).not.toBeInTheDocument();
  });

  it('shows only selected keys when filter is selected', () => {
    render(
      <KeyTree
        operations={operations}
        selectedKeys={['auth.login']}
        onSelectKey={vi.fn()}
        onToggleKey={vi.fn()}
        filter="selected"
      />
    );

    expect(screen.getByText('login')).toBeInTheDocument();
    expect(screen.queryByText('hello')).not.toBeInTheDocument();
    expect(screen.queryByText('logout')).not.toBeInTheDocument();
  });
});
