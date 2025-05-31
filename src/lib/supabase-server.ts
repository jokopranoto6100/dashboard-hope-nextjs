// src/lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js';

// Ini adalah client Supabase yang menggunakan Service Role Key
// HANYA digunakan di lingkungan sisi server (API Routes, Server Actions, Server Components)
// JANGAN PERNAH mengekspos kunci ini ke sisi klien!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables for server-side operations.');
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        persistSession: false, // Penting untuk API Routes, tidak perlu mempertahankan sesi
    }
});