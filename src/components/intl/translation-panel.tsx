'use client';

import { Languages, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

interface TranslationPanelProps {
  selectedCount: number;
  isTranslating: boolean;
  progress: number;
  onTranslate: () => void;
  disabled?: boolean;
}

export function TranslationPanel({
  selectedCount,
  isTranslating,
  progress,
  onTranslate,
  disabled,
}: TranslationPanelProps) {
  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">AI Translation</h3>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-center items-center gap-4">
        {isTranslating ? (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Translating...</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Please wait while AI translates your selected keys
            </p>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                <Languages className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-1">
                Ready to Translate
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedCount === 0
                  ? 'Select keys from the list to translate'
                  : `${selectedCount} ${selectedCount === 1 ? 'key' : 'keys'} selected`}
              </p>
            </div>

            <Button
              onClick={onTranslate}
              disabled={disabled || selectedCount === 0}
              size="lg"
              className="mt-2"
            >
              <Languages className="w-4 h-4 mr-2" />
              Translate Selected Keys
            </Button>

            {selectedCount > 0 && (
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                AI will analyze context and generate natural translations for the
                selected keys
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
