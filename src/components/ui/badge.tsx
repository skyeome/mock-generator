import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'destructive' | 'secondary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground border-border',
  secondary: 'bg-secondary text-secondary-foreground border-border',
  success: 'bg-primary/20 text-primary border-primary/50',
  warning: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/50',
  error: 'bg-destructive/20 text-destructive border-destructive/50',
  destructive: 'bg-destructive/20 text-destructive border-destructive/50',
  info: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={twMerge(clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
        'font-mono',
        variantStyles[variant],
        className
      ))}
    >
      {children}
    </span>
  );
}
