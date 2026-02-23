export interface JsonValidationError {
  message: string;
  line: number;
  column: number;
  offset: number;
}

export interface JsonValidationResult {
  valid: boolean;
  errors: JsonValidationError[];
}

export interface JsonFormatResult {
  success: boolean;
  output: string;
  error?: string;
}
