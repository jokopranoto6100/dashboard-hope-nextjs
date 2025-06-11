// Lokasi: src/app/(dashboard)/evaluasi/ksa/page.tsx

import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KsaEvaluasiFilterProvider } from "@/context/KsaEvaluasiFilterContext";
import { EvaluasiKsaClient } from "./evaluasi-ksa-client"; // Komponen ini akan kita buat selanjutnya

export default async function EvaluasiKsaPage() {

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl">Evaluasi Survei Kerangka Sampel Area (KSA)</CardTitle>
                <CardDescription>
                    Analisis visual untuk data amatan lapangan KSA. Gunakan filter di bawah untuk menyesuaikan data yang ditampilkan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Membungkus komponen client dengan Provider agar bisa mengakses state filter */}
                <KsaEvaluasiFilterProvider>
                    <EvaluasiKsaClient />
                </KsaEvaluasiFilterProvider>
            </CardContent>
        </Card>
    </div>
  );
}