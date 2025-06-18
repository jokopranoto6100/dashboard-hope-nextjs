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

## ✨ Fitur Utama yang Sudah Diimplementasikan (Next.js Migration Progress)

1.  **Arsitektur & Setup Proyek Baru:**
    * Migrasi penuh dari Flask ke Next.js sebagai *frontend* dengan React, TypeScript, dan Tailwind CSS.
    * Penggunaan Supabase sebagai *backend* untuk database PostgreSQL, otentikasi, dan API otomatis.
    * Inisialisasi `shadcn/ui` dan komponen-komponen dasarnya.
    * Integrasi `TanStack Table` untuk tabel yang lebih kuat.

2.  **Sistem Login & Otorisasi Berbasis Peran (Telah Direfaktor):**
    * **Single Source of Truth**: Arsitektur dirombak total untuk menjadikan tabel **`public.users`** sebagai satu-satunya sumber data profil pengguna (`username`, `fullname`, `role`, `satker_id`), menghilangkan duplikasi dan ketergantungan pada `user_metadata`.
    * **Halaman Registrasi Cerdas**: Halaman registrasi (`/auth/register`) diperbarui untuk menyertakan input "Nama Lengkap" dan "Satuan Kerja". Kolom Satuan Kerja menggunakan komponen **`Combobox`** `shadcn/ui` yang interaktif dengan fitur pencarian dan daftar yang dapat di-scroll.
    * **React Context untuk Autentikasi (`AuthContext`)**: Direfaktor untuk melakukan proses 2 langkah: mengambil sesi dari Supabase Auth, lalu menggunakan ID pengguna untuk mengambil data profil lengkap dari `public.users`, memastikan data di seluruh aplikasi selalu konsisten.
    * **Halaman Login & Notifikasi**: Halaman login (`/auth/login`) berfungsi penuh dengan notifikasi `toast` dari Sonner.
    * **Middleware untuk Proteksi Rute:** Menggunakan Next.js Middleware (`middleware.ts`) untuk melindungi rute dan mengarahkan pengguna yang belum login.
    * **Visibilitas Menu Dinamis:** Menu sidebar (`NavUserHope`) disesuaikan berdasarkan `userRole` yang didapat dari `AuthContext` yang sudah terpusat.

3.  **Layout & Navigasi Sidebar yang Dinamis:**
    * `MainLayout` yang kondisional: Sidebar dan header hanya muncul di halaman dashboard setelah *login*, tidak di halaman otentikasi.
    * Sidebar yang dapat di-*toggle* (ciut/perluas) menjadi hanya ikon atau tampilan penuh dengan label.
    * Penggunaan CSS Grid di `MainLayout` untuk penyesuaian layout yang mulus saat sidebar di-*toggle*.

4.  **Filter Data Global:**
    * **Context Tahun Global:** Implementasi `YearContext` (`src/context/YearContext.tsx`) untuk mengelola tahun yang dipilih secara global di seluruh aplikasi.
    * **Pilihan Tahun di Header:** Penambahan komponen `Select` (`shadcn/ui`) di header aplikasi untuk memilih tahun, yang akan secara otomatis memfilter data di halaman-halaman yang relevan.

5.  **Monitoring Ubinan (Halaman `/monitoring/ubinan`):**
    * **Data Fetching Modular:** Logika pengambilan dan pemrosesan data diekstraksi ke *custom hooks* (`usePadiMonitoringData.ts`, `usePalawijaMonitoringData.ts`) untuk modularitas dan reusabilitas.
    * **Paginasi Data Otomatis:** Mengimplementasikan logika paginasi kustom menggunakan `range()` dari Supabase untuk mengambil semua record (lebih dari 1000 baris) dari database, memastikan semua data tersedia.
    * **Filter Subround:** Penambahan filter `Select` (`shadcn/ui`) di halaman untuk menyaring data berdasarkan `subround` (1, 2, 3, atau Semua) pada kedua tabulasi.
    * **Tabulasi Ubinan Padi:**
        * Menggunakan komponen `Table` dari `shadcn/ui` yang didukung oleh `TanStack Table` untuk tampilan data.
        * Data diambil dari tabel `ubinan_dashboard`.
        * **Pengelompokan Data:** Dilakukan berdasarkan nama kabupaten (`nmkab` asli dari `ubinan_dashboard`), dengan pembersihan nilai `nmkab` menjadi *Title Case* untuk tampilan.
        * **Kolom Dapat Diperluas/Diringkas (Fase Generatif):** Kolom "Fase Generatif" dapat diperluas untuk menampilkan detail G1, G2, G3 atau diringkas menjadi satu kolom total.
        * Perhitungan kolom:
            * `Target Utama`: Dihitung dari baris dengan `jenis_sampel = 'U'`.
            * `Cadangan`: Dihitung dari baris dengan `jenis_sampel = 'C'`.
            * `Realisasi`: Dihitung dari baris di mana kolom `r701` memiliki isian.
            * `Lewat Panen`: Dihitung berdasarkan kolom `lewat_panen_X` yang relevan dengan subround.
            * `Fase Generatif (G1, G2, G3)`: Dihitung dari kolom bulan terakhir yang relevan.
            * `Anomali`: Dihitung dari baris dengan isian pada kolom `anomali`.
            * `Persentase`: `(Realisasi / Target Utama) * 100`, diformat 2 digit desimal.
        * **Pengurutan Data:** Hasil pengelompokan diurutkan secara *ascending* berdasarkan kode kabupaten (`kab_sort_key` dari kolom `kab`).
        * **Visualisasi Persentase:** Kolom `Persentase (%)` menampilkan komponen `Badge` (shadcn/ui) dengan warna dan ikon ceklis (untuk >= 100%) yang dinamis sesuai rentang nilai, diatur oleh fungsi utilitas global (`getPercentageBadgeVariant`).
        * **Baris Total:** Menampilkan agregasi total untuk semua kolom numerik.
        * **Informasi "Terakhir Diperbarui"**: Menampilkan timestamp data terakhir diperbarui.
    * **Tabulasi Ubinan Palawija (Non-Padi):**
        * Menggunakan komponen `Table` dari `shadcn/ui` yang didukung oleh `TanStack Table`.
        * Data diambil dari tabel `ubinan_raw`, dengan filter untuk mengeluarkan komoditas "padi".
        * **Pengelompokan Data & Nama Kabupaten:** Dilakukan berdasarkan kolom `kab`. Nama Kabupaten/Kota ditampilkan berdasarkan pemetaan manual dari kode `kab` (misal, '1' menjadi 'Sambas').
        * **Kolom Dapat Diperluas/Diringkas (Realisasi):** Kolom "Realisasi" dapat diperluas untuk menampilkan detail "Clean", "Warning", "Error" (dari kolom `validasi`) atau diringkas menjadi satu kolom total realisasi.
        * Perhitungan kolom:
            * `Target`: Dihitung dari baris dengan `prioritas = 'UTAMA'`.
            * `Realisasi` (dan detail `Clean`, `Warning`, `Error`): Dihitung dari baris di mana `r701` memiliki isian, dan status `validasi`.
            * `Persentase`: `(Realisasi / Target) * 100`, diformat 2 digit desimal.
        * **Pengurutan Data:** Hasil pengelompokan diurutkan secara numerik berdasarkan kode `kab` (`kab_sort_key`).
        * **Visualisasi Persentase:** Kolom `Persentase (%)` menampilkan komponen `Badge` (shadcn/ui) dengan warna dan ikon ceklis (untuk >= 100%) yang dinamis sesuai rentang nilai, diatur oleh fungsi utilitas global (`getPercentageBadgeVariant`).
        * **Baris Total:** Menampilkan agregasi total untuk semua kolom numerik.
        * **Informasi "Terakhir Diperbarui"**: Menampilkan timestamp data terakhir diperbarui dari kolom `uploaded_at`.

6.  **Halaman Utama Dashboard Dinamis (`/`):**
    * Menampilkan ringkasan data Ubinan Padi dan Palawija dalam komponen `Card` (shadcn/ui) terpisah.
    * Untuk Padi dan Palawija, menampilkan total persentase realisasi menggunakan komponen `Badge` (shadcn/ui) dengan gaya dinamis (warna dan ikon ceklis sesuai nilai persentase).
    * Menampilkan daftar 3 Kabupaten/Kota dengan persentase realisasi terendah untuk Padi dan Palawija, juga menggunakan komponen `Badge` untuk menyorot persentase masing-masing.
    * Menyertakan informasi "Data per:" (timestamp pembaruan terakhir) untuk kedua ringkasan data ubinan.
    * Ringkasan Palawija juga menampilkan jumlah status validasi data (Clean, Warning, Error) dari hasil realisasi.
    * Pengambilan dan pemrosesan data untuk ringkasan ini menggunakan *custom hooks* yang sama (`usePadiMonitoringData`, `usePalawijaMonitoringData`).

7.  **Manajemen Pengguna (Halaman `/pengguna`) - (Telah Direfaktor):**
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

8.  **Monitoring KSA (Halaman `/monitoring/ksa`):**
    * **Nama Halaman & Judul Kartu Dinamis:** Judul halaman dan kartu berubah secara dinamis, menampilkan "Monitoring KSA Padi" untuk tampilan level kabupaten, dan "Detail KSA Padi - \[Nama Kabupaten]" saat melihat detail per `nama` dalam suatu kabupaten.
    * **Data Fetching Modular:** Menggunakan *custom hook* `useKsaMonitoringData.ts` untuk pengambilan dan pemrosesan data dari tabel `ksa_amatan` di Supabase. Hook ini sekarang mengelola data untuk dua level tampilan (kabupaten dan detail per `nama`). Mengimplementasikan logika paginasi untuk mengambil semua record.
    * **Filtering Data:**
        * Terintegrasi dengan filter `YearContext` global.
        * Filter Bulan lokal menggunakan komponen `Select` (`shadcn/ui`), diposisikan di kanan atas kartu tabel. Filter ini berlaku untuk tampilan level kabupaten. Perubahan bulan akan mengembalikan tampilan ke level kabupaten.
        * **Logika Default Bulan Cerdas:** Filter bulan secara otomatis memprioritaskan bulan berjalan. Jika data bulan berjalan kosong, hook secara internal akan mengambil dan menampilkan data bulan sebelumnya.
    * **Tampilan Tabel Interaktif Dua Level (TanStack Table & shadcn/ui):**
        * **Level Kabupaten/Kota (Tampilan Awal):**
            * Menampilkan data KSA yang dikelompokkan berdasarkan `kabupaten` dalam tabel yang responsif dan dapat di-*scroll*.
            * **Kolom Utama:** Kabupaten/Kota (rata kiri), Target, Realisasi, Persentase (%), Kolom Status Dinamis (berdasarkan data `status` yang ada, misal "Selesai", "Belum Selesai", dll., menampilkan jumlah dan persentase), Inkonsisten, dan Kode 12 (rata tengah).
            * **Baris Dapat Diklik:** Setiap baris Kabupaten/Kota dapat diklik untuk melihat detail data yang dikelompokkan berdasarkan kolom `nama` untuk kabupaten tersebut.
            * **Pengurutan Kolom (Sorting):** Diaktifkan untuk kolom "Persentase (%)", kolom status dinamis, "Inkonsisten", dan "Kode 12". Dinonaktifkan untuk "Kabupaten/Kota", "Target", dan "Realisasi".
            * **Pengurutan Data:** Data diurutkan berdasarkan `kode_kab`.
            * **Perhitungan Kolom Spesifik:**
                * `Target`: Dihitung dari jumlah baris yang memiliki isian pada kolom `subsegmen`.
                * `Realisasi`: Dihitung dari jumlah baris yang memiliki isian pada kolom `n`.
                * `Persentase (%)`: Dihitung sebagai `(Realisasi / Target) * 100` dan divisualisasikan menggunakan komponen `Badge` (`shadcn/ui`) dengan warna dan ikon ceklis (`CheckCircle2`) yang dinamis.
                * `Kolom Status Dinamis`: Untuk setiap status unik yang ditemukan (misalnya, "Selesai", "Proses"), menampilkan jumlah entri dan persentasenya relatif terhadap total entri yang memiliki status di kabupaten tersebut.
                * `Inkonsisten`: Dihitung dari jumlah baris di mana kolom `evaluasi` bernilai `'Inkonsisten'`.
                * `Kode 12`: Dihitung dari penjumlahan baris dengan `n = 12` dan baris yang memiliki isian pada `flag_kode_12`.
            * **Baris Total Keseluruhan:** Menampilkan label "Kalimantan Barat" dan nilai agregat total untuk semua kolom numerik dan status.
        * **Level Detail per `nama` (Setelah Klik Kabupaten):**
            * Menampilkan data KSA untuk kabupaten yang dipilih, dikelompokkan berdasarkan kolom `nama` (misalnya, nama responden atau segmen).
            * **Tombol Navigasi "Kembali":** Tersedia tombol untuk kembali ke tampilan level Kabupaten/Kota.
            * **Kolom Utama:** Nama (rata kiri), Target, Realisasi, Persentase (%), Kolom Status Dinamis, Inkonsisten, dan Kode 12, dengan perhitungan yang sama seperti level kabupaten tetapi diagregasi per `nama` dalam kabupaten tersebut.
            * **Pengurutan Kolom (Sorting):** Serupa dengan level kabupaten, berlaku untuk kolom yang relevan.
            * **Pengurutan Data:** Data diurutkan berdasarkan `nama`.
            * **Baris Total untuk Kabupaten Terpilih:** Menampilkan label "Total \[Nama Kabupaten]" dan nilai agregat untuk semua kolom numerik dan status di level `nama`.
    * **Informasi "Terakhir Diperbarui":** Menampilkan *timestamp* dari kolom `tanggal` maksimum data yang ditampilkan, diletakkan di `CardDescription`.
    * **Layout & Styling:** Mengikuti konsistensi desain dengan halaman Monitoring Ubinan.

9.  **Evaluasi Ubinan (Halaman `/evaluasi/ubinan`)**
    * **Tujuan Halaman**: Menyediakan dashboard analitik interaktif untuk melakukan evaluasi statistik terhadap data ubinan mentah. Halaman ini dirancang untuk memberikan wawasan mendalam mengenai produktivitas (`r701`), penggunaan benih, dan pupuk, baik dalam satu periode waktu maupun perbandingan antar waktu.

    * **Struktur & Alur Data**:
        * **`src/app/(dashboard)/evaluasi/ubinan/page.tsx`**:
            * Bertindak sebagai Server Component dan *entry point* untuk halaman.
            * Menyediakan `UbinanEvaluasiFilterProvider` dan `YearProvider` untuk manajemen state filter global.

        * **`src/app/(dashboard)/evaluasi/ubinan/evaluasi-ubinan-client.tsx`**:
            * Client Component utama yang mengorkestrasi seluruh UI interaktif dan logika halaman.
            * Mengelola state utama seperti **Mode Analisis** (`detail` vs `comparison`).
            * Secara dinamis memilih set kolom yang akan ditampilkan di tabel berdasarkan mode yang aktif.
            * Merender semua komponen UI, termasuk `Tabs` untuk mode analisis, filter, chart, tabel, dan modal.

        * **`src/context/YearContext.tsx`**:
            * Menyediakan `selectedYear` dan daftar `availableYears` (diambil dari database menggunakan RPC `get_unique_years`) secara global ke seluruh aplikasi.

        * **`src/context/UbinanEvaluasiFilterContext.tsx`**:
            * Mengelola state untuk filter spesifik halaman ini: **Subround** dan **Komoditas**.
            * Mengambil daftar opsi filter unik dari tabel `ubinan_raw`.

        * **`src/hooks/useUbinanDescriptiveStatsData.ts`**:
            * *Custom hook* yang menerima `comparisonYear` sebagai argumen.
            * Jika `comparisonYear` **null** (Mode Detail): Menghitung statistik deskriptif lengkap dan mempersiapkan data untuk **Box Plot**.
            * Jika `comparisonYear` **diisi** (Mode Perbandingan): Mengambil data untuk dua tahun, lalu menghitung nilai perbandingan dan persentase perubahan (`meanChange`).

        * **`src/hooks/usePenggunaanBenihDanPupukData.ts`**:
            * Hook serupa yang menerima `comparisonYear` untuk mengambil dan memproses data penggunaan benih dan pupuk.
            * Menghitung rata-rata penggunaan per hektar untuk semua input pertanian.
            * Menghasilkan data perbandingan dan persentase perubahan untuk setiap variabel saat di "Mode Perbandingan".

        * **`src/app/(dashboard)/evaluasi/ubinan/descriptive-stats-columns.tsx`**:
            * **Telah direfaktor**: Mengekspor dua set kolom terpisah: `detailStatsColumns` dan `comparisonStatsColumns` untuk digunakan secara dinamis di setiap mode.

        * **`src/app/(dashboard)/evaluasi/ubinan/penggunaan-benih-dan-pupuk-columns.tsx`**:
            * **Telah direfaktor**: Mengekspor `detailFertilizerColumns` untuk mode detail, dan sebuah fungsi `getComparisonFertilizerColumns(selectedVariables)` yang secara dinamis menghasilkan kolom perbandingan.

        * **`UbinanBoxPlot.tsx` & `UbinanComparisonChart.tsx`**:
            * Komponen chart terpisah. `UbinanBoxPlot` menggunakan **ECharts**, sedangkan `UbinanComparisonChart` menggunakan **Recharts**. Keduanya dirender secara kondisional berdasarkan `analysisMode`.

        * **`HasilUbinanDetailModal.tsx` & `DetailKabupatenModal.tsx`**:
            * Dua komponen modal berbeda untuk kebutuhan *drill-down* yang berbeda.
            * Satu untuk detail hasil ubinan (`r701`, `r702`), dan satu lagi untuk detail penggunaan input pertanian per hektar.
            * Keduanya memiliki konten (`...ModalContent.tsx`) dan definisi kolom (`...-columns.tsx`) masing-masing.

        * **Fungsi RPC (PostgreSQL)**:
            * **`get_hasil_ubinan_detail_paginated`**: Mengambil data detail responden (`r111`, `r701`, `r702`, segmen) untuk modal dari tabel statistik.
            * **`get_ubinan_detail_sorted_paginated`**: Mengambil data detail penggunaan input per hektar untuk modal dari tabel benih & pupuk.
            * **`get_unique_years`**: Fungsi yang dipanggil oleh `YearContext` untuk mengambil daftar unik semua tahun yang ada di tabel `ubinan_raw`. Hasilnya digunakan untuk mengisi pilihan pada filter "Tahun" dan "Tahun Pembanding".

    ### Fitur Interaktif & Analitik
    * **Mode Analisis**:
        * Komponen `<Tabs>` memungkinkan pengguna beralih antara **"Analisis Detail"** dan **"Perbandingan Waktu"**.
        * Perpindahan mode mengubah seluruh tata letak halaman, termasuk tabel dan chart yang ditampilkan.

    * **Visualisasi Data Interaktif**:
        * **Box Plot (ECharts)**: Di "Mode Analisis Detail", chart ini memvisualisasikan sebaran data `r701` per kabupaten, lengkap dengan deteksi *outlier*.
        * **Grouped Bar Chart (Recharts)**: Di "Mode Perbandingan Waktu", chart ini menampilkan perbandingan rata-rata hasil ubinan antara dua tahun.

    * **Tabel Dinamis**:
        * **Tabel Statistik Deskriptif**: Menampilkan set kolom yang berbeda tergantung mode. Dilengkapi *unit switcher*, penanda anomali kondisional untuk komoditas padi, dan *drill-down* ke modal detail hasil ubinan.
        * **Tabel Penggunaan Benih & Pupuk**: Menampilkan set kolom berbeda tergantung mode. Dilengkapi penanda anomali untuk rata-rata penggunaan dan *drill-down* ke modal detail input per hektar.

    * **Filtering & Kontrol Lanjutan**:
        * **Filter Global**: `Select` untuk **Tahun**, **Subround**, dan **Komoditas**.
        * **Filter Perbandingan**: `Select` untuk **Tahun Pembanding** yang hanya aktif di "Mode Perbandingan".
        * **Filter Variabel**: Komponen **Multi-select Popover** dengan *checkbox* di dalamnya, memungkinkan pengguna memilih variabel benih & pupuk mana yang akan dibandingkan saat di "Mode Perbandingan".

    * **Modal Detail (Keduanya)**:
        * Menampilkan data dalam tabel dengan **server-side sorting**.
        * Menyediakan opsi untuk mengubah **jumlah data per halaman**.
        * Dilengkapi komponen **paginasi** untuk navigasi.
        * Menampilkan **skeleton loading** yang presisi saat data sedang diperbarui.

    * **Fitur Ekspor**:
        * Tombol "Download Anomali" untuk mengunduh data anomali pada tahun terpilih dalam format Excel (`.xlsx`).

10. **Halaman Update Data (`/update-data/ubinan`) - (Fitur Diperluas Secara Signifikan):**
    * **Struktur Halaman dengan Tabs**: Halaman ini dirombak total menggunakan komponen `Tabs` dari `shadcn/ui` untuk memisahkan dua fungsi impor yang berbeda: "Import Data Transaksi (Raw)" dan "Import Master Sampel".
    * **Riwayat Pembaruan Dinamis**: Setiap tab kini menampilkan riwayat pembaruan terakhir untuk tabelnya masing-masing (`ubinan_raw` dan `master_sampel_ubinan`). Logika pengambilan data telah disempurnakan untuk menangani nilai `NULL` pada data lama, memastikan data terbaru selalu ditampilkan dengan benar.

    * **Fitur A: Import Data Ubinan (Raw) dengan Pemetaan Kolom Cerdas**
        * **UI & Logika Unggah Dua Langkah**: Untuk mengatasi masalah header CSV yang sering berubah, alur unggah diubah menjadi proses dua langkah yang canggih:
            1.  **Analisis Header**: Setelah pengguna memilih file, sistem menjalankan `Server Action` ringan (`analyzeCsvHeadersAction`) yang membaca header CSV dan secara otomatis mencocokkannya dengan kolom database yang dibutuhkan (`auto-matching`). Logika pencocokan ini dibuat *robust* untuk menangani karakter tak terlihat (seperti BOM) dan perbedaan spasi.
            2.  **Modal Pemetaan Interaktif**: Sebuah modal `Dialog` dari `shadcn/ui` akan muncul, menampilkan hasil analisis. Pengguna dapat dengan mudah memetakan kolom yang tidak cocok secara otomatis melalui dropdown, dan melihat daftar kolom tak terduga yang akan diabaikan.
            3.  **Impor Berdasarkan Mapping**: Proses impor penuh kemudian berjalan menggunakan konfigurasi pemetaan yang telah disetujui pengguna, membuat sistem menjadi sangat fleksibel terhadap perubahan format file sumber.
        * **Backend (Server Action `uploadUbinanRawAction`)**:
            * Logika dipecah menjadi dua `Server Actions` untuk efisiensi.
            * Tetap menggunakan logika **"Hapus dan Ganti"** melalui fungsi RPC PostgreSQL `process_ubinan_raw_upload`.
            * Setelah impor berhasil, secara otomatis memanggil fungsi RPC untuk me-refresh `materialized view` `ubinan_anomali` dan `ubinan_dashboard` secara berurutan.

    * **Fitur B: Import Master Sampel Ubinan**
        * **UI & Logika**: Menggunakan komponen uploader yang diseragamkan (`MasterSampleUploader`) untuk mengunggah **satu atau beberapa file Excel (.xlsx, .xls)**.
        * **Backend (Server Action `uploadMasterSampleAction`)**:
            * Menggunakan library **`xlsx` (SheetJS)** untuk mem-parsing file Excel di sisi server.
            * Melakukan konversi nama bulan dari format teks (misal: "Agustus") menjadi format angka ("8").
            * Menggunakan logika **UPSERT** (Update jika ada, Insert jika baru) ke tabel `master_sampel_ubinan`.
            * Keunikan data ditentukan oleh kombinasi 5 kolom: `tahun`, `subround`, `bulan`, `idsegmen`, dan `subsegmen`.
            * Me-refresh `materialized view` `ubinan_dashboard` setelah `upsert` berhasil.
        * **Persiapan Database**: Meliputi penambahan kolom audit (`uploaded_at`, `uploaded_by_username`) dan pembuatan `UNIQUE INDEX` pada 5 kolom kunci untuk optimasi `UPSERT`.

11. **Halaman Update Data KSA (`/update-data/ksa`) - (Fitur Baru):**
    * **Halaman & Logika Modular**: Membuat halaman dan `Server Action` (`_actions.ts`) yang sepenuhnya terpisah dan didedikasikan untuk impor data KSA.
    * **UI Halaman Unggah**:
        * Menggunakan komponen `KsaUploader` yang dirancang untuk menerima **satu atau beberapa file Excel** dengan antarmuka *drag-and-drop* yang konsisten dengan fitur impor lainnya.
        * **Modal Konfirmasi Cerdas**: Sebelum mengunggah, sebuah modal konfirmasi akan muncul. Ringkasan data (tahun, bulan, dan wilayah terdampak) di dalam modal ini **dihasilkan secara dinamis** dengan mem-parsing file Excel di sisi klien terlebih dahulu untuk memastikan pengguna mengonfirmasi data yang akurat.
    * **Logika Backend (Server Action `uploadKsaAction`)**:
        * Menggunakan logika **"Hapus dan Ganti"** melalui fungsi RPC PostgreSQL `process_ksa_amatan_upload`. Data lama dihapus berdasarkan `tahun`, `bulan`, dan `kode_kab`.
        * **Transformasi Data Kompleks**: Secara otomatis melakukan transformasi data saat impor:
            * Mengekstrak `tahun` dan `bulan` (sebagai integer) dari kolom `tanggal`.
            * Membuat `kode_kab` dan `kode_kec` dengan memotong data dari kolom `id_segmen`.
            * Membuat `kabupaten` dengan melakukan *mapping* dari `kode_kab`.
            * Menangani nama header dengan spasi (seperti `"id segmen"`) dan karakter khusus (`"n-1"`) secara defensif.
    * **Persiapan Database**: Meliputi penambahan kolom audit dan pembuatan `INDEX` (non-unik) pada kolom kunci `DELETE` untuk mempercepat performa penghapusan data.

12. **Peningkatan Sistem & Pengalaman Pengguna (Global):**
    * **Konfigurasi Batas Ukuran File**: Batas ukuran body untuk Server Action telah dinaikkan menjadi **25MB** melalui `next.config.js` untuk mengakomodasi file impor yang besar dan mencegah error `413 Payload Too Large`.
    * **Penyegaran Cache & UI**: Mengimplementasikan pola `router.refresh()` di sisi klien setelah Server Action sukses. Ini bekerja bersama dengan `revalidatePath` di server untuk memastikan data di UI (seperti "Riwayat Pembaruan Terakhir") langsung ter-update tanpa perlu me-reload halaman secara manual.

13. **Halaman Analisis Statistik Produksi ATAP (`/produksi-statistik`) - (Fitur Baru & Canggih):**
    * **Arsitektur Data Terpusat**: Halaman ini dirancang untuk menjadi pusat analisis dengan mengambil data dari satu `DATABASE VIEW` yang kuat bernama `laporan_atap_lengkap`. View ini menggabungkan semua tabel data ATAP (bulanan/tahunan, kab/prov) dengan tabel `master_indikator_atap`, menyederhanakan kueri di sisi aplikasi secara drastis.
    * **UI & Komponen**: Halaman dibangun menggunakan struktur Server Component (`page.tsx`) yang mengambil data awal (daftar indikator) dan Client Component (`statistik-client.tsx`) yang menangani semua interaktivitas.
    * **Filter Dinamis & Komprehensif**:
        * **Filter Global**: Terintegrasi penuh dengan `YearContext` global.
        * **Filter Lokal**: Menyediakan filter untuk "Periode Bulan", "Indikator", "Level Wilayah", dan "Bandingkan Dengan Tahun".
        * **Debouncing**: Filter dioptimalkan dengan `debounce` untuk mengurangi beban server dan meningkatkan responsivitas UI.
    * **Pengambilan Data Efisien**: Menggunakan *custom hook* `useAtapStatistikData` yang dibangun di atas `SWR` untuk data fetching yang efisien, lengkap dengan caching otomatis dan penanganan status *loading*.
    * **Visualisasi Data Interaktif dengan `Recharts`**:
        * **KPI Cards**: Menampilkan kartu ringkasan untuk "Total Nilai" (lengkap dengan persentase perubahan tahunan), "Wilayah Tertinggi & Terendah", dan "Jumlah Wilayah".
        * **Grafik Kontribusi (Donut Chart)**: Menampilkan persentase kontribusi setiap kabupaten terhadap total provinsi.
        * **Grafik Batang (Perbandingan Wilayah)**: Memvisualisasikan perbandingan nilai antar wilayah.
        * **Grafik Garis (Tren Waktu)**: Menampilkan tren bulanan.
        * **Fitur Drill Down**: Pengguna dapat mengeklik sebuah batang pada grafik perbandingan untuk memfilter grafik tren waktu secara dinamis.
        * **Fitur Perbandingan Periode**: Semua grafik dapat menampilkan data perbandingan dengan tahun sebelumnya.
    * **Tabel Data Rinci dengan `TanStack Table`**:
        * Mengimplementasikan tabel data yang interaktif, lengkap dengan sorting, filtering berdasarkan nama wilayah, dan paginasi.
        * **Kolom Dinamis**: Tabel secara cerdas menampilkan kolom tambahan seperti "Kontribusi (%)", "Nilai Tahun Lalu", dan "Pertumbuhan (%)" hanya ketika filter yang relevan aktif.
    * **Fitur Utilitas Lanjutan**:
        * **Ekspor ke CSV**: Menyediakan tombol untuk mengunduh data rinci yang sedang ditampilkan.
        * **Ekspor ke PNG**: Setiap grafik memiliki tombol untuk diunduh sebagai gambar berkualitas tinggi menggunakan `html-to-image`.
        * **Simpan Tampilan (Preset Filter)**: Pengguna dapat menyimpan konfigurasi filter favorit mereka ke `localStorage` untuk diakses kembali dengan cepat.
    * **Perbaikan Teknis (Robustness)**:
        * Mengatasi error umum `Recharts` pada Next.js App Router dengan mengimplementasikan **Dynamic Imports** (`next/dynamic`) dengan opsi `ssr: false`.

14. **Halaman Update Data ATAP (`/update-data/atap`) - (Fitur Baru & Arsitektur Lanjutan):**
    * **Arsitektur Database Scalable**: Merancang dan mengimplementasikan arsitektur database yang kuat untuk data ATAP, yang terdiri dari:
        * **Satu Tabel Master (`master_indikator_atap`)**: Menjadi "sumber kebenaran tunggal" untuk semua nama indikator, satuan default, dan alias. Ini memastikan standarisasi data di seluruh aplikasi.
        * **Empat Tabel Data Spesifik**: Data dipecah berdasarkan granularitasnya ke dalam empat tabel (`data_atap_bulanan_kab`, `data_atap_tahunan_kab`, `data_atap_bulanan_prov`, `data_atap_tahunan_prov`) untuk menjaga integritas dan kejelasan data. Semua tabel data ini terhubung ke tabel master melalui `id_indikator`.
        * **Satu `DATABASE VIEW` untuk Analisis (`laporan_atap_lengkap`)**: Sebuah "tabel virtual" dibuat dengan menggabungkan (JOIN) semua tabel data dan tabel master. Ini menyederhanakan kueri untuk analisis lintas tabel dan visualisasi data secara drastis.
    * **UI Halaman Unggah dengan Tabs**:
        * Membuat halaman baru di `/update-data/atap` yang menggunakan komponen `Tabs` `shadcn/ui` untuk menyediakan antarmuka yang bersih bagi empat jenis impor data yang berbeda.
        * Menggunakan satu komponen `AtapUploader` yang reusable untuk semua tab, yang dikonfigurasi melalui *props*.
    * **Logika Backend (Server Action `uploadAtapDataAction`)**:
        * **Satu Aksi untuk Semua**: Membuat satu Server Action generik yang cerdas untuk menangani keempat jenis impor data ATAP.
        * **Transformasi Data (Unpivot)**: Secara otomatis mengubah data dari format "wide" (banyak kolom indikator di Excel) menjadi format "long" yang sesuai dengan struktur database.
        * **Pencocokan Indikator**: Mencocokkan nama indikator dari header file Excel dengan `nama_resmi` di tabel `master_indikator_atap` sebelum melakukan impor.
        * **Logika `UPSERT`**: Menggunakan logika `UPSERT` (update jika ada, insert jika baru) untuk semua jenis data, memastikan tidak ada duplikasi dan data selalu yang terbaru.
        * **Penanganan Satuan Dinamis**: Mampu mem-parsing satuan yang ada di dalam header Excel (misal: "Produksi Padi (Ton)") dan menyimpannya di kolom `satuan_override` jika berbeda dari `satuan_default` di tabel master.
    * **Agregasi Otomatis**:
        * Membuat dua fungsi RPC PostgreSQL (`aggregate_kabupaten_to_tahunan` dan `aggregate_provinsi_to_tahunan`).
        * Setelah impor data bulanan berhasil, Server Action secara otomatis memanggil fungsi RPC ini untuk menjumlahkan data bulanan dan melakukan `UPSERT` hasilnya ke tabel tahunan yang sesuai. Ini mengurangi pekerjaan manual dan menjamin konsistensi data.

15. **Halaman Evaluasi KSA (Halaman `/evaluasi/ksa`) - (Fitur Baru & Arsitektur RPC):**
    * **Arsitektur Berbasis RPC yang Efisien:** Seluruh pengambilan data untuk halaman ini telah direfaktor untuk menggunakan fungsi RPC PostgreSQL di Supabase. Pendekatan ini memindahkan beban agregasi data yang berat dari *frontend* ke *backend*, memungkinkan pemrosesan ratusan ribu *record* data KSA secara instan tanpa membebani *browser*. Fungsi RPC yang digunakan antara lain:
        * `get_ksa_evaluation_stats`: Mengambil data agregat untuk KPI dan grafik utama.
        * `get_ksa_harvest_frequency_by_kab`: Mengambil data untuk tabel distribusi frekuensi panen.
        * `get_ksa_distinct_kabupaten`: Mengambil daftar unik kabupaten untuk filter.
        * `get_ksa_subsegmen_detail`: Mengambil rincian data untuk modal detail.
    * **Visualisasi Data Interaktif (Tab Visualisasi Utama):**
        * **Kartu KPI:** Menampilkan ringkasan data kunci seperti rata-rata frekuensi panen, bulan puncak tanam, dan bulan puncak panen.
        * **Grafik Proporsi Fase Tanam:** Menggunakan *Stacked Area Chart* untuk memvisualisasikan proporsi bulanan fase amatan KSA.
        * **Grafik Tren Tanam vs. Panen:** Menggunakan *Line Chart* untuk membandingkan tren bulanan antara jumlah subsegmen yang melakukan tanam dan yang melakukan panen.
    * **Tabel Distribusi Frekuensi Panen Dinamis:**
        * Menampilkan tabel pivot yang merangkum jumlah subsegmen berdasarkan frekuensi panennya dalam setahun (misal: 1x, 2x, 3x panen).
        * Kolom frekuensi pada tabel dibuat secara dinamis sesuai dengan data frekuensi panen maksimum yang ada pada tahun tersebut.
        * Setiap baris kabupaten dapat diklik untuk membuka **Modal Detail** yang menampilkan rincian subsegmen beserta "Kalender Panen" visual per subsegmen.
    * **Tab Validator Anomali Interaktif (Fitur Baru):** Menambahkan tab kedua yang didedikasikan untuk validasi data dan penemuan anomali fase tanam.
        * **Deteksi Anomali di Backend:** Mengimplementasikan fungsi RPC PostgreSQL baru, `find_ksa_phase_anomalies`, yang secara cerdas mendeteksi berbagai jenis anomali (Stagnansi, Fase Mundur, Lompatan Ekstrem, dll.) langsung di level database.
        * **Dashboard Ringkasan KPI Anomali:** Menampilkan tiga kartu KPI dinamis di bagian atas yang didesain ulang untuk visualisasi yang lebih baik: "Total Anomali" dengan ikon besar, "Ringkasan Jenis Anomali" (dalam format akordeon hierarkis yang bisa diekspansi untuk melihat detail per kabupaten), dan "Sebaran Anomali Wilayah" (menampilkan wilayah dengan anomali terbanyak dan terendah).
        * **Tabel Anomali yang Informatif & Interaktif:** Menggunakan `TanStack Table` untuk menampilkan rincian anomali dengan fitur-fitur canggih:
            * **Default Sorting & Paginasi:** Tabel diurutkan berdasarkan "ID Subsegmen" secara default dan dilengkapi paginasi di sisi klien.
            * **Visualisasi Konteks Fase:** Kolom "Konteks Fase" diubah menjadi komponen visual (`PhaseTimelineVisual`) untuk memudahkan pemahaman transisi fase yang anomali.
            * **Tooltip untuk Detail:** Kolom "Deskripsi" dihilangkan dari tampilan tabel untuk membuat UI lebih ringkas, dan informasinya dipindahkan ke dalam *tooltip* yang muncul saat kursor diarahkan ke *badge* "Kode Anomali".
        * **Filter Bulan & Ekspor ke Excel:** Dilengkapi filter per bulan yang memperbarui data KPI dan tabel secara dinamis, serta tombol untuk mengekspor data yang telah difilter ke dalam format Excel, dengan tetap menyertakan kolom deskripsi yang tersembunyi.

## 📁 Struktur Folder Proyek
Dashboard Pertanian/
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
│   │   ├── login-illustration.jpg
│   │   └── login-illustration.svg
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
│   │   │   ├── evaluasi
│   │   │   │   ├── ksa
│   │   │   │   │   ├── DetailKsaModal.tsx
│   │   │   │   │   ├── DetailKsaModalContent.tsx
│   │   │   │   │   ├── MonthlyHarvestDisplay.tsx
│   │   │   │   │   ├── evaluasi-ksa-client.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── ubinan
│   │   │   │       ├── DetailKabupatenModal.tsx
│   │   │   │       ├── DetailKabupatenModalContent.tsx
│   │   │   │       ├── descriptive-stats-columns.tsx
│   │   │   │       ├── detail-record-columns.tsx
│   │   │   │       ├── evaluasi-ubinan-client.tsx
│   │   │   │       ├── page.tsx
│   │   │   │       └── penggunaan-benih-dan-pupuk-columns.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── monitoring
│   │   │   │   ├── ksa
│   │   │   │   │   ├── ksa-monitoring-client-page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── ubinan
│   │   │   │       └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── pengguna
│   │   │   │   ├── _actions.ts
│   │   │   │   ├── page.tsx
│   │   │   │   └── user-management-client-page.tsx
│   │   │   ├── produksi-statistik
│   │   │   │   ├── atap-charts.tsx
│   │   │   │   ├── bar-chart-wrapper.tsx
│   │   │   │   ├── columns.tsx
│   │   │   │   ├── data-table.tsx
│   │   │   │   ├── line-chart-wrapper.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── pie-chart-wrapper.tsx
│   │   │   │   └── statistik-client.tsx
│   │   │   └── update-data
│   │   │       ├── atap
│   │   │       │   ├── _actions.ts
│   │   │       │   ├── atap-uploader.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── ksa
│   │   │       │   ├── _actions.ts
│   │   │       │   ├── ksa-uploader.tsx
│   │   │       │   └── page.tsx
│   │   │       └── ubinan
│   │   │           ├── _actions.ts
│   │   │           ├── master-sample-uploader.tsx
│   │   │           ├── page.tsx
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
│   │   │       └── page.tsx
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
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
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
│   │       └── tooltip.tsx
│   ├── context
│   │   ├── AuthContext.tsx
│   │   ├── KsaEvaluasiFilterContext.tsx
│   │   ├── UbinanEvaluasiFilterContext.tsx
│   │   └── YearContext.tsx
│   ├── hooks
│   │   ├── use-mobile.ts
│   │   ├── useAtapStatistikData.ts
│   │   ├── useDebounce.ts
│   │   ├── useKsaEvaluationData.ts
│   │   ├── useKsaMonitoringData.ts
│   │   ├── usePadiMonitoringData.ts
│   │   ├── usePalawijaMonitoringData.ts
│   │   ├── usePenggunaanBenihDanPupukData.ts
│   │   └── useUbinanDescriptiveStatsData.ts
│   ├── lib
│   │   ├── database.types.ts
│   │   ├── satker-data.ts
│   │   ├── sidebar-data.ts
│   │   ├── supabase-server.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── middleware.ts
├── tailwind.config.ts
└── tsconfig.json

**Catatan Penting tentang Struktur Folder:**
* Penempatan `middleware.ts` di dalam `src/`.
* File `layout.tsx` di `src/app/(dashboard)/layout.tsx` akan menjadi layout utama untuk semua rute di dalam grup `(dashboard)`. File `src/app/layout.tsx` (jika ada di luar grup dashboard) akan menjadi root layout global.
* `client-layout-wrapper.tsx` tetap dibutuhkan.
* `src/app/api/users/route.ts` adalah penamaan standar untuk Next.js App Router Route Handlers (sebelumnya `routes.ts`).

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

## 🌐 Daftar Route Penting
* `/`: Dashboard Utama
* `/auth/login`: Halaman Login
* `/auth/register`: Halaman Registrasi
* `/monitoring/ubinan`: Monitoring Ubinan Padi & Palawija
* `/monitoring/ksa`: Monitoring KSA Padi
* `/pengguna`: Halaman Manajemen Pengguna (hanya untuk `super_admin`)
* `/evaluasi/ubinan`: Halaman Evaluasi Statistik Deskriptif Ubinan (Baru)

🚧 TODO & Isu yang Perlu Diperhatikan
* **Fitur "Edit Pengguna"**: Memerlukan pengujian menyeluruh.
* **Fitur "Lihat Detail Pengguna"**: Masih TODO.
* **Penyempurnaan UI/UX Manajemen Pengguna**.
* **RLS (Row Level Security)**: Perlu dipantau.

Jika ada kendala atau permintaan fitur baru, silakan hubungi pengelola proyek.