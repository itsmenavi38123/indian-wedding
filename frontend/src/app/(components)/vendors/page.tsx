'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';

import { Plus, Search, X, Filter, Trash, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/common/table/DataTable';
import { RootState, AppDispatch } from '@/store/store';
import { PaginationState, SortingState } from '@tanstack/react-table';
import { setSearch, setRoleFilter, setPagination } from '@/store/slices/vendorTeam';
import { RoleType } from '@/components/common/Header/Header';
import { useDeleteVendorTeam, useGetVendorTeams } from '@/services/api/vendors';

// Table Columns
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const getTeamColumns = (onDelete: (id: string) => void): ColumnDef<any>[] => [
  {
    accessorKey: 'name',
    header: 'Team Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    id: 'teamMembers',
    header: 'Team Members',
    cell: ({ row }) => {
      const members = row.original.teamMembers || [];
      return `${members.length} member${members.length !== 1 ? 's' : ''}`;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    enableSorting: true,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const teamId = row.original.id;
      const authUser = useSelector((state: RootState) => state.auth.user);
      const role = authUser?.role as RoleType | null;
      const route = role === 'VENDOR' ? 'vendor' : 'user';
      return (
        <div className="flex gap-2">
          <Link href={`/${route}/team/edit/${teamId}`}>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="destructive" size="icon" onClick={() => onDelete(teamId)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function VendorTeamPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const role = authUser?.role as RoleType | null;
  const route = role === 'VENDOR' ? 'vendor' : 'user';
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchText = useSelector((state: RootState) => state.vendorTeam.search);
  const selectedRole = useSelector((state: RootState) => state.vendorTeam.roleFilter);
  const [debouncedSearch] = useDebounce(searchText, 500);
  const [open, setOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const deleteTeamMutation = useDeleteVendorTeam();
  const { pagination, sorting, search, roleFilter } = useSelector(
    (state: RootState) => state.vendorTeam
  );
  const { pageIndex, pageSize } = pagination;
  const { data, isLoading, isError, error, refetch } = useGetVendorTeams({
    page: pageIndex + 1,
    limit: pageSize,
    search: searchText,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) console.error('[VendorTeamPage] fetch error:', error);

  const handleDeleteClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedTeamId) return;

    try {
      await deleteTeamMutation.mutateAsync(selectedTeamId);
      queryClient.invalidateQueries({ queryKey: ['vendorTeams'] });
    } catch (err) {
      toast.error('Failed to delete team');
    } finally {
      setOpen(false);
      setSelectedTeamId(null);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setSelectedTeamId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Team Management</h1>
        <Link href={`/${route}/team/add`} className="flex items-center">
          <Button className="text-white bg-gold hover:bg-white hover:text-accent-foreground">
            <Plus className="mr-2 h-4 w-4" /> Add New Team
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
          <Input
            value={searchText}
            placeholder="Search team members"
            className="pl-10 pr-4 py-2 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            onChange={(e) => dispatch(setSearch(e.target.value))}
          />
          {searchText && (
            <button
              type="button"
              onClick={() => dispatch(setSearch(''))}
              className="absolute right-3 top-2 cursor-pointer text-black hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {/* Mobile Filters */}
        <div className="flex md:hidden">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => dispatch(setRoleFilter(value))}
                >
                  <SelectTrigger className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="Filter by Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="SALES">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  dispatch(setSearch(''));
                  dispatch(setRoleFilter('ALL'));
                  setIsPopoverOpen(false);
                }}
              >
                Reset Filters
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Table */}
      <div className="black-bg shadow-sm rounded-lg border p-4 border-[#e5e5e521]">
        {isLoading ? (
          <div>Loading teams...</div>
        ) : isError ? (
          <div>Failed to load teams.</div>
        ) : (
          <DataTable
            columns={getTeamColumns(handleDeleteClick)}
            data={data?.data?.teams || []}
            sorting={[]}
            onSortingChange={() => {}}
            pagination={pagination}
            onPaginationChange={(newPagination) => dispatch(setPagination(newPagination))}
            pageCount={data ? Math.ceil(Number(data.data.total) / pagination.pageSize) : 0}
            loading={isLoading}
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>Are you sure you want to delete this team?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
