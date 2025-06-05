// src/app/(dashboard)/update-data/ubinan/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploaderClientComponent } from "./uploader-client-component";
import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // BARU
import { Terminal, UserCircle, CalendarClock, Info } from "lucide-react"; // BARU: Ikon

// Fungsi untuk mengambil informasi pembaruan terakhir
async function getLastUpdateInfo() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data, error } = await supabase
    .from('ubinan_raw')
    .select('uploaded_at, uploaded_by_username')
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching last update info:", error.message);
    return null;
  }
  return data;
}

export default async function UpdateUbinanRawPage() {
  const cookieStore = await cookies();
  const supabaseAuth = await createSupabaseServerClientWithUserContext(cookieStore);
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (user?.user_metadata?.role !== 'super_admin') {
    // console.warn("Akses ditolak untuk UpdateUbinanRawPage, pengguna bukan super_admin.");
    // notFound();
    // Atau tampilkan komponen 'Unauthorized'
    // Untuk pengembangan, kita bisa biarkan lolos sementara atau return pesan
    // return <p>Akses ditolak. Hanya Super Admin.</p>;
  }

  const lastUpdate = await getLastUpdateInfo();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8"> {/* Sedikit penyesuaian gap */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Update Data Ubinan (Raw)</CardTitle> {/* Ukuran font sedikit lebih besar */}
          <CardDescription>
            Unggah file CSV untuk memperbarui data mentah ubinan. Pastikan format file CSV Anda sudah sesuai.
            Data yang ada dengan Tahun, Subround, dan Kabupaten/Kota yang sama akan dihapus dan digantikan dengan data dari file ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploaderClientComponent />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"> {/* Ukuran font & flex untuk ikon */}
            <Terminal className="mr-2 h-6 w-6 text-primary" /> {/* Ikon Terminal */}
            Riwayat Pembaruan Terakhir
          </CardTitle>
          <CardDescription>
            Informasi mengenai unggahan data terakhir ke tabel ubinan mentah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lastUpdate && lastUpdate.uploaded_at ? (
            <Alert variant="default" className="bg-slate-50 dark:bg-slate-800"> {/* Menggunakan Alert untuk tampilan berbeda */}
              {/* <Info className="h-4 w-4" /> */}
              {/* <AlertTitle className="font-semibold">Detail Pembaruan</AlertTitle> */}
              <AlertDescription className="space-y-2 text-sm">
                <div className="flex items-center">
                  <UserCircle className="mr-2 h-5 w-5 text-sky-600" />
                  <span>
                    Diperbarui oleh: <strong className="font-medium">{lastUpdate.uploaded_by_username || 'Tidak diketahui'}</strong>
                  </span>
                </div>
                <div className="flex items-center">
                  <CalendarClock className="mr-2 h-5 w-5 text-sky-600" />
                  <span>
                    Pada tanggal: <strong className="font-medium">
                      {new Date(lastUpdate.uploaded_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>, pukul <strong className="font-medium">
                      {new Date(lastUpdate.uploaded_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })} WIB
                    </strong>
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700"> {/* Alert untuk info belum ada data */}
              <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <AlertTitle className="font-semibold text-yellow-700 dark:text-yellow-300">Informasi</AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-500">
                Belum ada riwayat pembaruan data yang tercatat.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}