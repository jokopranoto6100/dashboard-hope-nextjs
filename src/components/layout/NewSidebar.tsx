// src/components/layout/NewSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";

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
import { Skeleton } from '@/components/ui/skeleton'; // Impor Skeleton

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
  const { supabase } = useAuth();

  const [userSession, setUserSession] = React.useState<UserSessionData | null>(null);
  const [isLoadingSession, setIsLoadingSession] = React.useState(true);
  
  const { open } = useSidebar();

  React.useEffect(() => {
    const getSession = async () => {
      setIsLoadingSession(true);
      const { data: { session }, error } = await supabase.auth.getSession(); //
      if (error) {
        console.error("Error fetching session:", error.message); //
        setUserSession(null); //
      } else if (session) {
        setUserSession({ //
          role: session.user.user_metadata?.role || 'viewer', //
          username: session.user.user_metadata?.username || 'User', //
          email: session.user.email || 'N/A', //
        });
      } else {
        setUserSession(null); //
      }
      setIsLoadingSession(false); //
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { //
      if (session?.user) {
        setUserSession({ //
          role: session.user.user_metadata?.role || 'viewer', //
          username: session.user.user_metadata?.username || 'User', //
          email: session.user.email || 'N/A', //
        });
      } else {
        setUserSession(null); //
        // router.push('/auth/login');
      }
    });
    return () => {
      subscription?.unsubscribe(); //
    };
  }, [supabase, router]);

  const isSuperAdmin = userSession?.role === 'super_admin'; //
  const navMainData = React.useMemo(
    () => getNavMainItems(pathname, isSuperAdmin), //
    [pathname, isSuperAdmin]
  );
  const userDataForNav: UserData | null = userSession //
    ? { name: userSession.username, email: userSession.email } //
    : null;

  if (isLoadingSession && !userSession) {
    return (
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out", //
          "fixed top-0 left-0 h-screen z-50", //
          !open ? "w-[var(--sidebar-width-icon)] items-center" : "w-[var(--sidebar-width)]", //
          "pt-4 pb-2" // Menambahkan padding atas dan bawah
        )}
        style={{
          // @ts-ignore
          "--sidebar-width": "16rem", //
          "--sidebar-width-icon": "3rem", //
        }}
      >
        {/* Skeleton untuk Header */}
        <div className={cn(
          "h-16 flex items-center",
          open ? "px-4 lg:px-6 justify-start" : "px-0 justify-center"
        )}>
          <Skeleton className={cn("rounded-md", open ? "h-8 w-8" : "h-6 w-6")} />
          {open && <Skeleton className="h-5 w-32 ml-2" />}
        </div>

        {/* Skeleton untuk Content Menu */}
        <div className={cn(
          "flex flex-1 flex-col gap-2 overflow-hidden py-2",
          open ? "px-3" : "px-0 items-center"
        )}>
          {[...Array(5)].map((_, i) => ( // Membuat 5 baris skeleton menu
            <div key={i} className={cn("flex items-center", open ? "p-2" : "p-0 py-2 justify-center")}>
              <Skeleton className={cn("rounded", open ? "h-6 w-6" : "h-5 w-5")} />
              {open && <Skeleton className="h-4 w-[calc(100%-2rem)] ml-2" />}
            </div>
          ))}
        </div>
        
        {/* Skeleton untuk Footer (User) */}
        <div className={cn(
          "p-2 flex items-center",
          open ? "justify-start" : "justify-center"
        )}>
          <Skeleton className={cn("rounded-lg", open ? "h-10 w-10" : "h-8 w-8")} />
          {open && (
            <div className="ml-2 flex-1">
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <UiSidebar
      variant="sidebar"
      collapsible="icon" //
      className={cn(
        "hidden md:flex flex-col bg-background z-50" //
      )}
    >
      <SidebarHeader
        className={cn(
          "h-16 border-b", //
          open
            ? "px-4 lg:px-6 justify-center items-start" //
            : "px-0 justify-center items-center",   //
          "py-0" //
        )}
      >
        <Link href="/" className={cn( //
            "flex items-center gap-2",  //
            open ? "font-semibold" : "" //
          )} 
          aria-label="Ke Dashboard Utama"
        >
          <div className={cn( //
            "flex items-center justify-center rounded-md", //
            open ? "bg-black p-2" : "bg-transparent p-0"  //
          )}>
            <Atom className={cn( //
              open ? "text-white h-5 w-5" : "text-foreground h-6 w-6" //
            )} />
          </div>
          {open && ( //
            <div className="flex flex-col"> 
              <span className="text-base font-semibold whitespace-nowrap">Dashboard HOPE</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className={cn( //
        "py-2", //
        open ? "px-3" : "px-0" //
      )}>
        <NavMainHope items={navMainData} />
      </SidebarContent>

      <SidebarFooter className="mt-auto p-2 border-t"> 
        <NavUserHope user={userDataForNav} />
      </SidebarFooter>
    </UiSidebar>
  );
}