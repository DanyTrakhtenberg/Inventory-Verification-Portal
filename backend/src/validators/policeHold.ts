import { InventoryRow, ValidationResult } from '../types/validation';

// P2M uses "POLICE INVENTORY HOLD"; also support "POLICE_HOLD"
const POLICE_HOLD_STATUSES = ['POLICE_HOLD', 'POLICE INVENTORY HOLD'];

export function validatePoliceHold(rows: InventoryRow[], headers: string[]): ValidationResult {
  const statusCol = headers.find((h) => h === 'status');
  if (!statusCol) {
    return {
      rule: 'police_hold',
      passed: true,
      details: { message: 'No status column - skipping check' },
    };
  }

  const items: Array<{ row: number; status: string }> = [];
  rows.forEach((row, idx) => {
    const val = row[statusCol];
    const status = String(val ?? '').toUpperCase().trim();
    const isPoliceHold =
      POLICE_HOLD_STATUSES.includes(status) ||
      status.replace(/\s+/g, '_') === 'POLICE_HOLD';
    if (isPoliceHold) {
      items.push({ row: idx + 2, status: String(val) });
    }
  });

  return {
    rule: 'police_hold',
    passed: items.length === 0,
    details: {
      count: items.length,
      items: items.length > 0 ? items : undefined,
    },
  };
}
