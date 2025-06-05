// src/app/(dashboard)/update-data/ubinan/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; //
import { UploaderClientComponent } from "./uploader-client-component"; // Kita akan buat komponen ini

export default function UpdateUbinanRawPage() {
  // Di sini Anda bisa menambahkan logika untuk proteksi peran jika diperlukan di level server component,
  // meskipun middleware sudah menjadi garda utama.
  // Contoh:
  // const { data: { user } } = await supabaseServer().auth.getUser(); // Menggunakan helper supabase-server
  // const userRole = user?.user_metadata?.role;
  // if (userRole !== 'super_admin') {
  //   notFound(); // atau redirect, atau tampilkan pesan "Unauthorized"
  // }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Update Data Ubinan (Raw)</CardTitle>
          <CardDescription>
            Unggah file CSV untuk memperbarui data mentah ubinan. Pastikan format file CSV Anda sudah sesuai.
            Data yang ada dengan Tahun, Subround, Kabupaten/Kota, dan Komoditas yang sama akan dihapus dan digantikan dengan data dari file ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Komponen client untuk menangani state upload file dan interaksi */}
          <UploaderClientComponent />
        </CardContent>
      </Card>

      {/* Di sini nanti bisa ditambahkan Card untuk menampilkan log histori update */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pembaruan Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {/* Contoh statis, nanti kita buat dinamis */}
            Data terakhir diperbarui oleh: - pada: -
          </p>
          {/* Di sini bisa ditambahkan tabel log jika diperlukan */}
        </CardContent>
      </Card>
    </div>
  );
}