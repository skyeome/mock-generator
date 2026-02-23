import { Check, Copy, Minimize2, RefreshCcw, WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ControlBarProps {
  canFormat: boolean;
  canCopy: boolean;
  canReset: boolean;
  copied: boolean;
  onPrettify: () => void;
  onMinify: () => void;
  onCopy: () => void;
  onReset: () => void;
}

export function ControlBar({
  canFormat,
  canCopy,
  canReset,
  copied,
  onPrettify,
  onMinify,
  onCopy,
  onReset,
}: ControlBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onPrettify} disabled={!canFormat} size="sm" variant="secondary">
          <WandSparkles className="mr-1.5 h-4 w-4" />
          Prettify
        </Button>
        <Button onClick={onMinify} disabled={!canFormat} size="sm" variant="secondary">
          <Minimize2 className="mr-1.5 h-4 w-4" />
          Minify
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onCopy} disabled={!canCopy} size="sm" variant="ghost">
          {copied ? (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-4 w-4" />
              Copy
            </>
          )}
        </Button>
        <Button onClick={onReset} disabled={!canReset} size="sm" variant="ghost">
          <RefreshCcw className="mr-1.5 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
