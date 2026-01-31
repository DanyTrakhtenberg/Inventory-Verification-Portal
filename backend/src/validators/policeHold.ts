import { InventoryRow, ValidationResult, ValidationRule } from '../types/validation';

const POLICE_HOLD_STATUSES = ['POLICE_HOLD', 'POLICE INVENTORY HOLD'];

type State = {
  statusCol: string | null;
  items: Array<{ row: number; status: string }>;
};

export const policeHoldRule: ValidationRule<State> = {
  name: 'police_hold',
  init: (headers) => ({
    statusCol: headers.find((h) => h === 'status') ?? null,
    items: [],
  }),
  processRow: (state, row, idx, _headers) => {
    if (!state.statusCol) return;
    const val = row[state.statusCol];
    const status = String(val ?? '').toUpperCase().trim();
    const isPoliceHold =
      POLICE_HOLD_STATUSES.includes(status) ||
      status.replace(/\s+/g, '_') === 'POLICE_HOLD';
    if (isPoliceHold) {
      state.items.push({ row: idx + 2, status: String(val) });
    }
  },
  finalize: (state): ValidationResult => {
    if (!state.statusCol) {
      return {
        rule: 'police_hold',
        passed: true,
        details: { message: 'No status column - skipping check' },
      };
    }
    return {
      rule: 'police_hold',
      passed: state.items.length === 0,
      details: {
        count: state.items.length,
        items: state.items.length > 0 ? state.items : undefined,
      },
    };
  },
};
