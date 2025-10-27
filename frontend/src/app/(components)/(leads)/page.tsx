'use client';
import React, { useEffect, useState } from 'react';

import { useDebounce } from 'use-debounce';
import { Filter, Loader2, Plus, Search, X } from 'lucide-react';
import { DataTable } from '@/components/common/table/DataTable';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LEAD_STATUS_VALUES, LeadStatus } from '@/types/lead/Lead';
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
import { exportLeadsWithIds, updateBulkLeadStatus, useGetLeads } from '@/services/api/leads';
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
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_QUERY_KEYS } from '@/services/apiBaseUrl';
import { RoleType } from '@/components/common/Header/Header';
import { getColumns } from './columns';

export default function LeadPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const auth = useSelector((state: RootState) => state.auth.user);
  const role = auth?.role as RoleType | null;
  const columns = getColumns(role, queryClient);
  const { sorting, pagination, statusFilter, search } = useSelector(
    (state: RootState) => state.lead
  );
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const { data, isLoading, isFetching } = useGetLeads({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    status: statusFilter === 'ALL' ? '' : statusFilter,
    search: search,
  });

  const { isPending: updateLoading, mutate: updateStatusMutate } = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: LeadStatus }) =>
      updateBulkLeadStatus({ ids, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEYS.lead.getLeads] });
    },
    onError: () => {
      toast.error('Failed to update lead status. Please try again later.');
    },
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
  const route = role === 'ADMIN' ? 'admin' : 'user';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Leads Management</h1>
        <div className="flex gap-2">
          <Link href={`/${route}/leads/add`} className="flex items-center">
            <Button className="text-white bg-gold hover:bg-white hover:text-accent-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add New Lead
            </Button>
          </Link>
          {role === 'USER' && (
            <Link
              href={`/user/leads/archive`}
              className="text-blue-600 hover:underline hover:text-blue-800"
            >
              <Button variant={'outline'} className="hover:cursor-pointer">
                View archives
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search + Filters Layout */}
      <div className="flex gap-4 flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
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
            <SelectTrigger className="w-48 rounded-lg border-white text-white shadow-sm focus:ring-primary focus:border-primary">
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
            <Select
              onValueChange={(value: LeadStatus) => {
                updateStatusMutate({ ids: selectedRowIds, status: value as LeadStatus });
              }}
            >
              <SelectTrigger className="w-48 rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(LEAD_STATUS_VALUES).map((source) => (
                  <SelectItem
                    key={source}
                    value={source}
                    className="flex items-center gap-1 justify-center"
                  >
                    {updateLoading || isFetching ? (
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
                    ) : (
                      source
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
