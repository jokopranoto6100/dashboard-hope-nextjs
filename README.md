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

2.  **Sistem Login & Otorisasi Berbasis Peran:**
    * Halaman login (`/auth/login`) dan registrasi (`/auth/register`) yang berfungsi penuh menggunakan Supabase Auth.
    * Penggantian notifikasi dari SweetAlert2 ke Sonner untuk pengalaman *toast* yang lebih modern.
    * **Middleware untuk Proteksi Rute:** Menggunakan Next.js Middleware (`middleware.ts`) untuk melindungi rute yang memerlukan otentikasi dan mengarahkan pengguna yang belum *login* ke halaman login. Middleware juga diperbarui untuk menggunakan `supabase.auth.getUser()` untuk validasi sesi yang lebih aman di sisi server.
    * **Visibilitas Menu Dinamis:** Menu sidebar disesuaikan berdasarkan peran pengguna (`super_admin`, `viewer`) yang diambil dari `user_metadata` Supabase Auth.
    * **React Context untuk Autentikasi (`AuthContext`)**: Implementasi `AuthContext` (`src/context/AuthContext.tsx`) untuk mengelola sesi pengguna, data pengguna (termasuk peran dari `user_metadata`), dan status loading secara global di sisi klien. Komponen `NavUserHope.tsx` telah diupdate untuk menggunakan *context* ini.

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

7.  **Manajemen Pengguna (Halaman `/pengguna`) - (Fitur Baru dalam Sesi Ini):**
    * **Akses Terbatas**: Halaman hanya dapat diakses oleh pengguna dengan peran `super_admin`. Proteksi diterapkan di level *middleware* (`middleware.ts`) dan juga di *server component* halaman (`src/app/(dashboard)/pengguna/page.tsx`).
    * **Visibilitas Menu**: Menu "Manajemen Pengguna" di `NavUserHope.tsx` hanya terlihat oleh `super_admin`, menggunakan data peran dari `AuthContext`.
    * **Struktur Data Pengguna**: Dikonfirmasi bahwa kolom kustom `role` dan `username` ada langsung di tabel `public.users` (bukan di `auth.users` atau hanya di `user_metadata` untuk daftar pengguna).
    * **Pengambilan Daftar Pengguna**:
        * `src/app/(dashboard)/pengguna/page.tsx` (Server Component) mengambil daftar semua pengguna.
        * Menggunakan fungsi PostgreSQL `get_all_managed_users()` yang dipanggil via `supabaseServer.rpc()` untuk melakukan `LEFT JOIN` antara `auth.users` (untuk `id`, `email`, `created_at`) dan `public.users` (untuk kolom kustom `username`, `role`).
    * **Tampilan Tabel Pengguna**:
        * Komponen klien `src/app/(dashboard)/pengguna/user-management-client-page.tsx` menampilkan daftar pengguna menggunakan `TanStack Table`.
        * Fitur tabel: sorting, filtering (berdasarkan email), dan paginasi.
    * **Server Actions (`src/app/(dashboard)/pengguna/_actions.ts`)**:
        * Fungsi `verifySuperAdmin()` untuk memastikan hanya admin yang bisa menjalankan aksi.
        * `deleteUserAction(userId)`: Menghapus pengguna dari `Supabase Auth`.
        * `updateUserRoleAction({ userId, newRole })`:
            * Memanggil fungsi PostgreSQL `update_user_custom_role(userId, newRole)` via RPC untuk mengupdate kolom `role` di tabel `public.users`.
            * Juga mengupdate `user_metadata.role` pengguna target untuk konsistensi sesi.
        * `createUserAction(userData)`:
            * Membuat pengguna baru di `Supabase Auth`.
            * Memanggil fungsi RPC `update_user_custom_role` dan `update_user_custom_username` untuk mengisi kolom kustom di `public.users`.
            * Juga mengupdate `user_metadata` pengguna baru.
        * `editUserAction(payload)`: Kerangka telah dibuat untuk mengedit detail pengguna, termasuk email, password (opsional), username (via RPC), dan role (via RPC), serta `user_metadata`.
    * **Fungsi PostgreSQL untuk Kolom Kustom**:
        * `update_user_custom_role(user_id, new_role)`: Dibuat dan digunakan untuk mengupdate kolom `role` di `public.users`. Fungsi ini mengembalikan peran baru yang di-set.
        * `update_user_custom_username(user_id, new_username)`: Dibuat dan digunakan untuk mengupdate kolom `username` di `public.users`. Fungsi ini mengembalikan username baru yang di-set.
    * **UI Aksi Pengguna**:
        * Tombol "Hapus Pengguna" di tabel dengan dialog konfirmasi (`AlertDialog`) dan notifikasi `toast` (Sonner).
        * Tombol "Ubah Peran" di tabel (menjadi "Super Admin" atau "Viewer") dengan notifikasi `toast`.
        * Tombol "Tambah Pengguna Baru" yang membuka dialog (`Dialog`) dengan form (`React Hook Form` + `Zod` untuk validasi) untuk membuat pengguna baru.
        * Tombol "Edit Pengguna" di tabel yang membuka dialog (`Dialog`) dengan form untuk mengedit data pengguna.
        * Status loading (`useTransition`, ikon `Loader2`) diimplementasikan untuk tombol-tombol aksi (hapus, ubah peran, tambah, edit) untuk memberikan feedback visual selama proses.
    * **Revalidasi Data**: `revalidatePath('/pengguna')` digunakan di Server Actions untuk memastikan data di halaman diperbarui setelah aksi.

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

9.  **Evaluasi Ubinan (Halaman `/evaluasi/ubinan`) - (Fitur Baru):**
    * **Tujuan Halaman**: Menyajikan analisis statistik deskriptif dari data ubinan mentah (`ubinan_raw`).
        * **`src/app/(dashboard)/evaluasi/ubinan/page.tsx`**:
            * Bertindak sebagai Server Component dan entry point untuk halaman.
            * Menyediakan `UbinanEvaluasiFilterProvider` untuk manajemen state filter halaman.

        * **`src/app/(dashboard)/evaluasi/ubinan/evaluasi-ubinan-client.tsx`**:
            * Client Component utama yang bertanggung jawab untuk merender seluruh UI interaktif.
            * Menampilkan filter halaman dan tiga tabel data utama:
                1.  Tabel Statistik Deskriptif Ubinan (`r701`).
                2.  Tabel Gabungan Rata-Rata Penggunaan Benih dan Pupuk per Kabupaten/Kota.
            * Mengelola interaksi pengguna seperti perubahan filter, sorting tabel, dan pemicu modal detail.

        * **`src/context/UbinanEvaluasiFilterContext.tsx`**:
            * React Context yang mengelola state untuk filter spesifik halaman ini: **Subround** dan **Komoditas**.
            * Mengambil daftar opsi unik untuk filter Subround dan Komoditas dari database (tabel `ubinan_raw`) secara paginasi untuk memastikan semua opsi termuat.

        * **`src/hooks/useUbinanDescriptiveStatsData.ts`**:
            * Custom hook untuk mengambil dan memproses data statistik deskriptif.
            * Mengambil data dari `ubinan_raw` berdasarkan filter global **Tahun** (dari `YearContext`) dan filter halaman **Subround** serta **Komoditas** (dari `UbinanEvaluasiFilterContext`).
            * Memproses hanya record di mana `r701` (hasil ubinan/produksi per plot) tidak null.
            * Menerapkan faktor konversi pada `r701` jika pengguna mengubah unit tampilan melalui UI (kg/plot atau kuintal/hektar).
            * Menghitung statistik deskriptif (Jumlah Sampel, Rata-rata, Median, Min, Max, Standar Deviasi, Kuartil 1, Kuartil 3) untuk `r701` yang dikelompokkan per kabupaten/kota.
            * Menghitung statistik deskriptif agregat untuk "Kalimantan Barat".
            * Mengelola paginasi internal saat mengambil data dari Supabase untuk memastikan semua record yang relevan terambil.

        * **`src/hooks/usePenggunaanBenihDanPupukData.ts`**:
            * Custom hook untuk mengambil dan memproses data penggunaan benih dan pupuk.
            * Mengambil data dari `ubinan_raw` (kolom `r604` - Luas Tanam, `r608` - Bibit, `r610_1` s/d `r610_7` - Jenis Pupuk) berdasarkan filter global **Tahun** dan filter halaman **Subround** serta **Komoditas**.
            * Memproses hanya record di mana `r604` valid dan lebih dari 0.
            * Menghitung rata-rata luas tanam (m²), rata-rata penggunaan benih per hektar (Kg/Ha), dan rata-rata penggunaan berbagai jenis pupuk per hektar (Kg/Ha atau Liter/Ha) yang dikelompokkan per kabupaten/kota.
            * Menghitung nilai agregat yang sama untuk "Kalimantan Barat".
            * Mengelola paginasi internal saat mengambil data dari Supabase.
            * Menghasilkan satu set data gabungan dalam format `PupukDanBenihRow` untuk tabel utama.

        * **`src/app/(dashboard)/evaluasi/ubinan/descriptive-stats-columns.tsx`**:
            * Definisi kolom untuk `TanStack Table` yang menampilkan tabel statistik deskriptif.
            * Termasuk rendering data statistik dan baris footer untuk agregat "Kalimantan Barat".
            * Semua kolom data numerik dan header diatur rata tengah. Header kolom yang relevan menampilkan satuan unit (misalnya, (kg/plot)) pada baris kedua.

        * **`src/app/(dashboard)/evaluasi/ubinan/penggunaan-benih-dan-pupuk-columns.tsx`**:
            * Definisi kolom untuk `TanStack Table` yang menampilkan tabel gabungan rata-rata penggunaan benih dan pupuk.
            * Kolom mencakup "Nama Kabupaten/Kota", "Rata-rata Luas Tanam (m²)", "Rata-rata Benih (Kg/Ha)", dan kolom untuk setiap jenis pupuk per hektar.
            * Header memiliki dua baris (nama metrik dan satuan).
            * Sel data menampilkan nilai rata-rata. Jika nilai rata-rata tersebut melebihi ambang batas yang telah ditentukan, ikon `ShieldAlert` (dari `lucide-react`) akan ditampilkan di samping nilai.
            * Baris footer menampilkan data agregat "Kalimantan Barat" dengan logika indikator ikon `ShieldAlert` yang sama.
            * Semua kolom data numerik dan header diatur rata tengah.

        * **`src/app/(dashboard)/evaluasi/ubinan/DetailKabupatenModal.tsx`**:
            * Komponen wrapper yang menggunakan `<Dialog>` dari `shadcn/ui`.
            * Bertanggung jawab untuk menampilkan dan menyembunyikan modal detail per record.

        * **`src/app/(dashboard)/evaluasi/ubinan/DetailKabupatenModalContent.tsx`**:
            * Komponen yang menangani logika dan tampilan konten di dalam modal detail.
            * Memanggil fungsi RPC Supabase (`get_ubinan_detail_sorted_paginated`) untuk mengambil data detail per record berdasarkan kabupaten yang dipilih dan filter aktif (Tahun, Subround, Komoditas).
            * Hanya record dengan `r111` (Nama Responden) tidak null yang akan diambil dan ditampilkan.
            * Menampilkan tabel data detail per record dengan kolom-kolom seperti "Nama Responden", "Luas Tanam (m²)", dan penggunaan benih serta setiap jenis pupuk **per hektar**.
            * Mengimplementasikan **server-side sorting** untuk semua kolom di tabel detail. Pengguna dapat mengklik header kolom untuk mengurutkan data di seluruh dataset yang relevan (melalui pemanggilan ulang RPC dengan parameter sorting).
            * Menyediakan komponen `<Select>` (`shadcn/ui`) yang memungkinkan pengguna memilih jumlah record yang ditampilkan per halaman (opsi: 10, 20, 50, 100).
            * Mengimplementasikan komponen `<Pagination>` (`shadcn/ui`) untuk navigasi antar halaman data detail.
            * Menampilkan skeleton loading pada baris-baris `TableBody` saat data sedang di-refresh (misalnya, saat sorting, pindah halaman, atau perubahan ukuran halaman).

        * **`src/app/(dashboard)/evaluasi/ubinan/detail-record-columns.tsx`**:
            * Definisi kolom untuk tabel detail di dalam modal.
            * Kolom menampilkan data per hektar untuk benih dan setiap jenis pupuk.
            * Ikon `ShieldAlert` ditampilkan di samping nilai per hektar jika penggunaan individu tersebut melebihi ambang batas spesifik yang telah ditentukan untuk masing-masing jenis benih/pupuk.
            * Header memiliki dua baris (nama metrik dan satuan).

        * **Fungsi RPC `get_ubinan_detail_sorted_paginated` (PostgreSQL)**:
            * Fungsi database yang dibuat di PostgreSQL dan dipanggil melalui Supabase.
            * Bertanggung jawab untuk:
                * Menerima parameter filter (kabupaten, tahun, komoditas, subround).
                * Menerima parameter sorting (kolom target dan arah).
                * Menerima parameter paginasi (limit dan offset).
                * Mengambil data dari `ubinan_raw`, memfilter `r111 IS NOT NULL`.
                * Menghitung nilai penggunaan benih/pupuk per hektar secara dinamis.
                * Melakukan sorting berdasarkan nilai kalkulasi per hektar di sisi server.
                * Menerapkan paginasi.
                * Mengembalikan set data yang sudah diproses dan total jumlah record yang cocok dengan filter (untuk keperluan paginasi di client).

        ### Fitur Interaktif

        * **Filter Halaman (Kanan Atas, di luar Card Tabel)**:
            * **Filter Subround**: Komponen `<Select>` (`shadcn/ui`) memungkinkan pengguna memilih subround tertentu atau "Semua Subround".
            * **Filter Komoditas**: Komponen `<Select>` (`shadcn/ui`) memungkinkan pengguna memilih komoditas. Default ke komoditas pertama yang tersedia; tidak ada opsi "Semua Komoditas".

        * **Tabel Statistik Deskriptif (`r701`)**:
            * Menampilkan statistik (Jumlah Sampel, Rata-rata, Median, Min, Max, Standar Deviasi, Q1, Q3) untuk `r701` yang dikelompokkan berdasarkan Kabupaten/Kota. Nama kabupaten diambil menggunakan pemetaan dari `src/lib/utils.ts`.
            * Semua kolom data dan header di tabel diatur rata tengah.
            * **Tombol Switch Unit**: Komponen `<Switch>` (`shadcn/ui`) di pojok kanan atas kartu tabel untuk mengubah satuan `r701` antara "kg/plot" (default) dan "kuintal/hektar" (nilai `r701` dikalikan 16). Perubahan unit ini memicu perhitungan ulang statistik pada tabel. Header kolom yang relevan (Mean, Median, dll.) juga menampilkan unit yang aktif pada baris kedua.
            * **Baris Footer "Kalimantan Barat"**: Menampilkan nilai agregat statistik deskriptif untuk seluruh Provinsi Kalimantan Barat berdasarkan data yang terfilter.
            * Data tabel dapat diurutkan (sorting client-side).

        * **Tabel Gabungan Rata-Rata Penggunaan Benih dan Pupuk**:
            * Menampilkan data rata-rata penggunaan benih dan berbagai jenis pupuk per hektar, serta rata-rata luas tanam, per Kabupaten/Kota.
            * Sel data menampilkan ikon `ShieldAlert` jika nilai rata-rata melebihi ambang batas yang ditentukan.
            * Header kolom diatur rata tengah dengan satuan pada baris kedua.
            * Baris Footer "Kalimantan Barat" untuk agregat provinsi, juga dengan logika indikator ikon `ShieldAlert`.
            * Data tabel dapat diurutkan (sorting client-side).
            * **Interaksi Klik Baris**: Setiap baris kabupaten dapat diklik untuk memunculkan **Modal Detail** penggunaan benih dan pupuk per record.

        * **Modal Detail Penggunaan Benih & Pupuk (per Record)**:
            * Judul modal dinamis menampilkan nama kabupaten yang sedang dilihat detailnya.
            * Menampilkan tabel data per record (responden) untuk kabupaten yang dipilih.
            * Kolom mencakup "Nama Responden", "Luas Tanam (m²)", dan penggunaan benih serta setiap jenis pupuk **per hektar**.
            * Ikon `ShieldAlert` ditampilkan di samping nilai per hektar jika penggunaan individu tersebut melebihi ambang batas yang telah ditentukan.
            * **Server-side sorting** aktif untuk semua kolom di tabel detail, memungkinkan pengurutan data yang akurat di seluruh dataset yang relevan.
            * Pengguna dapat memilih **jumlah record per halaman** (10, 20, 50, 100) melalui komponen `<Select>`.
            * Komponen `<Pagination>` penuh untuk navigasi antar halaman data detail.
            * Skeleton loading ditampilkan pada baris-baris tabel (`TableBody`) saat data sedang di-refresh (misalnya, saat sorting, pindah halaman, atau perubahan ukuran halaman).

10. **Halaman Update Data (`/update-data/ubinan`) - (Fitur Baru & Diperluas):**
    * **Struktur Halaman dengan Tabs**: Halaman ini sekarang menggunakan komponen `Tabs` dari `shadcn/ui` untuk memisahkan dua fungsi impor yang berbeda: "Import Data Transaksi (Raw)" dan "Import Master Sampel".
    * **Riwayat Pembaruan Terakhir**: Setiap tab kini menampilkan riwayat pembaruan terakhir untuk tabelnya masing-masing (`ubinan_raw` dan `master_sampel_ubinan`), yang diambil secara dinamis menggunakan Server Component.

    * **Fitur A: Import Data Ubinan (Raw)**
        * **UI & Logika**: Menggunakan komponen uploader khusus (`UploaderClientComponent`) untuk mengunggah satu file **CSV**.
        * **Backend (Server Action `uploadUbinanRawAction`)**:
            * Melakukan validasi, parsing, dan konversi tipe data dari file CSV.
            * Menggunakan logika **"Hapus dan Ganti"**: Menghapus data yang ada di tabel `ubinan_raw` berdasarkan kombinasi unik dari `tahun`, `subround`, dan `kab` sebelum mengimpor data baru.
            * Seluruh proses `DELETE` dan `INSERT` dibungkus dalam satu transaksi atomik melalui fungsi RPC PostgreSQL `process_ubinan_raw_upload`.
            * Setelah impor berhasil, secara otomatis memanggil fungsi RPC untuk me-refresh `materialized view` `ubinan_anomali` dan `ubinan_dashboard` secara berurutan.

    * **Fitur B: Import Master Sampel Ubinan (Tambahan Baru)**
        * **UI & Logika**: Menggunakan komponen uploader kedua (`MasterSampleUploader`) yang dirancang untuk mengunggah **satu atau beberapa file Excel (.xlsx, .xls)** sekaligus. Tampilannya diseragamkan dengan form upload data raw untuk konsistensi.
        * **Backend (Server Action `uploadMasterSampleAction`)**:
            * Menggunakan library **`xlsx` (SheetJS)** untuk mem-parsing file Excel di sisi server.
            * **Konversi Data**: Secara otomatis mengonversi nama bulan dari format teks (misal: "Agustus") menjadi format angka ("8") sesuai kebutuhan tabel target.
            * Menggunakan logika **UPSERT** (Update jika ada, Insert jika baru) ke tabel `master_sampel_ubinan`.
            * Keunikan data ditentukan oleh kombinasi 5 kolom: `tahun`, `subround`, `bulan`, `idsegmen`, dan `subsegmen`.
            * Setelah `upsert` data master sampel berhasil, secara otomatis memanggil fungsi RPC untuk me-refresh `materialized view` `ubinan_dashboard` untuk memastikan data tetap sinkron.
        * **Persiapan Database untuk Master Sampel**:
            * Penambahan kolom audit (`uploaded_at`, `uploaded_by_username`) ke tabel `master_sampel_ubinan`.
            * Pembuatan `UNIQUE INDEX` pada 5 kolom kunci untuk mengoptimalkan performa `UPSERT`.

    * **Peningkatan Lainnya**:
        * **Konfigurasi Batas Ukuran File**: Batas ukuran body untuk Server Action telah dinaikkan menjadi **25MB** melalui `next.config.js` untuk mengakomodasi file impor yang besar.
        * **Penanganan Error**: Validasi dan penanganan error di sisi Server Action ditingkatkan untuk memberikan umpan balik yang lebih jelas kepada pengguna jika ada data yang tidak valid atau kosong di file sumber.

## 📁 Struktur Folder Proyek
Dashboard Pertanian/
├── .next/                            # Cache Next.js (dihapus saat debugging)
├── node_modules/                     # Dependensi Node.js
├── public/
│   └── images/                       # Gambar statis (misal: login-illustration.svg)
│   └── icon/                         # Icon aplikasi (misal: hope.png)
├── src/
│   ├── app/
│   │   ├── auth/                     # Grup rute otentikasi
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)               # Grup rute untuk halaman setelah login
│   │   │   ├── monitoring/
│   │   │   │   ├── ubinan/
│   │   │   │   │   └── page.tsx      # Halaman Monitoring Ubinan
│   │   │   │   └── ksa/
│   │   │   │       ├── page.tsx      # Halaman Monitoring KSA (Server Component)
│   │   │   │       └── ksa-monitoring-client-page.tsx # Komponen Klien untuk tabel KSA
│   │   │   ├── evaluasi/             # Folder untuk fitur Evaluasi
│   │   │   │   └── ubinan/           # Halaman Evaluasi Ubinan
│   │   │   │       ├── page.tsx      # Server Component Evaluasi Ubinan (Entry Point)
│   │   │   │       ├── evaluasi-ubinan-client.tsx # Client Component Utama Evaluasi Ubinan
│   │   │   │       ├── descriptive-stats-columns.tsx # Definisi Kolom Tabel Statistik Deskriptif
│   │   │   │       ├── penggunaan-benih-dan-pupuk-columns.tsx # Definisi Kolom Tabel Gabungan Benih & Pupuk
│   │   │   │       ├── DetailKabupatenModal.tsx # Komponen Modal Wrapper
│   │   │   │       ├── DetailKabupatenModalContent.tsx # Komponen Konten Modal Detail
│   │   │   │       └── detail-record-columns.tsx # Definisi Kolom Tabel Detail di Modal
│   │   │   ├── pengguna/
│   │   │   │   ├── _action.ts        # Server Actions untuk manajemen pengguna
│   │   │   │   ├── page.tsx
│   │   │   │   └── user-management-client-page.tsx
│   │   │   ├── layout.tsx            # Root Layout untuk grup (dashboard)
│   │   │   └── page.tsx              # Halaman utama Dashboard (setelah login)
│   │   ├── api/                      # Route Handlers (API Routes)
│   │   │   └── users/
│   │   │       └── route.ts          # Contoh API route untuk pengguna (menggantikan routes.ts)
│   │   ├── client-layout-wrapper.tsx # Wrapper untuk layout kondisional (jika masih digunakan)
│   │   ├── favicon.ico
│   │   └── globals.css               # Styling global Tailwind CSS
│   ├── components/
│   │   ├── layout/
│   │   │   ├── main-layout.tsx       # Layout utama dengan Header dan Sidebar (untuk dashboard)
│   │   │   ├── NavMainHope.tsx       # Komponen Sidebar Navigasi Utama
│   │   │   ├── NavUserHope.tsx       # Komponen Navigasi Pengguna (di header)
│   │   │   └── NewSidebar.tsx        # Komponen Sidebar (jika ini implementasi utama)
│   │   ├── ui/                       # Komponen shadcn/ui yang di-generate (lengkap)
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── dialog.tsx            # Komponen Dialog (digunakan untuk modal)
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx        # Komponen Pagination (digunakan di modal)
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx            # Komponen Switch (digunakan untuk unit)
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── tooltip.tsx
│   │   └── ... (komponen umum lainnya jika ada)
│   ├── context/
│   │   ├── YearContext.tsx           # Context untuk filter Tahun global
│   │   ├── AuthContext.tsx           # Context untuk Otentikasi (jika digunakan)
│   │   └── UbinanEvaluasiFilterContext.tsx # Context untuk filter halaman Evaluasi Ubinan
│   ├── hooks/
│   │   ├── usePadiMonitoringData.ts
│   │   ├── usePalawijaMonitoringData.ts
│   │   ├── useKsaMonitoringData.ts
│   │   ├── useUbinanDescriptiveStatsData.ts # Hook untuk data Statistik Deskriptif Ubinan
│   │   └── usePenggunaanBenihDanPupukData.ts # Hook untuk data Penggunaan Benih & Pupuk Ubinan
│   ├── lib/
│   │   ├── sidebar-data.ts         # Data untuk item sidebar
│   │   ├── supabase-server.ts      # Helper Supabase untuk Server Components/Actions
│   │   ├── supabase.ts             # Konfigurasi Supabase client (createClientComponentSupabaseClient)
│   │   ├── utils.ts                # Utility functions (cn, getNamaKabupaten, dll.)
│   │   └── database.types.ts       # Tipe database yang di-generate dari Supabase
│   ├── middleware.ts                 # Middleware Next.js (misal: untuk otentikasi)
├── .env.local                        # Variabel lingkungan
├── next.config.js                    # Konfigurasi Next.js
├── package.json                      # Daftar dependensi & script
├── tsconfig.json                     # Konfigurasi TypeScript
└── package-lock.json                 # File lock dependensi

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