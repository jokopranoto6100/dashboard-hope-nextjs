import { createServerComponentSupabaseClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { getKehutananData } from "./_actions";
import { KehutananClient } from "./KehutananClient";

export default async function KehutananPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentSupabaseClient(await cookieStore);
  
  // 1. Ambil data awal di server untuk performa loading pertama
  const initialData = await getKehutananData();
  
  // 2. Ambil informasi role dan satker pengguna di server
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  let userSatkerId = null;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role, satker_id').eq('id', user.id).single();
    userRole = profile?.role || null;
    userSatkerId = profile?.satker_id || null;
  }

  // 3. Teruskan semua data yang dibutuhkan sebagai props ke komponen client
  return (
    <KehutananClient 
      initialData={initialData} 
      userRole={userRole}
      userSatkerId={userSatkerId}
    />
  );
}