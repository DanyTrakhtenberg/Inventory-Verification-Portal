import { InventoryRow, ValidationResult } from '../types/validation';

// P2M uses "MISSING INV"; also support "MISSING"
const MISSING_STATUSES = ['MISSING', 'MISSING INV'];

export function validateMissingItems(rows: InventoryRow[], headers: string[]): ValidationResult {
  const statusCol = headers.find((h) => h === 'status');
  if (!statusCol) {
    return {
      rule: 'missing_items',
      passed: true,
      details: { message: 'No status column - skipping check' },
    };
  }

  const items: Array<{ row: number; status: string }> = [];
  rows.forEach((row, idx) => {
    const val = row[statusCol];
    const status = String(val ?? '').toUpperCase().trim();
    if (MISSING_STATUSES.includes(status)) {
      items.push({ row: idx + 2, status: String(val) });
    }
  });

  return {
    rule: 'missing_items',
    passed: items.length === 0,
    details: {
      count: items.length,
      items: items.length > 0 ? items : undefined,
    },
  };
}
