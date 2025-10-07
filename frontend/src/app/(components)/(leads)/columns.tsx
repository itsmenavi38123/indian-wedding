'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArchiveRestore, Edit, Eye, Link2 } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { Lead } from '@/types/lead/Lead';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { RoleType } from '@/components/common/Header/Header';

const statusColors: Record<Lead['status'], string> = {
  INQUIRY: 'bg-blue-500',
  PROPOSAL: 'bg-yellow-500',
  BOOKED: 'bg-green-500',
  COMPLETED: 'bg-gray-500',
};

const saveStatusColors: Record<Lead['saveStatus'], string> = {
  SUBMITTED: 'bg-green-500',
  DRAFT: 'bg-gray-500',
  ARCHIVED: 'bg-red-500',
};

export const getColumns = (role: RoleType | null): ColumnDef<Lead>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table?.getIsAllPageRowsSelected() ||
          (table?.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: any) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: 'partner1Name',
    header: 'Lead Name',
    cell: ({ row }) => (
      <span className="font-medium">{`${row?.original?.partner1Name}${row?.original?.partner2Name ? ` - ${row?.original?.partner2Name}` : ``}`}</span>
    ),
  },
  {
    id: 'primaryContact',
    header: 'Contact',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row?.original?.primaryContact ?? '-'}</span>
        <span className="text-muted-foreground text-sm">{row?.original?.phoneNumber ?? '-'}</span>
        <span className="text-muted-foreground text-sm">
          {row?.original?.whatsappNumber ?? '-'}
        </span>
        <span className="text-muted-foreground text-sm">{row?.original?.email ?? '-'}</span>
      </div>
    ),
  },
  {
    accessorKey: 'weddingDate',
    header: 'Wedding Date',
    cell: ({ row }) => format(row?.original?.weddingDate, 'dd MMM yyyy'),
  },
  {
    accessorKey: 'budgetMin',
    header: 'Budget Range',
    cell: ({ row }) => (
      <span className="font-medium">{`${row?.original?.budgetMin} - ${row?.original?.budgetMax}`}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Type',
    cell: ({ row }) => (
      <Badge className={`${statusColors[row.original.status]} text-white`}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'saveStatus',
    header: 'Status',
    cell: ({ row }) => (
      <Badge className={`${saveStatusColors[row.original.saveStatus]} text-white`}>
        {row.original.saveStatus}
      </Badge>
    ),
  },
  {
    accessorKey: 'leadSource',
    header: 'Source',
    cell: ({ row }) => (
      <span className="font-medium">{row?.original?.source ? row?.original?.source : '-'}</span>
    ),
  },
  {
    accessorKey: 'createdBy',
    header: 'Created By',
    cell: ({ row }) => {
      const assigned = row.original.createdBy;
      const displayValue = typeof assigned === 'string' ? assigned : assigned?.name || 'Admin';
      return <span className="font-medium">{displayValue}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created Date',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      if (!row.original.createdAt || isNaN(date.getTime())) {
        return '-';
      }
      return format(date, 'dd MMM yyyy');
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const leadId = row.original.id;
      if (role !== 'ADMIN' && role !== 'USER') {
        return null;
      }

      const route = role === 'ADMIN' ? 'admin' : 'user';
      return (
        <div className="flex gap-2">
          <Link href={`/${route}/leads/${leadId}`}>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/${route}/leads/edit/${leadId}`}>
            <Button className="cursor-pointer" variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          {role === 'ADMIN' && (
            <Link href={`/admin/leads/assign/vendors/${leadId}`}>
              <Button className="cursor-pointer" variant="ghost" size="icon">
                <Link2 className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

export const getArchivedColumns = (
  role: RoleType | null,
  onUnarchive: (leadId: string) => void
): ColumnDef<Lead>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table?.getIsAllPageRowsSelected() ||
          (table?.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: any) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: 'partner1Name',
    header: 'Lead Name',
    cell: ({ row }) => (
      <span className="font-medium">{`${row?.original?.partner1Name}${row?.original?.partner2Name ? ` - ${row?.original?.partner2Name}` : ``}`}</span>
    ),
  },
  {
    id: 'primaryContact',
    header: 'Contact',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span>{row?.original?.primaryContact ?? '-'}</span>
        <span className="text-muted-foreground text-sm">{row?.original?.phoneNumber ?? '-'}</span>
        <span className="text-muted-foreground text-sm">
          {row?.original?.whatsappNumber ?? '-'}
        </span>
        <span className="text-muted-foreground text-sm">{row?.original?.email ?? '-'}</span>
      </div>
    ),
  },
  {
    accessorKey: 'weddingDate',
    header: 'Wedding Date',
    cell: ({ row }) => format(row?.original?.weddingDate, 'dd MMM yyyy'),
  },
  {
    accessorKey: 'budgetMin',
    header: 'Budget Range',
    cell: ({ row }) => (
      <span className="font-medium">{`${row?.original?.budgetMin} - ${row?.original?.budgetMax}`}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Type',
    cell: ({ row }) => (
      <Badge className={`${statusColors[row.original.status]} text-white`}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdBy',
    header: 'Created By',
    cell: ({ row }) => {
      const assigned = row.original.createdBy;
      const displayValue = typeof assigned === 'string' ? assigned : assigned?.name || 'Admin';
      return <span className="font-medium">{displayValue}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created Date',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      if (!row.original.createdAt || isNaN(date.getTime())) {
        return '-';
      }
      return format(date, 'dd MMM yyyy');
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const leadId = row.original.id;
      return (
        <div className="flex gap-2">
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={() => onUnarchive(leadId)}
          >
            <ArchiveRestore className="h-4 w-4" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
