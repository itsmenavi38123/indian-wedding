'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setBudget } from '@/store/slices/configurator';
import {
  updateGuestWeddingPlan,
  calculateBudgetAllocation,
  formatIndianCurrency,
} from '@/services/api/configurator';

export default function BudgetPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const configuratorState = useAppSelector((state) => state.configurator);

  const [budgetMax, setBudgetMax] = useState(configuratorState.budgetMax || 5000000);
  const [budgetMin, setBudgetMin] = useState(configuratorState.budgetMin || 2000000);
  const [flexibleBudget, setFlexibleBudget] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const allocation = calculateBudgetAllocation(budgetMax);

  // Redirect if prerequisites not met
  useEffect(() => {
    if (!configuratorState.weddingPlanId || !configuratorState.vibe || !configuratorState.region) {
      router.push('/wedding-configurator/location');
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = async () => {
    setSubmitting(true);
    try {
      // Save to Redux
      dispatch(
        setBudget({
          budgetMin: flexibleBudget ? 0 : budgetMin,
          budgetMax,
          allocation,
        })
      );

      // Update DB
      if (configuratorState.weddingPlanId) {
        await updateGuestWeddingPlan(configuratorState.weddingPlanId, {
          budgetMin: flexibleBudget ? 0 : budgetMin,
          budgetMax,
          wizardStep: 4,
        });
      }

      // Navigate to Step 5
      router.push('/wedding-configurator/review');
    } catch (err: any) {
      setError('Failed to save your budget. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/wedding-configurator/location');
  };

  const budgetPresets = [
    { label: '₹20L - ₹50L', min: 2000000, max: 5000000 },
    { label: '₹50L - ₹1Cr', min: 5000000, max: 10000000 },
    { label: '₹1Cr - ₹2Cr', min: 10000000, max: 20000000 },
    { label: '₹2Cr+', min: 20000000, max: 50000000 },
  ];

  const categories = [
    { name: 'Venue', percentage: 30, amount: allocation.venue, color: 'bg-gold', icon: '🏰' },
    {
      name: 'Catering',
      percentage: 25,
      amount: allocation.catering,
      color: 'bg-purple-500',
      icon: '🍽️',
    },
    {
      name: 'Decoration',
      percentage: 15,
      amount: allocation.decoration,
      color: 'bg-pink-500',
      icon: '🌸',
    },
    {
      name: 'Photography',
      percentage: 12,
      amount: allocation.photography,
      color: 'bg-blue-500',
      icon: '📸',
    },
    {
      name: 'Entertainment',
      percentage: 10,
      amount: allocation.entertainment,
      color: 'bg-green-500',
      icon: '🎵',
    },
    { name: 'Other', percentage: 8, amount: allocation.other, color: 'bg-gray-500', icon: '✨' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
          Set Your Wedding Budget
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Tell us your budget, and we&apos;ll automatically allocate it across all wedding
          categories to help you plan better.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Budget Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        {/* Budget Presets */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Quick Budget Selection
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {budgetPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  setBudgetMin(preset.min);
                  setBudgetMax(preset.max);
                  setFlexibleBudget(false);
                }}
                className={`
                  py-3 px-4 rounded-lg font-medium text-sm transition-all
                  ${
                    budgetMax === preset.max && budgetMin === preset.min && !flexibleBudget
                      ? 'bg-gold text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flexible Budget Option */}
        <div className="mb-8">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={flexibleBudget}
              onChange={(e) => setFlexibleBudget(e.target.checked)}
              className="w-5 h-5 text-gold border-gray-300 rounded focus:ring-gold"
            />
            <span className="text-sm text-gray-700 font-medium">
              I don&apos;t have a set budget — suggest options
            </span>
          </label>
        </div>

        {!flexibleBudget && (
          <>
            {/* Maximum Budget Slider */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Budget</label>
              <div className="mb-4">
                <input
                  type="range"
                  min="1000000"
                  max="50000000"
                  step="100000"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gold"
                />
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-gold">
                  {formatIndianCurrency(budgetMax)}
                </span>
              </div>
            </div>

            {/* Minimum Budget Slider */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Budget</label>
              <div className="mb-4">
                <input
                  type="range"
                  min="500000"
                  max={budgetMax}
                  step="100000"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
              <div className="text-center">
                <span className="text-2xl font-medium text-gray-700">
                  {formatIndianCurrency(budgetMin)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Budget Allocation */}
      {!flexibleBudget && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-serif text-gray-900 mb-6">Suggested Budget Allocation</h2>
          <p className="text-gray-600 mb-8">
            Based on industry standards and your total budget, here&apos;s how we recommend
            allocating your funds across different categories.
          </p>

          {/* Allocation Bars */}
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-sm text-gray-500">({category.percentage}%)</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatIndianCurrency(category.amount)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${category.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">Total Budget</span>
              <span className="text-2xl font-bold text-gold">
                {formatIndianCurrency(budgetMax)}
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <span className="font-medium">Smart Allocation:</span> This is just a suggestion
              based on {configuratorState.guests} guests. You can always adjust individual budgets
              as you explore vendors.
            </p>
          </div>
        </div>
      )}

      {/* Flexible Budget Info */}
      {flexibleBudget && (
        <div className="bg-gradient-to-r from-gold/10 to-purple-50 rounded-2xl p-8 mb-8 border border-gold/20">
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              We&apos;ll Show You All Options
            </h3>
            <p className="text-gray-600">
              No budget constraints set. We&apos;ll present venues and vendors across all price
              ranges so you can explore everything available.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pb-8">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>

        <button
          onClick={handleContinue}
          disabled={submitting}
          className={`
            px-8 py-3 font-medium rounded-lg transition-colors shadow-md
            ${
              !submitting
                ? 'bg-gold text-white hover:bg-gold/90 hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {submitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Next: Review Your Plan →'
          )}
        </button>
      </div>
    </div>
  );
}
