/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from 'react';
import { useYear } from '@/context/YearContext';
import { kabMap } from '@/lib/satker-data';
import { getSimtpMonitoringData } from './_actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronDown, ChevronRight, Circle, HardDrive, Tractor, Wheat, Clock } from 'lucide-react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { SimtpMonitoringData, SimtpMonthStatus, SimtpTableRow } from './types';

const AnnualStatusIcon = ({ status, Icon, label }: { status?: any, Icon: React.ElementType, label: string }) => (
    <TooltipProvider delayDuration={100}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div tabIndex={0} className="focus:outline-none focus:ring-2 focus:ring-ring rounded-sm">
                  <Icon className={`h-5 w-5 ${status ? 'text-green-600' : 'text-gray-300'}`} />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p className='font-semibold'>{label}</p>
                {status ? (
                    <>
                        <p className='text-xs'>{status.file_name}</p>
                        <p className='text-xs'>
                            {new Date(status.uploaded_at).toLocaleString('id-ID')}
                        </p>
                    </>
                ) : <p className='text-xs'>Belum diupload</p>}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

export function SimtpMonitoringClient() {
  const { selectedYear } = useYear();
  const [isAnnualExpanded, setIsAnnualExpanded] = React.useState(false);

  const [monitoringData, setMonitoringData] = React.useState<SimtpMonitoringData>({});
  const [lastUpdate, setLastUpdate] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getSimtpMonitoringData(selectedYear);
        setMonitoringData(result.data);
        setLastUpdate(result.lastUpdate);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  const tableData = React.useMemo<SimtpTableRow[]>(() => {
    return kabMap.map(satker => {
      const satkerData = monitoringData[satker.value] || { months: {}, annuals: {} };
      const row: Partial<SimtpTableRow> = {
        nmkab: satker.label,
        kab_kode: satker.value,
        annuals: satkerData.annuals,
      };
      for (let i = 1; i <= 12; i++) {
        row[String(i) as keyof Omit<SimtpTableRow, 'nmkab' | 'kab_kode' | 'annuals'>] = satkerData.months[i] || null;
      }
      return row as SimtpTableRow;
    });
  }, [monitoringData]);

  const columns = React.useMemo<ColumnDef<SimtpTableRow>[]>(() => {
    const now = new Date();
    const currentReportMonth = now.getMonth(); // Jan=0, Feb=1... Laporan untuk bulan lalu.
    const currentYear = now.getFullYear();

    const monthColumns: ColumnDef<SimtpTableRow>[] = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthName = new Date(selectedYear, month - 1, 1).toLocaleString('id-ID', { month: 'short' });
      
      return {
        id: String(month),
        header: () => <div className="text-center">{monthName}</div>,
        cell: ({ row }) => {
          const status = row.original[month.toString() as keyof SimtpTableRow] as SimtpMonthStatus | null;

          let isOngoingPeriod = false;
          if (selectedYear === currentYear && month === currentReportMonth) {
              isOngoingPeriod = true;
          }

          return (
            <div className="flex justify-center items-center h-full">
              {status ? (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <div tabIndex={0} className="focus:outline-none focus:ring-2 focus:ring-ring rounded-sm">
                         <CheckCircle2 className="h-5 w-5 text-green-500" />
                       </div>
                    </TooltipTrigger>
                    <TooltipContent>
                       <p className='font-semibold'>Periode: {monthName} {selectedYear}</p>
                       <p className='text-xs'>{status.file_name}</p>
                       <p className='text-xs'>
                        Diupload pada: {new Date(status.uploaded_at).toLocaleString('id-ID')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : isOngoingPeriod ? (
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div tabIndex={0} className="focus:outline-none focus:ring-2 focus:ring-ring rounded-sm">
                                <Clock className="h-4 w-4 text-blue-500" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Periode pelaporan sedang berjalan.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
              ) : (
                <Circle className="h-2 w-2 text-gray-300" />
              )}
            </div>
          );
        },
        size: 50,
      };
    });

    const annualSummaryColumn: ColumnDef<SimtpTableRow> = {
      id: 'annual-summary',
      header: () => <div className="text-center">Data Tahunan</div>,
      cell: ({ row }) => (<div className="flex justify-center items-center gap-3"><AnnualStatusIcon status={row.original.annuals.LAHAN_TAHUNAN} Icon={HardDrive} label="File Lahan" /><AnnualStatusIcon status={row.original.annuals.ALSIN_TAHUNAN} Icon={Tractor} label="File Alsin" /><AnnualStatusIcon status={row.original.annuals.BENIH_TAHUNAN} Icon={Wheat} label="File Benih" /></div>),
      size: 150,
    };
    
    const annualDetailColumns: ColumnDef<SimtpTableRow>[] = [
        { id: 'lahan', header: 'Lahan', size: 60, cell: ({row}) => <div className="flex justify-center"><AnnualStatusIcon status={row.original.annuals.LAHAN_TAHUNAN} Icon={HardDrive} label="Lahan" /></div>},
        { id: 'alsin', header: 'Alsin', size: 60, cell: ({row}) => <div className="flex justify-center"><AnnualStatusIcon status={row.original.annuals.ALSIN_TAHUNAN} Icon={Tractor} label="Alsin" /></div>},
        { id: 'benih', header: 'Benih', size: 60, cell: ({row}) => <div className="flex justify-center"><AnnualStatusIcon status={row.original.annuals.BENIH_TAHUNAN} Icon={Wheat} label="Benih" /></div>},
    ];

    return [
      {
        accessorKey: 'nmkab',
        header: 'Kabupaten/Kota',
        cell: ({ row }) => <div className="truncate font-medium">{row.original.nmkab}</div>,
        size: 180,
      },
      ...monthColumns,
      ...(isAnnualExpanded ? annualDetailColumns : [annualSummaryColumn]),
    ];
  }, [selectedYear, isAnnualExpanded, monitoringData]);
  
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Monitoring Upload SIMTP {selectedYear}</CardTitle>
          <CardDescription className="mt-2 text-sm text-gray-500 h-5">
            {isLoading ? <Skeleton className="h-4 w-64" /> : (
              <span>{lastUpdate ? `Terakhir diperbarui: ${lastUpdate}`: 'Belum ada data untuk tahun ini.'}</span>
            )}
          </CardDescription>
        </div>
        <div className='flex justify-end items-center gap-2 pt-2'>
            <Button variant="outline" size="sm" onClick={() => setIsAnnualExpanded(!isAnnualExpanded)}>
              {isAnnualExpanded ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
              {isAnnualExpanded ? "Ringkas Tahunan" : "Detail Tahunan"}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="rounded-md border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, index) => <TableHead key={index} style={{ width: column.size ? `${column.size}px` : 'auto' }} className="p-2"><Skeleton className="h-5 w-full" /></TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 14 }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {columns.map((column, cellIndex) => <TableCell key={cellIndex} className="p-2"><Skeleton className="h-5 w-full" /></TableCell>)}
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        ) : error ? (
            <p className="text-red-500 text-center py-10">{error}</p>
        ) : (
          <>
            <div className="w-full overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead key={header.id} style={{ width: header.getSize() }} className="p-2">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id} style={{ width: cell.column.getSize() }} className="p-2">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        Tidak ada data untuk ditampilkan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
             <div className='flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground'>
                <p className='font-semibold'>Legenda:</p>
                <div className='flex items-center gap-2'><CheckCircle2 className="h-5 w-5 text-green-500" /> = Sudah Upload</div>
                <div className='flex items-center gap-2'><Clock className="h-4 w-4 text-blue-500" /> = Periode Berjalan</div>
                <div className='flex items-center gap-2'><Circle className="h-2 w-2 text-gray-300" /> = Belum Upload</div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}