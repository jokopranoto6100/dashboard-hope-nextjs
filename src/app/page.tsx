// src/app/page.tsx
"use client";

import { useEffect, useState } from 'react';
// Hapus import { createClientComponentSupabaseClient } from '@/lib/supabase'; // Tidak lagi diperlukan untuk fetch data ini
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useYear } from '@/context/YearContext'; // Import useYearContext

export default function HomePage() {
  const [usersData, setUsersData] = useState<any[] | null>(null);
  const [produksiData, setProduksiData] = useState<any[] | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProduksi, setLoadingProduksi] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [produksiError, setProduksiError] = useState<string | null>(null);

  const { selectedYear } = useYear(); // Ambil selectedYear dari konteks

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsersError(null);
      try {
        const response = await fetch('/api/users'); // Panggil API Route untuk users
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch users');
        }
        const data = await response.json();
        setUsersData(data);
      } catch (err: any) {
        setUsersError(err.message);
        toast.error('Error Mengambil Data Pengguna', {
          description: err.message,
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchProduksi = async () => {
      setLoadingProduksi(true);
      setProduksiError(null);
      try {
        // Panggil API Route untuk produksi dengan parameter tahun
        const response = await fetch(`/api/produksi?tahun=${selectedYear}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch produksi data');
        }
        const data = await response.json();
        setProduksiData(data);
      } catch (err: any) {
        setProduksiError(err.message);
        toast.error('Error Mengambil Data Produksi', {
          description: err.message,
        });
      } finally {
        setLoadingProduksi(false);
      }
    };

    fetchUsers();
    fetchProduksi(); // Panggil fetchProduksi setiap kali selectedYear berubah

    // Anda dapat menambahkan logika onAuthStateChange jika fetchUsers/fetchProduksi perlu re-fetch
    // saat status autentikasi berubah, tetapi API Route sendiri tidak memerlukan sesi aktif klien.
  }, [selectedYear]); // selectedYear sebagai dependency untuk fetchProduksi

  return (
    <div className="container flex flex-col items-center py-4">
      <h1 className="text-4xl font-bold mb-8">Selamat Datang di Dashboard HOPE!</h1>

      {/* Bagian Users Data */}
      {loadingUsers && <p className="text-lg">Memuat data pengguna...</p>}
      {usersError && <p className="text-red-500 text-lg">Error Pengguna: {usersError}</p>}
      {usersData && usersData.length > 0 && (
        <Card className="w-full max-w-2xl mt-8 rounded-lg shadow-md">
          <CardHeader className="bg-gray-50 p-4 rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-gray-800">Pengguna dari Supabase (via API):</CardTitle>
            <CardDescription className="text-gray-600">Daftar pengguna yang terdaftar di sistem.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="list-disc list-inside space-y-2">
              {usersData.map((u: any) => (
                <li key={u.id} className="text-lg text-gray-700">
                  <span className="font-medium">{u.username}</span> - {u.email} - <span className="font-semibold text-blue-600">{u.role}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      {!loadingUsers && !usersError && (!usersData || usersData.length === 0) && (
        <p className="text-lg mt-8 text-gray-600 text-center">
          Tidak ada data pengguna ditemukan atau RLS memblokir akses di API.
        </p>
      )}

      {/* Bagian Produksi Data (untuk tahun {selectedYear}) */}
      <h2 className="text-3xl font-bold mt-12 mb-6">Data Produksi Tahun {selectedYear}</h2>
      {loadingProduksi && <p className="text-lg">Memuat data produksi...</p>}
      {produksiError && <p className="text-red-500 text-lg">Error Produksi: {produksiError}</p>}
      {produksiData && produksiData.length > 0 && (
        <Card className="w-full max-w-2xl mt-8 rounded-lg shadow-md">
          <CardHeader className="bg-gray-50 p-4 rounded-t-lg">
            <CardTitle className="text-xl font-semibold text-gray-800">Ringkasan Data Produksi:</CardTitle>
            <CardDescription className="text-gray-600">Beberapa baris data produksi yang ditemukan.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="list-disc list-inside space-y-2">
              {/* Tampilkan beberapa contoh data produksi, sesuaikan dengan struktur data Anda */}
              {produksiData.slice(0, 5).map((d: any, index: number) => ( // Tampilkan 5 baris pertama sebagai contoh
                <li key={index} className="text-lg text-gray-700">
                  Tahun: {d.tahun}, Bulan: {d.bulan}, Komoditas: {d.komoditas}, Nilai: {d.nilai}
                </li>
              ))}
              {produksiData.length > 5 && (
                <li className="text-gray-500">... ({produksiData.length - 5} baris lainnya)</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
      {!loadingProduksi && !produksiError && (!produksiData || produksiData.length === 0) && (
        <p className="text-lg mt-8 text-gray-600 text-center">
          Tidak ada data produksi ditemukan untuk tahun {selectedYear}.
        </p>
      )}

      <p className="mt-12 text-gray-600 text-center">
        Ini adalah halaman utama dashboard Anda. Gunakan navigasi di samping untuk menjelajahi fitur-fitur lainnya.
      </p>
    </div>
  );
}