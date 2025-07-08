// Lokasi: src/app/(dashboard)/update-data/ksa/update-ksa-client.tsx (FILE BARU)

"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KsaUploader } from "./ksa-uploader";
import { Terminal } from "lucide-react";
import { type LastUpdateInfo } from "./page"; // Impor tipe dari page.tsx
import { uploadKsaAction, uploadKsaJagungAction } from "./_actions";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { SwipeIndicator } from "@/components/ui/swipe-indicator";

// Helper format tanggal kita pindahkan ke client component
function formatUpdateText(updateData: LastUpdateInfo, commodity: string): string {
    if (!updateData || !updateData.uploaded_at) {
        return `Belum ada riwayat pembaruan data KSA ${commodity}.`;
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
    lastPadiUpdate: LastUpdateInfo;
    lastJagungUpdate: LastUpdateInfo;
}

export function UpdateKsaClient({ lastPadiUpdate, lastJagungUpdate }: UpdateKsaClientProps) {
    const [activeTab, setActiveTab] = useState("padi");
    const containerRef = useRef<HTMLDivElement>(null);
    
    const tabs = [
        { value: "padi", label: "KSA Padi" },
        { value: "jagung", label: "KSA Jagung" }
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
        <div className="space-y-6">
            {/* --- JUDUL DAN DESKRIPSI HALAMAN STANDAR --- */}
            <div>
                <h1 className="text-2xl font-bold">Update Data Amatan KSA</h1>
                <p className="text-muted-foreground">
                    Unggah file Excel (.xlsx) berisi data amatan KSA Padi atau KSA Jagung.
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
                
                {/* --- TABS UNTUK KSA PADI DAN KSA JAGUNG --- */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="padi">KSA Padi</TabsTrigger>
                        <TabsTrigger value="jagung">KSA Jagung</TabsTrigger>
                    </TabsList>

                {/* --- KONTEN TAB PADI --- */}
                <TabsContent value="padi" className="space-y-4 mt-4">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Unggah Data KSA Padi</CardTitle>
                            <CardDescription>
                                Proses ini akan mengganti data KSA Padi berdasarkan Tahun, Bulan, dan Kabupaten.
                                Header yang diharapkan: id segmen, subsegmen, nama, n-3, n-2, n-1, n, amatan, status, evaluasi, tanggal, flag kode 12, note
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <KsaUploader 
                                uploadAction={uploadKsaAction}
                                templateFileUrl="/templates/template_ksa_padi.xlsx"
                                templateFileName="template_ksa_padi.xlsx"
                            />
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center">
                                <Terminal className="mr-2 h-5 w-5 text-primary" />
                                Riwayat Pembaruan Terakhir (Padi)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {formatUpdateText(lastPadiUpdate, 'Padi')}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- KONTEN TAB JAGUNG --- */}
                <TabsContent value="jagung" className="space-y-4 mt-4">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Unggah Data KSA Jagung</CardTitle>
                            <CardDescription>
                                Proses ini akan mengganti data KSA Jagung berdasarkan Tahun, Bulan, dan Kabupaten.
                                Header yang diharapkan: ID, ID Segmen, Subsegmen, PCS, N, Amatan, Status, Evaluasi, Tanggal, Kode 98
                                <br />
                                <span className="text-sm text-muted-foreground mt-1 block">
                                    <strong>Catatan:</strong> Kolom N-1, N-2, N-3 (jika ada) akan diabaikan dalam processing. Hanya kolom N yang diproses.
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <KsaUploader 
                                uploadAction={uploadKsaJagungAction}
                                templateFileUrl="/templates/template_ksa_jagung.xlsx"
                                templateFileName="template_ksa_jagung.xlsx"
                            />
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center">
                                <Terminal className="mr-2 h-5 w-5 text-primary" />
                                Riwayat Pembaruan Terakhir (Jagung)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {formatUpdateText(lastJagungUpdate, 'Jagung')}
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}