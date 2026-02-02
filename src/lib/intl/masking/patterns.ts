export const VARIABLE_PATTERNS = {
  // {{variable}} - Mustache/Handlebars
  mustache: /\{\{([^}]+)\}\}/g,

  // {variable} - ICU MessageFormat (but not {{...}})
  icu: /(?<!\{)\{([^{}]+)\}(?!\})/g,

  // $variable - PHP/Shell style
  dollar: /\$([a-zA-Z_][a-zA-Z0-9_]*)/g,

  // :variable - Laravel style
  colon: /:([a-zA-Z_][a-zA-Z0-9_]*)/g,

  // %variable - Ruby/Python style
  percent: /%([a-zA-Z_][a-zA-Z0-9_]*)/g,

  // HTML tags (self-closing and pairs)
  htmlTag: /<\/?[a-zA-Z][^>]*\/?>/g,

  // Combined pattern for all variables
  all: /(\{\{[^}]+\}\}|(?<!\{)\{[^{}]+\}(?!\})|\$[a-zA-Z_][a-zA-Z0-9_]*|:[a-zA-Z_][a-zA-Z0-9_]*|%[a-zA-Z_][a-zA-Z0-9_]*|<\/?[a-zA-Z][^>]*\/?>)/g
};

export type VariableFormat = keyof typeof VARIABLE_PATTERNS;
