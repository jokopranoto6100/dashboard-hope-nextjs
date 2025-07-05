import { createServerComponentSupabaseClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { KehutananClient } from "./KehutananClient";

export default async function KehutananPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentSupabaseClient(await cookieStore);
  
  // Ambil informasi role dan satker pengguna di server
  const { data: { user } } = await supabase.auth.getUser();
  let userRole = null;
  let userSatkerId = null;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role, satker_id').eq('id', user.id).single();
    userRole = profile?.role || null;
    userSatkerId = profile?.satker_id || null;
  }

  // Teruskan hanya user info ke komponen client (data diambil oleh hook)
  return (
    <KehutananClient 
      userRole={userRole}
      userSatkerId={userSatkerId}
    />
  );
}