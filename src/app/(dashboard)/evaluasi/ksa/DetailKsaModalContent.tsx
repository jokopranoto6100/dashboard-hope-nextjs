// Lokasi: src/app/(dashboard)/evaluasi/ksa/DetailKsaModalContent.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useYear } from "@/context/YearContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MonthlyHarvestDisplay } from "./MonthlyHarvestDisplay";
import { NoDataDisplay } from "./evaluasi-ksa-client";

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
  const [searchTerm, setSearchTerm] = useState("");

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
      } catch (err: unknown) {
        setError("Gagal memuat rincian subsegmen.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [kabupaten, selectedYear, supabase]);

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return data;
    }
    return data.filter(item => 
      item.id_subsegmen.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-2 py-4">
        <Skeleton className="h-10 w-1/3" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center py-8">{error}</p>;
  }
  
  return (
    <div className="grid grid-rows-[auto_1fr] gap-4 h-[60vh] md:h-[65vh]">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                type="text"
                placeholder="Cari berdasarkan ID Subsegmen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
            />
        </div>

        <div className="overflow-y-auto pr-1 md:pr-2">
            {filteredData.length === 0 ? (
                <NoDataDisplay message={searchTerm ? "Subsegmen tidak ditemukan." : "Tidak ada data panen untuk kabupaten ini."}/>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background/95 backdrop-blur-sm">
                            <TableRow>
                                <TableHead className="w-[140px] md:w-[200px] text-xs md:text-sm">ID Subsegmen</TableHead>
                                <TableHead className="text-center text-xs md:text-sm">Jumlah Panen</TableHead>
                                <TableHead className="text-xs md:text-sm">Jadwal Panen Bulanan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((item) => (
                                <TableRow key={item.id_subsegmen}>
                                    <TableCell className="font-mono text-xs md:text-sm">{item.id_subsegmen}</TableCell>
                                    <TableCell className="text-center font-bold text-xs md:text-sm">{item.jumlah_panen}x</TableCell>
                                    <TableCell>
                                        <MonthlyHarvestDisplay harvestMonths={item.bulan_panen} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    </div>
  );
}
