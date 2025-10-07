'use client';

import { useState } from 'react';
import { Toggle } from '@/components/ui/toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export const TopBar = ({ onViewChange, onFiltersChange }: any) => {
  const [view, setView] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [filters, setFilters] = useState({
    member: '',
    startDate: '',
    endDate: '',
    budget: [0, 100],
  });

  const handleViewChange = (newView: 'kanban' | 'list' | 'calendar') => {
    setView(newView);
    onViewChange?.(newView);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-2 border-b bg-gray-50">
      {/* View Toggle */}
      <div className="flex gap-2">
        <Toggle pressed={view === 'kanban'} onPressedChange={() => handleViewChange('kanban')}>
          Kanban
        </Toggle>
        <Toggle pressed={view === 'list'} onPressedChange={() => handleViewChange('list')}>
          List
        </Toggle>
        <Toggle pressed={view === 'calendar'} onPressedChange={() => handleViewChange('calendar')}>
          Calendar
        </Toggle>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        {/* Team Member */}
        <Select onValueChange={(v) => handleFilterChange('member', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Team Member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="john">John Doe</SelectItem>
            <SelectItem value="sarah">Sarah Smith</SelectItem>
            <SelectItem value="mike">Mike Wilson</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Inputs */}
        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm w-[130px]"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
          <span className="text-gray-500 text-xs">to</span>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm w-[130px]"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>

        {/* Budget Range */}
        <div className="w-full sm:w-[220px]">
          <Slider
            defaultValue={[0, 100]}
            max={100}
            step={5}
            onValueChange={(val) => handleFilterChange('budget', val)}
          />
          <div className="text-xs text-gray-500">
            Budget: {filters.budget[0]}L {filters.budget[1]}L
          </div>
        </div>
      </div>
    </div>
  );
};
