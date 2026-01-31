import { InventoryRow, ValidationResult, ValidationRule } from '../types/validation';

const MISSING_STATUSES = ['MISSING', 'MISSING INV'];

type State = {
  statusCol: string | null;
  items: Array<{ row: number; status: string }>;
};

export const missingItemsRule: ValidationRule<State> = {
  name: 'missing_items',
  init: (headers) => ({
    statusCol: headers.find((h) => h === 'status') ?? null,
    items: [],
  }),
  processRow: (state, row, idx, _headers) => {
    if (!state.statusCol) return;
    const val = row[state.statusCol];
    const status = String(val ?? '').toUpperCase().trim();
    if (MISSING_STATUSES.includes(status)) {
      state.items.push({ row: idx + 2, status: String(val) });
    }
  },
  finalize: (state): ValidationResult => {
    if (!state.statusCol) {
      return {
        rule: 'missing_items',
        passed: true,
        details: { message: 'No status column - skipping check' },
      };
    }
    return {
      rule: 'missing_items',
      passed: state.items.length === 0,
      details: {
        count: state.items.length,
        items: state.items.length > 0 ? state.items : undefined,
      },
    };
  },
};
