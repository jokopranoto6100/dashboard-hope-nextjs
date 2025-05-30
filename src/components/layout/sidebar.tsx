// src/components/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import {
  LayoutDashboard, ChevronDown, ChevronUp, User, Settings, FolderKanban, FlaskConical,
  FileUp, Database, RefreshCcw, Merge, ArrowDownToLine, Users, Scale, Factory,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface UserSession {
  role: string;
  username: string;
  email: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();

  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error: userError } = await supabase.auth.getSession();
      if (userError) {
        console.error("Error fetching session:", userError.message);
        setUserSession(null);
        setIsLoadingSession(false);
        return;
      }

      if (session) {
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

    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserSession({
          role: session.user.user_metadata?.role || 'viewer',
          username: session.user.user_metadata?.username || 'User',
          email: session.user.email || 'N/A',
        });
      } else {
        setUserSession(null);
        router.push('/auth/login');
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase, router]);

  const isSuperAdmin = userSession?.role === 'super_admin';

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isLoadingSession) {
    return (
      <aside className="hidden md:flex flex-col h-screen w-64 border-r bg-background justify-center items-center">
        <p>Memuat...</p>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen border-r bg-background transition-all duration-300 ease-in-out relative", // Tambahkan relative di sini
        isCollapsed ? "w-[80px]" : "w-64"
      )}
    >
      {/* Tombol Toggle Sidebar - Pindahkan posisi dan styling */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-4 z-10 rounded-full bg-background border border-gray-200 shadow-md hover:bg-gray-100",
          isCollapsed ? "left-[calc(80px-16px)]" : "left-[calc(256px-16px)]" // Posisi tombol
        )}
        onClick={handleToggleCollapse}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* Konten atas sidebar (logo dan nama aplikasi) */}
      <div className="flex h-16 items-center justify-center border-b px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <img src="/icon/hope.png" alt="Dashboard HOPE Logo" className="h-8 w-8" />
          {!isCollapsed && <span className="text-lg whitespace-nowrap">Dashboard HOPE</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className={cn("grid items-start px-2 text-sm font-medium", isCollapsed ? "gap-1" : "gap-2 lg:px-4")}>

          {/* Item menu dan Collapsible yang sama */}
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/" && "bg-muted text-primary",
              isCollapsed && "justify-center px-2 py-3"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            {!isCollapsed && <span className="whitespace-nowrap">Dashboard Utama</span>}
          </Link>

          {/* ... Sisa menu Monitoring, Evaluasi, Statistik Produksi, Update Data (tetap sama) ... */}

          {/* Monitoring */}
          <Collapsible className="grid gap-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isCollapsed && "justify-center px-2 py-3 w-full"
                )}
              >
                <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
                  <FolderKanban className="h-4 w-4" />
                  {!isCollapsed && <span className="whitespace-nowrap">Monitoring</span>}
                </div>
                {!isCollapsed && <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />}
              </Button>
            </CollapsibleTrigger>
            {!isCollapsed && (
              <CollapsibleContent className="space-y-1 pl-6">
                <Link
                  href="/monitoring/ubinan"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === "/monitoring/ubinan" && "bg-muted text-primary"
                  )}
                >
                  Ubinan
                </Link>
                <Link
                  href="/monitoring/ksa"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === "/monitoring/ksa" && "bg-muted text-primary"
                  )}
                >
                  Kerangka Sampel Area
                </Link>
              </CollapsibleContent>
            )}
          </Collapsible>

          {/* Evaluasi */}
          <Collapsible className="grid gap-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isCollapsed && "justify-center px-2 py-3 w-full"
                )}
              >
                <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
                  <FlaskConical className="h-4 w-4" />
                  {!isCollapsed && <span className="whitespace-nowrap">Evaluasi</span>}
                </div>
                {!isCollapsed && <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />}
              </Button>
            </CollapsibleTrigger>
            {!isCollapsed && (
              <CollapsibleContent className="space-y-1 pl-6">
                <Link
                  href="/evaluasi/ubinan"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === "/evaluasi/ubinan" && "bg-muted text-primary"
                  )}
                >
                  Ubinan
                </Link>
                <Link
                  href="/evaluasi/ksa"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === "/evaluasi/ksa" && "bg-muted text-primary"
                  )}
                >
                  Kerangka Sampel Area
                </Link>
              </CollapsibleContent>
            )}
          </Collapsible>

          {/* Statistik Produksi */}
          <Link
            href="/produksi-statistik"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname === "/produksi-statistik" && "bg-muted text-primary",
              isCollapsed && "justify-center px-2 py-3"
            )}
          >
            <Scale className="h-4 w-4" />
            {!isCollapsed && <span className="whitespace-nowrap">Statistik Produksi</span>}
          </Link>

          {/* Update Data (Hanya untuk Super Admin) */}
          {isSuperAdmin && (
            <Collapsible className="grid gap-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isCollapsed && "justify-center px-2 py-3 w-full"
                  )}
                >
                  <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
                    <Database className="h-4 w-4" />
                    {!isCollapsed && <span className="whitespace-nowrap">Update Data</span>}
                  </div>
                  {!isCollapsed && <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />}
                </Button>
              </CollapsibleTrigger>
              {!isCollapsed && (
                <CollapsibleContent className="space-y-1 pl-6">
                  <Link
                    href="/update/ubinan-raw"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      pathname === "/update/ubinan-raw" && "bg-muted text-primary"
                    )}
                  >
                    <FileUp className="h-4 w-4" />
                    Upload Data Ubinan Mentah
                  </Link>
                  <Link
                    href="/update/master-sampel"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      pathname === "/update/master-sampel" && "bg-muted text-primary"
                    )}
                  >
                    <FileUp className="h-4 w-4" />
                    Upload Data Master Sampel
                  </Link>
                  <Link
                    href="/update/generate-anomali"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      pathname === "/update/generate-anomali" && "bg-muted text-primary"
                    )}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Generate Anomali Ubinan
                  </Link>
                  <Link
                    href="/update/generate-gabung"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      pathname === "/update/generate-gabung" && "bg-muted text-primary"
                    )}
                  >
                    <Merge className="h-4 w-4" />
                    Generate Gabungan Ubinan
                  </Link>
                  <Link
                    href="/update/ksa"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      pathname === "/update/ksa" && "bg-muted text-primary"
                    )}
                  >
                    <FileUp className="h-4 w-4" />
                    Upload Data KSA
                  </Link>
                  <Link
                    href="/update/atap"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      pathname === "/update/atap" && "bg-muted text-primary"
                    )}
                  >
                    <Factory className="h-4 w-4" />
                    Upload & Edit ATAP
                  </Link>
                </CollapsibleContent>
              )}
            </Collapsible>
          )}
        </nav>
      </div>

      {/* Bagian Bawah Sidebar - Informasi User dan Logout */}
      <div className="mt-auto p-4 border-t">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full flex justify-between items-center px-2 py-2 text-muted-foreground hover:text-primary",
                    isCollapsed && "justify-center px-2 py-3"
                  )}
                >
                    <div className={cn("flex items-center gap-2", isCollapsed && "justify-center w-full")}>
                        <Users className="h-5 w-5" />
                        {!isCollapsed && (
                          <div className="flex flex-col items-start">
                              <span className="font-semibold text-sm whitespace-nowrap">
                                {userSession?.username || 'Guest'}
                              </span>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {userSession?.email || 'N/A'}
                              </span>
                          </div>
                        )}
                    </div>
                    {!isCollapsed && <ChevronUp className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Link href="/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Link href="/settings" className="flex items-center w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Pengaturan</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 hover:text-red-800 focus:text-red-800 cursor-pointer">
                    <LogoutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

const LogoutButton = () => {
  const supabase = createClientComponentSupabaseClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <Button variant="ghost" onClick={handleLogout} className="w-full flex items-center justify-start text-red-600 hover:text-red-800">
      <ArrowDownToLine className="mr-2 h-4 w-4" />
      <span>Keluar</span>
    </Button>
  );
};