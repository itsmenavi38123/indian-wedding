'use client';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Plus, Search, X } from 'lucide-react';
import { DataTable } from '@/components/common/table/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Link from 'next/link';
import { getVendorServiceColumns } from './columns';
import { setPagination, setSearch, setSorting } from '@/store/slices/vendorServices';
import { useDeleteVendorService, useGetVendorServices } from '@/services/api/vendorServices';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function VendorServicePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { mutate: deleteService } = useDeleteVendorService();
  const auth = useSelector((state: RootState) => state.auth.user);
  const role = auth?.role;

  const { sorting, pagination, categoryFilter, search } = useSelector(
    (state: RootState) => state.vendorService
  );

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedValue] = useDebounce(localSearch, 500);

  const [open, setOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

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
  const { data, isLoading, refetch } = useGetVendorServices({
    vendorId: auth?.id || '',
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    category: categoryFilter === 'ALL' ? '' : categoryFilter,
  });

  const handleDeleteClick = (leadId: string) => {
    setSelectedRowId(leadId);
    setOpen(true);
  };

  const handleConfirm = async () => {
    try {
      if (selectedRowId) {
        deleteService(selectedRowId);
      }
    } catch {
      toast.error('Failed to restore lead');
    } finally {
      setOpen(false);
      setSelectedRowId(null);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setSelectedRowId(null);
  };

  const columns = getVendorServiceColumns(role, handleDeleteClick);
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>Are you sure you want to delete this service?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              No
            </Button>
            <Button onClick={handleConfirm}>Yes, Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
