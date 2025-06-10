// Lokasi: src/app/(dashboard)/produksi-statistik/contribution-table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

// Tipe data untuk setiap baris di tabel ini
interface ContributionTableRow {
  name: string;
  nilaiTahunIni: number;
  kontribusi: number; // Dalam persen (misal: 25.5)
  nilaiTahunLalu?: number | null;
  pertumbuhan?: number | null; // Dalam persen
}

interface ContributionTableProps {
  data: ContributionTableRow[];
}

const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

export default function ContributionTable({ data }: ContributionTableProps) {
  const hasPerbandingan = data.some(d => d.nilaiTahunLalu !== undefined);

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kabupaten/Kota</TableHead>
            <TableHead className="text-right">Kontribusi</TableHead>
            {hasPerbandingan && <TableHead className="text-right">Pertumbuhan</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-right font-mono text-sm">
                {row.kontribusi.toFixed(2)}%
              </TableCell>
              {hasPerbandingan && (
                <TableCell className="text-right">
                  {row.pertumbuhan !== null && isFinite(row.pertumbuhan!) ? (
                    <Badge
                      variant={row.pertumbuhan! >= 0 ? "default" : "destructive"}
                      className="flex items-center justify-end gap-1 text-xs w-fit ml-auto"
                    >
                      {row.pertumbuhan! >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{row.pertumbuhan!.toFixed(2)}%</span>
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}