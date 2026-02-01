'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AIEnhanceButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  isEnhanced?: boolean;
}

export const AIEnhanceButton = forwardRef<HTMLButtonElement, AIEnhanceButtonProps>(
  ({ className, isLoading, isEnhanced, disabled, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || isEnhanced) return;
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={handleClick}
        aria-busy={isLoading}
        aria-label={
          isLoading ? 'Analyzing schema with AI…' :
          isEnhanced ? 'Schema enhanced with AI' :
          'Enhance schema detection with AI'
        }
        className={twMerge(clsx(
          'group relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg',
          'transition-all duration-200',
          // Focus state (visible only on keyboard)
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // State-based styling
          isEnhanced
            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 cursor-default'
            : isLoading
              ? 'bg-zinc-800 text-zinc-300 border border-zinc-600 cursor-wait'
              : 'bg-zinc-800 text-zinc-200 border border-zinc-600 hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/40 active:bg-purple-500/30',
          className
        ))}
        {...props}
      >
        {/* Icon */}
        <span className="relative flex-shrink-0 w-4 h-4">
          {isLoading ? (
            // Spinner
            <svg
              className="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : isEnhanced ? (
            // Checkmark
            <svg
              className="w-4 h-4 text-purple-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            // Sparkle icon (AI)
            <svg
              className="w-4 h-4 transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v1m0 16v1m-9-9h1m16 0h1m-2.636-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          )}
        </span>

        {/* Label */}
        <span className="whitespace-nowrap">
          {isLoading ? 'Enhancing…' : isEnhanced ? 'AI Enhanced' : 'Enhance with AI'}
        </span>

        {/* Subtle glow effect on hover (non-enhanced state) */}
        {!isEnhanced && !isLoading && (
          <span
            className="absolute inset-0 rounded-lg bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors pointer-events-none"
            aria-hidden="true"
          />
        )}
      </button>
    );
  }
);

AIEnhanceButton.displayName = 'AIEnhanceButton';
