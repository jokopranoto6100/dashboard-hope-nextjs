// src/app/(dashboard)/crawling-fasih/data-table.tsx
"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Definisikan props untuk komponen DataTable
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Hook untuk paginasi
    getPaginationRowModel: getPaginationRowModel(),
    // Hook untuk sorting
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    // Hook untuk filtering global
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    // State yang kita kelola
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <div className="space-y-4">
      {/* Toolbar: Filter/Pencarian */}
      <div className="flex items-center">
        <Input
          placeholder="Cari di semua kolom..."
          value={globalFilter ?? ''}
          onChange={(event) =>
            setGlobalFilter(String(event.target.value))
          }
          className="max-w-sm"
        />
      </div>

      {/* Tabel Utama */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginasi */}
      <div className="flex items-center justify-between space-x-2">
        <div className="text-sm text-muted-foreground">
            Menampilkan {table.getRowModel().rows.length} dari {data.length} baris.
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-sm">
                Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
                {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Selanjutnya
            </Button>
        </div>
      </div>
    </div>
  )
}