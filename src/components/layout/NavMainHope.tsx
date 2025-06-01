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
  // SidebarMenuAction, // Tidak lagi digunakan secara terpisah untuk trigger chevron
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  // SidebarMenuSubItem, // SidebarMenuSubItem tidak didefinisikan di snippet, mungkin ini SidebarMenuItem juga atau wrapper custom.
                          // Untuk saat ini, saya asumsikan SidebarMenuSubItem adalah tag standar atau wrapper sederhana.
                          // Jika SidebarMenuSubItem adalah komponen custom dengan stylingnya sendiri, ini perlu diperhatikan.
                          // Saya akan menggunakan div atau React.Fragment jika tidak ada styling khusus.
  useSidebar,
} from '@/components/ui/sidebar';

interface NavMainHopeProps {
  items: NavItem[];
}

export function NavMainHope({ items }: NavMainHopeProps) {
  const pathname = usePathname();
  const { open } = useSidebar(); // State 'open' dari SidebarProvider

  // Target indentasi teks utama dari tepi kiri SidebarContent (px-3 -> 0.75rem):
  // 0.75rem (SidebarContent pl) + 
  // 0.5rem (SidebarMenuButton p-2 -> pl) + 
  // 1rem (ikon w-4) + 
  // 0.5rem (ikon mr-2) 
  // = 2.75rem

  // Untuk Submenu agar sejajar:
  // Kita akan atur SidebarMenuSub agar memiliki margin kiri yang menempatkan
  // awal kontennya sejajar dengan awal ikon menu utama.
  // Awal ikon menu utama: 0.75rem (SidebarContent pl) + 0.5rem (SidebarMenuButton pl) = 1.25rem
  // Jadi, SidebarMenuSub akan mendapatkan ml-5 (1.25rem).
  // Kemudian, SidebarMenuSubButton di dalamnya akan mendapatkan pl-6 (1.5rem)
  // untuk menyamai (lebar ikon utama + margin kanan ikon utama).
  // Total indentasi teks submenu: 1.25rem (Sub ml) + 1.5rem (SubButton pl) = 2.75rem. SEJAJAR.

  return (
    <SidebarMenu>
      {items.map((item) => {
        const itemIsActive = item.isActive ? item.isActive(pathname) : false;

        if (item.items && item.items.length > 0) {
          return (
            <Collapsible key={item.title} defaultOpen={itemIsActive}>
              <SidebarMenuItem className={cn(!open && 'flex justify-center')}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={cn(
                      'group flex w-full items-center', // Tambahkan group, flex, w-full
                      itemIsActive && open && 'bg-muted text-primary font-semibold',
                      itemIsActive && !open && 'bg-muted text-primary',
                      // Hapus justify-between jika chevron dikontrol oleh 'open'
                    )}
                    tooltip={item.title}
                    // Jika item parent seharusnya tidak navigasi, hapus Link atau href
                    // Untuk saat ini, kita asumsikan item.url pada parent adalah '#' atau tidak ada
                    // Jika parent perlu navigasi DAN expand, UX perlu dipertimbangkan ulang
                  >
                    <item.icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        open ? 'mr-2' : '',
                      )}
                    />
                    {open && <span className="flex-grow truncate">{item.title}</span>}
                    {/* Chevron dipindah ke dalam button dan hanya muncul jika sidebar 'open' */}
                    {open && (
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform duration-200 ease-in-out',
                          'group-data-[state=open]:rotate-90', // Rotasi saat Collapsible terbuka
                        )}
                      />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  {/*
                    Pengaturan ml-5 (1.25rem) pada SidebarMenuSub bertujuan agar
                    konten di dalamnya (yaitu SidebarMenuSubButton) dimulai
                    sejajar dengan posisi ikon pada menu parent.
                  */}
                  <SidebarMenuSub className={cn(open ? 'ml-5' : 'mx-0 px-0' )}> {/* Penyesuaian indentasi submenu */}
                    {item.items.map((subItem) => {
                      const subItemIsActive = subItem.isActive
                        ? subItem.isActive(pathname)
                        : false;
                      return (
                        // Menggunakan div sebagai wrapper jika SidebarMenuSubItem tidak memberi styling khusus
                        // atau jika itu adalah alias untuk SidebarMenuItem. Sesuaikan jika perlu.
                        <div key={subItem.title}> 
                          <SidebarMenuSubButton
                            asChild
                            className={cn(
                              // pl-6 (1.5rem) = lebar ikon parent (1rem) + margin kanan ikon parent (0.5rem)
                              // pr-2 (0.5rem) untuk padding kanan standar
                              open ? 'pl-4 pr-2' : 'px-2', // Hanya terapkan padding khusus saat sidebar 'open'
                              subItemIsActive && 'bg-muted text-primary font-semibold',
                            )}
                          >
                            <Link href={subItem.url}>
                              {subItem.icon && open && ( // Hanya tampilkan ikon subitem jika sidebar 'open'
                                <subItem.icon className="mr-2 h-4 w-4 shrink-0" />
                              )}
                              {open && <span className="truncate">{subItem.title}</span>}
                              {!open && subItem.icon && ( // Jika sidebar collapsed, hanya ikon subitem (jika ada) sbg fallback
                                <subItem.icon className="h-4 w-4 shrink-0" />
                              )}
                               {!open && !subItem.icon && ( // Jika collapsed & tidak ada ikon subitem, mungkin title pendek?
                                 <span className="truncate">{subItem.title.substring(0,1)}</span>
                               )}
                            </Link>
                          </SidebarMenuSubButton>
                        </div>
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
          <SidebarMenuItem key={item.title} className={cn(!open && 'flex justify-center')}>
            <SidebarMenuButton
              asChild
              className={cn(
                itemIsActive && open && 'bg-muted text-primary font-semibold',
                itemIsActive && !open && 'bg-muted text-primary',
              )}
              tooltip={item.title}
            >
              <Link href={item.url || '#'}>
                <item.icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    open ? 'mr-2' : '',
                  )}
                />
                {open && <span className="truncate">{item.title}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}