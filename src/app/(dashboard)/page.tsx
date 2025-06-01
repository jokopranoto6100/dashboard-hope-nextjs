// src/app/(dashboard)/page.tsx
"use client";

import * as React from "react";
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { useYear } from '@/context/YearContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { Skeleton } from "@/components/ui/skeleton";
import { getPercentageBadgeClass } from "@/lib/utils"; // Impor fungsi global
import { CheckCircle2 } from "lucide-react"; // Impor ikon

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface KabupatenRealisasi {
  nmkab: string;
  realisasi: number;
  targetUtama: number;
  persentase: string | number;
}

export default function HomePage() {
  const supabase = createClientComponentSupabaseClient();
  const { selectedYear } = useYear();

  const [userData, setUserData] = React.useState<UserData[] | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [errorUser, setErrorUser] = React.useState<string | null>(null);

  const ubinanPadiSubround = 'all';
  const {
    processedPadiData,
    padiTotals,
    loadingPadi,
    errorPadi,
    lastUpdate
  } = usePadiMonitoringData(selectedYear, ubinanPadiSubround);

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

  const getTop3RealisasiTerendah = (data: KabupatenRealisasi[] | null): KabupatenRealisasi[] => {
    if (!data || data.length === 0) return [];
    return [...data]
      .sort((a, b) => {
        const persentaseA = parseFloat(a.persentase.toString());
        const persentaseB = parseFloat(b.persentase.toString());
        if (persentaseA !== persentaseB) {
          return persentaseA - persentaseB;
        }
        return a.realisasi - b.realisasi;
      })
      .slice(0, 3);
  };

  const top3RealisasiTerendah = React.useMemo(() => getTop3RealisasiTerendah(processedPadiData), [processedPadiData]);

  // Hapus definisi lokal getPercentageBadgeClass karena sudah diimpor
  // const getPercentageBadgeClass = (percentage: number | string) => { ... };

  return (
    <>
      <h1 className="text-4xl font-bold mb-6">Selamat Datang di Dashboard HOPE!</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ringkasan Ubinan Padi ({selectedYear})</CardTitle>
          {loadingPadi && <Skeleton className="h-4 w-[200px] mt-1" />}
          {!loadingPadi && lastUpdate && <CardDescription>Data per: {lastUpdate}</CardDescription>}
          {errorPadi && <CardDescription className="text-red-500">Gagal memuat data ubinan: {errorPadi}</CardDescription>}
        </CardHeader>
        <CardContent>
          {loadingPadi && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-12 w-1/2" />
              </div>
              <div>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-full mb-1" />
                <Skeleton className="h-6 w-full mb-1" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          )}
          {!loadingPadi && !errorPadi && padiTotals && processedPadiData && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Persentase Realisasi</h3>
                <p className={`text-4xl font-bold`}> {/* Kelas warna badge dipindah ke span */}
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
                <h3 className="text-lg font-semibold text-gray-700 mb-2">3 Kabupaten Realisasi Terendah (%)</h3>
                {top3RealisasiTerendah.length > 0 ? (
                  <ul className="space-y-1">
                    {top3RealisasiTerendah.map(kab => {
                      const persentaseValue = parseFloat(kab.persentase.toString());
                      const showCheckmark = !isNaN(persentaseValue) && persentaseValue >= 100;
                      return (
                        <li key={kab.nmkab} className="flex justify-between items-center text-sm">
                          <span>{kab.nmkab}</span>
                          <span className={`font-semibold px-2 py-0.5 text-xs rounded-full inline-flex items-center ${getPercentageBadgeClass(persentaseValue)}`}>
                            {showCheckmark && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {!isNaN(persentaseValue) ? persentaseValue.toFixed(2) : kab.persentase}%
                            <span className="ml-1 text-gray-600 oscuro:text-gray-400">({kab.realisasi}/{kab.targetUtama})</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Data kabupaten tidak tersedia atau semua realisasi baik.</p>
                )}
              </div>
            </div>
          )}
          {!loadingPadi && !errorPadi && !padiTotals && (
            <p className="text-gray-500">Data Ubinan Padi tidak tersedia untuk tahun {selectedYear}.</p>
          )}
        </CardContent>
      </Card>

      {/* Seksi Data Pengguna (seperti sebelumnya) */}
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