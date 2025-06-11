// Lokasi: src/app/(dashboard)/evaluasi/ksa/DetailKsaModalContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useYear } from "@/context/YearContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyHarvestDisplay } from "./MonthlyHarvestDisplay";
import { NoDataDisplay } from "./evaluasi-ksa-client"; // Impor komponen NoDataDisplay

interface DetailProps {
  kabupaten: string;
}

interface SubsegmenDetail {
    id_subsegmen: string;
    jumlah_panen: number;
    bulan_panen: number[];
}

export function DetailKsaModalContent({ kabupaten }: DetailProps) {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const [data, setData] = useState<SubsegmenDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!kabupaten || !selectedYear) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data: detailData, error: rpcError } = await supabase.rpc('get_ksa_subsegmen_detail', {
          p_year: selectedYear,
          p_kabupaten: kabupaten
        });

        if (rpcError) throw rpcError;

        setData(detailData || []);
      } catch (err: any) {
        setError("Gagal memuat rincian subsegmen.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [kabupaten, selectedYear, supabase]);


  if (isLoading) {
    return (
      <div className="space-y-2 py-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center py-8">{error}</p>;
  }

  if (data.length === 0) {
    return <NoDataDisplay message="Tidak ada data panen untuk kabupaten ini."/>
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto pr-4">
        <Table>
            <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                    <TableHead>ID Subsegmen</TableHead>
                    <TableHead className="text-center">Jumlah Panen</TableHead>
                    <TableHead>Jadwal Panen Bulanan</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((item) => (
                    <TableRow key={item.id_subsegmen}>
                        <TableCell className="font-mono">{item.id_subsegmen}</TableCell>
                        <TableCell className="text-center font-bold">{item.jumlah_panen}x</TableCell>
                        <TableCell>
                            <MonthlyHarvestDisplay harvestMonths={item.bulan_panen} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
  );
}
