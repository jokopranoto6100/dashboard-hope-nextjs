// src/lib/sidebar-data.ts
import {
    LayoutDashboard,
    FolderKanban,
    FlaskConical,
    Scale,
    Database,
    FileUp,
    RefreshCcw,
    Merge,
    Factory,
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
  }
  
  export interface NavSubItem {
    title: string;
    url: string;
    icon?: LucideIcon; // Ikon untuk submenu (opsional)
    isActive?: (pathname: string) => boolean;
  }
  
  export interface UserData {
    name: string;
    email: string;
    avatar?: string; // URL ke avatar pengguna (opsional)
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
        title: "Monitoring",
        icon: FolderKanban,
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
        ],
      },
      {
        title: "Evaluasi",
        icon: FlaskConical,
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
        icon: Scale,
        isActive: (currentPath) => currentPath === "/produksi-statistik",
      },
      {
        title: "Update Data",
        icon: Database,
        isCollapsible: true,
        adminOnly: true, // Tandai ini sebagai menu admin
        isActive: (currentPath) => currentPath.startsWith("/update"),
        items: [
          {
            title: "Upload Data Ubinan Mentah",
            url: "/update/ubinan-raw",
            icon: FileUp,
            isActive: (currentPath) => currentPath === "/update/ubinan-raw",
          },
          {
            title: "Upload Data Master Sampel",
            url: "/update/master-sampel",
            icon: FileUp, // Ganti ikon jika perlu
            isActive: (currentPath) => currentPath === "/update/master-sampel",
          },
          {
            title: "Generate Anomali Ubinan",
            url: "/update/generate-anomali",
            icon: RefreshCcw,
            isActive: (currentPath) => currentPath === "/update/generate-anomali",
          },
          {
            title: "Generate Gabungan Ubinan",
            url: "/update/generate-gabung",
            icon: Merge,
            isActive: (currentPath) => currentPath === "/update/generate-gabung",
          },
          {
            title: "Upload Data KSA",
            url: "/update/ksa",
            icon: FileUp, // Ganti ikon jika perlu
            isActive: (currentPath) => currentPath === "/update/ksa",
          },
          {
            title: "Upload & Edit ATAP",
            url: "/update/atap",
            icon: Factory,
            isActive: (currentPath) => currentPath === "/update/atap",
          },
        ],
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