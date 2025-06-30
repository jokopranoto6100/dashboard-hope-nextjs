"use client";

import * as React from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getKehutananData } from "./_actions";
import { PerusahaanKehutanan } from "./kehutanan.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  getSortedRowModel, 
  SortingState, 
  useReactTable, 
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Edit, RotateCw, Search, Download } from "lucide-react";
import { KehutananSummaryTable } from "./KehutananSummaryTable";
// == PERBAIKAN: Impor KehutananForm yang hilang ada di sini ==
import { KehutananForm } from "./KehutananForm";
import { toast } from "sonner";


interface KehutananClientProps {
  initialData: PerusahaanKehutanan[];
  userRole: string | null;
  userSatkerId: string | null;
}

const getStatusBadgeVariant = (status: string | null): "default" | "destructive" | "outline" | "secondary" => {
    if (!status) return "default";
    switch (status) {
        case 'Aktif Berproduksi':
            return 'default'; 
        case 'Tutup':
        case 'Alih Subsektor (Nonkehutanan)':
            return 'destructive';
        case 'Tutup Sementara':
        case 'Tidak Bersedia Diwawancarai':
            return 'secondary';
        case 'Tidak Ditemukan':
        case 'Tidak/Belum Produksi':
            return 'outline';
        default:
            return 'default';
    }
}


export function KehutananClient({ initialData, userRole, userSatkerId }: KehutananClientProps) {
  const [data, setData] = React.useState(initialData);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedPerusahaan, setSelectedPerusahaan] = React.useState<PerusahaanKehutanan | null>(null);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const kabupatenOptions = React.useMemo(() => {
    const uniqueKabupatens = new Map<string, string>();
    data.forEach(p => {
      if (p.kode_kab && p.kabupaten) {
        uniqueKabupatens.set(p.kode_kab, p.kabupaten);
      }
    });

    const sortedKabupatens = Array.from(uniqueKabupatens.entries())
      .sort((a, b) => a[0].localeCompare(b[0]));

    return sortedKabupatens.map(entry => entry[1]);
  }, [data]);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const newData = await getKehutananData();
      setData(newData);
      toast.success("Data berhasil diperbarui.");
    } catch (e) {
      toast.error("Gagal me-refresh data", { description: (e as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (perusahaan: PerusahaanKehutanan) => {
    setSelectedPerusahaan(perusahaan);
    setIsFormOpen(true);
  };

  const columns = React.useMemo<ColumnDef<PerusahaanKehutanan>[]>(() => [
    { accessorKey: "nama_perusahaan", header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Nama Perusahaan<ArrowUpDown className="ml-2 h-4 w-4" /></Button>, size: 250 },
    { accessorKey: "alamat_lengkap", header: "Alamat", cell: ({ row }) => <div className="truncate max-w-[250px]" title={row.original.alamat_lengkap || ""}>{row.original.alamat_lengkap}</div>, size: 280 },
    { accessorKey: "kabupaten", header: "Kabupaten", size: 150 },
    { 
      accessorKey: "status_perusahaan", 
      header: "Status", 
      size: 180,
      cell: ({ row }) => {
        const status = row.original.status_perusahaan;
        if (!status) return "-";
        const variant = getStatusBadgeVariant(status);
        const style = status === 'Aktif Berproduksi' ? { backgroundColor: '#22c55e', color: 'white' } : {};
        return <Badge variant={variant} style={style} className="text-xs">{status}</Badge>
      }
    },
    { accessorKey: "user_modified", header: "Terakhir Diubah Oleh", size: 150 },
    { accessorKey: "date_modified", header: "Tanggal Diubah", cell: ({ row }) => row.original.date_modified ? new Date(row.original.date_modified).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-', size: 150 },
    { 
      id: "actions",
      cell: ({ row }) => {
        const perusahaan = row.original;
        const canEdit = userRole === 'super_admin' || (userSatkerId && userSatkerId === perusahaan.kode_kab);
        if (!canEdit) return <div className="w-[48px] h-[36px]"></div>;
        return (<div className="text-center"><Button variant="ghost" size="sm" onClick={() => handleEdit(perusahaan)}><Edit className="h-4 w-4" /></Button></div>);
      },
      size: 60
    },
  ], [userRole, userSatkerId]);

  const table = useReactTable({
    data: data || [],
    columns, 
    getCoreRowModel: getCoreRowModel(), 
    getSortedRowModel: getSortedRowModel(), 
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting, 
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: { 
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const handleExport = () => {
    const rowsToExport = table.getFilteredRowModel().rows;
    if (rowsToExport.length === 0) {
      toast.warning("Tidak ada data untuk diekspor.");
      return;
    }

    const dataToExport = rowsToExport.map(row => ({
      "Nama Perusahaan": row.original.nama_perusahaan,
      "Alamat Lengkap": row.original.alamat_lengkap,
      "Kabupaten": row.original.kabupaten,
      "Status": row.original.status_perusahaan,
      "Keterangan": row.original.keterangan,
      "Terakhir Diubah Oleh": row.original.user_modified,
      "Tanggal Diubah": row.original.date_modified 
        ? new Date(row.original.date_modified).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) 
        : '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Perusahaan Kehutanan");

    worksheet["!cols"] = [
      { wch: 40 }, { wch: 50 }, { wch: 20 }, { wch: 25 }, { wch: 40 }, { wch: 25 }, { wch: 20 },
    ];

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const today = new Date().toISOString().slice(0, 10);
    saveAs(blob, `Data_Perusahaan_Kehutanan_${today}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row justify-between items-start gap-2'>
            <div>
              <CardTitle>Direktori Perusahaan Kehutanan</CardTitle>
              <CardDescription>Daftar perusahaan kehutanan yang terdata. Gunakan filter dan pencarian untuk mempermudah.</CardDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Ekspor
              </Button>
              <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
                <RotateCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama perusahaan..."
                value={globalFilter ?? ''}
                onChange={e => setGlobalFilter(e.target.value)}
                className="pl-8 w-full md:w-[300px]"
              />
            </div>
            <Select
              value={(table.getColumn('kabupaten')?.getFilterValue() as string) ?? 'all'}
              onValueChange={value => {
                table.getColumn('kabupaten')?.setFilterValue(value === 'all' ? '' : value)
              }}
            >
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[200px]">
                <SelectValue placeholder="Filter Kabupaten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kabupaten</SelectItem>
                {kabupatenOptions.map(kab => (
                  <SelectItem key={kab} value={kab}>{kab}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(hg => (
                  <TableRow key={hg.id}>
                    {hg.headers.map(h => <TableHead key={h.id} style={{ width: h.getSize() }}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">{isLoading ? 'Memuat data...' : 'Tidak ada data.'}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Sebelumnya</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Berikutnya</Button>
          </div>
        </CardContent>
      </Card>
      
      <KehutananSummaryTable data={data} />

      <KehutananForm 
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        perusahaan={selectedPerusahaan}
        onSuccess={() => {
          setIsFormOpen(false);
          refreshData();
        }}
      />
    </div>
  );
}