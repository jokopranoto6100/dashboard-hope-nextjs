// src/lib/sidebar-data.ts
import {
    LayoutDashboard,
    Table2,
    BetweenHorizontalEnd,
    BotMessageSquare,
    Binoculars,
    ChartNoAxesCombined,
    CalendarDays,
    // Impor ikon lain yang Anda perlukan dari lucide-react
    // ChevronDown, // Mungkin tidak perlu di sini, akan ditangani oleh komponen Collapsible
  } from 'lucide-react';
  import type { LucideIcon } from 'lucide-react'; // Untuk tipe data ikon
  
  export interface NavItem {
    title: string;
    url?: string; // URL adalah opsional jika item adalah header collapsible tanpa link langsung
    icon: LucideIcon;
    isActive?: (pathname: string) => boolean; // Fungsi untuk menentukan status aktif
    items?: NavSubItem[]; // Untuk submenu
    isCollapsible?: boolean; // Menandakan apakah ini grup collapsible
    adminOnly?: boolean; // Untuk menandai menu khusus admin
    disabled?: boolean; // <-- [PERUBAHAN 1] TAMBAHKAN PROPERTI INI

  }
  
  export interface NavSubItem {
    title: string;
    url: string;
    icon?: LucideIcon; // Ikon untuk submenu (opsional)
    isActive?: (pathname: string) => boolean;
  }

export interface UserData {
  // PATCH: Ubah 'name' menjadi 'fullname' dan tambahkan properti lain
  id: string;
  fullname: string;
  username: string;
  email: string;
  avatar: string | null;
  satker_id: string | null;
  // 'role' akan kita kelola di state terpisah 'userRole' di context
}
  
  // --- Definisi Item Navigasi Utama ---
  export const getNavMainItems = (pathname: string, isSuperAdmin: boolean): NavItem[] => {
    const allItems: NavItem[] = [
      {
        title: "Dashboard Utama",
        url: "/",
        icon: LayoutDashboard,
        isActive: (currentPath) => currentPath === "/",
      },
      {
        title: "Bahan Produksi",
        url: "/bahan-produksi",
        icon: Table2,
        isActive: (currentPath) => currentPath === "/bahan-produksi",
      },
      {
        title: "Jadwal Kegiatan",
        url: "/jadwal",
        icon: CalendarDays,
        isActive: (currentPath) => currentPath === "/jadwal",
      },
      {
        title: "Monitoring",
        icon: Binoculars,
        isCollapsible: true,
        isActive: (currentPath) => currentPath.startsWith("/monitoring"),
        items: [
          {
            title: "Ubinan",
            url: "/monitoring/ubinan",
            isActive: (currentPath) => currentPath === "/monitoring/ubinan",
          },
          {
            title: "Kerangka Sampel Area",
            url: "/monitoring/ksa",
            isActive: (currentPath) => currentPath === "/monitoring/ksa",
          },
           {
            title: "SKGB",
            url: "/monitoring/skgb",
            isActive: (currentPath) => currentPath === "/monitoring/skgb",
          },
          {
            title: "SIMTP",
            url: "/monitoring/simtp",
            isActive: (currentPath) => currentPath === "/monitoring/simtp",
          },
          {
            title: "Kehutanan",
            url: "/monitoring/kehutanan",
            isActive: (currentPath) => currentPath === "/monitoring/kehutanan",
          },
        ],
      },
      {
        title: "Evaluasi",
        icon: ChartNoAxesCombined,
        isCollapsible: true,
        isActive: (currentPath) => currentPath.startsWith("/evaluasi"),
        items: [
          {
            title: "Ubinan",
            url: "/evaluasi/ubinan",
            isActive: (currentPath) => currentPath === "/evaluasi/ubinan",
          },
          {
            title: "Kerangka Sampel Area",
            url: "/evaluasi/ksa",
            isActive: (currentPath) => currentPath === "/evaluasi/ksa",
          },
        ],
      },
      {
        title: "Statistik Produksi",
        url: "/produksi-statistik",
        icon: Table2,
        isActive: (currentPath) => currentPath === "/produksi-statistik",
      },
      {
        title: "Update Data",
        icon: BetweenHorizontalEnd,
        isCollapsible: true,
        adminOnly: true, // Tandai ini sebagai menu admin
        isActive: (currentPath) => currentPath.startsWith("/update"),
        items: [
          {
            title: "Ubinan",
            url: "/update-data/ubinan",
            isActive: (currentPath) => currentPath === "/update-data/ubinan",
          },
          {
            title: "Kerangka Sampel Area",
            url: "/update-data/ksa",
            isActive: (currentPath) => currentPath === "/update-data/ksa",
          },
          {
            title: "Angka Tetap (ATAP)",
            url: "/update-data/atap",
            isActive: (currentPath) => currentPath === "/update-data/atap",
          },
        ],
      },
      {
        title: "Crawling FASIH",
        url: "/crawling-fasih",
        icon: BotMessageSquare,
        isActive: (currentPath) => currentPath === "/crawling-fasih",
        disabled: true, // <-- [PERUBAHAN 2] TAMBAHKAN PROPERTI INI
      },
    ];
  
    // Filter item berdasarkan peran admin
    return allItems.filter(item => !item.adminOnly || (item.adminOnly && isSuperAdmin));
  };
  
  // --- Definisi Data Pengguna (Contoh) ---
  // Ini akan diisi secara dinamis di komponen sidebar Anda
  // export const sampleUserData: UserData = {
  //   name: "Nama Pengguna",
  //   email: "email@example.com",
  //   avatar: "/avatars/default.png" // Path ke avatar default jika ada
  // };