import { InventoryRow, ValidationResult, REQUIRED_COLUMNS } from '../types/validation';

export function validateRequiredColumns(rows: InventoryRow[], headers: string[]): ValidationResult {
  const missing: string[] = [];

  for (const col of REQUIRED_COLUMNS) {
    if (!headers.includes(col)) {
      missing.push(col);
    }
  }

  return {
    rule: 'required_columns',
    passed: missing.length === 0,
    details: {
      required: [...REQUIRED_COLUMNS],
      missing: missing.length > 0 ? missing : undefined,
      found: headers,
    },
  };
}
