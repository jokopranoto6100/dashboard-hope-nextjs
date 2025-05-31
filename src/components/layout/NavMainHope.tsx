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
  SidebarMenuSub, // Kita akan menggunakan gaya defaultnya kembali
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface NavMainHopeProps {
  items: NavItem[];
}

export function NavMainHope({ items }: NavMainHopeProps) {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const itemIsActive = item.isActive ? item.isActive(pathname) : false;

        if (item.items && item.items.length > 0) {
          return (
            <Collapsible key={item.title} asChild defaultOpen={itemIsActive}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    itemIsActive && open && "bg-muted text-primary font-semibold",
                    itemIsActive && !open && "bg-muted text-primary"
                  )}
                  tooltip={item.title}
                >
                  <Link href={item.url || '#'}>
                    <item.icon className={cn("h-5 w-5 shrink-0", !open ? "mx-auto" : "mr-2")} />
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
                  {/* Gunakan SidebarMenuSub tanpa className tambahan untuk mendapatkan gaya default (termasuk border-l) */}
                  <SidebarMenuSub> {/* <--- KEMBALIKAN KE DEFAULT (HAPUS className override) */}
                    {item.items.map((subItem) => {
                      const subItemIsActive = subItem.isActive ? subItem.isActive(pathname) : false;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={cn(
                              subItemIsActive && "bg-muted text-primary font-semibold",
                              // Sesuaikan padding kiri untuk alignment teks
                              // Default SidebarMenuSubButton sudah punya px-2.
                              // Default SidebarMenuSub memberi indent (mx-3.5 + px-2.5) = 1.5rem
                              // Teks induk dimulai pada 3.0rem (setelah padding SidebarContent px-3).
                              // Teks submenu tanpa pl tambahan: 1.5rem (indent sub) + 0.5rem (px-2 subbutton) = 2.0rem
                              // Jadi kita butuh pl-4 (1rem) lagi agar jadi 3.0rem.
                              "pl-4" // <--- PENYESUAIAN PADDING KIRI DI SINI
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
          // ... (bagian ini tetap sama) ...
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className={cn(
                itemIsActive && open && "bg-muted text-primary font-semibold",
                itemIsActive && !open && "bg-muted text-primary"
              )}
              tooltip={item.title}
            >
              <Link href={item.url || '#'}>
                <item.icon className={cn("h-5 w-5 shrink-0", !open ? "mx-auto" : "mr-2")} />
                {open && <span className="truncate">{item.title}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}