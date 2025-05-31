// src/components/layout/NavMainHope.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// ChevronRight untuk CollapsibleTrigger akan dikelola oleh SidebarMenuAction jika stylingnya sudah ada
// import { ChevronRight } from 'lucide-react'; 

import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/sidebar-data';

// Impor komponen UI Sidebar, Collapsible, dan useSidebar
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuAction, // Digunakan untuk trigger collapsible
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar, // Impor hook useSidebar
} from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react'; // Tetap dibutuhkan untuk ikon di dalam SidebarMenuAction

interface NavMainHopeProps {
  items: NavItem[];
  // isCollapsed prop dihapus
}

export function NavMainHope({ items }: NavMainHopeProps) {
  const pathname = usePathname();
  const { open } = useSidebar(); // Gunakan useSidebar untuk mendapatkan status 'open'

  return (
    <SidebarMenu>
      {items.map((item) => {
        const itemIsActive = item.isActive ? item.isActive(pathname) : false;

        if (item.items && item.items.length > 0) {
          return (
            <Collapsible key={item.title} asChild defaultOpen={itemIsActive}>
              <SidebarMenuItem>
                {/* Tidak perlu div wrapper ekstra di sini, SidebarMenuItem sudah cukup */}
                <SidebarMenuButton
                  asChild
                  className={cn(
                    // Styling item aktif bisa disederhanakan jika SidebarMenuButton menanganinya via data-active
                    itemIsActive && open && "bg-muted text-primary font-semibold",
                    itemIsActive && !open && "bg-muted text-primary" 
                  )}
                  tooltip={item.title} // Tooltip akan otomatis ditampilkan oleh SidebarMenuButton saat !open (collapsed)
                >
                  <Link href={item.url || '#'}>
                    <item.icon className={cn("h-5 w-5 shrink-0", !open ? "mx-auto" : "mr-2")} />
                    {open && <span className="truncate">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>

                {/* SidebarMenuAction dan SidebarMenuSub (dalam CollapsibleContent)
                    sudah memiliki styling `group-data-[collapsible=icon]:hidden`
                    dari components/ui/sidebar.tsx, jadi mereka akan otomatis tersembunyi
                    ketika sidebar diciutkan ke mode ikon.
                */}
                {item.items && item.items.length > 0 && (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction
                      aria-label={`Toggle ${item.title}`}
                      // className="data-[state=open]:rotate-90" // Styling rotate mungkin sudah ada di SidebarMenuAction
                    >
                      <ChevronRight className="h-4 w-4" />
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                )}
                
                <CollapsibleContent>
                  <SidebarMenuSub> {/* SidebarMenuSub akan hidden saat collapsible=icon */}
                    {item.items.map((subItem) => {
                      const subItemIsActive = subItem.isActive ? subItem.isActive(pathname) : false;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            // data-active={subItemIsActive} // Jika SidebarMenuSubButton mendukung ini
                            className={cn(subItemIsActive && "bg-muted text-primary font-semibold")}
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

        return (
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