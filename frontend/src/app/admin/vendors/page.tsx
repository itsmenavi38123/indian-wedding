'use client';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Filter, Loader2, Plus, Search, X } from 'lucide-react';

import { columns } from './columns';
import { DataTable } from '@/components/common/table/DataTable';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import {
  exportVendorsWithIds,
  updateBulkVendorStatus,
  useGetVendors,
} from '@/services/api/vendors';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  setClearFilters,
  setPagination,
  setSearch,
  setSorting,
  setStatusFilter,
  setData,
  setLoading,
} from '@/store/slices/vendor';
import Link from 'next/link';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_QUERY_KEYS } from '@/services/apiBaseUrl';

export default function VendorPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  const {
    sorting,
    pagination,
    statusFilter,
    search,
    data: reduxData,
  } = useSelector((state: RootState) => state.vendor);

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedValue] = useDebounce(localSearch, 500);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { data: vendorData, isLoading } = useGetVendors({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    status: statusFilter === 'ALL' ? '' : statusFilter,
    search,
  });

  // Sync fetched data to Redux
  useEffect(() => {
    dispatch(setLoading(isLoading));
    if (vendorData?.data) {
      dispatch(setData(vendorData.data));
    }
  }, [dispatch, vendorData, isLoading]);

  // Sync debounced search with Redux
  useEffect(() => {
    dispatch(setSearch(debouncedValue));
    dispatch(setPagination({ ...pagination, pageIndex: 0 })); // reset page on search
  }, [dispatch, debouncedValue, pagination]);

  // Sync local search input with Redux state
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Bulk status update mutation
  const { mutate: updateStatusMutate } = useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      updateBulkVendorStatus(ids, isActive ? 'ACTIVE' : 'INACTIVE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_QUERY_KEYS.vendor.getVendors] });
    },
    onError: () => {
      toast.error('Failed to update vendor status. Please try again later.');
    },
  });

  // Export selected vendors
  const exportSelectedVendors = async (selectedRowIds: string[]) => {
    setExportLoading(true);
    try {
      const response = await exportVendorsWithIds({ ids: selectedRowIds });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vendors.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting vendors:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const selectedRowIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Vendor Management</h1>
        <Link href="/admin/vendors/add" className="flex items-center">
          <Button className="bg-gold text-white border-gold">
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-4 flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          <Input
            value={localSearch}
            placeholder="Search vendors"
            className="pl-10 pr-4 py-2 rounded-lg border-white text-white shadow-sm focus:border-primary focus:ring-primary"
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-2 cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Desktop filters */}
        <div className="hidden md:flex md:items-center gap-3 border-white text-white">
          <Select
            value={statusFilter}
            onValueChange={(value: string) => {
              dispatch(setStatusFilter(value));
              dispatch(setPagination({ ...pagination, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-48 rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => dispatch(setClearFilters())}>
            Reset
          </Button>
        </div>

        {/* Mobile filters */}
        <div className="flex md:hidden">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value: string) => {
                    dispatch(setStatusFilter(value));
                    dispatch(setPagination({ ...pagination, pageIndex: 0 }));
                  }}
                >
                  <SelectTrigger className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
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
          <span className="text-sm text-gray-700">{selectedRowIds.length} vendor(s) selected</span>
          <div className="flex gap-2">
            <Select
              onValueChange={(value: string) => {
                updateStatusMutate({ ids: selectedRowIds, isActive: value === 'true' });
              }}
            >
              <SelectTrigger className="w-48 rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activate</SelectItem>
                <SelectItem value="false">Deactivate</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => exportSelectedVendors(selectedRowIds)} variant="outline">
              {exportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Export Selected'}
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="black-bg shadow-sm rounded-lg border p-4 border-[#e5e5e521]">
        <DataTable
          columns={columns}
          data={reduxData ?? []}
          sorting={sorting}
          onSortingChange={(sorting: SortingState) => dispatch(setSorting(sorting))}
          pagination={pagination}
          onPaginationChange={(pagination: PaginationState) => dispatch(setPagination(pagination))}
          pageCount={vendorData?.pagination?.totalPages ?? 0}
          loading={isLoading}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </div>
    </div>
  );
}
