'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Eye } from 'lucide-react';
import { Vendor } from '@/types/vendor/Vendor';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  true: 'bg-green-500',
  false: 'bg-red-500',
};

// helper to truncate long text
const truncateText = (text: string | undefined, maxLength = 20) => {
  if (!text) return '-';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const columns: ColumnDef<Vendor>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table?.getIsAllPageRowsSelected() ||
          (table?.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: 'name',
    header: 'Vendor Name',
    cell: ({ row }) => <span className="font-medium">{truncateText(row.original.name, 25)}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <span>{truncateText(row.original.email, 30)}</span>,
  },
  {
    accessorKey: 'contactNo',
    header: 'Contact',
    cell: ({ row }) => (
      <span>
        {row.original.countryCode ?? '-'} {truncateText(row.original.contactNo, 15)}
      </span>
    ),
  },
  {
    accessorKey: 'serviceTypes',
    header: 'Services',
    cell: ({ row }) => <span>{truncateText(row.original.serviceTypes, 30)}</span>,
  },
  {
    accessorKey: 'minimumAmount',
    header: 'Amount Range',
    cell: ({ row }) => (
      <span>
        {row.original.minimumAmount} - {row.original.maximumAmount}
      </span>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge className={`${statusColors[String(row.original.isActive)]} text-white`}>
        {row.original.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return createdAt ? format(new Date(createdAt), 'dd MMM yyyy') : '-';
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt;
      return updatedAt ? format(new Date(updatedAt), 'dd MMM yyyy') : '-';
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const vendorId = row.original.id;
      return (
        <div className="flex gap-2">
          <Link href={`/admin/vendors/${vendorId}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/admin/vendors/edit/${vendorId}`}>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
