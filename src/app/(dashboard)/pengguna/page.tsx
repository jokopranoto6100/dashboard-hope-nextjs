    // src/app/(dashboard)/pengguna/page.tsx
    import { cookies } from 'next/headers';
    import { redirect } from 'next/navigation';
    import { createServerComponentSupabaseClient } from '@/lib/supabase';
    import { supabaseServer } from '@/lib/supabase-server';
    import UserManagementClientPage from './user-management-client-page';
    import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
    import { Terminal } from "lucide-react";

    export interface ManagedUser {
      id: string;
      username: string | null;
      email: string | null;
      role: string | null;
      created_at: string;
    }

    async function getUsersForAdmin(): Promise<ManagedUser[]> {
      const fetchTimestamp = new Date().toISOString();
      console.log(`[${fetchTimestamp}] getUsersForAdmin: Calling RPC 'get_all_managed_users'...`);

      const { data: usersData, error } = await supabaseServer.rpc('get_all_managed_users');

      if (error) {
        console.error(`[${fetchTimestamp}] getUsersForAdmin: Error calling RPC 'get_all_managed_users':`, error);
        throw new Error(`Gagal mengambil data pengguna via RPC: ${error.message}`);
      }
      if (!usersData) {
        console.warn(`[${fetchTimestamp}] getUsersForAdmin: No data returned from RPC 'get_all_managed_users'.`);
        return [];
      }

      console.log(`[${fetchTimestamp}] getUsersForAdmin: Data fetched from RPC:`, JSON.stringify(usersData, null, 2));
      
      // Data dari RPC seharusnya sudah dalam format yang benar (array of ManagedUser)
      // Jika fungsi RPC mengembalikan kolom dengan nama yang sama dengan ManagedUser, tidak perlu mapping lagi.
      return usersData as ManagedUser[];
    }

    export default async function ManajemenPenggunaPage() {
      const cookieStore = cookies();
      const supabase = createServerComponentSupabaseClient(cookieStore);

      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !currentUser) {
        console.error("ManajemenPenggunaPage: Error getting current user or no user", authError?.message);
        redirect('/auth/login');
      }

      const currentUserRole = currentUser.user_metadata?.role || (currentUser as any).role;
      if (currentUserRole !== 'super_admin') {
        console.warn(`ManajemenPenggunaPage: User ${currentUser.email} with role ${currentUserRole} attempted to access restricted page.`);
        redirect('/');
      }

      let users: ManagedUser[] = [];
      let fetchError: string | null = null;

      try {
        users = await getUsersForAdmin();
      } catch (error: any) {
        console.error("ManajemenPenggunaPage: Error in getUsersForAdmin execution:", error.message);
        fetchError = error.message;
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
    