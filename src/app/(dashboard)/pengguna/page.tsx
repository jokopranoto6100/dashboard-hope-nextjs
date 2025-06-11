// src/app/(dashboard)/pengguna/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentSupabaseClient } from '@/lib/supabase';
import UserManagementClientPage from './user-management-client-page';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { supabaseServer } from '@/lib/supabase-server'; // <-- PASTIKAN INI DI-IMPOR
import { daftarSatker } from '@/lib/satker-data'; // Impor data satker

// PATCH: Tipe data diperbarui untuk mencakup semua data yang kita butuhkan
export interface ManagedUser {
  id: string;
  username: string | null;
  full_name: string | null; // <-- BARU
  email: string | null;
  role: string | null;
  satker_id: string | null; // <-- BARU
  satker_name: string | null; // <-- BARU (Untuk ditampilkan)
  created_at: string;
}

// PATCH: Fungsi ini sekarang menggunakan client yang benar
async function getUsersForAdmin(): Promise<ManagedUser[]> {
  // Ambil semua profil dari public.users
  // Operasi SELECT aman dilakukan dengan client admin
  const { data: profiles, error: profileError } = await supabaseServer
    .from('users')
    .select('*');

  if (profileError) {
    console.error("getUsersForAdmin: Error fetching profiles:", profileError);
    throw new Error(`Gagal mengambil data profil: ${profileError.message}`);
  }

  // Ambil semua user dari auth.users untuk mendapatkan email
  // INI ADALAH BAGIAN YANG MEMERLUKAN CLIENT ADMIN
  const { data: { users: authUsers }, error: authError } = await supabaseServer.auth.admin.listUsers(); // <-- GUNAKAN supabaseServer
  
  if (authError) {
    console.error("getUsersForAdmin: Error fetching auth users:", authError.message);
    throw new Error(`Gagal mengambil data otentikasi: ${authError.message}`);
  }

  // Logika penggabungan data tetap sama
  const authUserMap = new Map(authUsers.map(u => [u.id, u.email]));
  const satkerMap = new Map(daftarSatker.map(s => [s.value, s.label]));

  const managedUsers: ManagedUser[] = profiles.map(profile => ({
    id: profile.id,
    username: profile.username,
    full_name: profile.full_name,
    email: authUserMap.get(profile.id) || 'Email tidak ditemukan',
    role: profile.role,
    satker_id: profile.satker_id,
    satker_name: satkerMap.get(profile.satker_id) || 'Satker tidak diketahui',
    created_at: profile.created_at,
  }));

  return managedUsers;
}

export default async function ManajemenPenggunaPage() {
  const cookieStore = await cookies();
  const supabase = createServerComponentSupabaseClient(cookieStore);

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect('/auth/login');
  }
  
  // PATCH: Pengecekan role sekarang langsung dari tabel users (via AuthContext di client-side)
  // atau bisa juga dengan query tambahan di sini jika diperlukan, namun asumsi role di context sudah benar
  // Untuk keamanan, kita tetap cek di sini sebelum fetch data berat
  const { data: adminProfile } = await supabase.from('users').select('role').eq('id', currentUser.id).single();

  if (adminProfile?.role !== 'super_admin') {
    console.warn(`ManajemenPenggunaPage: User ${currentUser.email} with role ${adminProfile?.role} attempted to access.`);
    // Tampilkan halaman "Akses Ditolak" atau redirect
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Akses Ditolak!</AlertTitle>
          <AlertDescription>Anda tidak memiliki izin untuk mengakses halaman ini.</AlertDescription>
        </Alert>
      </div>
    );
  }

  let users: ManagedUser[] = [];
  let fetchError: string | null = null;

  try {
    users = await getUsersForAdmin();
  } catch (error: unknown) {
    if (error instanceof Error) {
      fetchError = error.message;
    } else {
      fetchError = 'Terjadi kesalahan yang tidak diketahui.';
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Manajemen Pengguna
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Kelola semua akun pengguna dalam sistem.
        </p>
      </header>

      {fetchError && (
        <Alert variant="destructive" className="mb-6">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Gagal Memuat Data Pengguna!</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {!fetchError && <UserManagementClientPage initialUsers={users} />}
    </div>
  );
}