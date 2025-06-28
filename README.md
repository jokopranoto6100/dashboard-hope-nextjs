# 📊 Dashboard HOPE - Statistik Produksi Pertanian BPS Kalbar (Next.js Version)

Dashboard HOPE adalah aplikasi web modern yang dibangun ulang dari versi Flask, kini menggunakan **Next.js sebagai *frontend* utama dan Supabase sebagai *backend-as-a-service***. Dashboard ini dirancang untuk memantau, mengevaluasi, dan menyajikan statistik produksi pertanian di Provinsi Kalimantan Barat secara internal oleh BPS Kalbar.

Migrasi ini berfokus pada arsitektur yang lebih modern, performa, skalabilitas, dan pengalaman pengguna yang lebih baik.

## 🚀 Teknologi Utama

* **Frontend Framework:** Next.js (React, TypeScript, Tailwind CSS)
* **UI Components:** shadcn/ui
* **Icons:** lucide-react
* **Table Library:** TanStack Table (untuk tabel data yang interaktif)
* **Backend-as-a-service:** Supabase (PostgreSQL Database, Otentikasi, API Otomatis melalui PostgREST)
* **State Management:** React Context (untuk *state* global seperti filter tahun)
* **Notifikasi:** Sonner (untuk *toast* notifikasi)

## ✨ Fitur Utama yang Sudah Diimplementasikan

Berikut adalah fitur yang telah diimplementasikan, dikelompokkan berdasarkan menu dan fungsionalitasnya, dengan mempertahankan detail penuh dari setiap fitur.

### ⚙️ Arsitektur & Konfigurasi Umum

* **1. Arsitektur & Setup Proyek Baru:**
    * Migrasi penuh dari Flask ke Next.js sebagai *frontend* dengan React, TypeScript, dan Tailwind CSS.
    * Penggunaan Supabase sebagai *backend* untuk database PostgreSQL, otentikasi, dan API otomatis.
    * Inisialisasi `shadcn/ui` dan komponen-komponen dasarnya.
    * Integrasi `TanStack Table` untuk tabel yang lebih kuat.
* **3. Layout & Navigasi Sidebar yang Dinamis:**
    * `MainLayout` yang kondisional: Sidebar dan header hanya muncul di halaman dashboard setelah *login*, tidak di halaman otentikasi.
    * Sidebar yang dapat di-*toggle* (ciut/perluas) menjadi hanya ikon atau tampilan penuh dengan label.
    * Penggunaan CSS Grid di `MainLayout` untuk penyesuaian layout yang mulus saat sidebar di-*toggle*.
* **4. Filter Data Global:**
    * **Context Tahun Global:** Implementasi `YearContext` (`src/context/YearContext.tsx`) untuk mengelola tahun yang dipilih secara global di seluruh aplikasi.
    * **Pilihan Tahun di Header:** Penambahan komponen `Select` (`shadcn/ui`) di header aplikasi untuk memilih tahun, yang akan secara otomatis memfilter data di halaman-halaman yang relevan.
* **12. Peningkatan Sistem & Pengalaman Pengguna (Global):**
    * **Konfigurasi Batas Ukuran File**: Batas ukuran body untuk Server Action telah dinaikkan menjadi **25MB** melalui `next.config.js` untuk mengakomodasi file impor yang besar dan mencegah error `413 Payload Too Large`.
    * **Penyegaran Cache & UI**: Mengimplementasikan pola `router.refresh()` di sisi klien setelah Server Action sukses. Ini bekerja bersama dengan `revalidatePath` di server untuk memastikan data di UI (seperti "Riwayat Pembaruan Terakhir") langsung ter-update tanpa perlu me-reload halaman secara manual.

### 🔑 Sistem Otentikasi & Manajemen Pengguna (`/auth`, `/pengguna`)

* **2. Sistem Login & Otorisasi Berbasis Peran (Telah Direfaktor):**
    * **Single Source of Truth**: Arsitektur dirombak total untuk menjadikan tabel **`public.users`** sebagai satu-satunya sumber data profil pengguna (`username`, `fullname`, `role`, `satker_id`), menghilangkan duplikasi dan ketergantungan pada `user_metadata`.
    * **Halaman Registrasi Cerdas**: Halaman registrasi (`/auth/register`) diperbarui untuk menyertakan input "Nama Lengkap" dan "Satuan Kerja". Kolom Satuan Kerja menggunakan komponen **`Combobox`** `shadcn/ui` yang interaktif dengan fitur pencarian dan daftar yang dapat di-scroll.
    * **React Context untuk Autentikasi (`AuthContext`)**: Direfaktor untuk melakukan proses 2 langkah: mengambil sesi dari Supabase Auth, lalu menggunakan ID pengguna untuk mengambil data profil lengkap dari `public.users`, memastikan data di seluruh aplikasi selalu konsisten.
    * **Halaman Login & Notifikasi**: Halaman login (`/auth/login`) berfungsi penuh dengan notifikasi `toast` dari Sonner.
    * **Middleware untuk Proteksi Rute:** Menggunakan Next.js Middleware (`middleware.ts`) untuk melindungi rute dan mengarahkan pengguna yang belum login.
    * **Visibilitas Menu Dinamis:** Menu sidebar (`NavUserHope`) disesuaikan berdasarkan `userRole` yang didapat dari `AuthContext` yang sudah terpusat.
* **7. Manajemen Pengguna (Halaman `/pengguna`) - (Telah Direfaktor):**
    * **Akses Terbatas**: Halaman hanya dapat diakses oleh pengguna dengan peran `super_admin`, yang diverifikasi langsung dari tabel `public.users`.
    * **Pengambilan Daftar Pengguna**: `page.tsx` (Server Component) mengambil daftar pengguna dengan melakukan `JOIN` antara `auth.users` (untuk email) dan `public.users` (untuk semua data profil). Ketergantungan pada RPC telah dihapus.
    * **Tampilan Tabel Pengguna**: Komponen klien (`user-management-client-page.tsx`) menampilkan daftar pengguna menggunakan `TanStack Table`, kini dengan kolom tambahan **"Nama Lengkap"** dan **"Satuan Kerja"**.
    * **Server Actions yang Disederhanakan (`_actions.ts`)**:
        * Fungsi `verifySuperAdmin()` memvalidasi peran dari `public.users`.
        * Semua aksi (Create, Edit, Delete) kini langsung berinteraksi dengan `public.users` dan `Supabase Auth`.
        * Logika **RPC** dan **sinkronisasi `user_metadata`** yang kompleks telah **dihapus sepenuhnya**.
    * **UI Aksi Pengguna yang Disempurnakan**:
        * Tombol "Tambah Pengguna" dan "Edit Pengguna" membuka `Dialog` dengan form yang sudah mencakup input untuk **Nama Lengkap** dan **Satuan Kerja**.
        * Menggunakan **Optimistic UI Update** pada aksi "Edit Pengguna" untuk menghilangkan *glitch* visual dan memberikan pengalaman pengguna yang instan.
        * Aksi "Hapus" dan "Ubah Peran" (via form edit) berfungsi dengan andal.

### 🏠 Halaman Utama (`/`)

* **Dashboard Ringkasan Berbasis Grid (`page.tsx`)**:
    * **Layout 4 Kartu**: Halaman utama menampilkan empat kartu ringkasan (KPI) dalam tata letak grid yang responsif (`md:grid-cols-2 lg:grid-cols-3`).
    * **Data Terpusat**: Mengambil data ringkasan dari empat *custom hooks* berbeda: `usePadiMonitoringData`, `usePalawijaMonitoringData`, `useKsaMonitoringData`, dan `useSimtpKpiData`.
    * **Kartu Ubinan Padi**:
        * Menampilkan persentase realisasi, jumlah realisasi dari target, total "Lewat Panen", dan "Jumlah Anomali" dengan *badge* berwarna.
        * Menyajikan "Detail Status Ubinan" yang menampilkan jumlah untuk setiap status unik (misalnya, 'Sudah Panen', 'Belum Panen') dalam bentuk *badge*.
        * Dilengkapi tombol "Lihat Detail" yang mengarah ke `/monitoring/ubinan`.
    * **Kartu Ubinan Palawija**:
        * Menampilkan persentase realisasi, jumlah realisasi dari target.
        * Menyajikan "Detail Status Validasi" yang menampilkan jumlah data dengan status "Clean", "Warning", dan "Error" dalam bentuk *badge*.
        * Dilengkapi tombol "Lihat Detail" yang mengarah ke `/monitoring/ubinan`.
    * **Kartu KSA Padi**:
        * Menampilkan persentase realisasi, jumlah realisasi dari target. Judul kartu bersifat dinamis, menyertakan tahun dan bulan data yang ditampilkan.
        * Menampilkan data "Inkonsisten" dan "Total Kode 12" dengan *badge* berwarna.
        * Menyajikan "Detail Status KSA" yang menampilkan jumlah untuk setiap status unik (misalnya, 'Selesai', 'Belum Selesai') dengan *badge* yang warnanya disesuaikan.
        * Dilengkapi tombol "Lihat Detail" yang mengarah ke `/monitoring/ksa`.
    * **Kartu KPI SIMTP (Baru)**:
        * Kartu baru yang didedikasikan untuk memantau progres pelaporan SIMTP.
        * Menampilkan persentase laporan bulanan yang masuk beserta *progress bar* visual.
        * Menampilkan rincian progres laporan tahunan untuk "Lahan", "Alsin", dan "Benih" dalam bentuk *badge*.
        * Dilengkapi tombol "Lihat Detail" yang mengarah ke `/monitoring/simtp`.

### 🔗 Portal Bahan Produksi (`/bahan-produksi`)

Halaman ini berfungsi sebagai portal terpusat untuk semua materi dan link terkait fungsi produksi, dengan fitur manajemen konten penuh untuk admin.

* **A. Kartu Materi dan Pedoman Survei (`MateriPedomanCard`)**:
    * Menampilkan kartu utama sebagai pusat dokumentasi dengan tombol "Lihat Semua Dokumen".
    * Link tujuan tombol bersifat dinamis, diambil dari database tabel `app_settings` saat halaman dimuat di server.
    * **Fitur Admin**: Pengguna dengan peran `super_admin` dapat melihat tombol pengaturan (`<Settings />`). Tombol ini membuka dialog (`MateriPedomanDialog`) untuk mengubah link tujuan, yang kemudian disimpan melalui Server Action (`updateMateriPedomanLink`).

* **B. Portal Subsektor Interaktif (`BahanProduksiClient`)**:
    * **Carousel Kartu Flipping**: Fitur utama halaman ini adalah carousel horizontal (`Carousel`) yang berisi kartu-kartu interaktif untuk setiap subsektor (misalnya, Tanaman Pangan, Hortikultura).
    * **Animasi**: Kartu menggunakan `framer-motion` untuk memberikan efek membalik (flip) 3D saat diklik.
    * **Sisi Depan Kartu**: Menampilkan ikon dan nama subsektor, berfungsi sebagai tombol untuk membalik kartu.
    * **Sisi Belakang Kartu**: Setelah dibalik, kartu menampilkan daftar link yang relevan dengan subsektor tersebut. Setiap link memiliki ikon, label, dan akan membuka di tab baru. Terdapat tombol "Kembali" untuk membalik kartu ke sisi depan.
    * **Konten Dinamis**: Data untuk sektor dan link diambil dari database menggunakan *custom hook* `useBahanProduksiData`, dan ikon dipetakan secara dinamis dari `icon-map`. Saat data dimuat, sebuah komponen skeleton (`BahanProduksiSkeleton`) akan ditampilkan.

* **C. Manajemen Konten (`ContentManagementDialog`) - Khusus Admin**:
    * **Dialog Terpusat**: Admin dapat mengelola semua konten melalui satu dialog komprehensif (`ContentManagementDialog`) yang diaktifkan oleh tombol pengaturan di header portal.
    * **CRUD Sektor & Link**: Memungkinkan admin untuk Tambah, Edit, dan Hapus Sektor maupun Link di dalamnya melalui antarmuka dua panel (daftar sektor di kiri, daftar link di kanan).
    * **Drag-and-Drop Reordering**: Fitur canggih menggunakan **`@dnd-kit/sortable`** yang memungkinkan admin untuk mengubah urutan sektor hanya dengan menyeret dan melepasnya di daftar. Perubahan urutan disimpan ke database melalui Server Action `updateSektorOrder`.
    * **Backend & Validasi**: Semua operasi (CRUD dan reordering) ditangani oleh **Server Actions** yang dilindungi (`verifySuperAdmin`). Validasi input form menggunakan skema terpusat dari **Zod** (`@/lib/schemas`).
    * **Konfirmasi Aman**: Setiap aksi penghapusan (baik sektor maupun link) akan menampilkan `AlertDialog` untuk konfirmasi, mencegah penghapusan yang tidak disengaja.


### 📈 Menu Monitoring

#### Monitoring Ubinan (`/monitoring/ubinan`)

* **Filter Terpusat dan Responsif**: Di bagian atas halaman, terdapat filter "Subround" (Semua, 1, 2, 3) yang datanya akan memengaruhi kedua tabel di bawahnya.
* **Struktur Modular**: Halaman utama (`page.tsx`) memanggil dua *custom hooks* terpisah untuk mengambil dan memproses data, kemudian meneruskannya sebagai *props* ke komponen tabel masing-masing.
* **Fitur Umum pada Kedua Tabel**:
    * **Desain Responsif**: Kedua tabel memiliki tombol "Lengkap" / "Ringkas" (dengan ikon mata) untuk menampilkan atau menyembunyikan kolom pada tampilan mobile.
    * **Struktur Kartu**: Setiap tabel disajikan dalam komponen `<Card>`, lengkap dengan judul, deskripsi "Terakhir diperbarui", dan tombol kontrol.
    * **Skeleton Loading**: Saat data dimuat, tabel menampilkan *skeleton loader* yang sesuai dengan struktur kolomnya.
    * **Baris Total Agregat**: Di bagian bawah setiap tabel (`<TableFooter>`), terdapat baris total yang menampilkan agregat data untuk "Kalimantan Barat".
    * **Visualisasi Persentase**: Kolom "Persentase (%)" menggunakan `<Badge>` yang warnanya dinamis. Untuk nilai ≥ 100%, ikon ceklis akan muncul di samping angka pada tampilan desktop.
* **Tabulasi Ubinan Padi (`PadiMonitoringTable`)**:
    * **Kolom Interaktif "Fase Generatif"**: Kolom "Fase Generatif" dapat diperluas dari satu kolom ringkasan ("Generatif (Nama Bulan)") menjadi tiga kolom terperinci ("G1", "G2", "G3") menggunakan tombol "Detail Generatif".
    * **Data yang Ditampilkan**: Menampilkan metrik utama untuk padi, termasuk Target Utama, Cadangan, Realisasi, Lewat Panen, dan Anomali.
* **Tabulasi Ubinan Palawija (`PalawijaMonitoringTable`)**:
    * **Kolom Interaktif "Realisasi"**: Kolom "Realisasi" dapat diperluas dari satu kolom total menjadi tiga kolom terperinci yang menunjukkan status validasi data: "Clean", "Warning", dan "Error" menggunakan tombol "Detail Realisasi".
    * **Data yang Ditampilkan**: Menampilkan metrik utama untuk palawija, termasuk Target dan Realisasi beserta detail status validasinya.

#### Monitoring KSA (`/monitoring/ksa`)

* **Tampilan Tabel Interaktif Dua Level (`DistrictKsaTable` & `NamaKsaTable`):**
    * **Level Kabupaten/Kota (Tampilan Awal):** Menampilkan data KSA yang dikelompokkan berdasarkan kabupaten, dengan baris yang dapat diklik untuk melihat detail.
    * **Level Detail per `nama` (Setelah Klik Kabupaten):**
        * Menampilkan data KSA untuk kabupaten yang dipilih, dikelompokkan berdasarkan nama petugas.
        * Dilengkapi tombol "Kembali" untuk navigasi.
        * **Fitur Baru: Generate Berita Acara (BA) Kode 12:**
            * **Tombol Aksi Kontekstual:** Pada kolom "Aksi", tombol **"Generate BA"** muncul otomatis di baris petugas yang memiliki data `kode_12 > 0`.
            * **Proses Backend via RPC:** Saat diklik, aplikasi memanggil RPC Supabase (`get_berita_acara_data`) untuk mengambil detail segmen yang relevan.
            * **Modal Interaktif:** Sebuah modal (`BeritaAcaraModal`) tampil agar pengguna dapat mengisi **Nama Pengawas** dan **Alasan Kode 12**.
            * **Pembuatan Dokumen Otomatis:** Setelah konfirmasi, aplikasi membuat dan mengunduh dokumen Berita Acara dalam format **.docx**.

### 🔍 Menu Evaluasi

* **9. Evaluasi Ubinan (Halaman `/evaluasi/ubinan`)**
    * **Tujuan Halaman**: Menyediakan dashboard analitik interaktif untuk melakukan evaluasi statistik terhadap data ubinan mentah. Halaman ini dirancang untuk memberikan wawasan mendalam mengenai produktivitas (`r701`), penggunaan benih, dan pupuk, baik dalam satu periode waktu maupun perbandingan antar waktu.
    * **Struktur & Alur Data**:
        * **`src/app/(dashboard)/evaluasi/ubinan/page.tsx`**: Bertindak sebagai Server Component dan *entry point* untuk halaman.
        * **`src/app/(dashboard)/evaluasi/ubinan/evaluasi-ubinan-client.tsx`**: Client Component utama yang mengorkestrasi seluruh UI interaktif dan logika halaman.
        * **`src/context/YearContext.tsx`**: Menyediakan `selectedYear` dan daftar `availableYears` secara global.
        * **`src/context/UbinanEvaluasiFilterContext.tsx`**: Mengelola state untuk filter spesifik halaman ini: **Subround** dan **Komoditas**.
        * **`src/hooks/useUbinanDescriptiveStatsData.ts`**: *Custom hook* yang menghitung statistik deskriptif atau data perbandingan.
        * **`src/hooks/usePenggunaanBenihDanPupukData.ts`**: Hook serupa untuk mengambil dan memproses data penggunaan benih dan pupuk.
        * **`descriptive-stats-columns.tsx` & `penggunaan-benih-dan-pupuk-columns.tsx`**: Mengekspor set kolom terpisah untuk mode detail dan perbandingan.
        * **`UbinanBoxPlot.tsx` & `UbinanComparisonChart.tsx`**: Komponen chart terpisah (ECharts & Recharts) yang dirender secara kondisional.
        * **`HasilUbinanDetailModal.tsx` & `DetailKabupatenModal.tsx`**: Komponen modal untuk kebutuhan *drill-down*.
        * **Fungsi RPC (PostgreSQL)**: Mengambil data detail untuk modal dan daftar unik tahun untuk filter.
    * **Fitur Interaktif & Analitik**
        * **Mode Analisis**: Beralih antara **"Analisis Detail"** dan **"Perbandingan Waktu"**.
        * **Visualisasi Data Interaktif**: **Box Plot (ECharts)** untuk sebaran data dan **Grouped Bar Chart (Recharts)** untuk perbandingan.
        * **Tabel Dinamis**: Tabel Statistik Deskriptif dan Tabel Penggunaan Benih & Pupuk dengan kolom yang berubah sesuai mode.
        * **Filtering & Kontrol Lanjutan**: Filter global, filter tahun pembanding, dan filter variabel multi-select.
        * **Modal Detail**: Menampilkan data dengan *server-side sorting*, paginasi, dan *skeleton loading*.
        * **Fitur Ekspor**: Tombol "Download Anomali" untuk mengunduh data dalam format Excel (`.xlsx`).
* **15. Halaman Evaluasi KSA (Halaman `/evaluasi/ksa`) - (Fitur Baru & Arsitektur RPC):**
    * **Arsitektur Berbasis RPC yang Efisien:** Seluruh pengambilan data untuk halaman ini telah direfaktor untuk menggunakan fungsi RPC PostgreSQL di Supabase. Pendekatan ini memindahkan beban agregasi data yang berat dari *frontend* ke *backend*, memungkinkan pemrosesan ratusan ribu *record* data KSA secara instan tanpa membebani *browser*.
    * **Visualisasi Data Interaktif (Tab Visualisasi Utama):**
        * **Kartu KPI:** Menampilkan ringkasan data kunci seperti rata-rata frekuensi panen, bulan puncak tanam, dan bulan puncak panen.
        * **Grafik Proporsi Fase Tanam:** Menggunakan *Stacked Area Chart* untuk memvisualisasikan proporsi bulanan fase amatan KSA.
        * **Grafik Tren Tanam vs. Panen:** Menggunakan *Line Chart* untuk membandingkan tren bulanan antara jumlah subsegmen yang melakukan tanam dan yang melakukan panen.
    * **Tabel Distribusi Frekuensi Panen Dinamis:**
        * Menampilkan tabel pivot yang merangkum jumlah subsegmen berdasarkan frekuensi panennya dalam setahun.
        * Kolom frekuensi pada tabel dibuat secara dinamis.
        * Setiap baris kabupaten dapat diklik untuk membuka **Modal Detail** yang menampilkan rincian subsegmen beserta "Kalender Panen" visual.
    * **Tab Validator Anomali Interaktif (Fitur Baru):**
        * **Deteksi Anomali di Backend:** Mengimplementasikan fungsi RPC PostgreSQL baru, `find_ksa_phase_anomalies`, yang secara cerdas mendeteksi anomali.
        * **Dashboard Ringkasan KPI Anomali:** Menampilkan kartu KPI dinamis: "Total Anomali", "Ringkasan Jenis Anomali" (dalam akordeon), dan "Sebaran Anomali Wilayah".
        * **Tabel Anomali yang Informatif & Interaktif:**
            * Dilengkapi paginasi di sisi klien.
            * Kolom "Konteks Fase" diubah menjadi komponen visual (`PhaseTimelineVisual`).
            * Informasi deskripsi dipindahkan ke dalam *tooltip* pada *badge* "Kode Anomali".
        * **Filter Bulan & Ekspor ke Excel:** Dilengkapi filter per bulan dan tombol untuk mengekspor data yang telah difilter.

### 📊 Menu Analisis Statistik ATAP (`/produksi-statistik`)

* **13. Halaman Analisis Statistik Produksi ATAP (`/produksi-statistik`) - (Fitur Baru & Canggih):**
    * **Arsitektur Data Terpusat**: Halaman ini dirancang untuk menjadi pusat analisis dengan mengambil data dari satu `DATABASE VIEW` yang kuat bernama `laporan_atap_lengkap`.
    * **UI & Komponen**: Halaman dibangun menggunakan struktur Server Component (`page.tsx`) dan Client Component (`statistik-client.tsx`).
    * **Filter Dinamis & Komprehensif**: Filter untuk "Periode Bulan", "Indikator", "Level Wilayah", dan "Bandingkan Dengan Tahun", dioptimalkan dengan `debounce`.
    * **Pengambilan Data Efisien**: Menggunakan *custom hook* `useAtapStatistikData` yang dibangun di atas `SWR`.
    * **Visualisasi Data Interaktif dengan `Recharts`**:
        * **KPI Cards**: Menampilkan kartu ringkasan untuk "Total Nilai", "Wilayah Tertinggi & Terendah", dan "Jumlah Wilayah".
        * **Grafik Kontribusi (Donut Chart)**, **Grafik Batang (Perbandingan Wilayah)**, **Grafik Garis (Tren Waktu)**.
        * **Fitur Drill Down**: Mengeklik batang pada grafik perbandingan untuk memfilter grafik tren waktu.
        * **Fitur Perbandingan Periode**: Semua grafik dapat menampilkan data perbandingan dengan tahun sebelumnya.
    * **Tabel Data Rinci dengan `TanStack Table`**: Tabel interaktif dengan sorting, filtering, paginasi, dan kolom dinamis.
    * **Fitur Utilitas Lanjutan**: Ekspor ke CSV, ekspor grafik ke PNG, dan fitur simpan konfigurasi filter (Preset).
    * **Perbaikan Teknis (Robustness)**: Mengatasi error umum `Recharts` dengan **Dynamic Imports** (`next/dynamic`) dengan `ssr: false`.

### 🔄 Menu Update Data

* **10. Halaman Update Data (`/update-data/ubinan`) - (Fitur Diperluas Secara Signifikan):**
    * **Struktur Halaman dengan Tabs**: Halaman dirombak menggunakan `Tabs` untuk memisahkan "Import Data Transaksi (Raw)" dan "Import Master Sampel".
    * **Riwayat Pembaruan Dinamis**: Setiap tab menampilkan riwayat pembaruan terakhir untuk tabelnya masing-masing.
    * **Fitur A: Import Data Ubinan (Raw) dengan Pemetaan Kolom Cerdas**
        * **UI & Logika Unggah Dua Langkah**:
            1.  **Analisis Header**: Sistem menganalisis header CSV dan melakukan *auto-matching*.
            2.  **Modal Pemetaan Interaktif**: Pengguna dapat memperbaiki *mapping* kolom yang tidak cocok melalui UI sebelum impor.
            3.  **Impor Berdasarkan Mapping**: Proses impor penuh berjalan menggunakan konfigurasi pemetaan.
        * **Backend (Server Action `uploadUbinanRawAction`)**:
            * Menggunakan logika **"Hapus dan Ganti"** melalui fungsi RPC `process_ubinan_raw_upload`.
            * Setelah impor berhasil, me-refresh `materialized view` `ubinan_anomali` dan `ubinan_dashboard`.
    * **Fitur B: Import Master Sampel Ubinan**
        * **UI & Logika**: Menggunakan komponen uploader seragam untuk mengunggah **satu atau beberapa file Excel**.
        * **Backend (Server Action `uploadMasterSampleAction`)**:
            * Menggunakan library **`xlsx` (SheetJS)** untuk mem-parsing file Excel.
            * Menggunakan logika **UPSERT** ke tabel `master_sampel_ubinan` berdasarkan 5 kolom kunci.
            * Me-refresh `materialized view` `ubinan_dashboard` setelah `upsert` berhasil.
* **11. Halaman Update Data KSA (`/update-data/ksa`) - (Fitur Baru):**
    * **Halaman & Logika Modular**: Membuat halaman dan `Server Action` yang terpisah untuk impor data KSA.
    * **UI Halaman Unggah**:
        * Menggunakan komponen `KsaUploader` untuk menerima **satu atau beberapa file Excel**.
        * **Modal Konfirmasi Cerdas**: Menampilkan ringkasan data (tahun, bulan, wilayah) yang diekstrak dari file di sisi klien sebelum proses unggah.
    * **Logika Backend (Server Action `uploadKsaAction`)**:
        * Menggunakan logika **"Hapus dan Ganti"** melalui fungsi RPC `process_ksa_amatan_upload`.
        * **Transformasi Data Kompleks**: Secara otomatis mengekstrak tahun/bulan, membuat kode wilayah, dan memetakan nama kabupaten saat impor.
* **14. Halaman Update Data ATAP (`/update-data/atap`) - (Fitur Baru & Arsitektur Lanjutan):**
    * **Arsitektur Database Scalable**: Merancang arsitektur dengan **Satu Tabel Master** (`master_indikator_atap`), **Empat Tabel Data Spesifik**, dan **Satu `DATABASE VIEW`** (`laporan_atap_lengkap`).
    * **UI Halaman Unggah dengan Tabs**: Menggunakan `Tabs` untuk empat jenis impor data yang berbeda, dengan satu komponen `AtapUploader` yang reusable.
    * **Logika Backend (Server Action `uploadAtapDataAction`)**:
        * **Satu Aksi untuk Semua**: Satu Server Action generik menangani keempat jenis impor.
        * **Transformasi Data (Unpivot)**: Mengubah data dari format "wide" menjadi "long".
        * **Logika `UPSERT` & Penanganan Satuan Dinamis**: Menggunakan `UPSERT` dan mampu mem-parsing satuan yang berbeda dari default.
    * **Agregasi Otomatis**: Setelah impor data bulanan berhasil, Server Action memanggil fungsi RPC untuk menjumlahkan data dan melakukan `UPSERT` ke tabel tahunan.

## 🌐 Daftar Route Penting
* `/`: Dashboard Utama
* `/auth/login`: Halaman Login
* `/auth/register`: Halaman Registrasi
* `/bahan-produksi`: Portal Bahan Produksi
* `/monitoring/ubinan`: Monitoring Ubinan Padi & Palawija
* `/monitoring/ksa`: Monitoring KSA Padi
* `/monitoring/simtp`: Monitoring SIMTP
* `/pengguna`: Halaman Manajemen Pengguna
* `/evaluasi/ubinan`: Halaman Evaluasi Statistik Deskriptif Ubinan
* `/evaluasi/ksa`: Halaman Evaluasi Statistik dan Anomali KSA
* `/produksi-statistik`: Halaman Analisis Statistik Produksi ATAP
* `/update-data/ubinan`: Halaman Update Data Ubinan
* `/update-data/ksa`: Halaman Update Data KSA
* `/update-data/atap`: Halaman Update Data ATAP

## 📁 Struktur Folder Proyek
Dashboard HOPE/
.
├── README.md
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── icon
│   │   └── hope.png
│   ├── images
│   │   ├── login-illustration.afdesign
│   │   ├── login-illustration.png
│   │   └── login-illustration.svg
│   ├── logo-bps.png
│   ├── next.svg
│   ├── templates
│   │   ├── template_atap_bulanan_kab.xlsx
│   │   ├── template_atap_bulanan_prov.xlsx
│   │   ├── template_atap_tahunan_kab.xlsx
│   │   ├── template_atap_tahunan_prov.xlsx
│   │   └── template_ubinan.csv
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── app
│   │   ├── (dashboard)
│   │   │   ├── _actions
│   │   │   │   └── getSimtpKpiAction.ts
│   │   │   ├── bahan-produksi
│   │   │   │   ├── _actions.ts
│   │   │   │   ├── bahan-produksi-client.tsx
│   │   │   │   ├── bahan-produksi-skeleton.tsx
│   │   │   │   ├── content-management-dialog.tsx
│   │   │   │   ├── materi-pedoman-card.tsx
│   │   │   │   ├── materi-pedoman-dialog.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── crawling-fasih
│   │   │   │   ├── _actions.ts
│   │   │   │   ├── columns.tsx
│   │   │   │   ├── crawling-client.tsx
│   │   │   │   ├── data-table.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── evaluasi
│   │   │   │   ├── ksa
│   │   │   │   │   ├── AnomalyValidatorTab.tsx
│   │   │   │   │   ├── DetailKsaModal.tsx
│   │   │   │   │   ├── DetailKsaModalContent.tsx
│   │   │   │   │   ├── MonthlyHarvestDisplay.tsx
│   │   │   │   │   ├── OfficerPerformanceTab.tsx
│   │   │   │   │   ├── PhaseTimelineVisual.tsx
│   │   │   │   │   ├── evaluasi-ksa-client.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── ubinan
│   │   │   │       ├── DetailKabupatenModal.tsx
│   │   │   │       ├── DetailKabupatenModalContent.tsx
│   │   │   │       ├── HasilUbinanDetailModal.tsx
│   │   │   │       ├── HasilUbinanDetailModalContent.tsx
│   │   │   │       ├── UbinanBoxPlot.tsx
│   │   │   │       ├── UbinanComparisonChart.tsx
│   │   │   │       ├── _actions.ts
│   │   │   │       ├── descriptive-stats-columns.tsx
│   │   │   │       ├── detail-record-columns.tsx
│   │   │   │       ├── evaluasi-ubinan-client.tsx
│   │   │   │       ├── hasil-ubinan-detail-columns.tsx
│   │   │   │       ├── page.tsx
│   │   │   │       ├── penggunaan-benih-dan-pupuk-columns.tsx
│   │   │   │       └── types.ts
│   │   │   ├── jadwal
│   │   │   │   ├── jadwal-client.tsx
│   │   │   │   ├── jadwal-desktop.tsx
│   │   │   │   ├── jadwal-mobile.tsx
│   │   │   │   ├── jadwal.config.tsx
│   │   │   │   ├── jadwal.utils.ts
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── monitoring
│   │   │   │   ├── kehutanan
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── ksa
│   │   │   │   │   ├── DistrictKsaTable.tsx
│   │   │   │   │   ├── NamaKsaTable.tsx
│   │   │   │   │   ├── components
│   │   │   │   │   │   └── BeritaAcaraModal.tsx
│   │   │   │   │   ├── ksa-monitoring-client-page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── simtp
│   │   │   │   │   ├── SimtpMonitoringClient.tsx
│   │   │   │   │   ├── _actions.ts
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── types.ts
│   │   │   │   └── ubinan
│   │   │   │       ├── PadiTable.tsx
│   │   │   │       ├── PalawijaTable.tsx
│   │   │   │       ├── page.tsx
│   │   │   │       └── types.ts
│   │   │   ├── page.tsx
│   │   │   ├── pengguna
│   │   │   │   ├── _actions.ts
│   │   │   │   ├── page.tsx
│   │   │   │   ├── user-import-dialog.tsx
│   │   │   │   └── user-management-client-page.tsx
│   │   │   ├── produksi-statistik
│   │   │   │   ├── annotation-sheet.tsx
│   │   │   │   ├── bar-chart-wrapper.tsx
│   │   │   │   ├── columns.tsx
│   │   │   │   ├── data-table.tsx
│   │   │   │   ├── line-chart-wrapper.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── pie-chart-wrapper.tsx
│   │   │   │   └── statistik-client.tsx
│   │   │   ├── profil
│   │   │   │   └── page.tsx
│   │   │   ├── simtp-upload
│   │   │   │   ├── SimtpUploadClient.tsx
│   │   │   │   ├── UploadHistory.tsx
│   │   │   │   ├── _actions.ts
│   │   │   │   └── page.tsx
│   │   │   └── update-data
│   │   │       ├── atap
│   │   │       │   ├── _actions.ts
│   │   │       │   ├── atap-uploader.tsx
│   │   │       │   ├── page.tsx
│   │   │       │   └── update-atap-client.tsx
│   │   │       ├── ksa
│   │   │       │   ├── _actions.ts
│   │   │       │   ├── ksa-uploader.tsx
│   │   │       │   ├── page.tsx
│   │   │       │   └── update-ksa-client.tsx
│   │   │       └── ubinan
│   │   │           ├── _actions.ts
│   │   │           ├── master-sample-uploader.tsx
│   │   │           ├── page.tsx
│   │   │           ├── update-ubinan-client.tsx
│   │   │           └── uploader-client-component.tsx
│   │   ├── api
│   │   │   ├── produksi
│   │   │   │   └── route.ts
│   │   │   └── users
│   │   │       └── route.ts
│   │   ├── auth
│   │   │   ├── login
│   │   │   │   └── page.tsx
│   │   │   └── register
│   │   │       ├── _actions.ts
│   │   │       ├── page.tsx
│   │   │       └── schema.ts
│   │   ├── client-layout-wrapper.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components
│   │   ├── layout
│   │   │   ├── NavMainHope.tsx
│   │   │   ├── NavUserHope.tsx
│   │   │   ├── NewSidebar.tsx
│   │   │   └── main-layout.tsx
│   │   └── ui
│   │       ├── CustomFileInput.tsx
│   │       ├── GenericPaginatedTable.tsx
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── sonner.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       └── tooltip.tsx
│   ├── context
│   │   ├── AuthContext.tsx
│   │   ├── DarkModeContext.tsx
│   │   ├── KsaEvaluasiFilterContext.tsx
│   │   ├── UbinanEvaluasiFilterContext.tsx
│   │   └── YearContext.tsx
│   ├── hooks
│   │   ├── use-mobile.ts
│   │   ├── useAtapStatistikData.ts
│   │   ├── useBahanProduksiData.ts
│   │   ├── useDailySubmissions.ts
│   │   ├── useDebounce.ts
│   │   ├── useKsaAnomalyData.ts
│   │   ├── useKsaEvaluationData.ts
│   │   ├── useKsaMonitoringData.ts
│   │   ├── useOfficerPerformanceData.ts
│   │   ├── usePadiMonitoringData.ts
│   │   ├── usePalawijaMonitoringData.ts
│   │   ├── usePenggunaanBenihDanPupukData.ts
│   │   ├── useSimtpKpiData.ts
│   │   └── useUbinanDescriptiveStatsData.ts
│   ├── lib
│   │   ├── database.types.ts
│   │   ├── docx-generator.ts
│   │   ├── icon-map.tsx
│   │   ├── satker-data.ts
│   │   ├── schemas.ts
│   │   ├── sidebar-data.ts
│   │   ├── supabase-server.ts
│   │   ├── supabase.ts
│   │   ├── useBreakpoint.ts
│   │   └── utils.ts
│   └── middleware.ts
├── tailwind.config.ts
└── tsconfig.json

**Catatan Penting tentang Struktur Folder:**
* Penempatan `middleware.ts` di dalam `src/`.
* File `layout.tsx` di `src/app/(dashboard)/layout.tsx` akan menjadi layout utama untuk semua rute di dalam grup `(dashboard)`. File `src/app/layout.tsx` (jika ada di luar grup dashboard) akan menjadi root layout global.
* `client-layout-wrapper.tsx` tetap dibutuhkan.

## 🛠️ Cara Instalasi & Menjalankan (Diperbarui)

1.  **Clone Repo & Masuk Folder:**
    ```bash
    git clone <URL_REPO_ANDA>
    cd Dashboard\ Pertanian # atau nama folder proyek Anda
    ```

2.  **Instal Dependencies:**
    ```bash
    npm install
    # atau
    yarn install
    ```
    (Pastikan `package.json` Anda mencakup semua dependensi seperti `next`, `react`, `tailwindcss`, `@supabase/ssr`, `@tanstack/react-table`, `sonner`, `lucide-react`, dll.)

3.  **Tambahkan File `.env.local`:**
    Buat file `.env.local` di root folder proyek Anda dengan isi berikut:
    ```
    NEXT_PUBLIC_SUPABASE_URL=[https://your-project-ref.supabase.co](https://your-project-ref.supabase.co)
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
    ```
    Ganti nilai *placeholder* dengan URL dan Kunci Supabase proyek Anda yang tepat.

4.  **Konfigurasi `tsconfig.json` (Jika Menggunakan TypeScript):**
    Pastikan file `tsconfig.json` di root proyek Anda memiliki `paths` yang benar untuk alias `@/`:
    ```json
    {
      "compilerOptions": {
        // ...
        "paths": {
          "@/*": ["./src/*"]
        }
        // ...
      }
      // ... bagian lain
    }
    ```
   

5.  **Inisialisasi dan Instal Komponen shadcn/ui:**
    Jika `shadcn/ui` belum diinisialisasi di proyek Anda, jalankan perintah berikut terlebih dahulu:
    ```bash
    npx shadcn-ui@latest init
    ```
    Ikuti prompt untuk konfigurasi (misalnya, pilihan style, base color, lokasi `globals.css`, alias path).

    Setelah inisialisasi, Anda dapat menambahkan komponen individual yang dibutuhkan. Berdasarkan struktur folder yang Anda berikan, Anda mungkin memerlukan komponen-komponen berikut (dan lainnya):
    ```bash
    npx shadcn-ui@latest add table tabs select scroll-area button card checkbox collapsible dropdown-menu input label sonner avatar badge breadcrumb carousel chart form menubar navigation-menu separator sheet skeleton tooltip alert dialog
    ```
    Tambahkan atau hapus nama komponen dari daftar di atas sesuai dengan yang benar-benar Anda gunakan atau rencanakan untuk digunakan.

6.  **Buat Tipe Database Supabase (Opsional tapi Sangat Direkomendasikan):**
    Jika Anda belum punya, instal Supabase CLI dan generate tipe untuk keamanan tipe:
    ```bash
    npm install -g supabase # Jika belum terinstal
    supabase login
    supabase link --project-ref your-project-id # Ganti dengan ID proyek Anda
    supabase gen types typescript --project-id "your-project-id" --schema public > src/lib/database.types.ts
    ```

7.  **Pembersihan Cache & Mulai Aplikasi:**
    ```bash
    rm -rf .next # Hapus folder cache Next.js
    npm run dev
    # atau
    yarn dev
    ```
    Aplikasi akan berjalan di `http://localhost:3000`. Anda akan diarahkan ke halaman login jika rute awal dilindungi.

Jika ada kendala atau permintaan fitur baru, silakan hubungi pengelola proyek.