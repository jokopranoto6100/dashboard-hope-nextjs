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
import { Badge } from "@/components/ui/badge"; // PATCH: Impor komponen Badge
import { getPercentageBadgeVariant } from "@/lib/utils"; // PATCH: Impor fungsi helper BARU untuk varian badge
// Hapus getPercentageBadgeClass jika sudah tidak digunakan di file ini dan sudah diganti total dengan getPercentageBadgeVariant
// import { getPercentageBadgeClass } from "@/lib/utils"; 

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  RowData,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData, PalawijaDataRow, PalawijaTotals } from '@/hooks/usePalawijaMonitoringData';


declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
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

interface PadiTotalsInterface { 
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

const PalawijaTableSkeletonComponent = ({ columns }: { columns: ColumnDef<PalawijaDataRow, unknown>[] }) => (
    <div className="rounded-md border p-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} style={{ width: column.size ? `${column.size}px` : 'auto', minWidth: column.minSize ? `${column.minSize}px` : 'auto' }}>
                <Skeleton className="h-5 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column.id} style={{ width: column.size ? `${column.size}px` : 'auto', minWidth: column.minSize ? `${column.minSize}px` : 'auto' }}>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );


export default function UbinanMonitoringPage() {
  const { selectedYear } = useYear();
  const [selectedSubround, setSelectedSubround] = React.useState<string>('all');

  const [sortingPadi, setSortingPadi] = React.useState<SortingState>([]);
  const [columnFiltersPadi, setColumnFiltersPadi] = React.useState<ColumnFiltersState>([]);
  const [isGeneratifExpanded, setIsGeneratifExpanded] = React.useState<boolean>(false);

  const [sortingPalawija, setSortingPalawija] = React.useState<SortingState>([]);
  const [columnFiltersPalawija, setColumnFiltersPalawija] = React.useState<ColumnFiltersState>([]);
  const [isRealisasiExpanded, setIsRealisasiExpanded] = React.useState<boolean>(false);


  const { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate } = usePadiMonitoringData(selectedYear, selectedSubround) as {
    processedPadiData: PadiDataRow[];
    padiTotals: PadiTotalsInterface | null;
    loadingPadi: boolean;
    errorPadi: string | null;
    lastUpdate: string | null;
  };

  const { processedPalawijaData, palawijaTotals, loadingPalawija, errorPalawija, lastUpdatePalawija } = usePalawijaMonitoringData(selectedYear, selectedSubround);

  const getLastMonthName = () => new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('id-ID', { month: 'long' });
  const lastMonthName = React.useMemo(() => getLastMonthName(), []);

  // PATCH: Hapus getPercentageBadgeClass lokal jika ada
  // const getPercentageBadgeClass = (percentage: number | string) => { ... };

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
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center">-</div>;
          const showCheckmark = value >= 100;
          return (
            <div className="text-center">
              {/* PATCH: Menggunakan komponen Badge */}
              <Badge variant={getPercentageBadgeVariant(value)}>
                {showCheckmark && <CheckCircle2 />} {/* Icon menggunakan size dari CSS Badge */}
                {value.toFixed(2)}%
              </Badge>
            </div>
          );
        },
        minSize: 100, size: 110
      },
    ];
    return [...baseColumns, ...(isGeneratifExpanded ? generatifDetailColumns : generatifSummaryColumn), ...trailingColumns];
  }, [lastMonthName, isGeneratifExpanded]);

  const padiTable = useReactTable({
    data: processedPadiData || [],
    columns: padiColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSortingPadi,
    onColumnFiltersChange: setColumnFiltersPadi,
    state: { sorting: sortingPadi, columnFilters: columnFiltersPadi },
    columnResizeMode: 'onChange',
  });

  const currentPadiSkeletonColumns = React.useMemo(() => {
    const activePadiColumns = padiTable.getVisibleLeafColumns();
    if (!activePadiColumns.length && processedPadiData?.length) { // Jika kolom belum ada tapi data ada, buat default
        return padiColumns; // atau struktur default skeleton columns
    }
    return activePadiColumns.map(col => ({
        id: col.id,
        size: col.getSize(),
        minSize: (col.columnDef as ColumnDef<PadiDataRow, unknown>).minSize,
    })) as ColumnDef<PadiDataRow, unknown>[];
  }, [padiTable, processedPadiData, padiColumns]);


  const palawijaColumns: ColumnDef<PalawijaDataRow>[] = React.useMemo(() => {
    const baseColumns: ColumnDef<PalawijaDataRow>[] = [
      { accessorKey: "nmkab", header: () => <div className="text-left">Kabupaten/Kota</div>, cell: ({ row }) => <div className="text-left">{row.original.nmkab}</div>, minSize: 150, size: 160 },
      { accessorKey: "target", header: () => <div className="text-center">Target</div>, cell: ({ row }) => <div className="text-center">{row.original.target}</div>, minSize: 80, size: 100 },
    ];

    const realisasiDetailColumns: ColumnDef<PalawijaDataRow>[] = [
      { accessorKey: "clean", header: () => <div className="text-center">Clean</div>, cell: ({ row }) => <div className="text-center">{row.original.clean}</div>, minSize: 70, size: 70 },
      { accessorKey: "warning", header: () => <div className="text-center">Warning</div>, cell: ({ row }) => <div className="text-center">{row.original.warning}</div>, minSize: 70, size: 70 },
      { accessorKey: "error", header: () => <div className="text-center">Error</div>, cell: ({ row }) => <div className="text-center">{row.original.error}</div>, minSize: 70, size: 70 },
    ];

    const realisasiSummaryColumn: ColumnDef<PalawijaDataRow>[] = [
      { accessorKey: "realisasi", header: () => <div className="text-center">Realisasi</div>, cell: ({ row }) => <div className="text-center">{row.original.realisasi}</div>, minSize: 80, size: 100 },
    ];

    const trailingColumns: ColumnDef<PalawijaDataRow>[] = [
      {
        accessorKey: "persentase",
        header: () => <div className="text-center">Persentase (%)</div>,
        cell: ({ row }) => {
          const rawValue = row.original.persentase;
          const value = typeof rawValue === 'string' ? parseFloat(rawValue) : rawValue;
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center">-</div>;
          const showCheckmark = value >= 100;
          return (
            <div className="text-center">
              {/* PATCH: Menggunakan komponen Badge */}
              <Badge variant={getPercentageBadgeVariant(value)}>
                {showCheckmark && <CheckCircle2 />}
                {value.toFixed(2)}%
              </Badge>
            </div>
          );
        },
        minSize: 100, size: 110
      },
    ];
    return [...baseColumns, ...(isRealisasiExpanded ? realisasiDetailColumns : realisasiSummaryColumn), ...trailingColumns];
  }, [isRealisasiExpanded]);

  const palawijaTable = useReactTable({
    data: processedPalawijaData || [],
    columns: palawijaColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSortingPalawija,
    onColumnFiltersChange: setColumnFiltersPalawija,
    state: { sorting: sortingPalawija, columnFilters: columnFiltersPalawija },
    columnResizeMode: 'onChange',
  });

   const currentPalawijaSkeletonColumns = React.useMemo(() => {
    if (loadingPalawija || !palawijaTable.getVisibleLeafColumns().length && processedPalawijaData?.length) {
        const initialColumnsConfig: Partial<ColumnDef<PalawijaDataRow, unknown>>[] = [
            { id: "nmkab", size: 160, minSize: 150 },
            { id: "target", size: 100, minSize: 80 },
            { id: "realisasi", size: 100, minSize: 80 },
            { id: "persentase", size: 110, minSize: 100 },
        ];
         return initialColumnsConfig as ColumnDef<PalawijaDataRow, unknown>[];
    }
    const activePalawijaColumns = palawijaTable.getVisibleLeafColumns();
    return activePalawijaColumns.map(col => ({
        id: col.id,
        size: col.getSize(),
        minSize: (col.columnDef as ColumnDef<PalawijaDataRow, unknown>).minSize,
    })) as ColumnDef<PalawijaDataRow, unknown>[];
  }, [palawijaTable, loadingPalawija, processedPalawijaData]);


  return (
    <div className="container mx-auto">
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

      {/* Padi Table Card */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Monitoring Ubinan Padi</CardTitle>
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
            {loadingPadi && <PadiTableSkeleton columns={currentPadiSkeletonColumns.length > 0 ? currentPadiSkeletonColumns : padiColumns /* Fallback jika skeleton columns kosong */} />}
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
                            } else displayValue = '-';
                          }
                          else if (padiTotals[columnId as keyof PadiTotalsInterface] !== undefined && padiTotals[columnId as keyof PadiTotalsInterface] !== null) {
                            displayValue = padiTotals[columnId as keyof PadiTotalsInterface] as string | number;
                          } else displayValue = '-';

                          return (
                            <TableCell key={columnId + "_total_padi"} className={columnId === 'nmkab' ? 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left' : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'} style={{ width: col.getSize(), minWidth: (col.columnDef as ColumnDef<PadiDataRow, unknown>).minSize ? `${(col.columnDef as ColumnDef<PadiDataRow, unknown>).minSize}px` : undefined }}>
                              {isPercentage ? (
                                (() => {
                                  const rawNumericTotal = padiTotals.persentase;
                                  const numericValue = typeof rawNumericTotal === 'string' ? parseFloat(rawNumericTotal) : rawNumericTotal;
                                  if (typeof numericValue !== 'number' || isNaN(numericValue)) return <Badge variant="secondary">{displayValue === '-' ? '-' : `${displayValue}%`}</Badge>;
                                  const showCheckmark = numericValue >= 100;
                                  return (
                                    // PATCH: Menggunakan komponen Badge
                                    <Badge variant={getPercentageBadgeVariant(numericValue)}>
                                      {showCheckmark && <CheckCircle2 />}
                                      {displayValue}%
                                    </Badge>
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

      {/* Palawija Table Card */}
      <div>
        <Card>
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle>Monitoring Ubinan Palawija</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsRealisasiExpanded(!isRealisasiExpanded)}>
                    {isRealisasiExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                    {isRealisasiExpanded ? "Ringkas Realisasi" : "Detail Realisasi"}
                </Button>
            </div>
            <CardDescription>
              {!loadingPalawija && lastUpdatePalawija && <span className="block text-sm text-gray-500 mt-1">Terakhir diperbarui: {lastUpdatePalawija}</span>}
              {loadingPalawija && <Skeleton className="h-4 w-[250px] mt-2" />}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPalawija && <PalawijaTableSkeletonComponent columns={currentPalawijaSkeletonColumns.length > 0 ? currentPalawijaSkeletonColumns : palawijaColumns /* Fallback */} />}
            {errorPalawija && <p className="text-red-500 text-center">Error: {errorPalawija}</p>}
            {!loadingPalawija && !errorPalawija && processedPalawijaData && processedPalawijaData.length > 0 && (
               <ScrollArea className="w-full rounded-md border">
                <Table>
                  <TableHeader>
                    {palawijaTable.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableHead key={header.id} className={header.column.id === 'nmkab' ? 'text-left' : 'text-center'} style={{ width: header.getSize(), minWidth: (header.column.columnDef as ColumnDef<PalawijaDataRow, unknown>).minSize ? `${(header.column.columnDef as ColumnDef<PalawijaDataRow, unknown>).minSize}px` : undefined }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {palawijaTable.getRowModel().rows?.length ? palawijaTable.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>{row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className={cell.column.id === 'nmkab' ? 'text-left' : 'text-center'} style={{ width: cell.column.getSize(), minWidth: (cell.column.columnDef as ColumnDef<PalawijaDataRow, unknown>).minSize ? `${(cell.column.columnDef as ColumnDef<PalawijaDataRow, unknown>).minSize}px` : undefined }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}</TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={palawijaColumns.length} className="h-24 text-center">Tidak ada hasil.</TableCell></TableRow>
                    )}
                  </TableBody>
                  {palawijaTotals && (
                    <tfoot className="bg-gray-50 font-bold">
                      <TableRow>
                        {palawijaTable.getVisibleLeafColumns().map(col => {
                          const columnId = col.id as keyof PalawijaDataRow | 'nmkab';
                          let displayValue: string | number | undefined;
                          let isPercentage = false;

                          if (columnId === 'nmkab') displayValue = 'Total';
                          else if (columnId === 'persentase') {
                            const rawTotalPercentage = palawijaTotals.persentase;
                            const totalPercentageValue = typeof rawTotalPercentage === 'string' ? parseFloat(rawTotalPercentage) : rawTotalPercentage;
                            if (typeof totalPercentageValue === 'number' && !isNaN(totalPercentageValue)) {
                              displayValue = totalPercentageValue.toFixed(2);
                              isPercentage = true;
                            } else displayValue = '-';
                          }
                           else if (palawijaTotals[columnId as keyof PalawijaTotals] !== undefined && palawijaTotals[columnId as keyof PalawijaTotals] !== null) {
                            displayValue = palawijaTotals[columnId as keyof PalawijaTotals] as string | number;
                          } else displayValue = '-';

                          return (
                            <TableCell key={columnId + "_total_palawija"} className={columnId === 'nmkab' ? 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left' : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'} style={{ width: col.getSize(), minWidth: (col.columnDef as ColumnDef<PalawijaDataRow, unknown>).minSize ? `${(col.columnDef as ColumnDef<PalawijaDataRow, unknown>).minSize}px` : undefined }}>
                               {isPercentage ? (
                                (() => {
                                  const rawNumericTotal = palawijaTotals.persentase;
                                  const numericValue = typeof rawNumericTotal === 'string' ? parseFloat(rawNumericTotal) : rawNumericTotal;
                                  if (typeof numericValue !== 'number' || isNaN(numericValue)) return <Badge variant="secondary">{displayValue === '-' ? '-' : `${displayValue}%`}</Badge>;
                                  const showCheckmark = numericValue >= 100;
                                  return (
                                    // PATCH: Menggunakan komponen Badge
                                    <Badge variant={getPercentageBadgeVariant(numericValue)}>
                                      {showCheckmark && <CheckCircle2 />}
                                      {displayValue}%
                                    </Badge>
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
             {!loadingPalawija && !errorPalawija && (!processedPalawijaData || processedPalawijaData.length === 0) && (
              <p className="text-center text-gray-500">Tidak ada data Ubinan Palawija (Non-Padi) ditemukan untuk tahun {selectedYear} dan Subround {selectedSubround === 'all' ? 'Semua' : selectedSubround}.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}