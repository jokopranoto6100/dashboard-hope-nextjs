// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { createServerClient, createBrowserClient, type CookieOptions } from '@supabase/ssr';
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
// import { cookies as nextCookies } from 'next/headers'; // Tidak perlu diimpor di sini, akan diteruskan sebagai argumen

// Pastikan variabel lingkungan Anda sudah ada
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables');
}

// Client untuk Client Components (digunakan di sidebar, login, register)
export const createClientComponentSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Client untuk Server Components atau Server Actions
// Parameter 'cookieStore' di sini adalah instance dari ReadonlyRequestCookies
// yang didapat dari next/headers di Server Component.
export const createServerComponentSupabaseClient = (cookieStore: ReadonlyRequestCookies) => {
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          try {
            // Di Server Components, cookieStore yang diteruskan dari `cookies()` dari `next/headers` bersifat read-only untuk `request`
            // Untuk set cookie, Anda perlu melakukannya pada `response` atau menggunakan Server Actions
            // Untuk saat ini, kita akan log jika ada upaya set, karena client ini mungkin juga digunakan di Server Actions
            console.warn(`Attempted to set cookie '${name}' in a server component context. This should ideally be done in a Server Action or API route response.`);
            // cookieStore.set({ name, value, ...options }); // Ini akan error jika cookieStore adalah Readonly
          } catch (error) {
            console.error(`Error setting cookie '${name}':`, error);
          }
        },
        remove: (name: string, options: CookieOptions) => {
          try {
            console.warn(`Attempted to remove cookie '${name}' in a server component context. This should ideally be done in a Server Action or API route response.`);
            // cookieStore.set({ name, value: '', ...options }); // Ini akan error jika cookieStore adalah Readonly
          } catch (error) {
            console.error(`Error removing cookie '${name}':`, error);
          }
        },
      },
    }
  );
};