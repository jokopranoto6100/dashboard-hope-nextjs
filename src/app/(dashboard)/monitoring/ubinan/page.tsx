// src/app/(dashboard)/monitoring/ubinan/page.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { getPercentageBadgeClass } from "@/lib/utils";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  RowData, // Pastikan RowData diimpor
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';

// PERBAIKAN DI SINI
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    // Menambahkan properti nominal untuk "menggunakan" TData
    // Anda bisa menamainya sesuai keinginan, seringkali menggunakan underscore
    // Ini tidak perlu diisi atau digunakan jika tidak ada fungsionalitas khusus untuknya
    _rowData?: TData;

    updateData?: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

interface PadiDataRow {
  nmkab: string;
  targetUtama: number;
  cadangan: number;
  realisasi: number;
  lewatPanen: number;
  faseGeneratif_G1?: number;
  faseGeneratif_G2?: number;
  faseGeneratif_G3?: number;
  faseGeneratif?: number;
  anomali: number;
  persentase: number | string;
}

interface PadiTotals {
  targetUtama: number;
  cadangan: number;
  realisasi: number;
  lewatPanen: number;
  faseGeneratif?: number;
  faseGeneratif_G1?: number;
  faseGeneratif_G2?: number;
  faseGeneratif_G3?: number;
  anomali: number;
  persentase: number | string;
}

interface PalawijaDataRow {
  tahun: number | string | null;
  subround: string | number | null;
  komoditas: string | null;
  kecamatan: string | null;
  luas_panen_ha: number | null;
}

const PadiTableSkeleton = ({ columns }: { columns: ColumnDef<PadiDataRow, unknown>[] }) => (
  <div className="rounded-md border p-4">
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index} style={{ width: column.size ? `${column.size}px` : 'auto', minWidth: column.minSize ? `${column.minSize}px` : 'auto' }}>
              <Skeleton className="h-5 w-full" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, cellIndex) => (
              <TableCell key={cellIndex} style={{ width: column.size ? `${column.size}px` : 'auto', minWidth: column.minSize ? `${column.minSize}px` : 'auto' }}>
                <Skeleton className="h-5 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const PalawijaTableSkeleton = () => (
  <div className="rounded-md border p-4">
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: 5 }).map((_, index) => (
            <th key={index} className="px-6 py-3">
              <Skeleton className="h-4 w-full" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: 5 }).map((_, cellIndex) => (
              <td key={cellIndex} className="px-6 py-4">
                <Skeleton className="h-4 w-full" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function UbinanMonitoringPage() {
  const { selectedYear } = useYear();
  const [selectedSubround, setSelectedSubround] = React.useState<string>('all');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isGeneratifExpanded, setIsGeneratifExpanded] = React.useState<boolean>(false);

  const { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate } = usePadiMonitoringData(selectedYear, selectedSubround) as {
    processedPadiData: PadiDataRow[];
    padiTotals: PadiTotals | null;
    loadingPadi: boolean;
    errorPadi: string | null;
    lastUpdate: string | null;
  };

  const { palawijaData, loadingPalawija, errorPalawija } = usePalawijaMonitoringData(selectedYear, selectedSubround) as {
    palawijaData: PalawijaDataRow[];
    loadingPalawija: boolean;
    errorPalawija: string | null;
  };

  const getLastMonthName = () => new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('id-ID', { month: 'long' });
  const lastMonthName = React.useMemo(() => getLastMonthName(), []);

  const padiColumns: ColumnDef<PadiDataRow>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<PadiDataRow>[] = [
      { accessorKey: "nmkab", header: () => <div className="text-left">Kabupaten/Kota</div>, cell: ({ row }) => <div className="text-left">{row.original.nmkab}</div>, minSize: 150, size: 160 },
      { accessorKey: "targetUtama", header: () => <div className="text-center">Target Utama</div>, cell: ({ row }) => <div className="text-center">{row.original.targetUtama}</div>, minSize: 80, size: 110 },
      { accessorKey: "cadangan", header: () => <div className="text-center">Cadangan</div>, cell: ({ row }) => <div className="text-center">{row.original.cadangan}</div>, minSize: 80, size: 110 },
      { accessorKey: "realisasi", header: () => <div className="text-center">Realisasi</div>, cell: ({ row }) => <div className="text-center">{row.original.realisasi}</div>, minSize: 80, size: 100 },
      { accessorKey: "lewatPanen", header: () => <div className="text-center">Lewat Panen</div>, cell: ({ row }) => <div className="text-center">{row.original.lewatPanen}</div>, minSize: 100, size: 100 },
    ];

    const generatifDetailColumns: ColumnDef<PadiDataRow>[] = [
      { accessorKey: "faseGeneratif_G1", header: () => <div className="text-center">G1</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G1 ?? '-'}</div>, minSize: 50, size: 50 },
      { accessorKey: "faseGeneratif_G2", header: () => <div className="text-center">G2</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G2 ?? '-'}</div>, minSize: 50, size: 50 },
      { accessorKey: "faseGeneratif_G3", header: () => <div className="text-center">G3</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G3 ?? '-'}</div>, minSize: 50, size: 50 },
    ];

    const generatifSummaryColumn: ColumnDef<PadiDataRow>[] = [
      { accessorKey: "faseGeneratif", header: () => <div className="text-center">Generatif ({lastMonthName})</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif ?? '-'}</div>, minSize: 130, size: 100 },
    ];

    const trailingColumns: ColumnDef<PadiDataRow>[] = [
      { accessorKey: "anomali", header: () => <div className="text-center">Anomali</div>, cell: ({ row }) => <div className="text-center">{row.original.anomali}</div>, minSize: 80, size: 100 },
      {
        accessorKey: "persentase",
        header: () => <div className="text-center">Persentase (%)</div>,
        cell: ({ row }) => {
          const rawValue = row.original.persentase;
          const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;

          if (typeof value !== 'number' || isNaN(value)) {
            return <div className="text-center">-</div>;
          }

          const showCheckmark = value >= 100;
          return (
            <div className="text-center">
              <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getPercentageBadgeClass(value)}`}>
                {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />}
                {value.toFixed(2)}%
              </span>
            </div>
          );
        },
        minSize: 100, size: 110
      },
    ];

    return [
      ...baseColumns,
      ...(isGeneratifExpanded ? generatifDetailColumns : generatifSummaryColumn),
      ...trailingColumns
    ];
  }, [lastMonthName, isGeneratifExpanded]);

  const padiTable = useReactTable({
    data: processedPadiData || [],
    columns: padiColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    columnResizeMode: 'onChange',
    // Jika Anda menggunakan meta, Anda akan mendefinisikannya di sini, misalnya:
    // meta: {
    //   _rowData: undefined, // Tidak perlu diisi jika hanya untuk memuaskan tipe
    //   updateData: (rowIndex, columnId, value) => {
    //     // logika update data Anda
    //   }
    // }
  });

  const currentPadiSkeletonColumns = React.useMemo(() => {
    const activePadiColumns = padiTable.getVisibleLeafColumns();
    return activePadiColumns.map(col => ({
        id: col.id,
        size: col.getSize(),
        minSize: (col.columnDef as ColumnDef<PadiDataRow, unknown>).minSize,
    })) as ColumnDef<PadiDataRow, unknown>[];
  }, [padiTable]);


  return (
    <div className="container mx-auto py-4">
      <div className="mb-2 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Select value={selectedSubround} onValueChange={setSelectedSubround}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Semua Subround" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Subround</SelectItem>
              <SelectItem value="1">Subround 1</SelectItem>
              <SelectItem value="2">Subround 2</SelectItem>
              <SelectItem value="3">Subround 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tabulasi Ubinan Padi</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setIsGeneratifExpanded(!isGeneratifExpanded)}>
                {isGeneratifExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                {isGeneratifExpanded ? "Ringkas Generatif" : "Detail Generatif"}
              </Button>
            </div>
            <CardDescription>
              {!loadingPadi && lastUpdate && <span className="block text-sm text-gray-500 mt-1">Terakhir diperbarui: {lastUpdate}</span>}
              {loadingPadi && <Skeleton className="h-4 w-[250px] mt-2" />}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPadi && <PadiTableSkeleton columns={currentPadiSkeletonColumns} />}
            {errorPadi && <p className="text-red-500 text-center">Error: {errorPadi}</p>}
            {!loadingPadi && !errorPadi && processedPadiData && processedPadiData.length > 0 && (
              <ScrollArea className="w-full rounded-md border">
                <Table>
                  <TableHeader>
                    {padiTable.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableHead key={header.id} className={header.column.id === 'nmkab' ? 'text-left' : 'text-center'} style={{ width: header.getSize(), minWidth: (header.column.columnDef as ColumnDef<PadiDataRow, unknown>).minSize ? `${(header.column.columnDef as ColumnDef<PadiDataRow, unknown>).minSize}px` : undefined }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {padiTable.getRowModel().rows?.length ? padiTable.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>{row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className={cell.column.id === 'nmkab' ? 'text-left' : 'text-center'} style={{ width: cell.column.getSize(), minWidth: (cell.column.columnDef as ColumnDef<PadiDataRow, unknown>).minSize ? `${(cell.column.columnDef as ColumnDef<PadiDataRow, unknown>).minSize}px` : undefined }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}</TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={padiColumns.length} className="h-24 text-center">Tidak ada hasil.</TableCell></TableRow>
                    )}
                  </TableBody>
                  {padiTotals && (
                    <tfoot className="bg-gray-50 font-bold">
                      <TableRow>
                        {padiTable.getVisibleLeafColumns().map(col => {
                          const columnId = col.id as keyof PadiDataRow | 'nmkab';
                          let displayValue: string | number | undefined;
                          let isPercentage = false;

                          if (columnId === 'nmkab') displayValue = 'Total';
                          else if (columnId === 'persentase') {
                            const rawTotalPercentage = padiTotals.persentase;
                            const totalPercentageValue = typeof rawTotalPercentage === 'string' ? parseFloat(rawTotalPercentage) : rawTotalPercentage;

                            if (typeof totalPercentageValue === 'number' && !isNaN(totalPercentageValue)) {
                              displayValue = totalPercentageValue.toFixed(2);
                              isPercentage = true;
                            } else {
                              displayValue = '-';
                            }
                          }
                          else if (padiTotals[columnId as keyof PadiTotals] !== undefined && padiTotals[columnId as keyof PadiTotals] !== null) {
                            displayValue = padiTotals[columnId as keyof PadiTotals] as string | number;
                          } else {
                            displayValue = '-';
                          }

                          return (
                            <TableCell key={columnId + "_total"} className={columnId === 'nmkab' ? 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left' : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'} style={{ width: col.getSize(), minWidth: (col.columnDef as ColumnDef<PadiDataRow, unknown>).minSize ? `${(col.columnDef as ColumnDef<PadiDataRow, unknown>).minSize}px` : undefined }}>
                              {isPercentage ? (
                                (() => {
                                  const rawNumericTotal = padiTotals.persentase;
                                  const numericValue = typeof rawNumericTotal === 'string' ? parseFloat(rawNumericTotal) : rawNumericTotal;

                                  if (typeof numericValue !== 'number' || isNaN(numericValue)) {
                                    return <span>{displayValue === '-' ? '-' : `${displayValue}%`}</span>;
                                  }
                                  const showCheckmark = numericValue >= 100;
                                  return (
                                    <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getPercentageBadgeClass(numericValue)}`}>
                                      {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                      {displayValue}%
                                    </span>
                                  );
                                })()
                              ) : (displayValue)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </tfoot>
                  )}
                </Table>
              </ScrollArea>
            )}
            {!loadingPadi && !errorPadi && (!processedPadiData || processedPadiData.length === 0) && (
              <p className="text-center text-gray-500">Tidak ada data Ubinan Padi ditemukan untuk tahun {selectedYear} dan Subround {selectedSubround === 'all' ? 'Semua' : selectedSubround}.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Tabulasi Ubinan Palawija</CardTitle>
            <CardDescription>Data dari tabel `ubinan_raw`.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPalawija && <PalawijaTableSkeleton />}
            {errorPalawija && <p className="text-red-500 text-center">Error: {errorPalawija}</p>}
            {!loadingPalawija && !errorPalawija && palawijaData && palawijaData.length > 0 && (
               <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <table className="min-w-full divide-y divide-gray-200">
                   <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subround</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Komoditas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kecamatan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Luas Panen (Ha)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {palawijaData.map((row, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.tahun ?? 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.subround ?? 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.komoditas ?? 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.kecamatan ?? 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.luas_panen_ha ?? 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </ScrollArea>
            )}
             {!loadingPalawija && !errorPalawija && (!palawijaData || palawijaData.length === 0) && (
              <p className="text-center text-gray-500">Tidak ada data Ubinan Palawija ditemukan.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}