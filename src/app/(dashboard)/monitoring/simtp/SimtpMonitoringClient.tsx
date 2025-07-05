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
import { CheckCircle2, Circle, HardDrive, Tractor, Wheat, Clock, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { SimtpMonitoringData, SimtpMonthStatus, SimtpTableRow } from './types';
import { useJadwalData } from '@/hooks/useJadwalData';
import { useCountdown } from '@/hooks/useCountdown';
import { Button } from '@/components/ui/button';
import { CONSTANTS, getMonthName, isOngoingReportingPeriod, formatUploadDate, getStatusAriaLabel } from './utils';
import { useIsMobile } from '@/hooks/use-mobile';

const AnnualStatusIcon = React.memo(({ status, Icon, label }: { status?: any, Icon: React.ElementType, label: string }) => (
    <TooltipProvider delayDuration={CONSTANTS.TOOLTIP_DELAY}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div 
                    tabIndex={0} 
                    className="focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
                    role="button"
                    aria-label={`Status ${label}: ${status ? 'Sudah diupload' : 'Belum diupload'}`}
                >
                  <Icon className={`h-5 w-5 ${status ? 'text-green-600' : 'text-gray-300'}`} />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p className='font-semibold'>{label}</p>
                {status ? (
                    <>
                        <p className='text-xs'>{status.file_name}</p>
                        <p className='text-xs text-muted-foreground'>
                            {formatUploadDate(status.uploaded_at)}
                        </p>
                    </>
                ) : <p className='text-xs'>Belum diupload</p>}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
));

AnnualStatusIcon.displayName = 'AnnualStatusIcon';

// Monthly Status Cell Component
const MonthlyStatusCell = React.memo(({ 
  status, 
  monthName, 
  selectedYear, 
  isOngoingPeriod 
}: { 
  status: SimtpMonthStatus | null;
  monthName: string;
  selectedYear: number;
  isOngoingPeriod: boolean;
}) => {
  const ariaLabel = getStatusAriaLabel(monthName, !!status, isOngoingPeriod);
  
  if (status) {
    return (
      <TooltipProvider delayDuration={CONSTANTS.TOOLTIP_DELAY}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              tabIndex={0} 
              className="focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
              role="button"
              aria-label={ariaLabel}
            >
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className='font-semibold'>Periode: {monthName} {selectedYear}</p>
            <p className='text-xs'>{status.file_name}</p>
            <p className='text-xs'>Diupload pada: {formatUploadDate(status.uploaded_at)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (isOngoingPeriod) {
    return (
      <TooltipProvider delayDuration={CONSTANTS.TOOLTIP_DELAY}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              tabIndex={0} 
              className="focus:outline-none focus:ring-2 focus:ring-ring rounded-sm"
              role="button"
              aria-label={ariaLabel}
            >
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Periode pelaporan sedang berjalan.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return <Circle className="h-2 w-2 text-gray-300" aria-label={ariaLabel} />;
});

MonthlyStatusCell.displayName = 'MonthlyStatusCell';

export function SimtpMonitoringClient() {
  const { selectedYear } = useYear();
  const isMobile = useIsMobile();
  const [showAnnualColumns, setShowAnnualColumns] = React.useState(false);
  
  const [monitoringData, setMonitoringData] = React.useState<SimtpMonitoringData>({});
  const [lastUpdate, setLastUpdate] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [kegiatanId, setKegiatanId] = React.useState<string | null>(null);

  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);

  // Fetch data function with better error handling
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setKegiatanId(null);
    try {
      const result = await getSimtpMonitoringData(selectedYear);
      setMonitoringData(result.data);
      setLastUpdate(result.lastUpdate);
      setKegiatanId(result.kegiatanId);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Terjadi kesalahan tidak diketahui';
      setError(errorMessage);
      console.error('Error fetching SIMTP monitoring data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const jadwalSimtp = React.useMemo(() => 
    !isJadwalLoading && kegiatanId ? jadwalData.find(k => k.id === kegiatanId) : undefined, 
    [jadwalData, isJadwalLoading, kegiatanId]
  );
  
  const countdownStatus = useCountdown(jadwalSimtp);

  // Memoize current date calculations
  const currentDateInfo = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // Convert to 1-based month
    const currentYear = now.getFullYear();
    
    // For SIMTP, we report previous month's data in current month
    // So if current month is July (7), the reporting period is for June (6) data
    const reportingMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const reportingYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    return {
      currentReportMonth: currentMonth,
      currentYear: currentYear,
      reportingMonth: reportingMonth,
      reportingYear: reportingYear
    };
  }, []);

  // Define which columns should be hidden on mobile
  const mobileHiddenColumns = React.useMemo(() => {
    const { reportingMonth } = currentDateInfo;
    const hiddenMonths = [];
    
    // Hide all months except the reporting month (previous month) on mobile when not showing all columns
    for (let i = 1; i <= CONSTANTS.MONTHS_IN_YEAR; i++) {
      if (i !== reportingMonth) {
        hiddenMonths.push(i.toString());
      }
    }
    
    return [...hiddenMonths, 'lahan', 'alsin', 'benih'];
  }, [currentDateInfo]);

  const tableData = React.useMemo<SimtpTableRow[]>(() => {
    return kabMap.map(satker => {
      const satkerData = monitoringData[satker.value] || { months: {}, annuals: {} };
      const row: Partial<SimtpTableRow> = {
        nmkab: satker.label,
        kab_kode: satker.value,
        annuals: satkerData.annuals,
      };
      for (let i = 1; i <= CONSTANTS.MONTHS_IN_YEAR; i++) {
        row[String(i) as keyof Omit<SimtpTableRow, 'nmkab' | 'kab_kode' | 'annuals'>] = satkerData.months[i] || null;
      }
      return row as SimtpTableRow;
    });
  }, [monitoringData]);

  const columns = React.useMemo<ColumnDef<SimtpTableRow>[]>(() => {
    const { currentReportMonth, currentYear } = currentDateInfo;

    const monthColumns: ColumnDef<SimtpTableRow>[] = Array.from({ length: CONSTANTS.MONTHS_IN_YEAR }, (_, i) => {
      const month = i + 1;
      const monthName = getMonthName(i);
      return {
        id: String(month),
        header: () => <div className="text-center">{monthName}</div>,
        cell: ({ row }) => {
          const status = row.original[month.toString() as keyof SimtpTableRow] as SimtpMonthStatus | null;
          const isOngoingPeriod = isOngoingReportingPeriod(
            selectedYear, 
            month, 
            currentYear, 
            currentReportMonth
          );
          
          return (
            <div className="flex justify-center items-center h-full">
              <MonthlyStatusCell 
                status={status}
                monthName={monthName}
                selectedYear={selectedYear}
                isOngoingPeriod={isOngoingPeriod}
              />
            </div>
          );
        },
        size: 50,
      };
    });
    
    const annualDetailColumns: ColumnDef<SimtpTableRow>[] = [
        { id: 'lahan', header: () => <div className="text-center">Lahan</div>, size: 60, cell: ({row}) => <div className="flex justify-center"><AnnualStatusIcon status={row.original.annuals.LAHAN_TAHUNAN} Icon={HardDrive} label="Lahan" /></div> },
        { id: 'alsin', header: () => <div className="text-center">Alsin</div>, size: 60, cell: ({row}) => <div className="flex justify-center"><AnnualStatusIcon status={row.original.annuals.ALSIN_TAHUNAN} Icon={Tractor} label="Alsin" /></div> },
        { id: 'benih', header: () => <div className="text-center">Benih</div>, size: 60, cell: ({row}) => <div className="flex justify-center"><AnnualStatusIcon status={row.original.annuals.BENIH_TAHUNAN} Icon={Wheat} label="Benih" /></div> },
    ];

    const allColumns = [
      { 
        accessorKey: 'nmkab', 
        header: 'Kabupaten/Kota', 
        cell: ({ row }: { row: any }) => (
          <div className="truncate font-medium" title={row.original.nmkab}>
            {row.original.nmkab}
          </div>
        ), 
        size: 180 
      },
      ...monthColumns,
      ...annualDetailColumns,
    ];

    // Filter columns for mobile
    if (isMobile && !showAnnualColumns) {
      return allColumns.filter(col => !mobileHiddenColumns.includes(col.id || ''));
    }

    return allColumns;
  }, [selectedYear, currentDateInfo, isMobile, showAnnualColumns, mobileHiddenColumns]);
  
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pageIsLoading = isLoading || isJadwalLoading;

  // Error state component
  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <div className="text-center">
        <p className="text-red-600 font-medium">Terjadi Kesalahan</p>
        <p className="text-sm text-gray-600 mt-1">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchData} 
          className="mt-3"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Coba Lagi
        </Button>
      </div>
    </div>
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead 
                key={index} 
                style={{ width: column.size ? `${column.size}px` : 'auto' }} 
                className="p-2"
              >
                <Skeleton className="h-5 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: CONSTANTS.LOADING_SKELETON_ROWS }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column, cellIndex) => (
                <TableCell key={cellIndex} className="p-2">
                  <Skeleton className="h-5 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
          <div className='flex-grow'>
            <CardTitle>Monitoring Upload SIMTP {selectedYear}</CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {isMobile && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAnnualColumns(prev => !prev)}
              >
                {showAnnualColumns ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                {showAnnualColumns ? "Ringkas" : "Lengkap"}
              </Button>
            )}
            {countdownStatus && !pageIsLoading && (
              <div className={`flex items-center text-xs p-2 rounded-md border bg-gray-50 dark:bg-gray-800`}>
                  <Clock className={`h-4 w-4 mr-2 flex-shrink-0 ${countdownStatus.color}`} />
                  <span className={`font-medium whitespace-nowrap ${countdownStatus.color}`}>{countdownStatus.text}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between items-end pt-2">
          <CardDescription className="text-sm text-gray-500 h-5">
            {pageIsLoading ? <Skeleton className="h-4 w-64" /> : (
              <span>{lastUpdate ? `Terakhir diperbarui: ${lastUpdate}`: 'Belum ada data untuk tahun ini.'}</span>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {pageIsLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState />
        ) : (
          <>
            <div className="w-full overflow-x-auto rounded-md border" role="region" aria-label="Tabel monitoring SIMTP">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead 
                          key={header.id} 
                          style={{ width: header.getSize() }} 
                          className="p-2"
                          scope="col"
                        >
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
                          <TableCell 
                            key={cell.id} 
                            style={{ width: cell.column.getSize() }} 
                            className="p-2"
                          >
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
            <div className='flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-muted-foreground' role="complementary" aria-label="Legenda status">
              <p className='font-semibold'>Legenda:</p>
              <div className='flex items-center gap-2' role="img" aria-label="Sudah upload">
                <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" /> 
                <span>Sudah Upload</span>
              </div>
              <div className='flex items-center gap-2' role="img" aria-label="Periode berjalan">
                <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" /> 
                <span>Periode Berjalan</span>
              </div>
              <div className='flex items-center gap-2' role="img" aria-label="Belum upload">
                <Circle className="h-2 w-2 text-gray-300" aria-hidden="true" /> 
                <span>Belum Upload</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}