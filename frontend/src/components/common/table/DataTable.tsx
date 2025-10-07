'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
import { SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { Button } from '@/components/ui/button';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading: boolean;
  sorting: SortingState;
  pagination: PaginationState;
  pageCount: number;
  onSortingChange: (sorting: SortingState) => void;
  onPaginationChange: (pagination: PaginationState) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (updater: RowSelectionState) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  sorting,
  pagination,
  pageCount,
  onSortingChange,
  onPaginationChange,
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      pagination,
      rowSelection: rowSelection ?? {},
    },
    getRowId: (row) => (row as any)?.id,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange(newSorting);
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      onPaginationChange(newPagination);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    onRowSelectionChange: (updater) => {
      const newRowSelection = typeof updater === 'function' ? updater(rowSelection ?? {}) : updater;
      onRowSelectionChange?.(newRowSelection);
    },
  });

  const generatePageNumbers = () => {
    const total = pageCount;
    const current = pagination.pageIndex + 1;
    const delta = 2; // pages to show before/after current
    const range: (number | string)[] = [];

    const start: number = Math.max(1, current - delta);
    const end: number = Math.min(total, current + delta);

    if (start > 1) {
      range.push(1);
      if (start > 2) range.push('...');
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (end < total) {
      if (end < total - 1) range.push('...');
      range.push(total);
    }

    return range;
  };

  return (
    <div className="overflow-auto rounded-md border border-[#e5e5e521] text-white">
      <Table className="border-[#e5e5e521] text-white">
        <TableHeader className="border-[#e5e5e521] text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted(); // "asc" | "desc" | false
                const sortingEnabled = header.column.getCanSort();

                return (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none border-[#e5e5e521] text-white"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {sortingEnabled && (
                      <span className="inline-block ml-1">
                        {sorted === 'asc' && <ArrowUp className="h-4 w-4 inline" />}
                        {sorted === 'desc' && <ArrowDown className="h-4 w-4 inline" />}
                        {sorted === false && (
                          <ArrowUpDown className="h-4 w-4 inline text-gray-400" />
                        )}
                      </span>
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-white">
                <Loader2 className="mx-auto h-6 w-6 animate-spin   border-[#e5e5e521] text-white" />
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-white">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex flex-col gap-3 p-2 md:flex-row md:items-center md:justify-between">
        {/* Page Info */}
        <div className="text-sm text-white text-center md:text-left">
          Page {pagination.pageIndex + 1} of {pageCount}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            className=" bg-transparent text-white"
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange({ ...pagination, pageIndex: 0 })}
            disabled={pagination.pageIndex === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            className=" bg-transparent text-white"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {generatePageNumbers().map((page, i) =>
            typeof page === 'number' ? (
              <Button
                className=" bg-transparent text-white"
                key={i}
                variant={pagination.pageIndex + 1 === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPaginationChange({ ...pagination, pageIndex: page - 1 })}
              >
                {page}
              </Button>
            ) : (
              <span key={i} className="px-2 text-gray-400">
                {page}
              </span>
            )
          )}

          <Button
            className=" bg-transparent text-white"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            className=" bg-transparent text-white"
            variant="outline"
            size="sm"
            onClick={() => onPaginationChange({ ...pagination, pageIndex: pageCount - 1 })}
            disabled={pagination.pageIndex === pageCount - 1 || pageCount === 0}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Page Size Selector */}
        <div className="flex justify-center md:justify-end">
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value: string) =>
              onPaginationChange({
                ...pagination,
                pageSize: Number(value),
              })
            }
          >
            <SelectTrigger className="w-[120px] h-9 rounded-lg border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm">
              <SelectValue placeholder={`${pagination.pageSize} / page`} />
            </SelectTrigger>
            <SelectContent className="rounded-lg shadow-lg border border-gray-200">
              {['25', '50', '100'].map((size) => (
                <SelectItem
                  value={size}
                  key={size}
                  className="cursor-pointer text-sm hover:bg-gray-100 focus:bg-primary/10"
                >
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
