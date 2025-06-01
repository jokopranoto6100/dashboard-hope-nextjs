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
    * **Middleware untuk Proteksi Rute:** Menggunakan Next.js Middleware (`middleware.ts`) untuk melindungi rute yang memerlukan otentikasi dan mengarahkan pengguna yang belum *login* ke halaman login.
    * **Visibilitas Menu Dinamis:** Menu sidebar disesuaikan berdasarkan peran pengguna (`super_admin`, `viewer`) yang diambil dari `user_metadata` Supabase Auth.

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
        * **Visualisasi Persentase:** Kolom `Persentase (%)` menampilkan *badge* berwarna sesuai rentang.
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
        * **Visualisasi Persentase:** Kolom `Persentase (%)` menampilkan *badge* berwarna.
        * **Baris Total:** Menampilkan agregasi total untuk semua kolom numerik.
        * **Informasi "Terakhir Diperbarui"**: Menampilkan timestamp data terakhir diperbarui dari kolom `uploaded_at`.

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
│   │   │   ├── layout.tsx             # Root Layout aplikasi
│   │   │   └── page.tsx               # Halaman utama Dashboard
│   │   ├── ... (rute aplikasi utama lainnya)
│   │   ├── client-layout-wrapper.tsx # Wrapper untuk layout kondisional
│   │   ├── favicon.ico
│   │   ├── globals.css            # Styling global Tailwind CSS
│   ├── components/
│   │   ├── layout/
│   │   │   ├── main-layout.tsx    # Layout utama dengan Header dan Sidebar
│   │   │   └── sidebar.tsx        # Komponen Sidebar
│   │   ├── ui/                    # Komponen shadcn/ui yang di-generate
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── sonner.tsx
│   │   │   └── ... (komponen shadcn/ui lainnya)
│   │   └── ... (komponen umum lainnya)
│   ├── context/
│   │   └── YearContext.tsx        # Context untuk filter tahun global
│   ├── hooks/
│   │   ├── usePadiMonitoringData.ts     # Hook untuk fetching & processing data Padi
│   │   └── usePalawijaMonitoringData.ts # Hook untuk fetching data Palawija
│   ├── lib/
│   │   ├── supabase.ts              # Konfigurasi Supabase client
│   │   ├── utils.ts                 # Utility functions (misal: cn dari shadcn/ui)
│   │   └── database.types.ts        # Tipe database dari Supabase CLI (opsional)
├── .env.local                       # Variabel lingkungan
├── middleware.ts                    # Middleware Next.js untuk otentikasi
├── next.config.js                   # Konfigurasi Next.js
├── package.json                     # Daftar dependensi & script
├── tsconfig.json                    # Konfigurasi TypeScript
└── package-lock.json                # File lock dependensi

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
        "paths": {
          "@/*": ["./src/*"]
        }
      }
      // ... bagian lain
    }
    ```

5.  **Instal Komponen shadcn/ui yang Diperlukan:**
    Jika ada komponen yang belum terinstal, jalankan:
    ```bash
    npx shadcn-ui@latest add table tabs select scroll-area button card checkbox collapsible dropdown-menu input label sonner # dan komponen lain yang digunakan
    ```

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
    Aplikasi akan berjalan di `http://localhost:3000`. Anda akan diarahkan ke halaman login.

## 🌐 Daftar Route Penting

* `/`: Dashboard Utama (membutuhkan Login)
* `/auth/login`: Halaman Login
* `/auth/register`: Halaman Registrasi
* `/auth/logout`: Logout Pengguna
* `/monitoring/ubinan`: Monitoring Ubinan Padi & Palawija (membutuhkan Login)
* `/update-data/...`: Rute-rute untuk update data (membutuhkan peran `super_admin`)

---

Jika ada kendala atau permintaan fitur baru, silakan hubungi pengelola proyek.