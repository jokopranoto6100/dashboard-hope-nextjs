// src/components/layout/NewSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // useRouter diimpor tapi tidak digunakan di sini, bisa dihapus jika tidak ada rencana penggunaan.
import { createClientComponentSupabaseClient } from '@/lib/supabase';

import { cn } from '@/lib/utils';
import { getNavMainItems, type UserData } from '@/lib/sidebar-data';

// Impor dari pustaka komponen UI Sidebar Anda
import {
  Sidebar as UiSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar, // Digunakan untuk mendapatkan state 'open'
} from '@/components/ui/sidebar';

// NavMainHope dan NavUserHope sekarang akan menggunakan useSidebar() secara internal
import { NavMainHope } from './NavMainHope';
import { NavUserHope } from './NavUserHope';

interface UserSessionData {
  role: string;
  username: string;
  email: string;
}

interface NewSidebarProps {} // Tidak ada props isCollapsed/setIsCollapsed lagi

export default function NewSidebar({}: NewSidebarProps) {
  const pathname = usePathname();
  const router = useRouter(); // Tetap ada, mungkin digunakan untuk redirect jika user null (meski saat ini dikomentari)
  const supabase = createClientComponentSupabaseClient();

  const [userSession, setUserSession] = React.useState<UserSessionData | null>(null);
  const [isLoadingSession, setIsLoadingSession] = React.useState(true);
  
  // Dapatkan state 'open' dari useSidebar().
  // Ini penting untuk menyesuaikan tampilan NewSidebar itu sendiri (misalnya loading state atau elemen lain)
  // jika komponen <UiSidebar> belum dirender atau jika ada logika kondisional di level NewSidebar.
  const { open } = useSidebar();

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
        // router.push('/auth/login'); // Pertimbangkan untuk mengaktifkan ini atau menangani di middleware
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
    // Loading state sekarang juga menggunakan variabel CSS untuk konsistensi lebar
    // dan state 'open' dari useSidebar()
    return (
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
          "fixed top-0 left-0 h-screen z-50 justify-center items-center",
          !open ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"
        )}
        style={{
          // @ts-ignore
          "--sidebar-width": "16rem", // Nilai default dari components/ui/sidebar.tsx
          "--sidebar-width-icon": "3rem", // Nilai default dari components/ui/sidebar.tsx
        }}
      >
        <p>Memuat...</p>
      </aside>
    );
  }

  return (
    // SidebarProvider sudah ada di MainLayout
    <UiSidebar
      variant="sidebar" // Anda bisa memilih variant lain jika diperlukan (misal: "inset")
      collapsible="icon" // Mode ciut menjadi ikon
      className={cn(
        "hidden md:flex flex-col bg-background z-50" // Kelas dasar, lebar diatur oleh UiSidebar
      )}
    >
      {/* Tombol Toggle Sidebar sudah dipindahkan ke MainLayout dan menggunakan SidebarTrigger */}

      <SidebarHeader
        className={cn(
          "flex h-16 items-center border-b px-4 lg:px-6", // Padding default dari template header
          // mt-8 dihilangkan karena SidebarTrigger sudah tidak di sini, tapi di MainLayout
          !open ? "justify-center" : "justify-start" // Penyesuaian alignment logo berdasarkan state 'open'
        )}
      >
        <Link href="/" className="flex items-center gap-2 font-semibold" aria-label="Ke Dashboard Utama">
          <img src="/icon/hope.png" alt="Dashboard HOPE Logo" className="h-8 w-8" />
          {/* Teks nama dashboard ditampilkan berdasarkan state 'open' dari useSidebar() */}
          {open && <span className="text-lg whitespace-nowrap">Dashboard HOPE</span>}
        </Link>
      </SidebarHeader>

      {/* Menambahkan padding horizontal px-3 ke SidebarContent untuk memberi ruang pada ikon */}
      <SidebarContent className="flex-1 overflow-y-auto py-2 px-3">
        {/* NavMainHope akan menggunakan useSidebar() untuk menyesuaikan tampilannya */}
        <NavMainHope items={navMainData} />
      </SidebarContent>

      {/* p-2 pada SidebarFooter untuk konsistensi dengan template ui/sidebar */}
      <SidebarFooter className="mt-auto p-2 border-t">
        {/* NavUserHope akan menggunakan useSidebar() untuk menyesuaikan tampilannya */}
        <NavUserHope user={userDataForNav} />
      </SidebarFooter>
    </UiSidebar>
  );
}