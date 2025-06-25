// Lokasi: src/app/(dashboard)/evaluasi/ksa/page.tsx (REKOMENDASI)

import { KsaEvaluasiFilterProvider } from "@/context/KsaEvaluasiFilterContext";
import { EvaluasiKsaClient } from "./evaluasi-ksa-client";

export default async function EvaluasiKsaPage() {
  return (
    // Langsung render Provider dan Client tanpa Card dan padding tambahan
    // Padding utama akan diatur oleh layout dashboard Anda
    <KsaEvaluasiFilterProvider>
        <EvaluasiKsaClient />
    </KsaEvaluasiFilterProvider>
  );
}