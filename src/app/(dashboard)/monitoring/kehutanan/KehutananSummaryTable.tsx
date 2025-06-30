"use client";

import * as React from 'react';
import { PerusahaanKehutanan, StatusPerusahaan, ALL_STATUSES } from './kehutanan.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";

// Tipe data untuk baris rekapitulasi
interface SummaryRow {
  kode_kab: string;
  kabupaten: string;
  counts: { [key in StatusPerusahaan]: number };
  total: number;
}

// Tipe data untuk baris Grand Total
type GrandTotal = Omit<SummaryRow, 'kode_kab' | 'kabupaten'>;

const STATUS_ORDER = ALL_STATUSES;

export function KehutananSummaryTable({ data }: { data: PerusahaanKehutanan[] }) {
    
    // Logika untuk agregasi data (tidak berubah)
    const { summaryData, grandTotal } = React.useMemo(() => {
        const aggregation = new Map<string, { kabupaten: string; counts: { [key in StatusPerusahaan]: number }; total: number }>();

        data.forEach(p => {
            if (!p.kode_kab || !p.kabupaten) return;

            if (!aggregation.has(p.kode_kab)) {
                aggregation.set(p.kode_kab, {
                    kabupaten: p.kabupaten,
                    counts: Object.fromEntries(STATUS_ORDER.map(s => [s, 0])) as { [key in StatusPerusahaan]: number },
                    total: 0,
                });
            }

            const entry = aggregation.get(p.kode_kab)!;
            if (p.status_perusahaan && STATUS_ORDER.includes(p.status_perusahaan)) {
                entry.counts[p.status_perusahaan]++;
            }
            entry.total++;
        });

        const summaryData: SummaryRow[] = Array.from(aggregation.entries())
            .map(([kode_kab, value]) => ({ kode_kab, ...value }))
            .sort((a, b) => a.kode_kab.localeCompare(b.kode_kab));
            
        const grandTotal: GrandTotal = {
            counts: Object.fromEntries(STATUS_ORDER.map(s => [s, 0])) as { [key in StatusPerusahaan]: number },
            total: 0,
        };
        summaryData.forEach(row => {
            STATUS_ORDER.forEach(status => {
                grandTotal.counts[status] += row.counts[status];
            });
            grandTotal.total += row.total;
        });

        return { summaryData, grandTotal };

    }, [data]);

    // Konfigurasi kolom yang deklaratif
    const tableColumns = React.useMemo(() => {
        const kabupatenColumn = {
            id: 'kabupaten',
            header: 'Kabupaten/Kota',
            cell: (row: SummaryRow) => (
                <TableCell key={row.kode_kab + '_kab'} className="font-medium sticky left-0 bg-background shadow-[5px_0_5px_-5px_rgba(0,0,0,0.1)]">
                    {row.kabupaten}
                </TableCell>
            ),
            // == PERUBAHAN 1: Ubah teks "Grand Total" menjadi "Kalimantan Barat" dan hapus text-lg ==
            footerCell: () => (
                <TableCell key="total_kab" className="font-bold sticky left-0 bg-background shadow-[5px_0_5px_-5px_rgba(0,0,0,0.1)]">
                    Kalimantan Barat
                </TableCell>
            ),
        };

        const statusColumns = STATUS_ORDER.map(status => ({
            id: status,
            header: status,
            cell: (row: SummaryRow) => (
                <TableCell key={row.kode_kab + '_' + status} className="text-center">{row.counts[status]}</TableCell>
            ),
            // == PERUBAHAN 2: Hapus text-lg dari semua sel footer ==
            footerCell: (totals: GrandTotal) => (
                <TableCell key={'total_' + status} className="font-bold text-center">{totals.counts[status]}</TableCell>
            ),
        }));

        const totalColumn = {
            id: 'total',
            header: 'Total',
            cell: (row: SummaryRow) => (
                <TableCell key={row.kode_kab + '_total'} className="font-bold text-center">{row.total}</TableCell>
            ),
            // == PERUBAHAN 2: Hapus text-lg dari semua sel footer ==
            footerCell: (totals: GrandTotal) => (
                <TableCell key="total_total" className="font-bold text-center">{totals.total}</TableCell>
            ),
        };
        
        return [kabupatenColumn, ...statusColumns, totalColumn];
    }, []);

    if (data.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rekapitulasi per Kabupaten</CardTitle>
                <CardDescription>Jumlah perusahaan berdasarkan status di setiap kabupaten/kota.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {tableColumns.map(col => (
                                    <TableHead key={col.id} className={col.id === 'kabupaten' ? 'sticky left-0 bg-background z-10' : 'text-center'}>
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summaryData.map((row) => (
                                <TableRow key={row.kode_kab}>
                                    {tableColumns.map(col => col.cell(row))}
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow className="bg-muted/50 hover:bg-muted">
                                {tableColumns.map(col => col.footerCell(grandTotal))}
                            </TableRow>
                        </TableFooter>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}