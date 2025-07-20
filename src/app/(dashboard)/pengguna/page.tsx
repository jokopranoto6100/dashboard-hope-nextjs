import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentSupabaseClient } from '@/lib/supabase';
import UserManagementClientPage from './user-management-client-page';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Users } from "lucide-react";
import { supabaseServer } from '@/lib/supabase-server';
import { daftarSatker } from '@/lib/satker-data';
import { Suspense } from 'react';

// Optimasi: Tambahkan metadata untuk caching
export const metadata = {
  title: 'Manajemen Pengguna | Dashboard HOPE',
  description: 'Kelola semua akun pengguna dalam sistem HOPE',
};

// Optimasi: Tambahkan revalidate untuk ISR
export const revalidate = 300; // Revalidate setiap 5 menit

// Loading component untuk Suspense
function UsersLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manajemen Pengguna
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Memuat data pengguna...
        </p>
      </header>

        {/* Loading skeleton */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md w-full max-w-sm animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          </div>
          
          <div className="border rounded-lg">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}export interface ManagedUser {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  role: string | null;
  satker_id: string | null;
  satker_name: string | null;
  created_at: string;
  is_active: boolean;
}

// HAPUS: Interface PenggunaPageProps tidak lagi digunakan
// interface PenggunaPageProps { ... }

async function getUsersForAdmin(): Promise<ManagedUser[]> {
  // Optimasi: Ambil hanya field yang diperlukan, bukan select('*')
  const { data: profiles, error: profileError } = await supabaseServer
    .from('users')
    .select('id, username, full_name, role, satker_id, created_at, is_active')
    .order('created_at', { ascending: false });

  if (profileError) {
    console.error("getUsersForAdmin: Error fetching profiles:", profileError);
    throw new Error(`Gagal mengambil data profil: ${profileError.message}`);
  }

  // Optimasi: Ambil auth users secara paralel menggunakan Promise.all
  const [authUsersResponse] = await Promise.all([
    supabaseServer.auth.admin.listUsers()
  ]);

  if (authUsersResponse.error) {
    throw new Error(`Gagal mengambil data otentikasi: ${authUsersResponse.error.message}`);
  }

  const authUserMap = new Map(authUsersResponse.data.users.map(u => [u.id, u.email]));
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
    is_active: profile.is_active,
  }));

  return managedUsers;
}

// PERBAIKAN: Hapus tipe props, karena kita kembali ke client-side pagination
export default async function ManajemenPenggunaPage() {
  return (
    <Suspense fallback={<UsersLoadingSkeleton />}>
      <UserManagementContent />
    </Suspense>
  );
}

// Pisahkan konten utama untuk Suspense
async function UserManagementContent() {
  const cookieStore = await cookies();
  const supabase = createServerComponentSupabaseClient(cookieStore);

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) redirect('/auth/login');
  
  const { data: adminProfile } = await supabase.from('users').select('role').eq('id', currentUser.id).single();
  if (adminProfile?.role !== 'super_admin') {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manajemen Pengguna
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola semua akun pengguna dalam sistem.
        </p>
      </header>

      {fetchError && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Gagal Memuat Data Pengguna!</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {!fetchError && <UserManagementClientPage initialUsers={users} />}
    </div>
  );
}