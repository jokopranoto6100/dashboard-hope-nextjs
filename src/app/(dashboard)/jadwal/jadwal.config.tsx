// Lokasi: src/app/(dashboard)/jadwal/jadwal.config.ts

export interface JadwalItem {
    nama: string;
    keterangan: string;
    startDate: string; // Format 'YYYY-MM-DD'
    endDate: string;
    warna: 'blue' | 'green' | 'amber' | 'sky' | 'slate'; // Tambah warna baru
  }
  
  export interface Kegiatan {
    kegiatan: string;
    jadwal?: JadwalItem[]; 
    subKegiatan?: Kegiatan[]; 
  }
  
  // Data Hardcode untuk Jadwal
  export const dataJadwalHarian: Kegiatan[] = [
    {
        kegiatan: "SKGB",
        subKegiatan: [
          {
            kegiatan: "Pelatihan Petugas",
            jadwal: [
              { nama: "Pelatihan Petugas", keterangan: "...", startDate: "2025-07-17", endDate: "2025-07-31", warna: "sky" },
            ],
          },
          {
            kegiatan: "Pelaksanaan Lapangan",
            jadwal: [
              { nama: "Pencacahan", keterangan: "...", startDate: "2025-08-01", endDate: "2025-09-30", warna: "green" },
            ],
          },
          {
            kegiatan: "Pemeriksaan",
            jadwal: [
              { nama: "Pemeriksaan", keterangan: "...", startDate: "2025-08-01", endDate: "2025-10-07", warna: "amber" },
            ],
          },
        ],
      },
    {
      kegiatan: "Ubinan Padi",
      subKegiatan: [
        {
          kegiatan: "Subround 1",
          jadwal: [
            { nama: "Pencacahan", keterangan: "...", startDate: "2025-01-01", endDate: "2025-04-30", warna: "sky" },
          ],
        },
        {
          kegiatan: "subround 2",
          jadwal: [
            { nama: "Pencacahan", keterangan: "...", startDate: "2025-05-01", endDate: "2025-08-30", warna: "green" },
          ],
        },
        {
          kegiatan: "Subround 3",
          jadwal: [
            { nama: "Pencacahan", keterangan: "...", startDate: "2025-09-01", endDate: "2025-12-30", warna: "amber" },
          ],
        },
      ],
    },
    {
      kegiatan: "Kerangka Sampel Area",
      jadwal: [
        {
          nama: "Juni",
          keterangan: "Pengamatan fase tumbuh KSA Padi.",
          startDate: "2025-06-24",
          endDate: "2025-06-30",
          warna: "blue",
        },
        {
          nama: "Juli",
          keterangan: "Pengamatan lanjutan KSA Padi.",
          startDate: "2025-07-25",
          endDate: "2025-07-31",
          warna: "blue",
        },
      ],
    },
    {
      kegiatan: "Ubinan Palawija",
      jadwal: [
        {
          nama: "Subround 1",
          keterangan: "Fokus ubinan jagung saat panen raya.",
          startDate: "2025-01-01",
          endDate: "2025-04-30",
          warna: "amber",
        },
        {
          nama: "Subround 2",
          keterangan: "Fokus ubinan jagung saat panen raya.",
          startDate: "2025-05-01",
          endDate: "2025-08-31",
          warna: "amber",
        },
        {
          nama: "Subround 3",
          keterangan: "Fokus ubinan jagung saat panen raya.",
          startDate: "2025-09-01",
          endDate: "2025-12-31",
          warna: "amber",
        },
      ],
    },
    {
      kegiatan: "Kehutanan",
      jadwal: [
          {
              nama: "Pencacahan Perusahaan PBPH",
              keterangan: "...",
              startDate: "2025-06-01",
              endDate: "2025-08-31",
              warna: "sky"
          }
      ]
    }
  ];