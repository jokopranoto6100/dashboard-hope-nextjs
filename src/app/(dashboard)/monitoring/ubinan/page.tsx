// src/app/monitoring/ubinan/page.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Import Button
import { ChevronDown, ChevronRight } from "lucide-react"; // Import icons for button

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

// Komponen Skeleton untuk Tabel Padi (tidak perlu diubah signifikan, tapi pastikan menerima `columns` yang dinamis)
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

const PalawijaTableSkeleton = () => ( /* ... implementasi skeleton palawija tetap sama ... */
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
  const [isGeneratifExpanded, setIsGeneratifExpanded] = React.useState<boolean>(false); // State untuk ekspansi

  const { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate } = usePadiMonitoringData(selectedYear, selectedSubround);
  const { palawijaData, loadingPalawija, errorPalawija } = usePalawijaMonitoringData(selectedYear, selectedSubround);

  const toTitleCase = (str: string) => str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const getPercentageBadgeClass = (percentage: number | string) => { /* ... implementasi tetap sama ... */
    const value = parseFloat(percentage.toString());
    if (isNaN(value)) return "bg-gray-200 text-gray-800";
    if (value >= 90) return "bg-green-500 text-white";
    if (value >= 70) return "bg-yellow-500 text-gray-900";
    if (value >= 50) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };
  const getLastMonthName = () => new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('id-ID', { month: 'long' });
  const lastMonthName = React.useMemo(() => getLastMonthName(), []);

  const padiColumns: ColumnDef<any>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<any>[] = [
      { accessorKey: "nmkab", header: () => <div className="text-left">Kabupaten/Kota</div>, cell: ({ row }) => <div className="text-left">{row.original.nmkab}</div>, minSize: 150, size: 160 },
      { accessorKey: "targetUtama", header: () => <div className="text-center">Target Utama</div>, cell: ({ row }) => <div className="text-center">{row.original.targetUtama}</div>, minSize: 80, size: 120 },
      { accessorKey: "cadangan", header: () => <div className="text-center">Cadangan</div>, cell: ({ row }) => <div className="text-center">{row.original.cadangan}</div>, minSize: 80, size: 120 },
      { accessorKey: "realisasi", header: () => <div className="text-center">Realisasi</div>, cell: ({ row }) => <div className="text-center">{row.original.realisasi}</div>, minSize: 80, size: 120 },
      { accessorKey: "lewatPanen", header: () => <div className="text-center">Lewat Panen</div>, cell: ({ row }) => <div className="text-center">{row.original.lewatPanen}</div>, minSize: 100, size: 120 },
    ];

    const generatifDetailColumns: ColumnDef<any>[] = [
      { accessorKey: "faseGeneratif_G1", header: () => <div className="text-center">G1</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G1}</div>, minSize: 50, size: 70 },
      { accessorKey: "faseGeneratif_G2", header: () => <div className="text-center">G2</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G2}</div>, minSize: 50, size: 70 },
      { accessorKey: "faseGeneratif_G3", header: () => <div className="text-center">G3</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif_G3}</div>, minSize: 50, size: 70 },
    ];

    const generatifSummaryColumn: ColumnDef<any>[] = [
      { accessorKey: "faseGeneratif", header: () => <div className="text-center">Fase Generatif ({lastMonthName})</div>, cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif}</div>, minSize: 130, size: 160 },
    ];

    const trailingColumns: ColumnDef<any>[] = [
      { accessorKey: "anomali", header: () => <div className="text-center">Anomali</div>, cell: ({ row }) => <div className="text-center">{row.original.anomali}</div>, minSize: 80, size: 100 },
      {
        accessorKey: "persentase",
        header: () => <div className="text-center">Persentase (%)</div>,
        cell: ({ row }) => (<div className="text-center"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPercentageBadgeClass(row.original.persentase)}`}>{row.original.persentase}%</span></div>),
        minSize: 100, size: 120
      },
    ];

    return [
      ...baseColumns,
      ...(isGeneratifExpanded ? generatifDetailColumns : generatifSummaryColumn),
      ...trailingColumns
    ];
  }, [lastMonthName, isGeneratifExpanded, getPercentageBadgeClass]); // Tambahkan isGeneratifExpanded dan getPercentageBadgeClass ke dependencies

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

  // Mendapatkan kolom yang akan digunakan untuk skeleton, berdasarkan state ekspansi
  // Ini penting agar skeleton cocok dengan jumlah kolom yang akan ditampilkan
  const currentPadiSkeletonColumns = React.useMemo(() => {
    // Logika ini harus sama dengan pembentukan `padiColumns` di atas
    // Ini adalah cara sederhana, idealnya definisi skeleton mengikuti struktur kolom aktual
    const numBase = 5; // nmkab, target, cadangan, realisasi, lewatPanen
    const numGeneratif = isGeneratifExpanded ? 3 : 1;
    const numTrailing = 2; // anomali, persentase
    const totalCols = numBase + numGeneratif + numTrailing;
    
    // Membuat array dummy ColumnDef untuk PadiTableSkeleton
    // Anda bisa lebih detail di sini untuk mencocokkan minSize/size jika perlu
    return Array.from({ length: totalCols }).map((_, i) => ({
        id: `skeleton-col-${i}`,
        size: 100, // ukuran default untuk skeleton
        minSize: 80
    })) as ColumnDef<any>[];
  }, [isGeneratifExpanded]);


  return (
    <div className="container mx-auto py-8">
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
                          else if (columnId === 'faseGeneratif') displayValue = padiTotals.faseGeneratif; // Ini adalah total ringkasan
                          else if (columnId === 'faseGeneratif_G1') displayValue = padiTotals.faseGeneratif_G1; // Total G1
                          else if (columnId === 'faseGeneratif_G2') displayValue = padiTotals.faseGeneratif_G2; // Total G2
                          else if (columnId === 'faseGeneratif_G3') displayValue = padiTotals.faseGeneratif_G3; // Total G3
                          else if (columnId === 'anomali') displayValue = padiTotals.anomali;
                          else if (columnId === 'persentase') {
                            displayValue = padiTotals.persentase.toFixed(2);
                            isPercentage = true;
                          } else displayValue = '';

                          return (
                            <TableCell key={columnId + "_total"} className={columnId === 'nmkab' ? 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left' : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'} style={{ width: col.getSize(), minWidth: col.columnDef.minSize ? `${col.columnDef.minSize}px` : undefined }}>
                              {isPercentage ? (<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPercentageBadgeClass(padiTotals.persentase)}`}>{displayValue}%</span>) : (displayValue)}
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

      {/* Konten untuk Ubinan Palawija tetap sama */}
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
                  {/* ... Konten tabel Palawija ... */}
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