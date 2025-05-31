// src/app/page.tsx
"use client"; // Ini harus tetap Client Component

import * as React from "react"
import { useRouter } from 'next/navigation';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { useYear } from '@/context/YearContext';
import { cn } from '@/lib/utils';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Komponen sidebar dan layout tidak lagi diimpor di sini, karena sudah di MainLayout
// Hapus import yang tidak digunakan lagi:
// import { AppSidebar } from "@/components/layout/app-sidebar";
// import { Breadcrumb, ... } from "@/components/ui/breadcrumb"
// import { Separator } from "@/components/ui/separator"
// import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function HomePage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const { selectedYear } = useYear(); // Hanya perlu selectedYear, karena header dan filter di MainLayout

  const [userData, setUserData] = React.useState<UserData[] | null>(null);
  const [loadingData, setLoadingData] = React.useState(true);
  const [errorData, setErrorData] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setErrorData(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        setErrorData(userError.message);
        toast.error('Error Mengambil Sesi Pengguna', { description: userError.message });
        setLoadingData(false);
        return;
      }

      if (user) {
        const { data: users, error: fetchError } = await supabase.from('users').select('*');
        if (fetchError) {
          setErrorData(fetchError.message);
          toast.error('Error Mengambil Data Pengguna', { description: fetchError.message });
        } else {
          setUserData(users as UserData[]);
        }
      } else {
        setUserData(null);
      }
      setLoadingData(false);
    };

    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchData();
      } else {
        setUserData(null);
        setLoadingData(false);
        setErrorData(null);
      }
    });

    fetchData();
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase]);

  return (
    // Tidak ada SidebarProvider, AppSidebar, SidebarInset, Header di sini
    <> {/* Fragment karena tidak ada wrapper div top-level lagi di sini */}
      <h1 className="text-4xl font-bold mb-4">Selamat Datang di Dashboard HOPE!</h1>

      {loadingData && <p className="text-lg">Memuat data dari Supabase...</p>}
      {errorData && <p className="text-red-500 text-lg">Error: {errorData}</p>}

      {userData && userData.length > 0 && (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center p-4">
            <p className="text-center">Jumlah User: {userData.length}</p>
          </div>
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
        </div>
      )}

      {userData && userData.length > 0 && (
        <div className="bg-muted/50 flex-1 rounded-xl p-4">
          <h2 className="text-2xl font-semibold mb-4">Users from Supabase:</h2>
          <ul className="list-disc list-inside space-y-2">
            {userData.map((u: UserData) => (
              <li key={u.id} className="text-lg text-gray-700">
                <span className="font-medium">{u.username}</span> - {u.email} - <span className="font-semibold text-blue-600">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loadingData && !errorData && (!userData || userData.length === 0) && (
        <p className="text-lg mt-8 text-gray-600 text-center">
          Tidak ada data ditemukan di tabel 'users' atau RLS memblokir akses. Pastikan ada data pengguna atau RLS diizinkan.
        </p>
      )}

      <p className="mt-12 text-gray-600 text-center">
        Ini adalah halaman utama dashboard Anda. Gunakan navigasi di samping untuk menjelajahi fitur-fitur lainnya.
      </p>
    </>
  );
}