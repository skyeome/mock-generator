import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-zinc-700 text-zinc-300 border-zinc-600',
  success: 'bg-emerald-900/50 text-emerald-300 border-emerald-700',
  warning: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  error: 'bg-red-900/50 text-red-300 border-red-700',
  info: 'bg-blue-900/50 text-blue-300 border-blue-700',
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
