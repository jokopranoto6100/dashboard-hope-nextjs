// src/app/(dashboard)/page.tsx
"use client";

import * as React from "react";
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { useYear } from '@/context/YearContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData, PalawijaDataRow } from '@/hooks/usePalawijaMonitoringData'; // Import hook dan tipe Palawija
import { Skeleton } from "@/components/ui/skeleton";
import { getPercentageBadgeClass } from "@/lib/utils"; 
import { CheckCircle2 } from "lucide-react"; 

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Interface ini bisa digunakan untuk kedua jenis data (Padi & Palawija)
// dengan asumsi 'target' pada Palawija serupa dengan 'targetUtama' pada Padi untuk ringkasan ini.
interface KabupatenRingkasan {
  nmkab: string;
  realisasi: number;
  target: number; // Menggunakan 'target' yang lebih generik
  persentase: string | number;
}

export default function HomePage() {
  const supabase = createClientComponentSupabaseClient();
  const { selectedYear } = useYear();

  const [userData, setUserData] = React.useState<UserData[] | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [errorUser, setErrorUser] = React.useState<string | null>(null);

  const ubinanSubround = 'all'; // Digunakan untuk Padi dan Palawija

  // Data Padi
  const {
    processedPadiData,
    padiTotals,
    loadingPadi,
    errorPadi,
    lastUpdate
  } = usePadiMonitoringData(selectedYear, ubinanSubround);

  // Data Palawija
  const {
    processedPalawijaData, // Nama variabel ini sudah sesuai dari hook Anda
    palawijaTotals,
    loadingPalawija,
    errorPalawija,
    lastUpdatePalawija
  } = usePalawijaMonitoringData(selectedYear, ubinanSubround);


  React.useEffect(() => {
    const fetchUserData = async () => {
      setLoadingUser(true);
      setErrorUser(null);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setErrorUser(userError.message);
        toast.error('Error Mengambil Sesi Pengguna', { description: userError.message });
        setLoadingUser(false);
        return;
      }
      if (user) {
        const { data: users, error: fetchError } = await supabase.from('users').select('*');
        if (fetchError) {
          setErrorUser(fetchError.message);
          toast.error('Error Mengambil Data Pengguna', { description: fetchError.message });
        } else {
          setUserData(users as UserData[]);
        }
      } else {
        setUserData(null);
      }
      setLoadingUser(false);
    };
    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData();
      } else {
        setUserData(null);
        setLoadingUser(false);
        setErrorUser(null);
      }
    });
    fetchUserData();
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase]);

  // Fungsi generik untuk mendapatkan 3 entitas dengan persentase terendah
  // Menerima data yang memiliki properti nmkab, persentase, realisasi, dan target
  const getTop3LowestPercentage = (
    data: { nmkab: string; persentase: string | number; realisasi: number; target: number }[] | null
  ): KabupatenRingkasan[] => {
    if (!data || data.length === 0) return [];
    return [...data]
      .sort((a, b) => {
        const persentaseA = parseFloat(a.persentase.toString());
        const persentaseB = parseFloat(b.persentase.toString());
        if (persentaseA !== persentaseB) {
          return persentaseA - persentaseB;
        }
        return a.realisasi - b.realisasi; // Tie-breaker: realisasi lebih rendah
      })
      .slice(0, 3)
      .map(item => ({ // Map ke interface KabupatenRingkasan
        nmkab: item.nmkab,
        realisasi: item.realisasi,
        target: item.target,
        persentase: item.persentase
      }));
  };

  const top3PadiRealisasiTerendah = React.useMemo(() => 
    getTop3LowestPercentage(
      processedPadiData ? processedPadiData.map(p => ({...p, target: p.targetUtama })) : null
    ), 
  [processedPadiData]);
  
  const top3PalawijaRealisasiTerendah = React.useMemo(() => 
    getTop3LowestPercentage(processedPalawijaData), 
  [processedPalawijaData]);

  return (
    <>
      <h1 className="text-4xl font-bold mb-6">Selamat Datang di Dashboard HOPE!</h1>

      {/* Card Ringkasan Ubinan Padi */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ringkasan Ubinan Padi ({selectedYear})</CardTitle>
          {loadingPadi && <Skeleton className="h-4 w-[200px] mt-1" />}
          {!loadingPadi && lastUpdate && <CardDescription>Data per: {lastUpdate}</CardDescription>}
          {errorPadi && <CardDescription className="text-red-500">Gagal memuat data ubinan padi: {errorPadi}</CardDescription>}
        </CardHeader>
        <CardContent>
          {loadingPadi && ( /* Skeleton Padi */ <div className="grid md:grid-cols-2 gap-4"><div><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-12 w-1/2" /></div><div><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-6 w-full mb-1" /><Skeleton className="h-6 w-full mb-1" /><Skeleton className="h-6 w-full" /></div></div>)}
          {!loadingPadi && !errorPadi && padiTotals && processedPadiData && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Persentase Realisasi (Padi)</h3>
                <p className={`text-4xl font-bold`}>
                  <span className={`px-3 py-1 inline-flex items-center text-3xl font-bold rounded-full ${getPercentageBadgeClass(padiTotals.persentase)}`}>
                    {padiTotals.persentase >= 100 && <CheckCircle2 className="mr-2 h-6 w-6" />}
                    {padiTotals.persentase.toFixed(2)}%
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ({padiTotals.realisasi} dari {padiTotals.targetUtama} Target Utama)
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">3 Kab/Kota Realisasi Padi Terendah (%)</h3>
                {top3PadiRealisasiTerendah.length > 0 ? (
                  <ul className="space-y-1">
                    {top3PadiRealisasiTerendah.map(kab => {
                      const persentaseValue = parseFloat(kab.persentase.toString());
                      const showCheckmark = !isNaN(persentaseValue) && persentaseValue >= 100;
                      return (
                        <li key={kab.nmkab} className="flex justify-between items-center text-sm">
                          <span>{kab.nmkab}</span>
                          <span className={`font-semibold px-2 py-0.5 text-xs rounded-full inline-flex items-center ${getPercentageBadgeClass(persentaseValue)}`}>
                            {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {!isNaN(persentaseValue) ? persentaseValue.toFixed(2) : kab.persentase}%
                            <span className="ml-1 text-gray-600 oscuro:text-gray-400">({kab.realisasi}/{kab.target})</span> {/* Menggunakan kab.target generik */}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Data kabupaten (Padi) tidak tersedia atau semua realisasi baik.</p>
                )}
              </div>
            </div>
          )}
          {!loadingPadi && !errorPadi && !padiTotals && ( <p className="text-gray-500">Data Ubinan Padi tidak tersedia untuk tahun {selectedYear}.</p>)}
        </CardContent>
      </Card>

      {/* Card Baru untuk Ringkasan Ubinan Palawija */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ringkasan Ubinan Palawija ({selectedYear})</CardTitle>
          {loadingPalawija && <Skeleton className="h-4 w-[200px] mt-1" />}
          {!loadingPalawija && lastUpdatePalawija && <CardDescription>Data per: {lastUpdatePalawija}</CardDescription>}
          {errorPalawija && <CardDescription className="text-red-500">Gagal memuat data ubinan palawija: {errorPalawija}</CardDescription>}
        </CardHeader>
        <CardContent>
          {loadingPalawija && ( /* Skeleton Palawija */ <div className="grid md:grid-cols-2 gap-4"><div><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-12 w-1/2" /></div><div><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-6 w-full mb-1" /><Skeleton className="h-6 w-full mb-1" /><Skeleton className="h-6 w-full" /></div></div>)}
          {!loadingPalawija && !errorPalawija && palawijaTotals && processedPalawijaData && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Persentase Realisasi (Palawija)</h3>
                <p className={`text-4xl font-bold`}>
                  <span className={`px-3 py-1 inline-flex items-center text-3xl font-bold rounded-full ${getPercentageBadgeClass(palawijaTotals.persentase)}`}>
                    {parseFloat(palawijaTotals.persentase.toString()) >= 100 && <CheckCircle2 className="mr-2 h-6 w-6" />}
                    {typeof palawijaTotals.persentase === 'number' ? palawijaTotals.persentase.toFixed(2) : parseFloat(palawijaTotals.persentase.toString()).toFixed(2)}%
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ({palawijaTotals.realisasi} dari {palawijaTotals.target} Target)
                </p>
                 {/* Anda bisa menambahkan detail clean, warning, error di sini jika mau */}
                 <div className="mt-2 text-xs text-gray-500">
                    Status Validasi: Clean: {palawijaTotals.clean}, Warning: {palawijaTotals.warning}, Error: {palawijaTotals.error}
                 </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">3 Kab/Kota Realisasi Palawija Terendah (%)</h3>
                {top3PalawijaRealisasiTerendah.length > 0 ? (
                  <ul className="space-y-1">
                    {top3PalawijaRealisasiTerendah.map(kab => {
                      const persentaseValue = parseFloat(kab.persentase.toString());
                      const showCheckmark = !isNaN(persentaseValue) && persentaseValue >= 100;
                      return (
                        <li key={kab.nmkab} className="flex justify-between items-center text-sm">
                          <span>{kab.nmkab}</span>
                          <span className={`font-semibold px-2 py-0.5 text-xs rounded-full inline-flex items-center ${getPercentageBadgeClass(persentaseValue)}`}>
                            {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {!isNaN(persentaseValue) ? persentaseValue.toFixed(2) : kab.persentase}%
                            <span className="ml-1 text-gray-600 oscuro:text-gray-400">({kab.realisasi}/{kab.target})</span> {/* Menggunakan kab.target generik */}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Data kabupaten (Palawija) tidak tersedia atau semua realisasi baik.</p>
                )}
              </div>
            </div>
          )}
          {!loadingPalawija && !errorPalawija && !palawijaTotals && ( <p className="text-gray-500">Data Ubinan Palawija tidak tersedia untuk tahun {selectedYear}.</p>)}
        </CardContent>
      </Card>

      {/* Seksi Data Pengguna (tetap sama) */}
      {(loadingUser || errorUser || (userData && userData.length > 0)) && (
          <Card className="mb-6">
              <CardHeader>
                  <CardTitle>Informasi Pengguna</CardTitle>
                  {loadingUser && <Skeleton className="h-4 w-[150px] mt-1" />}
                  {errorUser && <CardDescription className="text-red-500">Gagal memuat data pengguna: {errorUser}</CardDescription>}
              </CardHeader>
              {(loadingUser || (userData && userData.length > 0)) && (
                <CardContent>
                  {loadingUser && (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <Skeleton className="aspect-video rounded-xl" />
                        <Skeleton className="aspect-video rounded-xl" />
                        <Skeleton className="aspect-video rounded-xl" />
                        <div className="md:col-span-3">
                            <Skeleton className="h-8 w-1/2 mb-3" />
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-5 w-3/4" />
                        </div>
                    </div>
                  )}
                  {!loadingUser && userData && userData.length > 0 && (
                    <>
                      <div className="grid auto-rows-min gap-4 md:grid-cols-3 mb-6">
                        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center p-4">
                          <p className="text-center text-lg">Jumlah User Terdaftar: <span className="font-bold text-2xl block">{userData.length}</span></p>
                        </div>
                        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center p-4">
                            <p className="text-gray-400">Statistik Tambahan 1</p>
                        </div>
                        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center p-4">
                            <p className="text-gray-400">Statistik Tambahan 2</p>
                        </div>
                      </div>
                      <div className="bg-muted/50 flex-1 rounded-xl p-4">
                        <h2 className="text-xl font-semibold mb-3">Daftar Pengguna:</h2>
                        <ul className="list-disc list-inside space-y-1">
                          {userData.map((u: UserData) => (
                            <li key={u.id} className="text-sm text-gray-700">
                              <span className="font-medium">{u.username}</span> ({u.email}) - Role: <span className="font-semibold text-blue-600">{u.role}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              )}
          </Card>
      )}

      {!loadingUser && !errorUser && (!userData || userData.length === 0) && (
        <p className="text-lg mt-8 text-gray-600 text-center">
          Tidak ada data pengguna ditemukan atau RLS memblokir akses. Pastikan ada data pengguna atau RLS diizinkan.
        </p>
      )}

      <p className="mt-12 text-gray-600 text-center">
        Ini adalah halaman utama dashboard Anda. Gunakan navigasi di samping untuk menjelajahi fitur-fitur lainnya.
      </p>
    </>
  );
}