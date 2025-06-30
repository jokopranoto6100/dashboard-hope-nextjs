"use client";

import { useState, useEffect, useCallback } from "react";
import { getKehutananData } from "@/app/(dashboard)/monitoring/kehutanan/_actions";
import { PerusahaanKehutanan } from "@/app/(dashboard)/monitoring/kehutanan/kehutanan.types";
import { toast } from "sonner";

export function useKehutananData() {
    const [data, setData] = useState<PerusahaanKehutanan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getKehutananData();
            setData(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui";
            setError(errorMessage);
            toast.error("Gagal memuat data", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, isLoading, error, refreshData: fetchData };
}