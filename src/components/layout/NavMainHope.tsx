// src/components/layout/NavMainHope.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/sidebar-data';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'; // Pastikan path ini benar menunjuk ke file sidebar.tsx Anda

interface NavMainHopeProps {
  items: NavItem[];
}

export function NavMainHope({ items }: NavMainHopeProps) {
  const pathname = usePathname();
  const { open } = useSidebar(); // State 'open' dari SidebarProvider

  // Kalkulasi target indentasi teks (berdasarkan ikon h-4 w-4 untuk main item):
  // - SidebarContent (saat open) memiliki px-3 -> padding-left: 0.75rem
  // - SidebarMenuButton (dari CVA di sidebar.tsx) memiliki p-2 -> padding-left: 0.5rem
  // - Ikon utama (h-4 w-4) memiliki lebar 1rem
  // - Margin kanan ikon utama (mr-2) adalah 0.5rem
  // Jadi, target indentasi teks utama = 0.75rem + 0.5rem + 1rem + 0.5rem = 2.75rem

  // Untuk Submenu:
  // - Indentasi sebelum SidebarMenuSubButton = 
  //   0.75rem (SidebarContent pl) + 
  //   0.875rem (SidebarMenuSub mx-3.5 -> ml) + 
  //   0.625rem (SidebarMenuSub px-2.5 -> pl) 
  //   = 2.25rem
  // - SidebarMenuSubButton (dari sidebar.tsx) memiliki px-2 -> padding-left: 0.5rem
  // Jadi, target indentasi teks submenu (tanpa ikon) = 2.25rem + 0.5rem = 2.75rem. Ini akan SEJAJAR.

  return (
    <SidebarMenu> {/* Menggunakan base style dari sidebar.tsx */}
      {items.map((item) => {
        const itemIsActive = item.isActive ? item.isActive(pathname) : false;

        if (item.items && item.items.length > 0) {
          return (
            <Collapsible key={item.title} asChild defaultOpen={itemIsActive}>
              {/* Tambahkan flex justify-center saat !open untuk menengahkan SidebarMenuButton */}
              <SidebarMenuItem className={cn(!open && "flex justify-center")}>
                <SidebarMenuButton
                  asChild
                  className={cn( // Menambahkan gaya aktif
                    itemIsActive && open && "bg-muted text-primary font-semibold",
                    itemIsActive && !open && "bg-muted text-primary"
                  )}
                  tooltip={item.title}
                >
                  <Link href={item.url || '#'}>
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0", // Ukuran ikon konsisten dengan ekspektasi CVA
                      open ? "mr-2" : "" // Margin hanya saat open. Saat collapsed, padding tombol yg urus.
                    )} />
                    {open && <span className="truncate">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>

                {item.items && item.items.length > 0 && (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction aria-label={`Toggle ${item.title}`}>
                      <ChevronRight className="h-4 w-4" />
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                )}
                
                <CollapsibleContent>
                  {/* Menggunakan SidebarMenuSub dengan gaya defaultnya */}
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const subItemIsActive = subItem.isActive ? subItem.isActive(pathname) : false;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={cn( // Hanya menambahkan gaya aktif
                              subItemIsActive && "bg-muted text-primary font-semibold"
                              // Tidak perlu override padding kiri (pl-*), base px-2 sudah cukup untuk alignment
                            )}
                          >
                            <Link href={subItem.url}>
                              {subItem.icon && (
                                <subItem.icon className="h-4 w-4 mr-2 shrink-0" />
                              )}
                              <span className="truncate">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        }

        // Item menu tunggal (tanpa submenu)
        return (
          // Tambahkan flex justify-center saat !open untuk menengahkan SidebarMenuButton
          <SidebarMenuItem key={item.title} className={cn(!open && "flex justify-center")}>
            <SidebarMenuButton
              asChild
              className={cn(
                itemIsActive && open && "bg-muted text-primary font-semibold",
                itemIsActive && !open && "bg-muted text-primary"
              )}
              tooltip={item.title}
            >
              <Link href={item.url || '#'}>
                <item.icon className={cn(
                  "h-4 w-4 shrink-0", // Ukuran ikon konsisten
                  open ? "mr-2" : "" // Margin hanya saat open
                )} />
                {open && <span className="truncate">{item.title}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}