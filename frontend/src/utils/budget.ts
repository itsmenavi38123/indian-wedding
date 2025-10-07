export const BudgetRange = [
  [500000, 1000000],
  [1000000, 2500000],
  [2500000, 5000000],
  [5000000, 20000000],
];

export const minBudget = 500000;
export const maxBudget = 20000000;
export const minGuestCount = 50;
export const maxGuestCount = 2000;

export function parseBudget(budget: string | number): number {
  if (!budget) return 0;
  if (typeof budget === 'number') return budget;

  let clean = budget.replace(/[₹,\s]/g, '');

  if (clean.includes('-')) {
    clean = clean.split('-')[0]; // take lower bound
  }

  if (clean.endsWith('L')) {
    return parseFloat(clean.replace('L', '')) * 100000;
  }

  if (clean.endsWith('Cr')) {
    return parseFloat(clean.replace('Cr', '')) * 10000000;
  }

  return parseFloat(clean) || 0;
}

export function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
  return `₹${value.toLocaleString('en-IN')}`;
}
