// Lokasi: src/components/layout/NavUserHope.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Settings, LogOut, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from "@/components/ui/skeleton";

export function NavUserHope() {
  const router = useRouter();
  const { userData, userRole, logout, isLoading } = useAuth(); // Data dari useAuth sekarang sudah kaya!
  const { open, isMobile } = useSidebar();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const getInitials = (name: string) => {
    if (!name) return '??'; // Handle jika nama kosong
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="w-full justify-start text-left cursor-default">
            <Skeleton className={cn("h-8 w-8 rounded-lg shrink-0", !open ? "mx-auto" : "mr-2")} />
            {open && (
              <div className="grid flex-1 text-sm leading-tight gap-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!userData) {
    return null; // Tidak menampilkan apa-apa jika tidak ada sesi
  }

  // PATCH: Semua referensi ke `userData.name` sekarang menjadi `userData.fullname`
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn("w-full justify-start text-left")}
            >
              <Avatar className={cn("h-8 w-8 rounded-lg shrink-0", !open ? "mx-auto" : "mr-2")}>
                {userData.avatar && <AvatarImage src={userData.avatar} alt={userData.fullname} />}
                <AvatarFallback className="rounded-lg">
                  {getInitials(userData.fullname)}
                </AvatarFallback>
              </Avatar>
              {open && (
                <div className="grid flex-1 text-sm leading-tight">
                  {/* Di sini perubahannya */}
                  <span className="truncate font-semibold">{userData.fullname}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userData.email}
                  </span>
                </div>
              )}
              {open && <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={isMobile ? 12 : 8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  {userData.avatar && <AvatarImage src={userData.avatar} alt={userData.fullname} />}
                  <AvatarFallback className="rounded-lg">
                    {getInitials(userData.fullname)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  {/* Dan di sini juga perubahannya */}
                  <span className="truncate font-semibold">{userData.fullname}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {userData.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profil" className="flex items-center w-full cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4 shrink-0" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            {userRole === 'super_admin' && (
              <DropdownMenuItem asChild>
                <Link href="/pengguna" className="flex items-center w-full cursor-pointer">
                  <Settings className="mr-2 h-4 w-4 shrink-0" />
                  <span>Manajemen Pengguna</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 hover:!text-red-700 focus:!text-red-700 !bg-transparent hover:!bg-red-50 focus:!bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4 shrink-0" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}