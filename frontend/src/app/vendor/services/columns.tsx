import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export type VendorService = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  country: string;
  state: string;
  city: string;
  thumbnail: {
    url: string;
  };
  createdAt: string;
  updatedAt: string;
};

export const getVendorServiceColumns = (
  role: 'ADMIN' | 'USER' | 'VENDOR' | null,
  onDelete?: (id: string) => void
): ColumnDef<VendorService>[] => [
  {
    accessorKey: 'thumbnail',
    header: 'Image',
    cell: ({ row }) => (
      <div className="w-16 h-16">
        {row.original.thumbnail?.url ? (
          <Image
            src={row.original.thumbnail.url}
            alt={row.original.title}
            width={64}
            height={64}
            className="rounded-md object-cover"
          />
        ) : (
          <span>No Image</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <span>{row.original.description}</span>,
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => <span>₹{row.original.price.toLocaleString()}</span>,
  },
  {
    accessorKey: 'city',
    header: 'Location',
    cell: ({ row }) => (
      <span>{`${row.original.city}, ${row.original.state}, ${row.original.country}`}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => format(new Date(row.original.createdAt), 'dd MMM yyyy'),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      if (!role) return null;
      return (
        <div className="flex gap-2">
          {role === 'VENDOR' && (
            <>
              <Link href={`/vendor/services/edit/${row.original.id}`}>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this service?')) {
                      onDelete(row.original.id);
                    }
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      );
    },
  },
];
