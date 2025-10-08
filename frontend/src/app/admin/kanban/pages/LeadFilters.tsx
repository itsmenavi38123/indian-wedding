'use client';
import { memo, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import { X, Filter, RefreshCcw, Check } from 'lucide-react';
import { LeadFiltersProps, LeadFilters as LeadFiltersType } from '@/app/admin/kanban/pages/type';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export const LeadFilters = memo(
  ({ initialFilters, onApplyFilters, locations }: LeadFiltersProps) => {
    const [localSearch, setLocalSearch] = useState(initialFilters.searchQuery);
    const [localLocations, setLocalLocations] = useState(initialFilters.selectedLocations);
    const [localBudget, setLocalBudget] = useState(initialFilters.budgetRange);
    const [localDate, setLocalDate] = useState(initialFilters.dateRange);

    const normalizeToLocalMidnight = (date?: Date) => {
      if (!date) return undefined;
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const handleApply = () => {
      const filtersForAPI: LeadFiltersType = {};

      if (localSearch) filtersForAPI.search = localSearch;
      if (localLocations.length > 0) filtersForAPI.location = localLocations.join(',');
      if (localBudget) {
        filtersForAPI.budgetMin = localBudget[0];
        filtersForAPI.budgetMax = localBudget[1];
      }
      if (localDate.from)
        filtersForAPI.dateFrom = normalizeToLocalMidnight(localDate.from)?.toISOString();
      if (localDate.to)
        filtersForAPI.dateTo = normalizeToLocalMidnight(localDate.to)?.toISOString();
      onApplyFilters(filtersForAPI);
    };

    const handleReset = () => {
      setLocalSearch('');
      setLocalLocations([]);
      setLocalBudget(initialFilters.budgetRange || [500_000, 20_000_000]);
      setLocalDate({});
      onApplyFilters({});
    };

    // const formatCurrency = (value: number) => {
    //   if (value >= 1_00_00_000) return `₹${value / 10000000}Cr`;
    //   if (value >= 1_00_000) return `₹${value / 100000}L`;
    //   return `₹${value.toLocaleString()}`;
    // };

    return (
      <div className="px-4 py-3 mb-6 rounded-md border border-[#e5e5e521]  shadow-sm black-bg">
        {/* Title row */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-gold" /> Filters
          </h2>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleReset}
                  className="p-2 rounded-md border hover:bg-gold hover:border-gold"
                >
                  <RefreshCcw className="w-4 h-4 text-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Reset filters</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleApply}
                  className="p-2 rounded-md bg-gold hover:bg-white  text-white hover:text-gold"
                >
                  <Check className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Apply filters</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 items-start">
          {/* Search */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white mb-1">Search</label>
            <div className="relative">
              <Input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search couple"
                className="pr-8 text-white"
              />
              {localSearch && (
                <X
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-white w-4 h-4"
                  onClick={() => setLocalSearch('')}
                />
              )}
            </div>
          </div>

          {/* Locations */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white mb-1">Preferred Locations</label>
            <MultiSelect
              options={locations.map((loc) => ({ label: loc, value: loc }))}
              value={localLocations}
              onChange={(selected: string[]) => setLocalLocations(selected)}
              placeholder="Select locations"
              className="h-[40px] md:h-[45px] bg-transparent text-white hover:bg-transparent hover:text-white"
            />
          </div>
          {/* Wedding Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white mb-1">Wedding Date</label>
            <DateRangePicker
              value={localDate}
              onChange={(range) =>
                setLocalDate({
                  from: normalizeToLocalMidnight(range.from),
                  to: normalizeToLocalMidnight(range.to),
                })
              }
            />
          </div>

          {/* Budget */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white mb-1">Budget Range</label>

            <div className="relative px-2">
              <Slider
                min={500_000}
                max={20_000_000}
                step={1000}
                value={localBudget}
                onValueChange={(val: any) => setLocalBudget(val as [number, number])}
                className="mt-4 bg-white text-[16px]"
              />
            </div>

            {/* Inputs for precise control */}
            <div className="flex items-center gap-2 mt-3">
              <Input
                type="number"
                min={500_000}
                max={localBudget[1]}
                value={localBudget[0]}
                onChange={(e) => setLocalBudget([Number(e.target.value), localBudget[1]])}
                className="w-[100px] text-white text-[14px] h-[30px] "
                placeholder="Min"
              />
              <span>-</span>
              <Input
                type="number"
                min={localBudget[0]}
                max={20_000_000}
                value={localBudget[1]}
                onChange={(e) => setLocalBudget([localBudget[0], Number(e.target.value)])}
                className="w-[100px] text-white h-[30px] text-[14px]"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

LeadFilters.displayName = 'LeadFilters';
