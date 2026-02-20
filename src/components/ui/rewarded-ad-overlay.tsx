'use client';

import { useEffect } from 'react';
import { Film, X } from 'lucide-react';

interface RewardedAdOverlayProps {
  isVisible: boolean;
  state: 'prompt' | 'watching' | 'completed' | 'dismissed';
  onDismiss: () => void;
  /** Message shown on the prompt screen before the ad plays */
  promptMessage?: string;
  /** Message shown when the user skips the ad */
  dismissedMessage?: string;
}

export function RewardedAdOverlay({
  isVisible,
  state,
  onDismiss,
  promptMessage = 'Watch a brief ad to generate your mock data for free.',
  dismissedMessage = 'Watch the full ad to generate mock data.',
}: RewardedAdOverlayProps) {
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state === 'prompt') {
        onDismiss();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, state, onDismiss]);

  if (!isVisible) return null;

  if (state === 'watching') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Ad playing"
      >
        <div className="relative w-full max-w-md mx-4 p-6 bg-card border border-border rounded-xl shadow-2xl">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Ad is playing…
          </p>
        </div>
      </div>
    );
  }

  if (state === 'completed') {
    return null;
  }

  if (state === 'dismissed') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Ad dismissed"
      >
        <div className="relative w-full max-w-md mx-4 p-6 bg-card border border-border rounded-xl shadow-2xl">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="flex justify-center mb-4">
            <div className="relative w-14 h-14 flex items-center justify-center bg-muted rounded-full border border-border">
              <X className="w-7 h-7 text-muted-foreground" />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-center text-foreground mb-1">
            Ad skipped
          </h2>
          <p className="text-sm text-center text-muted-foreground mb-4">
            {dismissedMessage}
          </p>

          <button
            onClick={onDismiss}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewarded-ad-title"
    >
      <div className="relative w-full max-w-md mx-4 p-6 bg-card border border-border rounded-xl shadow-2xl shadow-primary/10">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" style={{ animationDuration: '2s' }} />
            <div className="relative w-16 h-16 flex items-center justify-center bg-muted rounded-full border border-primary/30">
              <Film className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        <h2
          id="rewarded-ad-title"
          className="text-xl font-semibold text-center text-foreground mb-2"
        >
          Watch a short ad
        </h2>

        <p className="text-sm text-center text-muted-foreground mb-6">
          {promptMessage}
        </p>

        <p className="text-xs text-center text-primary/80 mb-6 flex items-center justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Ad is ready
        </p>

        <button
          onClick={onDismiss}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-border/80 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          Cancel
        </button>
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-ping,
          .animate-spin {
            animation: none;
          }
          .animate-in {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
