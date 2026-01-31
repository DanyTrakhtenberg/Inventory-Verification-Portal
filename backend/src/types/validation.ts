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
