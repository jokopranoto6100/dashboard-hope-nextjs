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
    * **Nama Halaman & Judul Kartu:** Halaman didedikasikan untuk "Monitoring KSA Padi".
    * **Data Fetching Modular:** Menggunakan *custom hook* baru `useKsaMonitoringData.ts` untuk pengambilan dan pemrosesan data dari tabel `ksa_amatan` di Supabase. Mengimplementasikan logika paginasi untuk mengambil semua record.
    * **Filtering Data:**
        * Terintegrasi dengan filter `YearContext` global.
        * Filter Bulan lokal menggunakan komponen `Select` (`shadcn/ui`), diposisikan di kanan atas kartu tabel.
        * **Logika Default Bulan Cerdas:** Filter bulan secara otomatis memprioritaskan bulan berjalan. Jika data bulan berjalan kosong, hook secara internal akan mengambil dan menampilkan data bulan sebelumnya untuk pengalaman pengguna yang lebih baik tanpa "glitch" tabel kosong.
    * **Tampilan Tabel Interaktif (TanStack Table & shadcn/ui):**
        * Menampilkan data KSA dalam tabel yang responsif dan dapat di-*scroll* (menggunakan `ScrollArea`).
        * **Kolom Utama:** Kabupaten/Kota (rata kiri), Target, Realisasi, Persentase (%), Inkonsisten, dan Kode 12 (rata tengah).
        * **Pengurutan Kolom (Sorting):**
            * Dinonaktifkan untuk kolom "Kabupaten/Kota", "Target", dan "Realisasi".
            * Diaktifkan untuk kolom "Persentase (%)", "Inkonsisten", dan "Kode 12".
        * **Pengelompokan & Pengurutan Data:** Data dikelompokkan berdasarkan `kabupaten` dan diurutkan berdasarkan `kode_kab`.
        * **Perhitungan Kolom Spesifik:**
            * `Target`: Dihitung dari jumlah baris yang memiliki isian pada kolom `subsegmen`.
            * `Realisasi`: Dihitung dari jumlah baris yang memiliki isian pada kolom `n`.
            * `Persentase (%)`: Dihitung sebagai `(Realisasi / Target) * 100` dan divisualisasikan menggunakan komponen `Badge` (`shadcn/ui`) dengan warna dan ikon ceklis (`CheckCircle2`) yang dinamis berdasarkan nilai (menggunakan utilitas `getPercentageBadgeVariant`).
            * `Inkonsisten`: Dihitung dari jumlah baris di mana kolom `evaluasi` bernilai `'inkonsisten'`.
            * `Kode 12`: Dihitung dari penjumlahan baris dengan `n = 12` dan baris yang memiliki isian pada `flag_kode_12`.
        * **Baris Total Keseluruhan:** Menampilkan label "Kalimantan Barat" di kolom pertama dan nilai agregat total untuk semua kolom numerik.
        * **Informasi "Terakhir Diperbarui":** Menampilkan *timestamp* dari kolom `tanggal` maksimum data yang ditampilkan, diletakkan di `CardDescription` untuk konsistensi.
    * **Layout & Styling:** Mengikuti konsistensi desain dengan halaman Monitoring Ubinan, termasuk struktur `Card`, `CardHeader`, `CardTitle`, `CardDescription`, dan `CardContent`.


## 📁 Struktur Folder Proyek
Dashboard Pertanian/
├── .next/                         # Cache Next.js (dihapus saat debugging)
├── node_modules/                  # Dependensi Node.js
├── public/
│   └── images/                    # Gambar statis (misal: login-illustration.svg)
│   └── icon/                      # Icon aplikasi (misal: hope.png)
├── src/
│   ├── app/
│   │   ├── auth/                # Grup rute otentikasi (jika menggunakan grouped layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)
│   │   │   ├── monitoring/
│   │   │   │   └── ubinan/
│   │   │   │       └── page.tsx       # Halaman Monitoring Ubinan
│   │   │   │   ├── ksa/
│   │   │   │   │   ├── page.tsx                       # Halaman Monitoring KSA (Server Component)
│   │   │   │   │   └── ksa-monitoring-client-page.tsx # Komponen Klien untuk tabel KSA
│   │   │   ├── pengguna/
│   │   │   │   └── _action.ts
│   │   │   │   ├── page.tsx
│   │   │   │   ├── user-management-client-page.tsx
│   │   │   ├── layout.tsx             # Root Layout aplikasi
│   │   │   └── page.tsx               # Halaman utama Dashboard
│   │   ├── api
│   │   │   └── users/
│   │   │       └── routes.ts
│   │   ├── ... (rute aplikasi utama lainnya)
│   │   ├── client-layout-wrapper.tsx # Wrapper untuk layout kondisional
│   │   ├── favicon.ico
│   │   ├── globals.css            # Styling global Tailwind CSS
│   ├── components/
│   │   ├── layout/
│   │   │   ├── main-layout.tsx    # Layout utama dengan Header dan Sidebar
│   │   │   └── NavMainHope.tsx        # Komponen Sidebar
│   │   │   └── NavUserHope.tsx        # Komponen Sidebar
│   │   │   └── NewSidebar.tsx        # Komponen Sidebar
│   │   ├── ui/                    # Komponen shadcn/ui yang di-generate
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── tooltip.tsx
│   │   └── ... (komponen umum lainnya)
│   ├── context/
│   │   ├── YearContext.tsx             # Context untuk filter tahun global
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── usePadiMonitoringData.ts     # Hook untuk fetching & processing data Padi
│   │   └── usePalawijaMonitoringData.ts # Hook untuk fetching & processing data Palawija
│   │   └── useKsaMonitoringData.ts    # Hook untuk fetching & processing data KSA
│   ├── lib/
│   │   ├── sidebar-data.ts 
│   │   ├── supabase-server.ts 
│   │   ├── supabase.ts              # Konfigurasi Supabase client
│   │   ├── utils.ts                 # Utility functions (misal: cn, getPercentageBadgeVariant)
│   ├── middleware.ts                # Middleware Next.js untuk otentikasi
├── .env.local                       # Variabel lingkungan
├── next.config.js                   # Konfigurasi Next.js
├── package.json                     # Daftar dependensi & script
├── tsconfig.json                    # Konfigurasi TypeScript
└── package-lock.json                # File lock dependensi

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

/: Dashboard Utama
/auth/login: Halaman Login
/auth/register: Halaman Registrasi
/monitoring/ubinan: Monitoring Ubinan Padi & Palawija
/monitoring/ksa: Monitoring KSA Padi
/pengguna: Halaman Manajemen Pengguna (baru, hanya untuk super_admin)
/api/users: Contoh endpoint API untuk pengguna (status tidak berubah).

---
🚧 TODO & Isu yang Perlu Diperhatikan
Error cookies() di Server Components/Actions:
Masih muncul pesan Error: Route "/pengguna" used cookies().get(...). cookies() should be awaited before using its value. di log server. Meskipun fungsionalitas utama berjalan, ini perlu diinvestigasi lebih lanjut untuk memastikan stabilitas dan praktik terbaik Next.js. Mungkin terkait versi Next.js atau @supabase/ssr.
Fitur "Edit Pengguna":
UI Dialog dan form untuk edit pengguna sudah ada di UserManagementClientPage.tsx.
Server Action editUserAction sudah ada kerangkanya di _actions.ts. Perlu pengujian menyeluruh untuk memastikan semua field (email, password opsional, username kustom, role kustom, dan user_metadata) terupdate dengan benar.
Fitur "Lihat Detail Pengguna":
Masih TODO. Bisa berupa dialog read-only yang menampilkan semua informasi relevan pengguna.
Penyempurnaan UI/UX Manajemen Pengguna:
Pesan error/sukses yang lebih spesifik dari Server Actions.
Mungkin perlu validasi yang lebih kompleks untuk form.
RLS (Row Level Security):
Sempat ada error "Gagal mengambil informasi peran user. Pastikan RLS diizinkan" saat login ulang setelah peran diubah. Ini perlu dipantau. Jika muncul lagi, periksa kebijakan RLS di tabel auth.users dan public.users. Idealnya, pengguna harus bisa membaca data mereka sendiri yang relevan untuk sesi.
Konsistensi username: Pastikan username di public.users selalu sinkron dengan user_metadata.username jika keduanya digunakan. Server Actions saat ini sudah mencoba mengupdate keduanya.

Jika ada kendala atau permintaan fitur baru, silakan hubungi pengelola proyek.