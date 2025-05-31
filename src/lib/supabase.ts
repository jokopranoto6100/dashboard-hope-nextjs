// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient } from '@supabase/ssr'; // Untuk server components dan client components
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// Pastikan variabel lingkungan Anda sudah ada
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables');
}

// Client untuk Client Components (digunakan di sidebar, login, register)
export const createClientComponentSupabaseClient = () => {
  // Hapus <Database> type di sini
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Client untuk Server Components atau Server Actions
export const createServerComponentSupabaseClient = (cookies: ReadonlyRequestCookies) => {
  // Hapus <Database> type di sini
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get: (name: string) => cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => cookies.set(name, value, options),
        remove: (name: string, options: any) => cookies.set(name, '', options),
      },
    }
  );
};

// Ini adalah client yang Anda miliki sebelumnya, bisa tetap ada jika Anda menggunakannya
// untuk interaksi langsung yang tidak melibatkan cookies Next.js (misalnya di API Route yang tidak perlu session)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);