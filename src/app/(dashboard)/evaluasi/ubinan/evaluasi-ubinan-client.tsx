// src/app/(dashboard)/evaluasi/ubinan/evaluasi-ubinan-client.tsx
"use client";

import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUbinanEvaluasiFilter } from '@/context/UbinanEvaluasiFilterContext';
import { useUbinanDescriptiveStatsData } from '@/hooks/useUbinanDescriptiveStatsData';
import { columns as descriptiveStatsTableColumns } from './descriptive-stats-columns';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  TableMeta,
} from "@tanstack/react-table";

// Extend TableMeta to include kalimantanBaratData and currentUnit
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    kalimantanBaratData?: unknown;
    currentUnit?: string;
  }
}

export function EvaluasiUbinanClient() {
  const {
    selectedSubround,
    setSelectedSubround,
    availableSubrounds,
    selectedKomoditas,
    setSelectedKomoditas,
    availableKomoditas,
    isLoadingFilters,
  } = useUbinanEvaluasiFilter();

  const [useKuHa, setUseKuHa] = useState(false);
  const conversionFactor = useKuHa ? 16 : 1;
  const currentUnit = useKuHa ? 'ku/ha' : 'kg/plot';

  const {
    data: statsDataPerKab,
    kalimantanBaratData,
    isLoadingData,
    error: dataError,
  } = useUbinanDescriptiveStatsData(conversionFactor);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useMemo(() => descriptiveStatsTableColumns, []);
  const dataForTable = useMemo(() => statsDataPerKab, [statsDataPerKab]);

  const table = useReactTable({
    data: dataForTable,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: false,
    meta: {
      kalimantanBaratData,
      currentUnit,
    },
  });

  const handleSubroundChange = (value: string) => {
    if (value === 'all') {
      setSelectedSubround('all');
    } else {
      setSelectedSubround(Number(value));
    }
  };

  const handleKomoditasChange = (value: string) => {
    setSelectedKomoditas(value);
  };
  
  const isKomoditasDisabled = isLoadingFilters || availableKomoditas.length === 0;

  return (
    <div className="space-y-4"> {/* Mengurangi space-y default jika filter di luar */}
      {/* Filter ditempatkan di sini, di luar Card, sisi kanan atas */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-x-4 gap-y-2 mb-4">
        <div>
          {isLoadingFilters ? (
            <Skeleton className="h-10 w-36 sm:w-40" />
          ) : (
            <Select
              value={selectedSubround === 'all' ? 'all' : String(selectedSubround)}
              onValueChange={handleSubroundChange}
              disabled={isLoadingFilters || availableSubrounds.length === 0}
            >
              <SelectTrigger id="subround-filter" className="w-full sm:w-auto min-w-[150px]">
                <SelectValue placeholder="Pilih Subround" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Subround</SelectItem>
                {availableSubrounds.map((subround) => (
                  <SelectItem key={subround} value={String(subround)}>
                    Subround {subround}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          {isLoadingFilters ? (
            <Skeleton className="h-10 w-36 sm:w-40" />
          ) : (
            <Select
              value={selectedKomoditas || ""}
              onValueChange={handleKomoditasChange}
              disabled={isKomoditasDisabled}
            >
              <SelectTrigger id="komoditas-filter" className="w-full sm:w-auto min-w-[150px]">
                <SelectValue placeholder={isKomoditasDisabled ? "Tidak ada komoditas" : "Pilih Komoditas"} />
              </SelectTrigger>
              <SelectContent>
                {availableKomoditas.map((komoditas) => (
                  <SelectItem key={komoditas} value={komoditas}>
                    {komoditas}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Card>
        {/* CardHeader dibuat relative untuk positioning absolute Switch */}
        {/* Tambahkan padding-right agar title/desc tidak tertimpa Switch */}
        <CardHeader className="relative pr-28 md:pr-32"> 
          <CardTitle>Tabel Statistik Deskriptif Ubinan (R701)</CardTitle>
          <CardDescription>
            Pilih tahun melalui filter global di header. Data pada tabel di bawah ini difilter berdasarkan subround dan komoditas yang dipilih di atas.
            Statistik mencakup entri R701 yang tidak kosong. Ubah satuan menggunakan tombol di pojok kanan atas kartu ini.
          </CardDescription>
          
          {/* Switch Unit di pojok kanan atas CardHeader */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-2">
            <Switch
              id="unit-switcher"
              checked={useKuHa}
              onCheckedChange={setUseKuHa}
            />
            <Label htmlFor="unit-switcher" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              ku/ha
            </Label>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bagian Tabel Statistik */}
          {isLoadingData && (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {!isLoadingData && dataError && (
            <p className="text-red-600 dark:text-red-400 text-center py-4">Error: {dataError}</p>
          )}
          {!isLoadingData && !dataError && table.getRowModel().rows.length === 0 && (
             <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                Tidak ada data statistik untuk ditampilkan dengan filter yang dipilih.
             </p>
          )}
          {!isLoadingData && !dataError && table.getRowModel().rows.length > 0 && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                            key={header.id} 
                            onClick={header.column.getToggleSortingHandler()} 
                            className={`whitespace-nowrap ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                            style={{ textAlign: 'center' }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} style={{ textAlign: 'center' }} className="whitespace-nowrap">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
                {kalimantanBaratData && (
                  <TableFooter>
                    {table.getFooterGroups().map((footerGroup) => (
                      <TableRow key={footerGroup.id} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold">
                        {footerGroup.headers.map((header) => ( 
                          <TableCell 
                            key={header.id} 
                            scope="col"
                            style={{ textAlign: 'center' }}
                            className="whitespace-nowrap"
                          >
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
                )}
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}