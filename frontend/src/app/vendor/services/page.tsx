'use client';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Search, X } from 'lucide-react';
import { DataTable } from '@/components/common/table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationState, SortingState } from '@tanstack/react-table';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';

import Link from 'next/link';
import { getVendorServiceColumns } from './columns';
import { setPagination, setSearch, setSorting } from '@/store/slices/vendorServices';
import { useDeleteVendorService, useGetVendorServices } from '@/services/api/vendorServices';

export default function VendorServicePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { mutate: deleteService } = useDeleteVendorService();
  const auth = useSelector((state: RootState) => state.auth.user);
  const role = auth?.role;
  const columns = getVendorServiceColumns(role, deleteService); // adjust columns for vendor services

  const { sorting, pagination, categoryFilter, search } = useSelector(
    (state: RootState) => state.vendorService
  );

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedValue] = useDebounce(localSearch, 500);

  // Update Redux search state after debounce
  useEffect(() => {
    dispatch(setSearch(debouncedValue));
  }, [debouncedValue, dispatch]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Determine route based on role
  const route = role === 'ADMIN' ? 'admin' : 'vendor';
  console.log('auth', auth);
  // Fetch Vendor Services
  const { data, isLoading } = useGetVendorServices({
    vendorId: auth?.id || '',
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    category: categoryFilter === 'ALL' ? '' : categoryFilter,
  });
  console.log('vendor services data', data);
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Vendor Services</h1>
        <div className="flex gap-2">
          <Link href={`/${route}/services/add`} className="flex items-center">
            <Button className="text-white bg-gold hover:bg-white hover:text-accent-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add New Service
            </Button>
          </Link>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-4 flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            <Input
              value={localSearch}
              placeholder="Search services"
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
      </div>

      {/* Data Table */}
      <div className="black-bg shadow-sm rounded-lg border p-4 border-[#e5e5e521]">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          sorting={sorting}
          onSortingChange={(sorting: SortingState) => dispatch(setSorting(sorting))}
          pagination={pagination}
          onPaginationChange={(pagination: PaginationState) => dispatch(setPagination(pagination))}
          pageCount={data?.pagination?.totalPages ?? 0}
          loading={isLoading}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </div>
    </div>
  );
}
