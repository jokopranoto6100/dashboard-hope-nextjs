// src/components/layout/NewSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentSupabaseClient } from '@/lib/supabase';

import { cn } from '@/lib/utils';
import { getNavMainItems, type UserData } from '@/lib/sidebar-data';

import { Atom } from 'lucide-react';

import {
  Sidebar as UiSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'; // (implied, as these components are defined in sidebar.tsx)

import { NavMainHope } from './NavMainHope';
import { NavUserHope } from './NavUserHope';

interface UserSessionData {
  role: string;
  username: string;
  email: string;
}

interface NewSidebarProps {}

export default function NewSidebar({}: NewSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();

  const [userSession, setUserSession] = React.useState<UserSessionData | null>(null);
  const [isLoadingSession, setIsLoadingSession] = React.useState(true);
  
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
          !open ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]"
        )}
        style={{
          // @ts-ignore
          "--sidebar-width": "16rem", // Should match SIDEBAR_WIDTH from sidebar.tsx
          "--sidebar-width-icon": "3rem", // Should match SIDEBAR_WIDTH_ICON from sidebar.tsx
        }}
      >
        <p>Memuat...</p>
      </aside>
    );
  }

  return (
    <UiSidebar
      variant="sidebar"
      collapsible="icon" // This enables group-data-[collapsible=icon] styles from sidebar.tsx
      className={cn(
        "hidden md:flex flex-col bg-background z-50" // Custom styles for UiSidebar itself
      )}
    >
      <SidebarHeader
        className={cn(
          // Base styles from sidebar.tsx: "flex flex-col gap-2 p-2"
          "h-16 border-b", // Set height and border
          open
            ? "px-4 lg:px-6 justify-center items-start" // For open: horizontal padding, vertical center (for flex-col), horizontal left (for flex-col)
            : "px-0 justify-center items-center",   // For collapsed: no padding, vertical & horizontal center
          "py-0" // Override vertical padding from base "p-2". Use "!py-0" if needed.
        )}
      >
        <Link href="/" className={cn(
            "flex items-center gap-2", 
            open ? "font-semibold" : ""
          )} 
          aria-label="Ke Dashboard Utama"
        >
          <div className={cn(
            "flex items-center justify-center rounded-md",
            open ? "bg-black p-2" : "bg-transparent p-0" 
          )}>
            {/* Icon Atom, disarankan size-4 (h-4 w-4) jika ingin konsisten dengan CVA SidebarMenuButton */}
            <Atom className={cn(
              open ? "text-white h-5 w-5" : "text-foreground h-6 w-6" // Saat ini h-5/h-6. Pertimbangkan h-4 w-4 jika ingin konsisten.
            )} />
          </div>
          {open && (
            <div className="flex flex-col"> 
              <span className="text-base font-semibold whitespace-nowrap">Dashboard HOPE</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className={cn(
        // Base styles from sidebar.tsx: "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden"
        // User styles:
        "py-2", // Menambahkan padding vertikal pada content area
        open ? "px-3" : "px-0" // Menambahkan padding horizontal kondisional
        // flex-1 dan overflow-y-auto sudah ada di base atau kompatibel.
      )}>
        <NavMainHope items={navMainData} />
      </SidebarContent>

      <SidebarFooter className="mt-auto p-2 border-t"> 
        {/* Base SidebarFooter: "flex flex-col gap-2 p-2" */}
        {/* User: "mt-auto p-2 border-t". `p-2` konsisten. `mt-auto` dan `border-t` adalah tambahan. */}
        <NavUserHope user={userDataForNav} />
      </SidebarFooter>
    </UiSidebar>
  );
}