// src/lib/supabase-server.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createServerClient as createSupabaseSSRClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers'; // Pastikan ini diimpor

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Diperlukan untuk client sadar sesi
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables (URL, Service Role Key, or Anon Key).');
}

// Client untuk operasi admin (menggunakan service role key) - SEPERTI YANG SUDAH ANDA PUNYA
export const supabaseServer = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    }
});

// BARU: Fungsi untuk membuat client dengan konteks pengguna (menggunakan anon key dan cookies)
export const createSupabaseServerClientWithUserContext = async (cookieStoreParam?: Awaited<ReturnType<typeof cookies>>) => {
  const cookieStore = cookieStoreParam || await cookies();
  return createSupabaseSSRClient(supabaseUrl, supabaseAnonKey, { // Menggunakan anon key
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        try { cookieStore.set({ name, value, ...options }); } catch (error) { /* Abaikan */ }
      },
      remove: (name: string, options: CookieOptions) => {
        try { cookieStore.set({ name, value: '', ...options }); } catch (error) { /* Abaikan */ }
      },
    },
  });
};