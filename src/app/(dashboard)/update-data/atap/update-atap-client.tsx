// Lokasi File: src/app/(dashboard)/update-data/atap/update-atap-client.tsx (FILE BARU)

"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal } from "lucide-react";
import { AtapUploader } from "./atap-uploader";
import { type LastUpdateData } from "./page"; // Impor tipe dari file page.tsx
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { SwipeIndicator } from "@/components/ui/swipe-indicator";

// Helper untuk memformat teks riwayat
function formatUpdateText(updateData: { uploaded_at: string | null; uploaded_by_username: string | null; } | null, dataType: string): string {
    if (!updateData || !updateData.uploaded_at) {
        return `Belum ada riwayat pembaruan untuk ${dataType}.`;
    }
    try {
        const date = new Date(updateData.uploaded_at);
        const formattedDate = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Pontianak' });
        return `Terakhir diperbarui oleh ${updateData.uploaded_by_username || 'Tidak diketahui'} pada ${formattedDate}, pukul ${formattedTime} WIB.`;
    } catch {
        return "Gagal memformat tanggal riwayat.";
    }
}

interface UpdateAtapClientProps {
  lastUpdateData: LastUpdateData;
}

export function UpdateAtapClient({ lastUpdateData }: UpdateAtapClientProps) {
  const [activeTab, setActiveTab] = useState("bulanan_kab");
  const containerRef = useRef<HTMLDivElement>(null);
  
  const tabs = [
    { value: "bulanan_kab", label: "Bulanan Kab/Kota" },
    { value: "tahunan_kab", label: "Tahunan Kab/Kota" },
    { value: "bulanan_prov", label: "Bulanan Provinsi" },
    { value: "tahunan_prov", label: "Tahunan Provinsi" }
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
      {/* --- JUDUL DAN DESKRIPSI HALAMAN --- */}
      <div>
        <h1 className="text-2xl font-bold">Pembaruan Data ATAP</h1>
        <p className="text-muted-foreground">
          Unggah file Excel untuk memperbarui data Administrasi Tahapan Produksi (ATAP) untuk berbagai level dan periode. 
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
              <CardTitle>Data Bulanan Kabupaten/Kota</CardTitle>
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
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{formatUpdateText(lastUpdateData.bulananKab, "data bulanan kabupaten")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tahunan_kab" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Data Tahunan Kabupaten/Kota</CardTitle>
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
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{formatUpdateText(lastUpdateData.tahunanKab, "data tahunan kabupaten")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulanan_prov" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Data Bulanan Provinsi</CardTitle>
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
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{formatUpdateText(lastUpdateData.bulananProv, "data bulanan provinsi")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tahunan_prov" className="mt-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Data Tahunan Provinsi</CardTitle>
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
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{formatUpdateText(lastUpdateData.tahunanProv, "data tahunan provinsi")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}