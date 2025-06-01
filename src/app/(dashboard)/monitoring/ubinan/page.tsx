// src/app/monitoring/ubinan/page.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react"; // Ensure CheckCircle2 is imported
import { getPercentageBadgeClass } from "@/lib/utils"; // Import from global utils

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';

// Komponen Skeleton untuk Tabel Padi
const PadiTableSkeleton = ({ columns }: { columns: ColumnDef<any>[] }) => (
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

// Komponen Skeleton untuk Tabel Palawija
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

  const { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate } = usePadiMonitoringData(selectedYear, selectedSubround);
  const { palawijaData, loadingPalawija, errorPalawija } = usePalawijaMonitoringData(selectedYear, selectedSubround);

  // Fungsi toTitleCase tidak perlu diubah
  const toTitleCase = (str: string) => str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Fungsi getPercentageBadgeClass sudah diimpor dari lib/utils.ts, jadi hapus definisi lokalnya.
  // const getPercentageBadgeClass = (percentage: number | string) => { ... };

  const getLastMonthName = () => new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('id-ID', { month: 'long' });
  const lastMonthName = React.useMemo(() => getLastMonthName(), []);

  const padiColumns: ColumnDef<any>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<any>[] = [
      { accessorKey: "nmkab", header: () => <div className="text-left">Kabupaten/Kota</div>, cell: ({ row }) => <div className="text-left">{row.original.nmkab}</div>, minSize: 150, size: 160 },
      { accessorKey: "targetUtama", header: () => <div className="text-center">Target Utama</div>, cell: ({ row }) => <div className="text-center">{row.original.targetUtama}</div>, minSize: 80, size: 110 },
      { accessorKey: "cadangan", header: () => <div className="text-center">Cadangan</div>, cell: ({ row }) => <div className="text-center">{row.original.cadangan}</div>, minSize: 80, size: 110 },
      { accessorKey: "realisasi", header: () => <div className="text-center">Realisasi</div>, cell: ({ row }) => <div className="text-center">{row.original.realisasi}</div>, minSize: 80, size: 100 },
      { accessorKey: "lewatPanen", header: () => <div className="text-center">Lewat Panen</div>, cell: ({ row }) => <div className="text-center">{row.original.lewatPanen}</div>, minSize: 100, size: 100 },
    ];

    const generatifDetailColumns: ColumnDef<any>[] = [
      { accessorKey: "faseGeneratif_G1", header: () => <div className="text-center">G1</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G1}</div>, minSize: 50, size: 50 },
      { accessorKey: "faseGeneratif_G2", header: () => <div className="text-center">G2</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G2}</div>, minSize: 50, size: 50 },
      { accessorKey: "faseGeneratif_G3", header: () => <div className="text-center">G3</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G3}</div>, minSize: 50, size: 50 },
    ];

    const generatifSummaryColumn: ColumnDef<any>[] = [
      { accessorKey: "faseGeneratif", header: () => <div className="text-center">Generatif ({lastMonthName})</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif}</div>, minSize: 130, size: 100 },
    ];

    const trailingColumns: ColumnDef<any>[] = [
      { accessorKey: "anomali", header: () => <div className="text-center">Anomali</div>, cell: ({ row }) => <div className="text-center">{row.original.anomali}</div>, minSize: 80, size: 100 },
      {
        accessorKey: "persentase",
        header: () => <div className="text-center">Persentase (%)</div>,
        cell: ({ row }) => {
          const value = parseFloat(row.original.persentase.toString());
          const showCheckmark = !isNaN(value) && value >= 100;
          return (
            <div className="text-center">
              <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getPercentageBadgeClass(value)}`}>
                {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />}
                {!isNaN(value) ? value.toFixed(2) : row.original.persentase}%
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
  // Karena getPercentageBadgeClass adalah fungsi global yang stabil, tidak perlu dimasukkan ke dependency array jika ia murni.
  // Jika React Linter mengeluh, Anda bisa menambahkannya, tapi secara teknis tidak perlu jika definisinya tidak berubah.
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
  });

  const currentPadiSkeletonColumns = React.useMemo(() => {
    const numBase = 5;
    const numGeneratif = isGeneratifExpanded ? 3 : 1;
    const numTrailing = 2;
    const totalCols = numBase + numGeneratif + numTrailing;
    return Array.from({ length: totalCols }).map((_, i) => ({
        id: `skeleton-col-${i}`,
        size: 100,
        minSize: 80
    })) as ColumnDef<any>[];
  }, [isGeneratifExpanded]);


  return (
    <div className="container mx-auto py-4"> {/* Mengurangi py-8 menjadi py-4 untuk padding atas/bawah */}
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
                          <TableHead key={header.id} className={header.column.id === 'nmkab' ? 'text-left' : 'text-center'} style={{ width: header.getSize(), minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {padiTable.getRowModel().rows?.length ? padiTable.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>{row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className={cell.column.id === 'nmkab' ? 'text-left' : 'text-center'} style={{ width: cell.column.getSize(), minWidth: cell.column.columnDef.minSize ? `${cell.column.columnDef.minSize}px` : undefined }}>
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
                          const columnId = col.id;
                          let displayValue: string | number | undefined;
                          let isPercentage = false;

                          if (columnId === 'nmkab') displayValue = 'Total';
                          else if (columnId === 'targetUtama') displayValue = padiTotals.targetUtama;
                          else if (columnId === 'cadangan') displayValue = padiTotals.cadangan;
                          else if (columnId === 'realisasi') displayValue = padiTotals.realisasi;
                          else if (columnId === 'lewatPanen') displayValue = padiTotals.lewatPanen;
                          else if (columnId === 'faseGeneratif') displayValue = padiTotals.faseGeneratif;
                          else if (columnId === 'faseGeneratif_G1') displayValue = padiTotals.faseGeneratif_G1;
                          else if (columnId === 'faseGeneratif_G2') displayValue = padiTotals.faseGeneratif_G2;
                          else if (columnId === 'faseGeneratif_G3') displayValue = padiTotals.faseGeneratif_G3;
                          else if (columnId === 'anomali') displayValue = padiTotals.anomali;
                          else if (columnId === 'persentase') {
                            displayValue = padiTotals.persentase.toFixed(2);
                            isPercentage = true;
                          } else displayValue = '';

                          return (
                            <TableCell key={columnId + "_total"} className={columnId === 'nmkab' ? 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left' : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'} style={{ width: col.getSize(), minWidth: col.columnDef.minSize ? `${col.columnDef.minSize}px` : undefined }}>
                              {isPercentage ? (
                                (() => {
                                  const numericValue = padiTotals.persentase;
                                  const showCheckmark = numericValue >= 100;
                                  return (
                                    <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getPercentageBadgeClass(numericValue)}`}>
                                      {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />}
                                      {numericValue.toFixed(2)}%
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.tahun || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.subround || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.komoditas || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.kecamatan || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.luas_panen_ha || 'N/A'}</td>
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