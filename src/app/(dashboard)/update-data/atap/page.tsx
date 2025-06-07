// Lokasi File: src/app/(dashboard)/update-data/atap/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { Terminal } from "lucide-react";

// Impor komponen uploader yang telah kita buat
import { AtapUploader } from "./atap-uploader";

// Tipe untuk nama tabel yang valid
type AtapTableName = 
  | 'data_atap_bulanan_kab' 
  | 'data_atap_tahunan_kab' 
  | 'data_atap_bulanan_prov' 
  | 'data_atap_tahunan_prov';

// Fungsi generik untuk mengambil riwayat pembaruan terakhir
async function getLastUpdateInfo(tableName: AtapTableName) {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data, error } = await supabase
    .from(tableName)
    .select('uploaded_at, uploaded_by_username')
    .not('uploaded_at', 'is', null)
    .order('uploaded_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching last update info for ${tableName}:`, error.message);
    return null;
  }
  return data;
}

// Helper untuk memformat teks riwayat agar tidak mengulang kode
function formatUpdateText(updateData: { uploaded_at: string | null; uploaded_by_username: string | null; } | null, dataType: string): string {
    if (!updateData || !updateData.uploaded_at) {
        return `Belum ada riwayat pembaruan untuk ${dataType}.`;
    }
    try {
        const date = new Date(updateData.uploaded_at);
        const formattedDate = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        return `Terakhir diperbarui oleh ${updateData.uploaded_by_username || 'Tidak diketahui'} pada ${formattedDate}, pukul ${formattedTime} WIB.`;
    } catch {
        return "Gagal memformat tanggal riwayat.";
    }
}

export default async function UpdateAtapPage() {
  // Ambil semua riwayat pembaruan secara paralel untuk efisiensi
  const [lastUpdateBulananKab, lastUpdateTahunanKab, lastUpdateBulananProv, lastUpdateTahunanProv] = await Promise.all([
    getLastUpdateInfo('data_atap_bulanan_kab'),
    getLastUpdateInfo('data_atap_tahunan_kab'),
    getLastUpdateInfo('data_atap_bulanan_prov'),
    getLastUpdateInfo('data_atap_tahunan_prov')
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <Tabs defaultValue="bulanan_kab" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 shadow-sm">
          <TabsTrigger value="bulanan_kab">Bulanan Kab/Kota</TabsTrigger>
          <TabsTrigger value="tahunan_kab">Tahunan Kab/Kota</TabsTrigger>
          <TabsTrigger value="bulanan_prov">Bulanan Provinsi</TabsTrigger>
          <TabsTrigger value="tahunan_prov">Tahunan Provinsi</TabsTrigger>
        </TabsList>

        {/* --- Konten untuk setiap Tab --- */}

        <TabsContent value="bulanan_kab" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Data Bulanan Kabupaten/Kota</CardTitle>
              <CardDescription>Unggah file Excel berisi data indikator bulanan untuk semua kabupaten/kota.</CardDescription>
            </CardHeader>
            <CardContent>
              <AtapUploader 
                dataType="bulanan_kab" 
                dataTypeLabel="Data Bulanan Kabupaten"
                templateUrl="/templates/template_atap_bulanan_kab.xlsx"
                templateFileName="template_atap_bulanan_kab.xlsx"
              />
              <div className="mt-8 border-t pt-6">
                <h4 className="text-md flex items-center font-semibold text-muted-foreground"><Terminal className="mr-2 h-5 w-5" />Riwayat Pembaruan</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{formatUpdateText(lastUpdateBulananKab, "data bulanan kabupaten")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tahunan_kab" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Data Tahunan Kabupaten/Kota</CardTitle>
              <CardDescription>Unggah file Excel berisi data indikator tahunan untuk semua kabupaten/kota.</CardDescription>
            </CardHeader>
            <CardContent>
               <AtapUploader 
                dataType="tahunan_kab" 
                dataTypeLabel="Data Tahunan Kabupaten"
                templateUrl="/templates/template_atap_tahunan_kab.xlsx"
                templateFileName="template_atap_tahunan_kab.xlsx"
              />
              <div className="mt-8 border-t pt-6">
                <h4 className="text-md flex items-center font-semibold text-muted-foreground"><Terminal className="mr-2 h-5 w-5" />Riwayat Pembaruan</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{formatUpdateText(lastUpdateTahunanKab, "data tahunan kabupaten")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulanan_prov" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Data Bulanan Provinsi</CardTitle>
              <CardDescription>Unggah file Excel berisi data indikator bulanan untuk level provinsi.</CardDescription>
            </CardHeader>
            <CardContent>
               <AtapUploader 
                dataType="bulanan_prov" 
                dataTypeLabel="Data Bulanan Provinsi"
                templateUrl="/templates/template_atap_bulanan_prov.xlsx"
                templateFileName="template_atap_bulanan_prov.xlsx"
              />
              <div className="mt-8 border-t pt-6">
                <h4 className="text-md flex items-center font-semibold text-muted-foreground"><Terminal className="mr-2 h-5 w-5" />Riwayat Pembaruan</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{formatUpdateText(lastUpdateBulananProv, "data bulanan provinsi")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tahunan_prov" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Data Tahunan Provinsi</CardTitle>
              <CardDescription>Unggah file Excel berisi data indikator tahunan untuk level provinsi.</CardDescription>
            </CardHeader>
            <CardContent>
               <AtapUploader 
                dataType="tahunan_prov"
                dataTypeLabel="Data Tahunan Provinsi"
                templateUrl="/templates/template_atap_tahunan_prov.xlsx"
                templateFileName="template_atap_tahunan_prov.xlsx"
              />
              <div className="mt-8 border-t pt-6">
                <h4 className="text-md flex items-center font-semibold text-muted-foreground"><Terminal className="mr-2 h-5 w-5" />Riwayat Pembaruan</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{formatUpdateText(lastUpdateTahunanProv, "data tahunan provinsi")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}