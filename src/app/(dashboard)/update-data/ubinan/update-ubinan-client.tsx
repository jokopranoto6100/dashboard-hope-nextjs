// Lokasi: src/app/(dashboard)/update-data/ubinan/update-ubinan-client.tsx (FILE BARU)

"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploaderClientComponent } from "./uploader-client-component";
import { MasterSampleUploader } from "./master-sample-uploader"; 
import { Terminal } from "lucide-react";
import { type LastUbinanUpdateData } from "./page"; // Impor tipe dari page.tsx
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { SwipeIndicator } from "@/components/ui/swipe-indicator";

// Helper untuk format tanggal kita pindahkan ke sini karena digunakan oleh JSX di client
function formatUpdateText(updateData: { uploaded_at: string | null; uploaded_by_username: string | null; } | null): string {
    if (!updateData || !updateData.uploaded_at) {
        return 'Belum ada riwayat pembaruan.';
    }
    try {
        const date = new Date(updateData.uploaded_at);
        const formattedDate = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Pontianak' });
        return `Diperbarui oleh ${updateData.uploaded_by_username || 'Tidak diketahui'} pada ${formattedDate}, pukul ${formattedTime} WIB.`;
    } catch {
        return "Gagal memformat tanggal.";
    }
}

interface UpdateUbinanClientProps {
  lastUpdateData: LastUbinanUpdateData;
}

export function UpdateUbinanClient({ lastUpdateData }: UpdateUbinanClientProps) {
  const [activeTab, setActiveTab] = useState("data_raw");
  const containerRef = useRef<HTMLDivElement>(null);
  
  const tabs = [
    { value: "data_raw", label: "Raw Ubinan" },
    { value: "master_sampel", label: "Master Sampel (iFrame)" }
  ];

  const { bindToElement, swipeProgress } = useSwipeGesture({
    onSwipeLeft: () => {
      const currentIndex = tabs.findIndex(tab => tab.value === activeTab);
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1].value);
      }
    },
    onSwipeRight: () => {
      const currentIndex = tabs.findIndex(tab => tab.value === activeTab);
      if (currentIndex > 0) {
        setActiveTab(tabs[currentIndex - 1].value);
      }
    },
    threshold: 50,
    velocityThreshold: 0.3,
    minSwipeDistance: 30
  });

  useEffect(() => {
    const cleanup = bindToElement(containerRef.current);
    return cleanup;
  }, [bindToElement]);

  return (
    <div className="space-y-4">
      {/* --- JUDUL DAN DESKRIPSI HALAMAN STANDAR --- */}
      <div>
        <h1 className="text-2xl font-bold">Pembaruan Data Ubinan</h1>
        <p className="text-muted-foreground">
          Impor raw data atau perbarui data master sampel ubinan melalui halaman ini.
          <span className="hidden sm:inline"> Geser ke kiri/kanan untuk berpindah tab.</span>
        </p>
      </div>

      <div ref={containerRef} className="relative">
        <SwipeIndicator 
          direction={swipeProgress.deltaX > 0 ? 'right' : 'left'} 
          isVisible={swipeProgress.progress > 0} 
          progress={swipeProgress.progress}
          showProgress={true}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 shadow-sm">
            <TabsTrigger value="data_raw">Raw Ubinan</TabsTrigger>
            <TabsTrigger value="master_sampel">Master Sampel (iFrame)</TabsTrigger>
          </TabsList>
        
        <TabsContent value="data_raw" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Update Raw Data Ubinan</CardTitle>
              <CardDescription>
                Unggah file CSV untuk memperbarui raw data ubinan. Proses ini akan menghapus data lama berdasarkan Tahun, Subround, dan Kabupaten/Kota.
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
                  {formatUpdateText(lastUpdateData.raw)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="master_sampel" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Update Master Sampel Ubinan</CardTitle>
              <CardDescription>
                Unggah satu atau beberapa file Excel (.xlsx) berisi data master sampel. Proses ini akan menambahkan data baru atau memperbarui data yang sudah ada (upsert).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MasterSampleUploader />
               <div className="mt-8 border-t pt-6">
                <h4 className="text-md flex items-center font-semibold text-muted-foreground">
                    <Terminal className="mr-2 h-5 w-5" />
                    Riwayat Pembaruan Terakhir (Master Sampel)
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {formatUpdateText(lastUpdateData.master)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}