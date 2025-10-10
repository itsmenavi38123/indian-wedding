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

export default function Filters({ assignees, value, onApply, isLoading = false }: Props) {
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
    <section className="w-80 sm:w-full max-w-full p-2 sm:p-3 md:p-4 overflow-hidden bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-[#e5e5e521] py-6 shadow-sm black-bg">
      <div className="space-y-3 sm:space-y-4 w-full max-w-full">
        {/* Filters grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 w-full max-w-full">
          {/* Team member */}
          <div className="flex flex-col gap-1 min-w-0">
            <label htmlFor={`${id}-m`} className="text-sm font-medium text-white truncate">
              Team member
            </label>
            <select
              id={`${id}-m`}
              value={localFilters.member}
              onChange={(e) => updateFilter({ member: e.target.value })}
              className="h-[40px] md:h-[45px]  rounded-md border border-gray-300 bg-transparent text-white px-2 text-[11px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
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
            <label htmlFor={`${id}-sd`} className="text-sm font-medium text-white truncate">
              Start date
            </label>
            <input
              id={`${id}-sd`}
              type="date"
              value={localFilters.startDate}
              onChange={(e) => updateFilter({ startDate: e.target.value })}
              className="h-[40px] md:h-[45px] bg bg-transparent rounded-md border border-gray-300 px-2 text-white text-[11px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
            />
          </div>

          {/* End date */}
          <div className="flex flex-col gap-1 min-w-0">
            <label htmlFor={`${id}-ed`} className="text-sm font-medium text-white truncate">
              End date
            </label>
            <input
              id={`${id}-ed`}
              type="date"
              value={localFilters.endDate}
              onChange={(e) => updateFilter({ endDate: e.target.value })}
              className="h-[40px] md:h-[45px]  rounded-md border border-gray-300 bg-transparent text-white px-2 text-[11px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
            />
          </div>

          {/* Min budget */}
          <div className="flex flex-col gap-1 min-w-0">
            <label htmlFor={`${id}-min`} className="text-sm font-medium text-white truncate">
              Min budget
            </label>
            <input
              id={`${id}-min`}
              type="number"
              inputMode="numeric"
              value={localFilters.minBudget}
              onChange={(e) => updateFilter({ minBudget: e.target.value })}
              placeholder="0"
              className="h-[40px] md:h-[45px]  rounded-md border border-gray-300 bg-transparent text-white px-2 text-[11px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
            />
          </div>

          {/* Max budget */}
          <div className="flex flex-col gap-1 min-w-0">
            <label htmlFor={`${id}-max`} className="text-sm font-medium text-white truncate">
              Max budget
            </label>
            <input
              id={`${id}-max`}
              type="number"
              inputMode="numeric"
              value={localFilters.maxBudget}
              onChange={(e) => updateFilter({ maxBudget: e.target.value })}
              placeholder="50000"
              className="h-[40px] md:h-[45px]  rounded-md border border-gray-300 bg-transparent text-white px-2 text-[11px] sm:text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full min-w-0"
            />
          </div>
        </div>

        {/* Apply and Reset Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2 pt-2 sm:pt-3 border-t border-[#e5e5e521] w-full max-w-full">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs sm:text-sm text-gray-600  transition-colors flex-shrink-0 bg-white rounded-md hover:bg-gold hover:text-white"
            disabled={isLoading}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isLoading}
            className="px-4 py-1.5 text-xs sm:text-sm font-medium text-white  focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 bg-gold rounded-md hover:bg-white hover:text-accent-foreground "
          >
            {isLoading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>
    </section>
  );
}
