// src/components/layout/NavUserHope.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { User as UserIcon, Settings, LogOut, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { UserData } from '@/lib/sidebar-data';

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
  useSidebar, // Impor hook useSidebar
} from '@/components/ui/sidebar';
// Button tidak lagi diimpor dari sini jika tidak digunakan
// import { Button } from '@/components/ui/button'; 

interface NavUserHopeProps {
  user: UserData | null;
  // isCollapsed prop dihapus
}

export function NavUserHope({ user }: NavUserHopeProps) {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const { open, isMobile } = useSidebar(); // Gunakan useSidebar untuk mendapatkan status 'open' dan 'isMobile'

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (!user) {
    return null;
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn("w-full justify-start text-left")}
              // Tidak perlu tooltip di sini karena menu pengguna biasanya selalu terlihat atau bagian dropdownnya yang adaptif
            >
              <Avatar className={cn("h-8 w-8 rounded-lg shrink-0", !open ? "mx-auto" : "mr-2")}>
                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              {open && ( // Tampilkan nama dan email hanya jika sidebar diperluas
                <div className="grid flex-1 text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              )}
              {open && <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
            side={isMobile ? "top" : "right"} // Sesuaikan 'side' untuk mobile jika perlu (misal 'top')
            align="end"
            sideOffset={isMobile ? 12 : 8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center w-full cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4 shrink-0" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center w-full cursor-pointer">
                <Settings className="mr-2 h-4 w-4 shrink-0" />
                <span>Pengaturan</span>
              </Link>
            </DropdownMenuItem>
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