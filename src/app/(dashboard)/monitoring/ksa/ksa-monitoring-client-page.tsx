// src/app/(dashboard)/monitoring/ksa/ksa-monitoring-client-page.tsx
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowUpDown, CheckCircle2, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getPercentageBadgeVariant } from "@/lib/utils";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { 
    useKsaMonitoringData, 
    ProcessedKsaDistrictData, // Updated interface name
    // KsaDistrictTotals, // Interface for district totals (implicitly used via ksaTotals)
    ProcessedKsaNamaData,    // New interface for nama data
    // KsaNamaTotals, // Interface for nama totals (implicitly used via namaLevelTotals)
    StatusValue 
} from '@/hooks/useKsaMonitoringData';

type ViewMode = 'district' | 'nama';

export default function KsaMonitoringClientPage() {
  const { selectedYear } = useYear();
  const initialMonth = useMemo(() => String(new Date().getMonth() + 1), []);
  const [displayMonth, setDisplayMonth] = useState<string>(initialMonth);
  const [fetchBehavior, setFetchBehavior] = useState<'autoFallback' | 'directFetch'>('autoFallback');
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // View management states
  const [currentView, setCurrentView] = useState<ViewMode>('district');
  const [selectedKabupatenDetail, setSelectedKabupatenDetail] = useState<ProcessedKsaDistrictData | null>(null);


  const { 
    districtLevelData,    // Renamed from dataKsa
    districtTotals,       // Renamed from ksaTotals
    isLoading, 
    error, 
    lastUpdated,
    effectiveDisplayMonth,
    uniqueStatusNames,
    namaLevelData,          // New data for 'nama' level
    namaLevelTotals,        // New totals for 'nama' level
    setSelectedKabupatenCode // Setter from hook
  } = useKsaMonitoringData(displayMonth, fetchBehavior);

  useEffect(() => {
    if (fetchBehavior === 'autoFallback' && !isLoading && effectiveDisplayMonth) {
      if (effectiveDisplayMonth !== displayMonth) {
        setDisplayMonth(effectiveDisplayMonth);
      }
      setFetchBehavior('directFetch'); 
    }
  }, [isLoading, effectiveDisplayMonth, fetchBehavior, displayMonth]);

  const handleMonthChange = (newMonthValue: string) => {
    setDisplayMonth(newMonthValue);
    setFetchBehavior('directFetch'); 
    // If month changes, reset to district view
    setCurrentView('district');
    setSelectedKabupatenDetail(null);
    setSelectedKabupatenCode(null);
  };

  const handleDistrictRowClick = (districtData: ProcessedKsaDistrictData) => {
    setSelectedKabupatenDetail(districtData);
    setSelectedKabupatenCode(districtData.kode_kab); // Notify hook
    setCurrentView('nama');
  };

  const handleBackToDistrictView = () => {
    setCurrentView('district');
    setSelectedKabupatenDetail(null);
    setSelectedKabupatenCode(null); // Notify hook
  };
  
  const months = [
    { value: "1", label: "Januari" }, { value: "2", label: "Februari" },
    { value: "3", label: "Maret" }, { value: "4", label: "April" },
    { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
    { value: "7", label: "Juli" }, { value: "8", label: "Agustus" },
    { value: "9", label: "September" }, { value: "10", label: "Oktober" },
    { value: "11", label: "November" }, { value: "12", label: "Desember" },
  ];

  // Columns for District Level Table
  const districtColumns = useMemo<ColumnDef<ProcessedKsaDistrictData, any>[]>(() => {
    const fixedStartCols: ColumnDef<ProcessedKsaDistrictData, any>[] = [
      {
        accessorKey: 'kabupaten',
        header: () => <div className="text-left pl-2">Kabupaten/Kota</div>, 
        cell: ({ row }) => <div className="text-left pl-2 font-medium">{row.original.kabupaten}</div>, // Made clickable via TableRow
        footer: () => <div className="text-left pl-2 font-bold">Kalimantan Barat</div>,
        size: 180, minSize: 150, enableSorting: false,
      },
      // ... (Target, Realisasi, Persentase columns remain largely the same, ensure they use ProcessedKsaDistrictData)
      {
        accessorKey: 'target',
        header: () => <div className="text-center">Target</div>,
        cell: ({ row }) => <div className="text-center">{row.original.target.toLocaleString('id-ID')}</div>,
        footer: () => <div className="text-center font-bold">{districtTotals?.target?.toLocaleString('id-ID') ?? '-'}</div>,
        size: 70, minSize: 60, enableSorting: false,
      },
      {
        accessorKey: 'realisasi',
        header: () => <div className="text-center">Realisasi</div>,
        cell: ({ row }) => <div className="text-center">{row.original.realisasi.toLocaleString('id-ID')}</div>,
        footer: () => <div className="text-center font-bold">{districtTotals?.realisasi?.toLocaleString('id-ID') ?? '-'}</div>,
        size: 70, minSize: 60, enableSorting: false,
      },
      {
        accessorKey: 'persentase',
        header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Persentase (%) <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
        cell: ({ row }) => { 
          const value = row.original.persentase;
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center">-</div>;
          const showCheckmark = value >= 100;
          return ( <div className="text-center"> <Badge variant={getPercentageBadgeVariant(value)} className="text-xs px-1.5 py-0.5"> {showCheckmark && <CheckCircle2 className="mr-0.5 h-3 w-3" />} {value.toFixed(2)}% </Badge> </div> );
        },
        footer: () => { 
          if (!districtTotals?.persentase) return <div className="text-center font-bold">-</div>;
          const value = districtTotals.persentase;
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center font-bold">-</div>;
          const showCheckmark = value >= 100;
          return ( <div className="text-center font-bold"> <Badge variant={getPercentageBadgeVariant(value)} className="text-xs px-1.5 py-0.5"> {showCheckmark && <CheckCircle2 className="mr-0.5 h-3 w-3" />} {value.toFixed(2)}% </Badge> </div> );
        },
        size: 110, minSize: 100,
      },
    ];
    const dynamicStatusCols: ColumnDef<ProcessedKsaDistrictData, any>[] = (uniqueStatusNames || []).map(statusName => ({
      id: `status_district_${statusName.replace(/\s+/g, '_')}`, // Ensure unique ID if same status names can appear in nama level
      header: ({column}) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0"> {statusName} <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
      accessorFn: row => row.statuses?.[statusName]?.percentage ?? 0, 
      cell: ({ row }) => {
        const statusData = row.original.statuses?.[statusName];
        if (!statusData || statusData.count === 0) return <div className="text-center text-xs">-</div>;
        return ( <div className="text-center text-xs tabular-nums"> {statusData.count} ({statusData.percentage.toFixed(1)}%) </div> );
      },
      footer: () => {
        const totalStatusData = districtTotals?.statuses?.[statusName];
        if (!totalStatusData || totalStatusData.count === 0) return <div className="text-center font-bold text-xs">-</div>;
        return ( <div className="text-center font-bold text-xs tabular-nums"> {totalStatusData.count} ({totalStatusData.percentage.toFixed(1)}%) </div> );
      },
      size: 120, minSize: 100, enableSorting: true,
    }));
    const fixedEndCols: ColumnDef<ProcessedKsaDistrictData, any>[] = [
        // ... (Inkonsisten, Kode 12 columns remain largely the same)
        {
          accessorKey: 'inkonsisten', // Corrected accessorKey if it was 'Inkonsisten' before
          header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Inkonsisten <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
          cell: ({ row }) => <div className="text-center">{row.original.inkonsisten.toLocaleString('id-ID')}</div>,
          footer: () => <div className="text-center font-bold">{districtTotals?.inkonsisten?.toLocaleString('id-ID') ?? '-'}</div>,
          size: 90, minSize: 80,
        },
        {
          accessorKey: 'kode_12',
          header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Kode 12 <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
          cell: ({ row }) => <div className="text-center">{row.original.kode_12.toLocaleString('id-ID')}</div>,
          footer: () => <div className="text-center font-bold">{districtTotals?.kode_12?.toLocaleString('id-ID') ?? '-'}</div>,
          size: 80, minSize: 70,
        },
    ];
    return [...fixedStartCols, ...dynamicStatusCols, ...fixedEndCols];
  }, [districtTotals, uniqueStatusNames]); // Removed getPercentageBadgeVariant as it's globally available

  const districtTable = useReactTable({
    data: districtLevelData || [],
    columns: districtColumns,
    state: { sorting, },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
  });

  // Columns for Nama Level Table
  const namaColumns = useMemo<ColumnDef<ProcessedKsaNamaData, any>[]>(() => {
    const fixedStartCols: ColumnDef<ProcessedKsaNamaData, any>[] = [
      {
        accessorKey: 'nama', // Grouped by 'nama'
        header: () => <div className="text-left pl-2">Nama Responden/Segmen</div>, 
        cell: ({ row }) => <div className="text-left pl-2">{row.original.nama}</div>,
        footer: () => <div className="text-left pl-2 font-bold">Total {selectedKabupatenDetail?.kabupaten || ''}</div>,
        size: 200, minSize: 180, enableSorting: false,
      },
      // ... (Target, Realisasi, Persentase for nama level)
      {
        accessorKey: 'target',
        header: () => <div className="text-center">Target</div>,
        cell: ({ row }) => <div className="text-center">{row.original.target.toLocaleString('id-ID')}</div>,
        footer: () => <div className="text-center font-bold">{namaLevelTotals?.target?.toLocaleString('id-ID') ?? '-'}</div>,
        size: 70, minSize: 60, enableSorting: false,
      },
      {
        accessorKey: 'realisasi',
        header: () => <div className="text-center">Realisasi</div>,
        cell: ({ row }) => <div className="text-center">{row.original.realisasi.toLocaleString('id-ID')}</div>,
        footer: () => <div className="text-center font-bold">{namaLevelTotals?.realisasi?.toLocaleString('id-ID') ?? '-'}</div>,
        size: 70, minSize: 60, enableSorting: false,
      },
      {
        accessorKey: 'persentase',
        header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Persentase (%) <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
        cell: ({ row }) => { 
          const value = row.original.persentase;
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center">-</div>;
          const showCheckmark = value >= 100;
          return ( <div className="text-center"> <Badge variant={getPercentageBadgeVariant(value)} className="text-xs px-1.5 py-0.5"> {showCheckmark && <CheckCircle2 className="mr-0.5 h-3 w-3" />} {value.toFixed(2)}% </Badge> </div> );
        },
        footer: () => { 
          if (!namaLevelTotals?.persentase) return <div className="text-center font-bold">-</div>;
          const value = namaLevelTotals.persentase;
          if (typeof value !== 'number' || isNaN(value)) return <div className="text-center font-bold">-</div>;
          const showCheckmark = value >= 100;
          return ( <div className="text-center font-bold"> <Badge variant={getPercentageBadgeVariant(value)} className="text-xs px-1.5 py-0.5"> {showCheckmark && <CheckCircle2 className="mr-0.5 h-3 w-3" />} {value.toFixed(2)}% </Badge> </div> );
        },
        size: 110, minSize: 100,
      },
    ];
    const dynamicStatusCols: ColumnDef<ProcessedKsaNamaData, any>[] = (uniqueStatusNames || []).map(statusName => ({
      id: `status_nama_${statusName.replace(/\s+/g, '_')}`, // Ensure unique ID
      header: ({column}) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0"> {statusName} <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
      accessorFn: row => row.statuses?.[statusName]?.percentage ?? 0,
      cell: ({ row }) => {
        const statusData = row.original.statuses?.[statusName];
        if (!statusData || statusData.count === 0) return <div className="text-center text-xs">-</div>;
        return ( <div className="text-center text-xs tabular-nums"> {statusData.count} ({statusData.percentage.toFixed(1)}%) </div> );
      },
      footer: () => {
        const totalStatusData = namaLevelTotals?.statuses?.[statusName];
        if (!totalStatusData || totalStatusData.count === 0) return <div className="text-center font-bold text-xs">-</div>;
        return ( <div className="text-center font-bold text-xs tabular-nums"> {totalStatusData.count} ({totalStatusData.percentage.toFixed(1)}%) </div> );
      },
      size: 120, minSize: 100, enableSorting: true,
    }));
    const fixedEndCols: ColumnDef<ProcessedKsaNamaData, any>[] = [
      // ... (Inkonsisten, Kode 12 for nama level)
        {
          accessorKey: 'inkonsisten',
          header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Inkonsisten <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
          cell: ({ row }) => <div className="text-center">{row.original.inkonsisten.toLocaleString('id-ID')}</div>,
          footer: () => <div className="text-center font-bold">{namaLevelTotals?.inkonsisten?.toLocaleString('id-ID') ?? '-'}</div>,
          size: 90, minSize: 80,
        },
        {
          accessorKey: 'kode_12',
          header: ({ column }) => ( <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="w-full flex justify-center items-center text-xs px-0" > Kode 12 <ArrowUpDown className="ml-1 h-3 w-3" /> </Button> ),
          cell: ({ row }) => <div className="text-center">{row.original.kode_12.toLocaleString('id-ID')}</div>,
          footer: () => <div className="text-center font-bold">{namaLevelTotals?.kode_12?.toLocaleString('id-ID') ?? '-'}</div>,
          size: 80, minSize: 70,
        },
    ];
    return [...fixedStartCols, ...dynamicStatusCols, ...fixedEndCols];
  }, [namaLevelTotals, uniqueStatusNames, selectedKabupatenDetail]);

  const namaTable = useReactTable({
    data: namaLevelData || [],
    columns: namaColumns,
    state: { sorting, }, // Can use the same sorting state or a new one if independent sorting is needed
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
  });

  // Skeleton configuration - simplified for brevity, you might need to make it dynamic based on view
  const skeletonColumnsToRender = currentView === 'district' ? districtColumns : namaColumns;
  const skeletonDataToRender = currentView === 'district' ? districtLevelData : namaLevelData;

    // Unified skeleton column configuration based on current view's columns
    const currentSkeletonColumnsConfig = useMemo(() => {
        const activeColumns = currentView === 'district' ? districtColumns : namaColumns;
        if (isLoading && (!uniqueStatusNames || uniqueStatusNames.length === 0)) {
            // Fallback for initial load when dynamic columns aren't ready
            const baseFixedStart = activeColumns.slice(0,1).map(c => ({ id: c.id ?? (c as any).accessorKey, size: (c as any).size, minSize: (c as any).minSize}));
            const statusPlaceholders = Array.from({ length: 2 }).map((_, i) => ({ 
                id: `status_skeleton_${currentView}_${i}`, size: 120, minSize: 100 
            }));
            const baseFixedEnd = activeColumns.slice(-2).map(c => ({ id: c.id ?? (c as any).accessorKey, size: (c as any).size, minSize: (c as any).minSize}));
            // Simplified fixed columns for skeleton, adjust indices as needed
             if (currentView === 'district') {
                 return [
                    { id: 'kab_skel', size: 180, minSize: 150 }, { id: 'target_skel', size: 70, minSize: 60 }, { id: 'real_skel', size: 70, minSize: 60 }, { id: 'persen_skel', size: 110, minSize: 100 },
                    ...statusPlaceholders,
                    { id: 'inkons_skel', size: 90, minSize: 80 }, { id: 'k12_skel', size: 80, minSize: 70 }
                 ];
             } else { // namaView
                 return [
                    { id: 'nama_skel', size: 200, minSize: 180 }, { id: 'target_skel_n', size: 70, minSize: 60 }, { id: 'real_skel_n', size: 70, minSize: 60 }, { id: 'persen_skel_n', size: 110, minSize: 100 },
                    ...statusPlaceholders,
                    { id: 'inkons_skel_n', size: 90, minSize: 80 }, { id: 'k12_skel_n', size: 80, minSize: 70 }
                 ];
             }
        }
        return activeColumns.map(c => ({ id: c.id ?? (c as any).accessorKey, size: (c as any).size, minSize: (c as any).minSize}));
    }, [isLoading, uniqueStatusNames, districtColumns, namaColumns, currentView]);


  if (isLoading) { 
    return (
      <div className="container mx-auto py-4 md:py-6">
        {currentView === 'district' && (
            <div className="mb-4 flex flex-col md:flex-row justify-end items-center gap-2">
            <Skeleton className="h-10 w-full md:w-[180px]" />
            </div>
        )}
        {currentView === 'nama' && (
            <div className="mb-4">
                <Skeleton className="h-8 w-1/4" /> {/* Back button skeleton */}
            </div>
        )}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-3/4 mb-2" /> 
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    <TableRow>
                    {currentSkeletonColumnsConfig.map((col) => (
                        <TableHead key={col.id} style={{ width: col.size ? `${col.size}px` : 'auto', minWidth: col.minSize ? `${col.minSize}px` : 'auto' }}>
                        <Skeleton className="h-5 w-full" />
                        </TableHead>
                    ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                        {currentSkeletonColumnsConfig.map((col) => (
                            <TableCell key={col.id} style={{ width: col.size ? `${col.size}px` : 'auto', minWidth: col.minSize ? `${col.minSize}px` : 'auto' }}>
                            <Skeleton className="h-5 w-full" />
                            </TableCell>
                        ))}
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) { 
    return (
      <div className="container mx-auto py-4 md:py-6">
         {currentView === 'district' && (
            <div className="mb-4 flex flex-col md:flex-row justify-end items-center gap-2">
                <Select onValueChange={handleMonthChange} value={displayMonth || ''} disabled={isLoading}>
                    <SelectTrigger className="w-full md:w-[180px]"> <SelectValue placeholder="Pilih Bulan" /> </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Semua">Semua Bulan</SelectItem>
                        {months.map(month => ( <SelectItem key={month.value} value={month.value}> {month.label} </SelectItem> ))}
                    </SelectContent>
                </Select>
            </div>
         )}
        <Alert variant="destructive" className="m-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Memuat Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const renderTable = (
    tableInstance: any, // Adjust type for ReactTable instance
    dataArray: any[], 
    columnsArray: ColumnDef<any,any>[], 
    viewType: ViewMode,
    totalsData: any
  ) => (
    <ScrollArea className="w-full rounded-md border"> 
        <Table>
            <TableHeader>
            {tableInstance.getHeaderGroups().map((headerGroup:any) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header:any) => ( <TableHead key={header.id} style={{ width: header.getSize(), minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined }}> {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())} </TableHead> ))}
                </TableRow>
            ))}
            </TableHeader>
            <TableBody>
            {tableInstance.getRowModel().rows?.length ? (
                tableInstance.getRowModel().rows.map((row:any) => (
                <TableRow 
                    key={row.id} 
                    data-state={row.getIsSelected() && "selected"}
                    onClick={viewType === 'district' ? () => handleDistrictRowClick(row.original as ProcessedKsaDistrictData) : undefined}
                    className={viewType === 'district' ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                    {row.getVisibleCells().map((cell:any) => ( <TableCell key={cell.id} style={{ width: cell.column.getSize(), minWidth: cell.column.columnDef.minSize ? `${cell.column.columnDef.minSize}px` : undefined }} className="p-2"> {flexRender(cell.column.columnDef.cell, cell.getContext())} </TableCell> ))}
                </TableRow>
                ))
            ) : ( <TableRow> <TableCell colSpan={columnsArray.length} className="h-24 text-center"> Tidak ada data untuk ditampilkan {displayMonth !== "Semua" && months.find(m => m.value === displayMonth) ? ` untuk bulan ${months.find(m => m.value === displayMonth)?.label}.` : '.'} </TableCell> </TableRow> )}
            </TableBody>
            {totalsData && dataArray && dataArray.length > 0 && (
            <tfoot className="bg-muted/50 font-semibold">
                {tableInstance.getFooterGroups().map((footerGroup:any) => (
                <TableRow key={footerGroup.id}>
                    {footerGroup.headers.map((header:any) => ( <TableCell key={header.id} className="p-2" style={{ width: header.column.getSize(), minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined }}> {header.isPlaceholder ? null : flexRender(header.column.columnDef.footer, header.getContext())} </TableCell> ))}
                </TableRow>
                ))}
            </tfoot>
            )}
        </Table>
    </ScrollArea>
  );

  return ( 
    <div className="container mx-auto py-4 md:py-6"> 
      {currentView === 'district' && (
        <div className="mb-4 flex flex-col md:flex-row justify-end items-center gap-2">
          <Select onValueChange={handleMonthChange} value={displayMonth || ''} disabled={isLoading}>
            <SelectTrigger className="w-full md:w-[180px]"> <SelectValue placeholder="Pilih Bulan" /> </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua">Semua Bulan</SelectItem>
              {months.map(month => ( <SelectItem key={month.value} value={month.value}> {month.label} </SelectItem> ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {currentView === 'nama' && selectedKabupatenDetail && (
        <div className="mb-4">
            <Button variant="outline" onClick={handleBackToDistrictView} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kabupaten
            </Button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {currentView === 'district' ? "Monitoring KSA Padi" : `Detail KSA Padi - ${selectedKabupatenDetail?.kabupaten || ''}`}
          </CardTitle>
          <CardDescription>
            {!isLoading && lastUpdated && <span className="block text-sm text-gray-500 mt-1">Terakhir diperbarui: {lastUpdated}</span>}
            {currentView === 'nama' && selectedKabupatenDetail && !isLoading && (
                 <span className="block text-sm text-gray-500 mt-1">Data untuk Tahun {selectedYear} {displayMonth !== "Semua" && months.find(m => m.value === displayMonth) ? `- Bulan ${months.find(m => m.value === displayMonth)?.label}` : ''}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentView === 'district' && renderTable(districtTable, districtLevelData, districtColumns, 'district', districtTotals)}
          {currentView === 'nama' && renderTable(namaTable, namaLevelData, namaColumns, 'nama', namaLevelTotals)}
          
          {!isLoading && !error && 
            ((currentView === 'district' && (!districtLevelData || districtLevelData.length === 0)) || 
             (currentView === 'nama' && (!namaLevelData || namaLevelData.length === 0))) && 
          ( <p className="text-center text-gray-500 py-4"> Tidak ada data ditemukan. </p> )}
        </CardContent>
      </Card>
    </div>
  );
}