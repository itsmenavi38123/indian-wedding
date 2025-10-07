'use client';
import React, { useEffect, useState } from 'react';

import { useDebounce } from 'use-debounce';
import { Filter, Loader2, Search, X } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { exportLeadsWithIds, updateLeadSaveStatus, useGetLeads } from '@/services/api/leads';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
  setClearFilters,
  setPagination,
  setSearch,
  setSorting,
  setStatusFilter,
} from '@/store/slices/lead';
import { RoleType } from '@/components/common/Header/Header';
import { getArchivedColumns } from '../columns';
import { toast } from 'sonner';

export default function LeadsArchivePage() {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth.user);
  const role = auth?.role as RoleType | null;
  const { sorting, pagination, statusFilter, search } = useSelector(
    (state: RootState) => state.lead
  );
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  const { data, isLoading, refetch } = useGetLeads({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortBy: sorting.length > 0 ? sorting[0].id : 'createdAt',
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc',
    status: statusFilter === 'ALL' ? '' : statusFilter,
    search: search,
    archived: true,
  });

  const [localSearch, setLocalSearch] = useState(search);
  const [debouncedValue] = useDebounce(localSearch, 500);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

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

  // unArchive >>>>>>>>>>>>>>>>>>
  const handleUnarchiveClick = (leadId: string) => {
    setSelectedLeadId(leadId);
    setOpen(true);
  };

  const handleConfirm = async () => {
    try {
      if (selectedLeadId) {
        console.log('Unarchiving lead:', selectedLeadId);
        const res = await updateLeadSaveStatus(selectedLeadId, false);
        if (res.statusCode === 200) {
          toast.success('Lead restored successfully!');
          await refetch();
        } else toast.error('Failed to restore lead');
      }
    } catch {
      toast.error('Failed to restore lead');
    } finally {
      setOpen(false);
      setSelectedLeadId(null);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setSelectedLeadId(null);
  };

  const columns = getArchivedColumns(role, handleUnarchiveClick);
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Archive Leads Management</h1>
      </div>

      {/* Search + Filters Layout */}
      <div className="flex gap-4 flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-[12px] h-5 w-5 text-white" />
            <Input
              value={localSearch}
              placeholder="Search"
              className="pl-10 pr-4 py-2 rounded-lg border-white text-white shadow-sm focus:border-primary focus:ring-primary"
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-2 cursor-pointer text-white hover:text-white"
              >
                <X className="h-5 w-5 top-[5px] relative" />
              </button>
            )}
          </div>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden md:flex md:items-center gap-3 border-white text-white h-[40px] md:h-[45px]">
          <Select
            value={statusFilter}
            onValueChange={(value: LeadStatus) => dispatch(setStatusFilter(value))}
          >
            <SelectTrigger className="w-48 rounded-lg border-white shadow-sm focus:ring-primary focus:border-primary h-[45px] md:h-[45px]">
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
            className="h-[40px] md:h-[45px] bg-gold text-white border-0"
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unarchive Lead</DialogTitle>
            <DialogDescription>Are you sure you want to unarchive this lead?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              No
            </Button>
            <Button onClick={handleConfirm}>Yes, Unarchive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
