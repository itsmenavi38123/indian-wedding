'use client';

import { formatCurrencyShort } from '@/lib/format';
import { BudgetRange } from '@/utils/budget';
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchDestinationsFromServices, setBudget, setCurrentStep } from '@/store/slices/planning';

type Budget = { min: number; max: number } | null;

type Props = {
  budget: Budget;
  onChange: (upd: Partial<{ budget: Budget }>) => void;
};

export default function BudgetStep({ budget, onChange }: Props) {
  const dispatch = useAppDispatch();
  const { destinationsLoading } = useAppSelector((state) => state.planning);

  const handleBudgetSelect = async (selectedBudgetMin: number, selectedBudgetMax: number) => {
    onChange({ budget: { min: selectedBudgetMin, max: selectedBudgetMax } });
    dispatch(setBudget({ budgetMin: selectedBudgetMin, budgetMax: selectedBudgetMax }));
    dispatch(setCurrentStep('destinations'));
    try {
      await dispatch(
        fetchDestinationsFromServices({
          budgetMin: selectedBudgetMin,
          budgetMax: selectedBudgetMax,
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">What&apos;s your budget?</h2>
        <p className="text-gray-600">This helps us show you the perfect options</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {BudgetRange.map(([min, max]) => {
          const minLabel = formatCurrencyShort(min);
          const maxLabel = max >= 20000000 ? '' : formatCurrencyShort(max);
          const rangeLabel = max >= 20000000 ? `${minLabel}+` : `${minLabel} - ${maxLabel}`;
          return (
            <button
              key={min}
              onClick={() => handleBudgetSelect(min, max)}
              disabled={destinationsLoading}
              className={`p-6 rounded-xl border-2 transition-all hover:cursor-pointer hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                budget?.min === min
                  ? 'border-rose-500 bg-rose-50 shadow-md'
                  : 'border-gray-200 hover:border-rose-200'
              }`}
            >
              <div className="text-xl font-bold text-gray-900">{rangeLabel}</div>
              {destinationsLoading && budget?.min === min && (
                <div className="mt-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500 mx-auto" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
