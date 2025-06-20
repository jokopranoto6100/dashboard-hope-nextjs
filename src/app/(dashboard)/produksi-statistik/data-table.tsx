// Lokasi: src/app/(dashboard)/produksi-statistik/data-table.tsx
"use client"

import { useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
  TableFooter,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button" // <-- PATCH: Import Button
import { Eye, EyeOff } from "lucide-react" // <-- PATCH: Import ikon

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // PATCH: Tambahkan props baru untuk fungsionalitas responsif
  isMobile: boolean
  showAllColumns: boolean
  onToggleColumns: () => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isMobile,
  showAllColumns,
  onToggleColumns,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  const hasComparison = columns.some(c => 'id' in c && c.id === 'pertumbuhan');

  return (
    <div>
      <div className="flex items-center justify-between py-4 gap-2">
          <Input
            placeholder="Cari berdasarkan nama wilayah..."
            value={(table.getColumn("nama_wilayah")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("nama_wilayah")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          {/* PATCH: Tombol untuk toggle kolom di mobile */}
          {isMobile && hasComparison && (
            <Button variant="outline" size="sm" onClick={onToggleColumns}>
              {showAllColumns ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {showAllColumns ? "Ringkas" : "Lengkap"}
            </Button>
          )}
      </div>
      <div className="relative w-full overflow-x-auto rounded-md border">
        <Table>
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
                  Tidak ada data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow key={footerGroup.id} className="bg-muted/50 font-bold hover:bg-muted">
                {footerGroup.headers.map((header) => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}