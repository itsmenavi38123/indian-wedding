'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';

import { Plus, Search, X, Filter } from 'lucide-react';

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
import { RoleType } from '@/components/common/Header/Header';
import { useGetVendorTeams } from '@/services/api/vendors';

// Table Columns
import { ColumnDef } from '@tanstack/react-table';

const teamColumns: ColumnDef<any>[] = [
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
      return members.map((m: any) => m.teamMember.name).join(', ');
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
];

export default function VendorTeamPage() {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const role = authUser?.role as RoleType | null;
  const route = role === 'VENDOR' ? 'vendor' : 'user';

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [debouncedSearch] = useDebounce(searchText, 500);

  const { data, isLoading, isError, error, refetch } = useGetVendorTeams();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (error) console.error('[VendorTeamPage] fetch error:', error);

  // Filter and Search
  const filteredTeams =
    data?.data?.teams.filter((team: any) => {
      const nameMatch = team.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const memberMatch = team.teamMembers.some((m: any) =>
        m.teamMember.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );

      const roleMatch =
        selectedRole === 'ALL' ||
        team.teamMembers.some((m: any) => (m.teamMember.role ?? '').toUpperCase() === selectedRole);

      return (nameMatch || memberMatch) && roleMatch;
    }) ?? [];

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
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText('')}
              className="absolute right-3 top-2 cursor-pointer text-white hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Desktop Filters */}
        {/* <div className="hidden md:flex md:items-center gap-3">
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-48 rounded-lg border-white text-white shadow-sm focus:ring-primary focus:border-primary">
                            <SelectValue placeholder="Filter by Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="SUPPORT">Support</SelectItem>
                            <SelectItem value="SALES">Sales</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        className="bg-gold text-white border-gold"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setSelectedRole('ALL');
                            setSearchText('');
                        }}
                    >
                        Reset
                    </Button>
                </div> */}

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
                <Select value={selectedRole} onValueChange={setSelectedRole}>
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
                onClick={() => setIsPopoverOpen(false)}
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
            columns={teamColumns}
            data={filteredTeams}
            sorting={[]}
            onSortingChange={() => {}}
            pagination={{ pageIndex: 0, pageSize: 10 }}
            onPaginationChange={() => {}}
            pageCount={filteredTeams.length}
            loading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
