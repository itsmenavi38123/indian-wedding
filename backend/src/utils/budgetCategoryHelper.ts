import { BudgetCategory } from '@prisma/client';

/**
 * Budget category ranges in INR
 * ECONOMY: 5L - 15L (500,000 - 1,500,000)
 * STANDARD: 15L - 30L (1,500,000 - 3,000,000)
 * PREMIUM: 30L - 50L (3,000,000 - 5,000,000)
 * LUXURY: 50L+ (5,000,000+)
 */

const BUDGET_RANGES = {
  ECONOMY: { min: 500000, max: 1500000 },
  STANDARD: { min: 1500000, max: 3000000 },
  PREMIUM: { min: 3000000, max: 5000000 },
  LUXURY: { min: 5000000, max: Infinity },
};

export function determineVendorBudgetCategories(
  minimumAmount: number,
  maximumAmount: number
): BudgetCategory[] {
  const categories: BudgetCategory[] = [];

  Object.entries(BUDGET_RANGES).forEach(([category, range]) => {
    const hasOverlap = minimumAmount <= range.max && maximumAmount >= range.min;

    if (hasOverlap) {
      categories.push(category as BudgetCategory);
    }
  });

  if (categories.length === 0) {
    if (maximumAmount < BUDGET_RANGES.ECONOMY.min) {
      categories.push(BudgetCategory.ECONOMY);
    } else if (minimumAmount > BUDGET_RANGES.LUXURY.min) {
      categories.push(BudgetCategory.LUXURY);
    }
  }

  return categories;
}
export function determineSingleBudgetCategory(budget: number): BudgetCategory {
  if (budget < BUDGET_RANGES.STANDARD.min) {
    return BudgetCategory.ECONOMY;
  } else if (budget < BUDGET_RANGES.PREMIUM.min) {
    return BudgetCategory.STANDARD;
  } else if (budget < BUDGET_RANGES.LUXURY.min) {
    return BudgetCategory.PREMIUM;
  } else {
    return BudgetCategory.LUXURY;
  }
}

/**
 * Get budget category from average of min and max
 */
export function getBudgetCategoryFromRange(minBudget: number, maxBudget: number): BudgetCategory {
  const avgBudget = (minBudget + maxBudget) / 2;
  return determineSingleBudgetCategory(avgBudget);
}

/**
 * Format budget amount in readable format (e.g., "15L", "1.5Cr")
 */
export function formatBudgetAmount(amount: number): string {
  if (amount >= 10000000) {
    // Crore
    return `${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    // Lakh
    return `${(amount / 100000).toFixed(0)}L`;
  } else {
    // Thousands
    return `${(amount / 1000).toFixed(0)}K`;
  }
}

/**
 * Get budget category display label
 */
export function getBudgetCategoryLabel(category: BudgetCategory): string {
  const labels = {
    [BudgetCategory.ECONOMY]: 'Economy (5L - 15L)',
    [BudgetCategory.STANDARD]: 'Standard (15L - 30L)',
    [BudgetCategory.PREMIUM]: 'Premium (30L - 50L)',
    [BudgetCategory.LUXURY]: 'Luxury (50L+)',
  };
  return labels[category];
}

/**
 * Check if a vendor's budget range matches a lead's budget
 */
export function isVendorBudgetMatch(
  vendorMin: number,
  vendorMax: number,
  leadBudget: number
): boolean {
  return leadBudget >= vendorMin && leadBudget <= vendorMax;
}

/**
 * Check if vendor categories include the target category
 */
export function vendorServesCategory(
  vendorCategories: BudgetCategory[],
  targetCategory: BudgetCategory
): boolean {
  return vendorCategories.includes(targetCategory);
}
