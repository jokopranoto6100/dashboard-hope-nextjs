// src/hooks/useSimtpKpiData.ts
"use client";

import { useState, useEffect } from "react";
import { getSimtpKpiData, SimtpKpiData } from "@/app/(dashboard)/_actions/getSimtpKpiAction";

export function useSimtpKpiData() {
  const [data, setData] = useState<SimtpKpiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getSimtpKpiData();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Dijalankan sekali saat komponen dimuat

  return { data, isLoading, error };
}