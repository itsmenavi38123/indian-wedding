'use client';

import { useId, useState } from 'react';

export type FiltersState = {
  member: string;
  startDate: string;
  endDate: string;
  minBudget: string;
  maxBudget: string;
};

type Props = {
  assignees: string[];
  value: FiltersState;
  onChange: (s: FiltersState) => void;
  onApply: (s: FiltersState) => void;
  isLoading?: boolean;
};

export default function Filters({ assignees, value, onChange, onApply, isLoading = false }: Props) {
  const id = useId();
  const [localFilters, setLocalFilters] = useState<FiltersState>(value);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const resetFilters: FiltersState = {
      member: 'all',
      startDate: '',
      endDate: '',
      minBudget: '',
      maxBudget: '',
    };
    setLocalFilters(resetFilters);
    onApply(resetFilters);
  };

  const updateFilter = (updates: Partial<FiltersState>) => {
    setLocalFilters((prev) => ({ ...prev, ...updates }));
  };

  return (
    <section className="w-80 sm:w-full max-w-full  rounded-lg border border-gray-200 bg-white p-2 sm:p-3 md:p-4 overflow-hidden">
      <div className="space-y-3 sm:space-y-4 w-full max-w-full">
        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 w-full max-w-full">
          {/* Team member */}
          <div className="flex flex-col gap-1 min-w-0">
            <label
              htmlFor={`${id}-m`}
              className="text-[10px] sm:text-[11px] md:text-xs font-medium text-gray-700 truncate"
            >
              Team member
            </label>
            <select
              id={`${id}-m`}
              value={localFilters.member}
              onChange={(e) => updateFilter({ member: e.target.value })}
              className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 text-[11px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
            >
              {assignees.map((a) => (
                <option key={a} value={a}>
                  {a === 'all' ? 'All members' : a}
                </option>
              ))}
            </select>
          </div>

          {/* Start date */}
          <div className="flex flex-col gap-1 min-w-0">
            <label
              htmlFor={`${id}-sd`}
              className="text-[10px] sm:text-[11px] md:text-xs font-medium text-gray-700 truncate"
            >
              Start date
            </label>
            <input
              id={`${id}-sd`}
              type="date"
              value={localFilters.startDate}
              onChange={(e) => updateFilter({ startDate: e.target.value })}
              className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 text-[11px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
            />
          </div>

          {/* End date */}
          <div className="flex flex-col gap-1 min-w-0">
            <label
              htmlFor={`${id}-ed`}
              className="text-[10px] sm:text-[11px] md:text-xs font-medium text-gray-700 truncate"
            >
              End date
            </label>
            <input
              id={`${id}-ed`}
              type="date"
              value={localFilters.endDate}
              onChange={(e) => updateFilter({ endDate: e.target.value })}
              className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 text-[11px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
            />
          </div>

          {/* Min budget */}
          <div className="flex flex-col gap-1 min-w-0">
            <label
              htmlFor={`${id}-min`}
              className="text-[10px] sm:text-[11px] md:text-xs font-medium text-gray-700 truncate"
            >
              Min budget
            </label>
            <input
              id={`${id}-min`}
              type="number"
              inputMode="numeric"
              value={localFilters.minBudget}
              onChange={(e) => updateFilter({ minBudget: e.target.value })}
              placeholder="0"
              className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 text-[11px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
            />
          </div>

          {/* Max budget */}
          <div className="flex flex-col gap-1 min-w-0">
            <label
              htmlFor={`${id}-max`}
              className="text-[10px] sm:text-[11px] md:text-xs font-medium text-gray-700 truncate"
            >
              Max budget
            </label>
            <input
              id={`${id}-max`}
              type="number"
              inputMode="numeric"
              value={localFilters.maxBudget}
              onChange={(e) => updateFilter({ maxBudget: e.target.value })}
              placeholder="50000"
              className="h-8 sm:h-9 rounded-md border border-gray-300 bg-white px-2 text-[11px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
            />
          </div>
        </div>

        {/* Apply and Reset Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2 pt-2 sm:pt-3 border-t w-full max-w-full">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isLoading}
            className="px-4 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isLoading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>
    </section>
  );
}
