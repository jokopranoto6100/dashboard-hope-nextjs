// src/app/(dashboard)/crawling-fasih/NavMainHope.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { NavItem } from '@/lib/sidebar-data';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';

interface NavMainHopeProps {
  items: NavItem[];
  onNavigate?: () => void;
}

// ✅ OPTIMALISASI 1: Tambahkan React.memo untuk mengurangi re-render
export const NavMainHope = React.memo(function NavMainHope({ items, onNavigate }: NavMainHopeProps) {
  const pathname = usePathname();
  const { open } = useSidebar();

  // ✅ OPTIMALISASI: Memoize click handler untuk mengurangi re-render
  const handleNavigate = React.useCallback(() => {
    onNavigate?.();
  }, [onNavigate]);

  // ✅ OPTIMALISASI: Memoize active items untuk mengurangi computation
  const memoizedItems = React.useMemo(() => 
    items.map(item => ({
      ...item,
      isActiveComputed: item.isActive ? item.isActive(pathname) : false
    })),
    [items, pathname]
  );

  return (
    <SidebarMenu>
      {memoizedItems.map((item) => {
        const itemIsActive = item.isActiveComputed;

        // Logika untuk menu GRUP/COLLAPSIBLE
        if (item.items && item.items.length > 0) {
          return (
            <Collapsible key={item.title} defaultOpen={itemIsActive} disabled={item.disabled}>
              <SidebarMenuItem className={cn(!open && 'flex justify-center')}>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CollapsibleTrigger asChild disabled={item.disabled}>
                        <SidebarMenuButton
                          className={cn(
                            'group flex w-full items-center',
                            itemIsActive && open && 'bg-muted text-primary font-semibold',
                            itemIsActive && !open && 'bg-muted text-primary',
                            item.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
                          )}
                          tooltip={item.title}
                        >
                          <item.icon className={cn('h-4 w-4 shrink-0', open ? 'mr-2' : '')} />
                          {open && <span className="flex-grow truncate">{item.title}</span>}
                          {open && (
                            <ChevronRight
                              className={cn(
                                'h-4 w-4 shrink-0',
                                'group-data-[state=open]:rotate-90',
                              )}
                            />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </TooltipTrigger>
                    {item.disabled && (
                      <TooltipContent side="right" sideOffset={10}>
                        <p>Fitur dinonaktifkan sementara</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                <CollapsibleContent>
                  <SidebarMenuSub className={cn(open ? 'ml-5' : 'mx-0 px-0')}>
                    {item.items.map((subItem) => {
                      const subItemIsActive = subItem.isActive
                        ? subItem.isActive(pathname)
                        : false;
                      return (
                        <div key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={cn(
                              open ? 'pl-4 pr-2' : 'px-2',
                              subItemIsActive && 'bg-muted text-primary font-semibold'
                            )}
                          >
                            <Link href={subItem.url} onClick={handleNavigate}>
                              {subItem.icon && (
                                <subItem.icon className={cn('h-4 w-4 shrink-0', open ? 'mr-2' : '')} />
                              )}
                              {open && <span className="flex-grow truncate">{subItem.title}</span>}
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

        // Logika untuk menu TUNGGAL (Crawling FASIH, dll)
        return (
          <SidebarMenuItem key={item.title} className={cn(!open && 'flex justify-center')}>
            {item.disabled ? (
              // JIKA DISABLED
              <TooltipProvider delayDuration={100}>
                 <Tooltip>
                    {/* [PERBAIKAN] Tambahkan 'asChild' di sini */}
                    <TooltipTrigger asChild>
                       <SidebarMenuButton
                         className={cn(
                           'w-full justify-start', // Pastikan button full-width
                           'cursor-not-allowed opacity-50 text-muted-foreground'
                         )}
                         tooltip={item.title}
                       >
                         <item.icon className={cn('h-4 w-4 shrink-0', open ? 'mr-2' : '')} />
                         {open && <span className="truncate">{item.title}</span>}
                       </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                       <p>This feature is currently available on localhost only.</p>
                    </TooltipContent>
                 </Tooltip>
              </TooltipProvider>
            ) : (
              // JIKA TIDAK DISABLED
              <SidebarMenuButton
                asChild
                className={cn(
                  itemIsActive && open && 'bg-muted text-primary font-semibold',
                  itemIsActive && !open && 'bg-muted text-primary'
                )}
                tooltip={item.title}
              >
                <Link href={item.url || '#'} onClick={handleNavigate}>
                  <item.icon className={cn('h-4 w-4 shrink-0', open ? 'mr-2' : '')} />
                  {open && <span className="truncate">{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
});