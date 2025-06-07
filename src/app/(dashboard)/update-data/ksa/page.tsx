// Lokasi File: src/app/(dashboard)/update-data/ksa/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KsaUploader } from "./ksa-uploader";
import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { Terminal } from "lucide-react";

// Fungsi untuk mengambil informasi pembaruan terakhir khusus untuk tabel ksa_amatan
async function getLastKsaUpdateInfo() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

// Kode yang sudah diperbaiki
const { data, error } = await supabase
    .from('ksa_amatan')
    .select('uploaded_at, uploaded_by_username')
    // Filter baris yang uploaded_at nya TIDAK NULL
    .not('uploaded_at', 'is', null) 
    // Urutkan sisanya secara menurun
    .order('uploaded_at', { ascending: false }) 
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching last KSA update info:", error.message);
    return null;
  }
  return data;
}

// Helper untuk format tanggal
function formatUpdateText(updateData: { uploaded_at: string | null; uploaded_by_username: string | null; } | null): string {
    if (!updateData || !updateData.uploaded_at) {
        return 'Belum ada riwayat pembaruan data KSA.';
    }
    try {
        const date = new Date(updateData.uploaded_at);
        const formattedDate = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `Diperbarui oleh ${updateData.uploaded_by_username || 'Tidak diketahui'} pada ${formattedDate}, pukul ${formattedTime} WIB.`;
    } catch (e) {
        return "Gagal memformat tanggal riwayat.";
    }
}

export default async function KsaUpdatePage() {
    console.log("Rendering KsaUpdatePage at:", new Date().toLocaleTimeString()); // Tambahkan log ini
    const lastUpdate = await getLastKsaUpdateInfo();
    console.log("Last update data fetched:", lastUpdate); // Tambahkan log ini
  
  // Proteksi peran super_admin bisa ditambahkan di sini jika perlu,
  // tapi idealnya sudah ditangani oleh middleware.

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Update Data Amatan KSA</CardTitle>
          <CardDescription>
            Unggah satu atau beberapa file Excel (.xlsx) berisi data amatan KSA. Proses ini akan menghapus data yang ada berdasarkan Tahun, Bulan, dan Kabupaten, lalu menggantinya dengan data baru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Merender komponen uploader yang sudah kita buat */}
          <KsaUploader />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Terminal className="mr-2 h-6 w-6 text-primary" />
            Riwayat Pembaruan Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {formatUpdateText(lastUpdate)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}