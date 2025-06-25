// Lokasi: src/app/(dashboard)/update-data/ksa/update-ksa-client.tsx (FILE BARU)

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KsaUploader } from "./ksa-uploader";
import { Terminal } from "lucide-react";
import { type LastUpdateInfo } from "./page"; // Impor tipe dari page.tsx

// Helper format tanggal kita pindahkan ke client component
function formatUpdateText(updateData: LastUpdateInfo): string {
    if (!updateData || !updateData.uploaded_at) {
        return 'Belum ada riwayat pembaruan data KSA.';
    }
    try {
        const date = new Date(updateData.uploaded_at);
        const formattedDate = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Pontianak' });
        return `Diperbarui oleh ${updateData.uploaded_by_username || 'Tidak diketahui'} pada ${formattedDate}, pukul ${formattedTime} WIB.`;
    } catch {
        return "Gagal memformat tanggal riwayat.";
    }
}

interface UpdateKsaClientProps {
    lastUpdate: LastUpdateInfo;
}

export function UpdateKsaClient({ lastUpdate }: UpdateKsaClientProps) {
    return (
        // Gunakan space-y-* untuk jarak vertikal antar elemen utama
        <div className="space-y-6">
            {/* --- JUDUL DAN DESKRIPSI HALAMAN STANDAR --- */}
            <div>
                <h1 className="text-2xl font-bold">Update Data Amatan KSA</h1>
                <p className="text-muted-foreground">
                    Unggah satu atau beberapa file Excel (.xlsx) berisi data amatan KSA.
                </p>
            </div>

            {/* --- KONTEN ASLI (KEDUA CARD) DIPINDAHKAN KE SINI --- */}
            <Card className="shadow-lg">
                <CardHeader>
                <CardTitle>Unggah Data Baru</CardTitle>
                <CardDescription>
                    Proses ini akan menghapus data yang ada berdasarkan Tahun, Bulan, dan Kabupaten, lalu menggantinya dengan data baru dari file yang diunggah.
                </CardDescription>
                </CardHeader>
                <CardContent>
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