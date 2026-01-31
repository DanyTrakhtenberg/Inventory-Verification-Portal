import { InventoryRow, ValidationResult, ValidationRule } from '../types/validation';

function parseNum(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

type State = {
  costCol: string | null;
  priceCol: string | null;
  items: Array<{ row: number; cost: number; price: number }>;
};

export const costVsPriceRule: ValidationRule<State> = {
  name: 'cost_vs_price',
  init: (headers) => ({
    costCol: headers.find((h) => h === 'cost') ?? null,
    priceCol: headers.find((h) => h === 'price') ?? null,
    items: [],
  }),
  processRow: (state, row, idx, _headers) => {
    if (!state.costCol || !state.priceCol) return;
    const cost = parseNum(row[state.costCol]);
    const price = parseNum(row[state.priceCol]);
    if (cost !== null && price !== null && cost < price) {
      state.items.push({ row: idx + 2, cost, price });
    }
  },
  finalize: (state): ValidationResult => {
    if (!state.costCol || !state.priceCol) {
      return {
        rule: 'cost_vs_price',
        passed: true,
        details: { message: 'Missing cost or price column - skipping check' },
      };
    }
    return {
      rule: 'cost_vs_price',
      passed: state.items.length === 0,
      details: {
        count: state.items.length,
        items: state.items.length > 0 ? state.items.slice(0, 50) : undefined,
      },
    };
  },
};
