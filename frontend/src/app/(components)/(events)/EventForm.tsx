'use client';
import React, { useEffect, useState } from 'react';

import { useDebounce } from 'use-debounce';
import { Filter, Loader2, Plus, Search, X } from 'lucide-react';
import { DataTable } from '@/components/common/table/DataTable';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LeadStatus } from '@/types/lead/Lead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationState, SortingState } from '@tanstack/react-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportLeadsWithIds } from '@/services/api/leads';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  setClearFilters,
  setPagination,
  setSearch,
  setSorting,
  setStatusFilter,
} from '@/store/slices/lead';
import Link from 'next/link';
import { RoleType } from '@/components/common/Header/Header';
import { getColumns } from './columns';
import { useGetEvents } from '@/services/api/events';

export default function EventForm() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth.user);
  const role = auth?.role as RoleType | null;
  const columns = getColumns(role);
  const { sorting, pagination, statusFilter, search } = useSelector(
    (state: RootState) => state.lead
  );
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const { data, isLoading } = useGetEvents({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    status: statusFilter === 'ALL' ? '' : statusFilter,
    search: search,
  });

  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedValue] = useDebounce(localSearch, 500);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const exportSelectedLeads = async (selectedRowIds: string[]) => {
    setExportLoading(true);
    try {
      await exportLeadsWithIds({ ids: selectedRowIds });
    } catch (error) {
      console.error('Error exporting leads:', error);
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setSearch(debouncedValue));
  }, [debouncedValue, dispatch]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const selectedRowIds = Object.keys(rowSelection).filter((id: string) => rowSelection[id]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Event Management</h1>
      </div>

      {/* Search + Filters Layout */}
      <div className="flex gap-4 flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={localSearch}
              placeholder="Search"
              className="pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-2 cursor-pointer border-white text-white hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden md:flex md:items-center gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value: LeadStatus) => dispatch(setStatusFilter(value))}
          >
            <SelectTrigger className="w-48 h-[40px] md:h-[45px] rounded-lg border-white text-white shadow-sm focus:ring-primary focus:border-primary">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="INQUIRY">Inquiry</SelectItem>
              <SelectItem value="PROPOSAL">Proposal</SelectItem>
              <SelectItem value="BOOKED">Booked</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            className="bg-gold text-white border-gold"
            variant="outline"
            size="sm"
            onClick={() => {
              dispatch(setClearFilters());
            }}
          >
            Reset
          </Button>
        </div>

        {/* Filters - Mobile (Popover) */}
        <div className="flex md:hidden">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Lead Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value: LeadStatus) => dispatch(setStatusFilter(value))}
                >
                  <SelectTrigger className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="INQUIRY">Inquiry</SelectItem>
                    <SelectItem value="PROPOSAL">Proposal</SelectItem>
                    <SelectItem value="BOOKED">Booked</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  dispatch(setClearFilters());
                  setIsPopoverOpen(false);
                }}
              >
                Reset Filters
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRowIds.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md border">
          <span className="text-sm text-gray-700">{selectedRowIds.length} lead(s) selected</span>
          <div className="flex gap-2">
            <Button onClick={() => exportSelectedLeads(selectedRowIds)} variant="outline">
              {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Export Selected'}
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="black-bg shadow-sm rounded-lg border p-4 border-[#e5e5e521]">
        <DataTable
          columns={columns}
          data={data?.data?.data ?? []}
          sorting={sorting}
          onSortingChange={(sorting: SortingState) => dispatch(setSorting(sorting))}
          pagination={pagination}
          onPaginationChange={(pagination: PaginationState) => dispatch(setPagination(pagination))}
          pageCount={data?.data?.pagination?.totalPages ?? 0}
          loading={isLoading}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </div>
    </div>
  );
}
