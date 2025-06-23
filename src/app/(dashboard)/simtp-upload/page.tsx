// /app/(dashboard)/simtp-upload/page.tsx

import { cookies } from "next/headers";
import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { daftarSatker } from '@/lib/satker-data';
import { SimtpUploadClient } from './SimtpUploadClient';

// Komponen Server async untuk memeriksa sesi dan peran pengguna di server
export default async function SimtpUploadPage() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  // 1. Ambil data sesi pengguna di server
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Cek perannya dari user_metadata
  const isAdmin = user?.user_metadata?.role === 'super_admin';

  // 3. Siapkan daftar satker dari file lib
  const allSatkers = daftarSatker.map(s => ({ id: s.value, nama: s.label }));

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* 4. Kirim status admin dan daftar satker sebagai props ke Client Component */}
      <SimtpUploadClient 
        allSatkers={allSatkers} 
        isAdmin={isAdmin} 
      />
    </div>
  );
}