// src/components/layout/NewSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentSupabaseClient } from '@/lib/supabase';

import { cn } from '@/lib/utils';
import { getNavMainItems, type UserData } from '@/lib/sidebar-data';

// Impor dari pustaka komponen UI Sidebar Anda
import {
  // SidebarProvider TIDAK LAGI diimpor di sini
  Sidebar as UiSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar, // Jika perlu untuk logika internal, tapi NavMainHope/NavUserHope sudah menggunakannya
} from '@/components/ui/sidebar';

import { NavMainHope } from './NavMainHope';
import { NavUserHope } from './NavUserHope';

interface UserSessionData {
  role: string;
  username: string;
  email: string;
}

// Hapus props isCollapsed dan setIsCollapsed dari interface
interface NewSidebarProps {}

export default function NewSidebar({}: NewSidebarProps) { // Hapus props dari parameter fungsi
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();

  const [userSession, setUserSession] = React.useState<UserSessionData | null>(null);
  const [isLoadingSession, setIsLoadingSession] = React.useState(true);
  
  // Mungkin kita bisa mendapatkan 'open' dari useSidebar() jika diperlukan di sini,
  // tapi komponen anak (NavMainHope, NavUserHope) yang lebih membutuhkannya.
  const { open } = useSidebar(); // Contoh jika perlu state 'open' di NewSidebar

  React.useEffect(() => {
    const getSession = async () => {
      setIsLoadingSession(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
        setUserSession(null);
      } else if (session) {
        setUserSession({
          role: session.user.user_metadata?.role || 'viewer',
          username: session.user.user_metadata?.username || 'User',
          email: session.user.email || 'N/A',
        });
      } else {
        setUserSession(null);
      }
      setIsLoadingSession(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserSession({
          role: session.user.user_metadata?.role || 'viewer',
          username: session.user.user_metadata?.username || 'User',
          email: session.user.email || 'N/A',
        });
      } else {
        setUserSession(null);
        // router.push('/auth/login');
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router]);

  const isSuperAdmin = userSession?.role === 'super_admin';
  const navMainData = React.useMemo(
    () => getNavMainItems(pathname, isSuperAdmin),
    [pathname, isSuperAdmin]
  );
  const userDataForNav: UserData | null = userSession
    ? { name: userSession.username, email: userSession.email }
    : null;

  if (isLoadingSession && !userSession) {
    return (
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
          "fixed top-0 left-0 h-screen z-50 justify-center items-center",
          // Gunakan state 'open' dari useSidebar() untuk menentukan lebar jika diperlukan di sini,
          // atau biarkan UiSidebar yang mengaturnya.
          // Untuk loading state, kita bisa pakai nilai default atau hardcode sementara.
          !open ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"
        )}
        style={{
          // @ts-ignore
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        }}
      >
        <p>Memuat...</p>
      </aside>
    );
  }

  return (
    // SidebarProvider sudah dipindahkan ke MainLayout
    <UiSidebar
      variant="sidebar"
      collapsible="icon"
      className={cn(
        "hidden md:flex flex-col bg-background z-50"
      )}
    >
      {/* Tombol Toggle Sidebar sudah dipindahkan ke MainLayout */}

      <SidebarHeader
        className={cn(
          "flex h-16 items-center border-b px-4 lg:px-6",
          // Jika SidebarHeader menggunakan useSidebar, ia akan tahu kapan harus rata tengah
           !open ? "justify-center" : "justify-start" 
        )}
      >
        <Link href="/" className="flex items-center gap-2 font-semibold" aria-label="Ke Dashboard Utama">
          <img src="/icon/hope.png" alt="Dashboard HOPE Logo" className="h-8 w-8" />
          {/* Span ini akan dikontrol oleh NavMainHope/NavUserHope yang menggunakan useSidebar()
              atau oleh styling internal SidebarHeader jika ia menggunakan useSidebar()
          */}
          {open && <span className="text-lg whitespace-nowrap">Dashboard HOPE</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto py-2">
        {/* NavMainHope dan NavUserHope akan mendapatkan state dari useSidebar() */}
        <NavMainHope items={navMainData} />
      </SidebarContent>

      <SidebarFooter className="mt-auto p-2 border-t">
        <NavUserHope user={userDataForNav} />
      </SidebarFooter>
    </UiSidebar>
  );
}