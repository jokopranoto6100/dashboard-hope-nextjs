'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { useDarkMode } from "@/context/DarkModeContext";
import { cn } from '@/lib/utils';
import { getNavMainItems, type UserData } from '@/lib/sidebar-data';
import { Atom } from 'lucide-react';

import {
  Sidebar as UiSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

import { NavMainHope } from './NavMainHope';
import { NavUserHope } from './NavUserHope';

interface NewSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

interface UserSessionData {
  id: string;
  role: string;
  username: string;
  email: string;
  avatar?: string | null;
  satker_id?: string | null;
  fullname?: string;
}


export default function NewSidebar({ mobile = false, onNavigate }: NewSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { supabase } = useAuth();
  const { open } = useSidebar();
  const { mounted } = useDarkMode();

  const [userSession, setUserSession] = React.useState<UserSessionData | null>(null);
  const [isLoadingSession, setIsLoadingSession] = React.useState(true);

  // For desktop, only prevent initial SSR mismatch
  if (!mobile && !mounted) {
    return null;
  }

  React.useEffect(() => {
    const getSession = async () => {
      setIsLoadingSession(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        setUserSession(null);
      } else if (session) {
        setUserSession({
          id: session.user.id, // ambil dari session.user.id
          role: session.user.user_metadata?.role || 'viewer',
          username: session.user.user_metadata?.username || 'User',
          email: session.user.email || 'N/A',
          avatar: session.user.user_metadata?.avatar ?? null,
          satker_id: session.user.user_metadata?.satker_id ?? null,
          fullname: session.user.user_metadata?.fullname ?? session.user.user_metadata?.username ?? "User"
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
          id: session.user.id, // ambil dari session.user.id
          role: session.user.user_metadata?.role || 'viewer',
          username: session.user.user_metadata?.username || 'User',
          email: session.user.email || 'N/A',
          avatar: session.user.user_metadata?.avatar ?? null,
          satker_id: session.user.user_metadata?.satker_id ?? null,
          fullname: session.user.user_metadata?.fullname ?? session.user.user_metadata?.username ?? "User"
        });

      } else {
        setUserSession(null);
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router]);

  const isSuperAdmin = userSession?.role === 'super_admin';
  
  // ✅ OPTIMALISASI 2: Optimalisasi useMemo dependencies
  const navMainData = React.useMemo(
    () => getNavMainItems(pathname, isSuperAdmin),
    [pathname, isSuperAdmin] // Hanya re-compute jika pathname atau role berubah
  );
  
  // ✅ OPTIMALISASI 3: Pisahkan user data computation untuk mengurangi re-render
  const userDataForNav: UserData | null = React.useMemo(() => 
    userSession ? {
      id: userSession.id ?? "",
      username: userSession.username ?? "",
      fullname: userSession.username ?? "",
      email: userSession.email ?? "",
      avatar: userSession.avatar ?? null,
      satker_id: userSession.satker_id ?? null
    } : null,
    [userSession]
  );

  if (mobile) {
    if (isLoadingSession && !userSession) {
       return (
         <div className="flex flex-col h-full px-3 py-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center p-2">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-4 w-[calc(100%-2rem)] ml-2" />
              </div>
            ))}
            <div className="mt-auto p-2 flex items-center">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="ml-2 flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
         </div>
       );
    }
    
    return (
      <div className="flex flex-col h-full">
        <SidebarContent className="py-2 px-3">
          <NavMainHope items={navMainData} onNavigate={onNavigate} />
        </SidebarContent>
        <SidebarFooter className="mt-auto p-2 border-t">
            <NavUserHope user={userDataForNav ?? undefined} onNavigate={onNavigate} />
        </SidebarFooter>
      </div>
    );
  }

  // Tampilan Sidebar Desktop (tidak berubah)
  if (isLoadingSession && !userSession) {
    return (
      <aside
        className={cn(
          "flex-col border-r bg-background",
          "fixed top-0 left-0 h-screen z-[50]",
          !open ? "w-[var(--sidebar-width-icon)] items-center" : "w-[var(--sidebar-width)]",
          "pt-4 pb-2"
        )}
        style={{
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties}
      >
        <div className={cn("h-16 flex items-center", open ? "px-4 lg:px-6 justify-start" : "px-0 justify-center")}>
          <Skeleton className={cn("rounded-md", open ? "h-8 w-8" : "h-6 w-6")} />
          {open && <Skeleton className="h-5 w-32 ml-2" />}
        </div>
        <div className={cn("flex flex-1 flex-col gap-2 overflow-hidden py-2", open ? "px-3" : "px-0 items-center")}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn("flex items-center", open ? "p-2" : "p-0 py-2 justify-center")}>
              <Skeleton className={cn("rounded", open ? "h-6 w-6" : "h-5 w-5")} />
              {open && <Skeleton className="h-4 w-[calc(100%-2rem)] ml-2" />}
            </div>
          ))}
        </div>
        <div className={cn("p-2 flex items-center", open ? "justify-start" : "justify-center")}>
          <Skeleton className={cn("rounded-lg", open ? "h-10 w-10" : "h-8 w-8")} />
          {open && (<div className="ml-2 flex-1"><Skeleton className="h-4 w-3/4 mb-1" /><Skeleton className="h-3 w-1/2" /></div>)}
        </div>
      </aside>
    );
  }

  return (
    <UiSidebar
      variant="sidebar"
      collapsible="icon"
      className={cn("flex-col bg-background z-[50]")}
    >
      <SidebarHeader className={cn("h-16 border-b", open ? "px-4 lg:px-6 justify-center items-start" : "px-0 justify-center items-center", "py-0")}>
        <Link href="/" className={cn("flex items-center gap-2", open ? "font-semibold" : "")} aria-label="Ke Dashboard Utama">
          <div className={cn("flex items-center justify-center rounded-md", open ? "bg-black p-2" : "bg-transparent p-0")}>
            <Atom className={cn(open ? "text-white h-5 w-5" : "text-foreground h-6 w-6")} />
          </div>
          {open && (<div className="flex flex-col"><span className="text-base font-semibold whitespace-nowrap">Dashboard HOPE</span></div>)}
        </Link>
      </SidebarHeader>
      <SidebarContent className={cn("py-2", open ? "px-3" : "px-0")}>
        <NavMainHope items={navMainData} onNavigate={onNavigate} />
      </SidebarContent>
      <SidebarFooter className="mt-auto p-2 border-t">
        <NavUserHope user={userDataForNav ?? undefined} onNavigate={onNavigate} />
      </SidebarFooter>
    </UiSidebar>
  );
}