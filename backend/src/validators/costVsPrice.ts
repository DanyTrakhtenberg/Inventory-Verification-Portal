import { InventoryRow, ValidationResult } from '../types/validation';

function parseNum(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export function validateCostVsPrice(rows: InventoryRow[], headers: string[]): ValidationResult {
  const costCol = headers.find((h) => h === 'cost');
  const priceCol = headers.find((h) => h === 'price');

  if (!costCol || !priceCol) {
    return {
      rule: 'cost_vs_price',
      passed: true,
      details: { message: 'Missing cost or price column - skipping check' },
    };
  }

  const items: Array<{ row: number; cost: number; price: number }> = [];

  rows.forEach((row, idx) => {
    const cost = parseNum(row[costCol]);
    const price = parseNum(row[priceCol]);
    if (cost !== null && price !== null && cost < price) {
      items.push({ row: idx + 2, cost, price });
    }
  });

  return {
    rule: 'cost_vs_price',
    passed: items.length === 0,
    details: {
      count: items.length,
      items: items.length > 0 ? items.slice(0, 50) : undefined, // limit for JSONB
    },
  };
}
