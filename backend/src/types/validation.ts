export interface InventoryRow {
  [key: string]: string | number;
}

export interface ValidationResult {
  rule: string;
  passed: boolean;
  details: Record<string, unknown>;
}

export interface ParsedFile {
  headers: string[];
  rows: InventoryRow[];
}

export const REQUIRED_COLUMNS = ['status', 'cost', 'price'] as const;

/** Rule interface for single-pass validation - add new rules by implementing this and registering in validation.service */
export interface ValidationRule<TState = unknown> {
  name: string;
  init: (headers: string[]) => TState;
  processRow: (state: TState, row: InventoryRow, rowIndex: number, headers: string[]) => void;
  finalize: (state: TState) => ValidationResult;
}
