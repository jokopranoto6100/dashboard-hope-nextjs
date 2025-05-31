// src/app/monitoring/ubinan/page.tsx
"use client";

import * as React from "react"
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useYear } from '@/context/YearContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';


export default function UbinanMonitoringPage() {
  const { selectedYear } = useYear();

  const [selectedSubround, setSelectedSubround] = React.useState<string>('all');
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate } = usePadiMonitoringData(selectedYear, selectedSubround);
  const { palawijaData, loadingPalawija, errorPalawija } = usePalawijaMonitoringData(selectedYear, selectedSubround);

  const toTitleCase = (str: string) => {
    return str.toLowerCase().split(' ').map((word) => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  };

  const getPercentageBadgeClass = (percentage: number | string) => {
    const value = parseFloat(percentage.toString());
    if (isNaN(value)) return "bg-gray-200 text-gray-800";
    
    if (value >= 90) return "bg-green-500 text-white";
    if (value >= 70) return "bg-yellow-500 text-gray-900";
    if (value >= 50) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const getLastMonthName = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const lastMonthDate = new Date(currentDate.getFullYear(), currentMonth - 1, 1);
    return lastMonthDate.toLocaleString('id-ID', { month: 'long' });
  };
  const lastMonthName = React.useMemo(() => getLastMonthName(), []);

  // --- Definisi Kolom Padi (dengan alignment di dalam cell renderer & size) ---
  const padiColumns: ColumnDef<any>[] = React.useMemo(() => [
    {
      accessorKey: "nmkab",
      header: () => <div className="text-left">Kabupaten</div>,
      cell: ({ row }) => <div className="text-left">{row.original.nmkab}</div>,
      size: 0.3, // Menggunakan ukuran relatif untuk distribusi lebar
      minSize: 150,
      enableHiding: true,
    },
    {
      accessorKey: "targetUtama",
      header: () => <div className="text-center">Target Utama</div>,
      cell: ({ row }) => <div className="text-center">{row.original.targetUtama}</div>,
      size: 0.15,
      minSize: 80,
      enableHiding: true,
    },
    {
      accessorKey: "cadangan",
      header: () => <div className="text-center">Cadangan</div>,
      cell: ({ row }) => <div className="text-center">{row.original.cadangan}</div>,
      size: 0.15,
      minSize: 80,
      enableHiding: true,
    },
    {
      accessorKey: "realisasi",
      header: () => <div className="text-center">Realisasi</div>,
      cell: ({ row }) => <div className="text-center">{row.original.realisasi}</div>,
      size: 0.15,
      minSize: 80,
      enableHiding: true,
    },
    {
      accessorKey: "lewatPanen",
      header: () => <div className="text-center">Lewat Panen</div>,
      cell: ({ row }) => <div className="text-center">{row.original.lewatPanen}</div>,
      size: 0.15,
      minSize: 100,
      enableHiding: true,
    },
    {
      accessorKey: "faseGeneratif",
      header: () => <div className="text-center">Fase Generatif ({lastMonthName})</div>,
      cell: ({ row }) => <div className="text-center">{row.original.faseGeneratif}</div>,
      size: 0.15,
      minSize: 120,
      enableHiding: true,
    },
    {
      accessorKey: "anomali",
      header: () => <div className="text-center">Anomali</div>,
      cell: ({ row }) => <div className="text-center">{row.original.anomali}</div>,
      size: 0.15,
      minSize: 80,
      enableHiding: true,
    },
    {
      accessorKey: "persentase",
      header: () => <div className="text-center">Persentase (%)</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPercentageBadgeClass(row.original.persentase)}`}>
              {row.original.persentase}%
          </span>
        </div>
      ),
      size: 0.15,
      minSize: 100,
      enableHiding: true,
    },
  ], [lastMonthName]);


  const padiTable = useReactTable({
    data: processedPadiData || [],
    columns: padiColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    // --- Perbaikan 1: Set default visibility sesuai permintaan ---
    initialState: {
        columnVisibility: {
            cadangan: false, // Default tersembunyi
            faseGeneratif: false, // Default tersembunyi
            anomali: false, // Default tersembunyi
        }
    },
    // --- Perbaikan 2: Aktifkan column resizing ---
    columnResizeMode: 'onChange', // Mode resizing kolom
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex items-center justify-end">
        <div className="flex items-center gap-2">
            <Select value={selectedSubround} onValueChange={setSelectedSubround}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Semua Subround" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Subround</SelectItem>
                    <SelectItem value="1">Subround 1</SelectItem>
                    <SelectItem value="2">Subround 2</SelectItem>
                    <SelectItem value="3">Subround 3</SelectItem>
                </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Kolom <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {padiTable
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id === 'nmkab' ? 'Kabupaten' :
                         column.id === 'targetUtama' ? 'Target Utama' :
                         column.id === 'cadangan' ? 'Cadangan' :
                         column.id === 'realisasi' ? 'Realisasi' :
                         column.id === 'lewatPanen' ? 'Lewat Panen' :
                         column.id === 'faseGeneratif' ? `Fase Generatif (${lastMonthName})` :
                         column.id === 'anomali' ? 'Anomali' :
                         column.id === 'persentase' ? 'Persentase (%)' :
                         column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

        </div>
      </div>

      <Tabs defaultValue="padi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="padi">Ubinan Padi</TabsTrigger>
          <TabsTrigger value="palawija">Ubinan Palawija</TabsTrigger>
        </TabsList>

        <TabsContent value="padi" className="mt-4">
          <Card>
            <CardHeader>
              <CardDescription>
                {lastUpdate && <span className="block text-sm text-gray-500">Terakhir diperbarui: {lastUpdate}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPadi && <p className="text-center">Memuat data padi...</p>}
              {errorPadi && <p className="text-red-500 text-center">Error: {errorPadi}</p>}
              {processedPadiData && processedPadiData.length > 0 ? (
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  {/* --- Perbaikan 2: table-layout: fixed & width di TableHead/TableCell --- */}
                  <Table style={{ tableLayout: 'fixed', width: '100%' }}> 
                    <TableHeader>
                      {padiTable.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                                key={header.id}
                                className={header.column.id === 'nmkab' ? 'text-left' : 'text-center'} 
                                style={{ width: header.getSize() }} // Gunakan getSize() dari TanStack Table
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {padiTable.getRowModel().rows?.length ? (
                        padiTable.getRowModel().rows.map(row => (
                          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>{
                            row.getVisibleCells().map(cell => (
                              <TableCell
                                key={cell.id}
                                className={cell.column.id === 'nmkab' ? 'text-left' : 'text-center'} 
                                style={{ width: cell.column.getSize() }} // Gunakan getSize() dari TanStack Table
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))
                          }</TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={padiColumns.length} className="h-24 text-center">
                            Tidak ada hasil.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                    {padiTotals && (
                        <tfoot className="bg-gray-50 font-bold">
                            <TableRow>
                                {/* Iterasi melalui kolom yang terlihat untuk sel total */}
                                {padiTable.getVisibleLeafColumns().map(col => {
                                    const columnId = col.id;
                                    let displayValue;
                                    let isPercentage = false;

                                    if (columnId === 'nmkab') displayValue = 'Total';
                                    else if (columnId === 'targetUtama') displayValue = padiTotals.targetUtama;
                                    else if (columnId === 'cadangan') displayValue = padiTotals.cadangan;
                                    else if (columnId === 'realisasi') displayValue = padiTotals.realisasi;
                                    else if (columnId === 'lewatPanen') displayValue = padiTotals.lewatPanen;
                                    else if (columnId === 'faseGeneratif') displayValue = padiTotals.faseGeneratif;
                                    else if (columnId === 'anomali') displayValue = padiTotals.anomali;
                                    else if (columnId === 'persentase') {
                                        displayValue = padiTotals.persentase.toFixed(2);
                                        isPercentage = true;
                                    } else displayValue = ''; // Untuk kolom yang tidak memiliki total

                                    return (
                                        <TableCell
                                            key={columnId + "_total"}
                                            className={columnId === 'nmkab' ? 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left' : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center'}
                                            style={{ width: col.getSize() }}
                                        >
                                            {isPercentage ? (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPercentageBadgeClass(padiTotals.persentase)}`}>
                                                    {displayValue}%
                                                </span>
                                            ) : (
                                                displayValue
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </tfoot>
                    )}
                  </Table>
                </ScrollArea>
              ) : (
                !loadingPadi && !errorPadi && <p className="text-center text-gray-500">Tidak ada data Ubinan Padi ditemukan untuk tahun {selectedYear} dan Subround {selectedSubround === 'all' ? 'Semua' : selectedSubround}.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="palawija" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tabulasi Ubinan Palawija</CardTitle>
              <CardDescription>Data dari tabel `ubinan_raw`.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPalawija && <p className="text-center">Memuat data palawija...</p>}
              {errorPalawija && <p className="text-red-500 text-center">Error: {errorPalawija}</p>}
              {palawijaData && palawijaData.length > 0 ? (
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
              ) : (
                !loadingPalawija && !errorPalawija && <p className="text-center text-gray-500">Tidak ada data Ubinan Palawija ditemukan.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}