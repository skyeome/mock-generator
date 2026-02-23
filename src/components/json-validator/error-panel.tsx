export interface EditorValidationError {
  line: number;
  column: number;
  message: string;
}

interface ErrorPanelProps {
  hasInput: boolean;
  isValid: boolean;
  errors: EditorValidationError[];
}

export function ErrorPanel({ hasInput, isValid, errors }: ErrorPanelProps) {
  if (!hasInput) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Paste or type JSON to validate
      </div>
    );
  }

  if (isValid) {
    return (
      <div className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
        Valid JSON
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
      <p className="mb-2 text-sm font-medium text-destructive">JSON errors</p>
      <ul className="space-y-1.5 text-sm text-destructive">
        {errors.map((error, index) => (
          <li key={`${error.line}-${error.column}-${index}`} className="font-mono">
            {error.line}:{error.column} {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
