import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ValidationPanel } from '@/components/intl/validation-panel';

describe('ValidationPanel', () => {
  it('shows "All checks passed" when no issues', () => {
    render(<ValidationPanel issues={[]} onNavigate={vi.fn()} />);
    expect(screen.getByText(/all checks passed/i)).toBeInTheDocument();
  });

  it('shows warning count badge', () => {
    const issues = [
      {
        keyPath: 'user.name',
        type: 'length_anomaly' as const,
        severity: 'warning' as const,
        message: 'Length ratio is 2.5x',
      },
      {
        keyPath: 'user.email',
        type: 'length_anomaly' as const,
        severity: 'warning' as const,
        message: 'Length ratio is 3.0x',
      },
    ];

    render(<ValidationPanel issues={issues} onNavigate={vi.fn()} />);
    expect(screen.getByText(/2.*warning/i)).toBeInTheDocument();
  });

  it('shows error count badge', () => {
    const issues = [
      {
        keyPath: 'user.name',
        type: 'variable_missing' as const,
        severity: 'error' as const,
        message: 'Missing variable {name}',
      },
    ];

    render(<ValidationPanel issues={issues} onNavigate={vi.fn()} />);
    expect(screen.getByText(/1.*error/i)).toBeInTheDocument();
  });

  it('lists each validation issue with type icon', () => {
    const issues = [
      {
        keyPath: 'user.name',
        type: 'variable_missing' as const,
        severity: 'error' as const,
        message: 'Missing variable {name}',
      },
      {
        keyPath: 'user.email',
        type: 'length_anomaly' as const,
        severity: 'warning' as const,
        message: 'Length ratio is 2.5x',
      },
    ];

    render(<ValidationPanel issues={issues} onNavigate={vi.fn()} />);

    expect(screen.getByText('user.name')).toBeInTheDocument();
    expect(screen.getByText('user.email')).toBeInTheDocument();
    expect(screen.getByText('Missing variable {name}')).toBeInTheDocument();
    expect(screen.getByText('Length ratio is 2.5x')).toBeInTheDocument();
  });

  it('clicking issue calls onNavigate with keyPath', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const issues = [
      {
        keyPath: 'user.name',
        type: 'variable_missing' as const,
        severity: 'error' as const,
        message: 'Missing variable {name}',
      },
    ];

    render(<ValidationPanel issues={issues} onNavigate={onNavigate} />);

    const issueRow = screen.getByText('user.name').closest('button');
    expect(issueRow).toBeInTheDocument();

    await user.click(issueRow!);
    expect(onNavigate).toHaveBeenCalledWith('user.name');
  });

  it('groups issues by type', () => {
    const issues = [
      {
        keyPath: 'user.name',
        type: 'variable_missing' as const,
        severity: 'error' as const,
        message: 'Missing variable {name}',
      },
      {
        keyPath: 'user.email',
        type: 'variable_missing' as const,
        severity: 'error' as const,
        message: 'Missing variable {email}',
      },
      {
        keyPath: 'product.title',
        type: 'length_anomaly' as const,
        severity: 'warning' as const,
        message: 'Length ratio is 2.5x',
      },
    ];

    render(<ValidationPanel issues={issues} onNavigate={vi.fn()} />);

    // Should have sections for each issue type
    expect(screen.getByText(/variable.*issue/i)).toBeInTheDocument();
    expect(screen.getByText(/length.*anomal/i)).toBeInTheDocument();
  });

  it('shows issue details in expandable section', async () => {
    const user = userEvent.setup();
    const issues = [
      {
        keyPath: 'user.name',
        type: 'variable_missing' as const,
        severity: 'error' as const,
        message: 'Missing variable {name}',
        details: {
          expected: ['{name}', '{age}'],
          actual: ['{age}'],
        },
      },
    ];

    render(<ValidationPanel issues={issues} onNavigate={vi.fn()} />);

    // Details should not be visible initially (check for "Expected:" which is inside details section)
    expect(screen.queryByText('Expected:')).not.toBeInTheDocument();

    // Click to expand
    const expandButton = screen.getByRole('button', { name: /expand/i });
    await user.click(expandButton);

    // Details should now be visible
    expect(screen.getByText('Expected:')).toBeInTheDocument();
    expect(screen.getByText('Actual:')).toBeInTheDocument();
    // Variables are displayed as comma-separated string
    expect(screen.getByText('{name}, {age}')).toBeInTheDocument();
  });

  it('shows both warnings and errors in summary', () => {
    const issues = [
      {
        keyPath: 'user.name',
        type: 'variable_missing' as const,
        severity: 'error' as const,
        message: 'Missing variable {name}',
      },
      {
        keyPath: 'user.email',
        type: 'length_anomaly' as const,
        severity: 'warning' as const,
        message: 'Length ratio is 2.5x',
      },
    ];

    render(<ValidationPanel issues={issues} onNavigate={vi.fn()} />);

    // Should show both counts
    expect(screen.getByText(/1.*error/i)).toBeInTheDocument();
    expect(screen.getByText(/1.*warning/i)).toBeInTheDocument();
  });
});
