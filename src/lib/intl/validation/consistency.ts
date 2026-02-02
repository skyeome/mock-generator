// Variable pattern matching multiple formats:
// - {{variable}} (double braces)
// - {variable} (single braces, not part of double braces)
// - $variable (dollar sign prefix)
// - :variable (colon prefix)
// - %variable (percent prefix)
// - <tag> and </tag> (HTML tags)
const VARIABLE_PATTERN = /(\{\{[^}]+\}\}|(?<!\{)\{[^{}]+\}(?!\})|\$[a-zA-Z_][a-zA-Z0-9_]*|:[a-zA-Z_][a-zA-Z0-9_]*|%[a-zA-Z_][a-zA-Z0-9_]*|<\/?[a-zA-Z][^>]*\/?>)/g;

export interface ConsistencyResult {
  isConsistent: boolean;
  missingInTarget: string[];
  extraInTarget: string[];
}

export function checkVariableConsistency(
  source: string,
  target: string
): ConsistencyResult {
  const sourceVars = new Set(source.match(VARIABLE_PATTERN) || []);
  const targetVars = new Set(target.match(VARIABLE_PATTERN) || []);

  const missingInTarget = Array.from(sourceVars).filter(v => !targetVars.has(v));
  const extraInTarget = Array.from(targetVars).filter(v => !sourceVars.has(v));

  return {
    isConsistent: missingInTarget.length === 0 && extraInTarget.length === 0,
    missingInTarget,
    extraInTarget
  };
}
