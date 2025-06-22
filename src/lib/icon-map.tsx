// src/lib/icon-map.tsx
import {
    LucideIcon, BookOpen, UploadCloud, LayoutTemplate, AreaChart,
    ClipboardPenLine, Trees, Fish, Wheat, Carrot, Leaf, Bird, Component, Link as LinkIcon
} from 'lucide-react';

// Peta dari string nama ikon ke komponen ikon yang sebenarnya
export const iconMap: { [key: string]: LucideIcon } = {
    BookOpen,
    UploadCloud,
    LayoutTemplate,
    AreaChart,
    ClipboardPenLine,
    Trees,
    Fish,
    Wheat,
    Carrot,
    Leaf,
    Bird,
    Component,
    LinkIcon
};

// Fungsi untuk mendapatkan ikon, dengan fallback jika tidak ditemukan
export const getIcon = (name: string | null | undefined): LucideIcon => {
    if (name && iconMap[name]) {
        return iconMap[name];
    }
    // Mengembalikan ikon default jika nama tidak ada di peta
    return Component; 
};

// Daftar nama ikon yang bisa dipilih di form nanti
export const availableIcons = Object.keys(iconMap);