import {
    LucideIcon,
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
  } from 'lucide-react';
  
  // Tipe untuk setiap tombol/link di dalam detail
  export interface LinkItem {
    label: string;
    href: string;
    Icon: LucideIcon;
    description: string;
  }
  
  // Tipe untuk setiap item di carousel (setiap sektor)
  export interface SektorItem {
    id: string;
    nama: string;
    Icon: LucideIcon;
    backgroundColor: string; // Class Tailwind CSS untuk warna latar
    links: LinkItem[];
  }
  
  // Data utama kita
  export const dataSektor: SektorItem[] = [
    {
      id: "tanaman-pangan",
      nama: "Tanaman Pangan",
      Icon: Wheat,
      backgroundColor: "from-green-100 to-green-200 dark:from-green-900/70 dark:to-green-950/70",
      links: [
        {
          label: "Upload SIMTP",
          href: "#",
          Icon: UploadCloud,
          description: "Unggah data melalui aplikasi SIMTP."
        },
        {
          label: "Ubinan",
          href: "https://drive.google.com/drive/u/3/folders/11XMQ8dgqvB9CqyUZln5v29YJayFNMr5W",
          Icon: LayoutTemplate,
          description: "Lihat detail..."
        },
        {
          label: "KSA",
          href: "https://drive.google.com/drive/u/3/folders/1LQOmYkwZt8RzyLvZKAPsPb8POxF4SHyE",
          Icon: BookOpen,
          description: "Lihat detail..."
        },
        {
          label: "iFrame Padi",
          href: "https://iframe.bps.go.id/sampling/padi",
          Icon: BookOpen,
          description: "Pengajuan sampel tambahan ubinan padi."
        },
        {
          label: "iFrame Palawija",
          href: "https://iframe.bps.go.id/sampling/palawija/login",
          Icon: BookOpen,
          description: "Pengajuan sampel tambahan ubinan palawija."
        }
      ]
    },
    {
      id: "hortikultura",
      nama: "Hortikultura",
      Icon: Carrot,
      backgroundColor: "from-orange-100 to-orange-200 dark:from-orange-900/70 dark:to-orange-950/70",
      links: [
        {
          label: "VP-VN",
          href: "https://drive.google.com/drive/u/3/folders/1f5dhRa37CRKI1vQbYDTNBNqL-weiP4yY",
          Icon: AreaChart,
          description: "Akses laporan bulanan interaktif."
        },
        {
          label: "Entri SPH",
          href: "https://pengolahan.bps.go.id/produksi/hortikultura/sph2021/index.php?r=site/login",
          Icon: BookOpen,
          description: "Unduh buku pedoman terbaru."
        }
      ]
    },
    {
      id: "perkebunan",
      nama: "Perkebunan",
      Icon: Leaf,
      backgroundColor: "from-lime-100 to-lime-200 dark:from-lime-900/70 dark:to-lime-950/70",
      links: [
        {
          label: "Komstrat",
          href: "https://drive.google.com/drive/u/3/folders/1A2w27Xpl0SlX98-GMM125e5c1GwtCufz",
          Icon: ClipboardPenLine,
          description: "Survei Komoditas Strategis Perkebunan."
        },
        {
          label: "Sedapp Online",
          href: "https://skb.bps.go.id/pb/site/login",
          Icon: ClipboardPenLine,
          description: "Entri Kebun Bulanan."
        },
        {
          label: "Entri Kebun Tahunan",
          href: "https://pengolahan.bps.go.id/produksi/perkebunan/SKB_tahunan/main",
          Icon: AreaChart,
          description: "Data produksi kelapa sawit terkini."
        },
      ]
    },
    {
      id: "peternakan",
      nama: "Peternakan",
      Icon: Bird,
      backgroundColor: "from-amber-100 to-amber-200 dark:from-amber-900/70 dark:to-amber-950/70",
      links: [
        {
          label: "LTU/LTT",
          href: "https://drive.google.com/drive/u/3/folders/1f0QdE1ivyD5g8oALD5RVmsuzxGaaadSO",
          Icon: LayoutTemplate,
          description: "Sistem Informasi Kesehatan Hewan Nasional."
        },
        {
          label: "Upload LTU/LTT",
          href: "https://drive.google.com/drive/u/3/folders/1RavSTLcclONYKYeVCZbr0u6QHdPPNEkm",
          Icon: AreaChart,
          description: "LTT/LTU"
        },
      ]
    },
    {
      id: "perikanan",
      nama: "Perikanan",
      Icon: Fish,
      backgroundColor: "from-sky-100 to-sky-200 dark:from-sky-900/70 dark:to-sky-950/70",
      links: [
        {
          label: "Entri Perikanan",
          href: "https://ipd.bps.go.id/perikanan/login",
          Icon: LayoutTemplate,
          description: "Entri Data Perikanan."
        },
      ]
    },
    {
      id: "kehutanan",
      nama: "Kehutanan",
      Icon: Trees,
      backgroundColor: "from-teal-100 to-teal-200 dark:from-teal-900/70 dark:to-teal-950/70",
      links: [
        {
          label: "Direktori Perusahaan",
          href: "https://s.bps.go.id/siutan_kalbar",
          Icon: LayoutTemplate,
          description: "Sistem Informasi Penatausahaan Hasil Hutan."
        },
      ]
    }
  ];