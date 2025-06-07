// src/app/(dashboard)/update-data/ubinan/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploaderClientComponent } from "./uploader-client-component";
import { MasterSampleUploader } from "./master-sample-uploader"; 
import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { Terminal } from "lucide-react";

// Fungsi generik untuk mengambil informasi pembaruan terakhir dari tabel manapun
async function getLastUpdateInfo(tableName: 'ubinan_raw' | 'master_sampel_ubinan') {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

// Kode yang sudah diperbaiki
const { data, error } = await supabase
    .from(tableName)
    .select('uploaded_at, uploaded_by_username')
    // Filter baris yang uploaded_at nya TIDAK NULL
    .not('uploaded_at', 'is', null) 
    // Urutkan sisanya secara menurun
    .order('uploaded_at', { ascending: false }) 
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching last update info for ${tableName}:`, error.message);
    return null;
  }
  return data;
}

// Helper untuk format tanggal
function formatUpdateText(updateData: { uploaded_at: string | null; uploaded_by_username: string | null; } | null): string {
    if (!updateData || !updateData.uploaded_at) {
        return 'Belum ada riwayat pembaruan.';
    }
    try {
        const date = new Date(updateData.uploaded_at);
        const formattedDate = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `Diperbarui oleh ${updateData.uploaded_by_username || 'Tidak diketahui'} pada ${formattedDate}, pukul ${formattedTime} WIB.`;
    } catch (e) {
        return "Gagal memformat tanggal.";
    }
}

export default async function UpdateDataPage() {
  // Ambil riwayat pembaruan untuk kedua tabel secara paralel
  const [lastUpdateRaw, lastUpdateMaster] = await Promise.all([
    getLastUpdateInfo('ubinan_raw'),
    getLastUpdateInfo('master_sampel_ubinan')
  ]);

  // ... (Anda bisa menambahkan proteksi peran super_admin di sini jika perlu)

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <Tabs defaultValue="data_raw" className="w-full">
        <TabsList className="grid w-full grid-cols-2 shadow-sm">
          <TabsTrigger value="data_raw">Import Data Transaksi (Raw)</TabsTrigger>
          <TabsTrigger value="master_sampel">Import Master Sampel</TabsTrigger>
        </TabsList>
        
        {/* Konten untuk Tab 1: Import Data Ubinan Raw (yang sudah ada) */}
        <TabsContent value="data_raw" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Update Data Ubinan (Raw)</CardTitle>
              <CardDescription>
                Unggah file CSV untuk memperbarui data mentah ubinan. Proses ini akan menghapus data lama berdasarkan Tahun, Subround, dan Kabupaten/Kota.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploaderClientComponent />
              
              <div className="mt-8 border-t pt-6">
                <h4 className="text-md flex items-center font-semibold text-muted-foreground">
                    <Terminal className="mr-2 h-5 w-5" />
                    Riwayat Pembaruan Terakhir (Data Raw)
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {formatUpdateText(lastUpdateRaw)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Konten untuk Tab 2: Import Master Sampel (yang baru) */}
        <TabsContent value="master_sampel" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Update Master Sampel Ubinan</CardTitle>
              <CardDescription>
                Unggah satu atau beberapa file Excel (.xlsx) berisi data master sampel. Proses ini akan menambahkan data baru atau memperbarui data yang sudah ada (upsert).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MasterSampleUploader /> {/* Komponen baru kita */}

               <div className="mt-8 border-t pt-6">
                <h4 className="text-md flex items-center font-semibold text-muted-foreground">
                    <Terminal className="mr-2 h-5 w-5" />
                    Riwayat Pembaruan Terakhir (Master Sampel)
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {formatUpdateText(lastUpdateMaster)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}