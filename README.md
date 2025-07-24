# 🌾 Dashboard HOPE - Sistem Monitoring Statistik Produksi Pertanian

Dashboard HOPE adalah aplikasi web modern **Progressive Web App (PWA)** yang dibangun dengan **Next.js 15** dan **Supabase** untuk memantau, mengevaluasi, dan menyajikan statistik produksi pertanian di Provinsi Kalimantan Barat. Sistem ini dirancang khusus untuk internal BPS Kalbar dengan arsitektur modern, performa tinggi, type safety penuh, dan dapat diinstall sebagai aplikasi native di Android, iOS, dan Desktop.

## 🚀 **Tech Stack & Arsitektur Modern**

### **Core Framework**
* **Frontend:** Next.js 15.3.2 (App Router, Server Components, Server Actions)
* **Runtime:** React 19 dengan TypeScript 5
* **Styling:** Tailwind CSS dengan shadcn/ui components
* **Database:** Supabase PostgreSQL dengan RPC functions
* **Authentication:** Supabase Auth dengan role-based access control
* **PWA:** next-pwa v5.6.0 dengan service worker optimization

### **Key Libraries**
* **UI Framework:** shadcn/ui dengan Radix UI primitives
* **Table Management:** TanStack Table untuk data interaktif
* **Data Visualization:** Recharts dan ECharts untuk charts
* **Form Handling:** React Hook Form dengan Zod validation
* **State Management:** React Context + SWR untuk caching
* **File Processing:** xlsx, papaparse untuk Excel/CSV
* **Animations:** Framer Motion untuk micro-interactions
* **Real-time:** Supabase Real-time untuk live data updates
* **Icons:** Lucide React dengan custom Atom icon design

## ✨ **Fitur Utama yang Telah Diimplementasikan**

### 🏠 **Dashboard Homepage (`/`)**
* **Executive Dashboard:** KPI cards dengan real-time data monitoring
* **Performance Sorting:** Dynamic card arrangement berdasarkan completion percentage
* **Responsive Design:** Mobile-optimized layout dengan adaptive spacing
* **Status Indicators:** Color-coded badges dengan progress tracking
* **Integration Links:** Seamless navigation ke detail monitoring pages

### 🔐 **Authentication & User Management (`/auth`, `/pengguna`)**
* **Supabase Auth Integration:** Secure authentication dengan session management
* **Role-Based Access Control:** Multi-role system (super_admin, admin, user)
* **User Registration:** Smart registration dengan satker selection
* **Profile Management:** Comprehensive user profile editing
* **Admin User Management:** CRUD operations untuk user administration

### 📊 **Monitoring System**

#### **Monitoring Ubinan (`/monitoring/ubinan`)**
* **Dual-Table Interface:** Separate monitoring untuk Padi dan Palawija
* **Responsive Tables:** Mobile-optimized dengan show/hide column controls
* **Expandable Columns:** Detail columns untuk Fase Generatif dan Realisasi
* **Real-time Data:** Live updates dengan SWR caching
* **Aggregate Totals:** Province-level summaries dengan automatic calculations

#### **Monitoring KSA (`/monitoring/ksa`)**
* **Two-Level Monitoring:** District overview dengan drill-down ke officer level
* **Interactive Tables:** Clickable rows untuk detailed analysis
* **Document Generation:** Automated Berita Acara (BA) generation untuk Kode 12
* **Modal Interactions:** Contextual modals untuk data exploration
* **Performance Analytics:** Officer performance tracking dan evaluation

#### **Monitoring SKGB (`/monitoring/skgb`)**
* **Pengeringan & Penggilingan:** Separate tabs untuk different SKGB processes
* **Sample Management:** Advanced modal system untuk kelola sampel
* **Optimized Performance:** Database optimization dengan specialized indexes
* **Real-time Updates:** Live data synchronization dengan fallback mechanisms
* **Export Capabilities:** Data export dengan custom formatting

#### **Monitoring SIMTP (`/monitoring/simtp`)**
* **Progress Tracking:** Visual progress indicators untuk reporting status
* **Multi-Category Monitoring:** Separate tracking untuk different categories
* **Document Upload:** File upload portal dengan history tracking
* **Real-time Synchronization:** Live data updates dari SIMTP system

### 🔍 **Evaluation & Analytics**

#### **Evaluasi Ubinan (`/evaluasi/ubinan`)**
* **Statistical Analysis:** Advanced descriptive statistics dengan visualizations
* **Dual Analysis Modes:** Detail analysis dan time comparison
* **Interactive Charts:** Box plots dan comparison charts
* **Anomaly Detection:** Automated anomaly identification dan export
* **Modal Drill-Down:** Detailed data exploration dengan pagination

#### **Evaluasi KSA (`/evaluasi/ksa`)**
* **RPC-Based Analytics:** PostgreSQL functions untuk heavy data processing
* **Anomaly Validator:** Intelligent anomaly detection dengan contextual information
* **Interactive Visualizations:** Stacked area charts dan trend analysis
* **Calendar Displays:** Monthly harvest calendar visualizations
* **Export Integration:** Filtered data export dengan Excel formatting

### 📈 **Statistical Analysis (`/produksi-statistik`)**
* **Comprehensive Analytics:** Advanced statistical analysis untuk ATAP data
* **Dynamic Filtering:** Multi-dimensional filtering dengan real-time updates
* **Interactive Charts:** Drill-down capabilities dengan Recharts integration
* **Comparison Analysis:** Year-over-year comparison dengan advanced visualizations
* **Export Features:** Chart export to PNG dan data export to Excel
* **Annotation System:** Collaborative discussion system untuk data points

### 🔄 **Data Management (`/update-data`)**

#### **Update Data Ubinan (`/update-data/ubinan`)**
* **Smart Column Mapping:** Intelligent CSV header matching dengan manual override
* **Excel Processing:** Multi-sheet Excel file processing
* **Validation Pipeline:** Multi-step validation dengan comprehensive error reporting
* **Master Sample Management:** Separate interface untuk master sample updates
* **History Tracking:** Detailed import history dengan user tracking

#### **Update Data KSA (`/update-data/ksa`)**
* **Multi-File Processing:** Batch Excel file upload dengan progress tracking
* **Smart Preview:** Client-side data preview dengan metadata extraction
* **Data Transformation:** Complex wide-to-long format transformation
* **Conflict Resolution:** Intelligent duplicate data handling

#### **Update Data ATAP (`/update-data/atap`)**
* **Scalable Architecture:** Multi-table design dengan unified processing
* **Generic Uploader:** Reusable upload component untuk multiple data types
* **Automatic Aggregation:** Monthly-to-yearly data aggregation via RPC
* **Unit Standardization:** Intelligent unit parsing dan conversion

### 🗓️ **Schedule Management (`/jadwal`)**
* **Interactive Calendar:** Desktop dan mobile-optimized calendar views
* **Event Management:** Dynamic event creation, editing, dan deletion
* **Admin Controls:** Super admin privileges untuk kegiatan management
* **Responsive Design:** Touch-friendly navigation untuk mobile devices
* **Real-time Updates:** Live calendar updates dengan optimistic UI

### 🔗 **Content Portal (`/bahan-produksi`)**
* **Interactive Carousel:** 3D flip animations dengan smooth transitions
* **Mobile-Optimized Swipe:** Perfect snap behavior untuk mobile carousel
* **Content Management:** Admin CMS untuk sektor dan link management
* **Drag & Drop Reordering:** Intuitive content reordering dengan @dnd-kit
* **Modal-Based Editing:** Advanced dialog system untuk content management

## 📱 **Progressive Web App (PWA) Features**

### **🚀 Native App Experience**
* **Installable:** Dapat diinstall sebagai aplikasi native di Android, iOS, dan Desktop
* **Standalone Mode:** Full app experience tanpa browser UI
* **Custom Icons:** Simplified Atom icon design dengan 9 responsive sizes (72px-512px)
* **Splash Screen:** Optimized startup tanpa delay splash yang mengganggu
* **Offline Support:** Service worker untuk basic offline functionality

### **⚡ Performance Optimization**
* **Fast Startup:** Network-first caching strategy dengan timeout 1-2 detik
* **Minimal Cache:** Reduced cache entries untuk startup yang lebih cepat
* **Fresh Data:** API calls selalu network-only untuk data terbaru
* **Real-time Sync:** Live data updates dengan Supabase real-time subscriptions

### **📲 Cross-Platform Compatibility**
* **Android:** Perfect installation experience via Chrome browser
* **iOS Safari:** Add to Home Screen dengan native app behavior
* **Desktop:** Installable via Chrome, Edge, dan browsers modern lainnya
* **Responsive Design:** Seamless experience across all screen sizes

### **🔧 PWA Technical Implementation**
* **Manifest:** Comprehensive PWA manifest dengan metadata lengkap
* **Service Worker:** next-pwa dengan optimized caching strategies
* **Icon Generation:** Automated icon generation dari SVG source
* **Viewport Optimization:** Next.js 15 viewport export pattern
* **Background Sync:** Real-time data synchronization support

## 🏗️ **Arsitektur & Struktur Project**

### **Directory Structure**
```
src/
├── app/                           # Next.js App Router
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── layout.tsx            # Dashboard layout dengan sidebar
│   │   ├── page.tsx              # Homepage dashboard
│   │   ├── monitoring/           # Monitoring modules
│   │   ├── evaluasi/             # Analytics modules  
│   │   ├── produksi-statistik/   # Statistical analysis
│   │   ├── update-data/          # Data management
│   │   ├── jadwal/               # Calendar system
│   │   └── pengguna/             # User management
│   └── auth/                     # Authentication pages
├── components/                    # Reusable UI components
│   ├── layout/                   # Layout components
│   └── ui/                       # shadcn/ui components
├── context/                      # React Context providers
├── hooks/                        # Custom React hooks
└── lib/                          # Utilities dan configurations
```

### **Key Architectural Features**
* **Server Components:** Optimal data fetching dengan React Server Components
* **Server Actions:** Type-safe server operations tanpa API routes
* **Middleware Protection:** Route-level authentication
* **Type Safety:** Full TypeScript dengan auto-generated database types
* **Responsive Design:** Mobile-first approach dengan adaptive layouts
* **Performance Optimization:** SWR caching, memoization, lazy loading

## 🛠️ **Installation & Development**

### **Prerequisites**
* Node.js 18+ 
* npm/yarn
* Supabase account
* Git

### **Quick Start**
```bash
# Clone repository
git clone <repository-url>
cd dashboard-hope-nextjs

# Install dependencies
npm install

# Environment setup
cp .env.example .env.local
# Edit .env.local dengan Supabase credentials

# Generate database types
npm run gen:types

# Start development server
npm run dev
```

### **Build Commands**
```bash
npm run build         # Production build dengan PWA optimization
npm run start         # Start production server
npm run lint          # Code linting
npm run gen:types     # Generate Supabase types

# PWA Development Commands
node scripts/generate-icons.js  # Generate PWA icons dari SVG
npm run build && npm run start  # Test PWA functionality
```

### **📱 PWA Installation Testing**
```bash
# 1. Build dan start production server
npm run build && npm run start

# 2. Buka browser dan navigate ke http://localhost:3000
# 3. Test installation:
#    - Chrome: Klik install prompt atau menu > Install Dashboard HOPE
#    - Mobile: Add to Home Screen dari browser menu
#    - Desktop: Install app dari address bar icon

# 4. Verify PWA features:
#    - App launches in standalone mode
#    - Icons display correctly
#    - Offline functionality works
#    - Real-time updates function properly
```

## 🔧 **Environment Configuration**

Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 **Performance Features**

### **Database Optimization**
* **Specialized Indexes:** Covering, partial, dan trigram GIN indexes
* **RPC Functions:** Complex queries di database level untuk performance
* **Materialized Views:** Pre-computed aggregations untuk fast data access
* **Optimized Queries:** Fallback mechanisms untuk graceful degradation

### **Frontend Optimization**
* **Code Splitting:** Automatic bundle splitting
* **Lazy Loading:** Component dan data lazy loading
* **Memoization:** Extensive React optimization
* **Debounced Inputs:** Optimized search dan filtering
* **SWR Caching:** Intelligent data caching dengan revalidation

## 🚀 **Recent Major Updates**

### **🔥 Progressive Web App (PWA) Implementation**
* **Full PWA Support:** Installable sebagai native app di Android, iOS, dan Desktop
* **Custom Icon Design:** Simplified Atom symbol dengan 9 responsive sizes
* **Fast Startup:** Optimized service worker dengan minimal caching strategy
* **Splash Screen Removal:** Instant app launch tanpa delay loading
* **Real-time Sync:** Live data updates dengan Supabase real-time subscriptions

### **📱 Mobile UX Enhancements**
* **Carousel Snap Behavior:** Perfect snap per card di mobile view (bahan-produksi)
* **Touch Optimization:** Improved touch targets dan gesture handling
* **Responsive Tables:** Advanced show/hide column controls untuk mobile
* **Navigation:** Seamless mobile navigation dengan adaptive layouts

### **⚡ Performance Optimization**
* **SKGB Optimization:** 80-90% performance improvement untuk Kelola Sampel modal
* **Database Indexes:** Specialized indexes dengan pg_trgm extension
* **Service Worker:** Network-first strategy dengan 1-2 detik timeout
* **Real-time Updates:** Optimized Supabase real-time dengan fallback mechanisms

### **🔧 Technical Improvements**
* **Next.js 15 Compatibility:** Updated viewport export pattern untuk metadata
* **TypeScript Fixes:** Resolved compilation errors dengan eslint optimizations
* **Icon System:** SVG-based icon generation dengan Sharp processing
* **Mobile Responsiveness:** Comprehensive mobile optimization untuk all pages

## 📈 **Future Development**

### **🔮 Planned Improvements**
* **Enhanced PWA Features:** Background sync, push notifications, offline data editing
* **Advanced Analytics:** Machine learning insights untuk predictive analytics
* **Real-time Collaboration:** Multi-user real-time editing dan commenting system
* **Mobile Native Features:** Camera integration, GPS location, device sensors
* **Advanced Export:** Scheduled reports, custom templates, automated delivery

### **🛠️ Technical Roadmap**
* **Edge Computing:** Vercel Edge Functions untuk global performance
* **Advanced Caching:** Redis integration untuk complex caching strategies
* **Micro-frontend:** Module federation untuk scalable architecture
* **Performance Monitoring:** Advanced analytics dengan Web Vitals tracking
* **Security Enhancements:** Advanced authentication, audit logging, data encryption

---

## 📚 **Documentation & Guides**

Proyek ini dilengkapi dengan dokumentasi lengkap untuk pengembangan dan deployment:

* **`PWA_GUIDE.md`** - Comprehensive PWA implementation guide
* **`REALTIME_GUIDE.md`** - Real-time data integration dengan Supabase
* **`DEPLOYMENT_GUIDE.md`** - Production deployment instructions
* **`SPLASH_REMOVAL_GUIDE.md`** - PWA splash screen optimization guide  
* **`ICON_REVISION.md`** - Icon design evolution dan technical specs
* **`UI_UX_IMPROVEMENTS.md`** - Mobile optimization dan user experience enhancements
* **`UPDATE_MOBILE_OPTIMIZATION.md`** - Mobile responsiveness implementation details

**🔧 Maintenance & Support:**  
Dashboard ini secara rutin di-maintain untuk memastikan keamanan, performa, dan reliability yang optimal.

**📞 Contact:**  
Untuk pertanyaan teknis atau feature requests, silakan hubungi tim development BPS Kalbar.


## 🚀 **Teknologi & Stack Terbaru**

### **Core Framework & Runtime**
* **Frontend Framework:** Next.js 15.3.2 (App Router, Server Components, Server Actions)
* **Runtime:** React 19.0.0 dengan TypeScript 5.8.3
* **Styling:** Tailwind CSS v4 dengan tw-animate-css
* **UI Components:** shadcn/ui dengan Radix UI primitives

### **Database & Backend**
* **Backend-as-a-service:** Supabase (PostgreSQL Database, Auth, Real-time API)
* **ORM/Client:** @supabase/ssr v0.6.1 dan @supabase/supabase-js v2.49.8
* **Type Safety:** Auto-generated database types dari Supabase CLI

### **Data Management & UI**
* **Table Library:** TanStack Table v8.21.3 (untuk tabel data interaktif)
* **State Management:** React Context + SWR v2.3.3 untuk caching
* **Form Management:** React Hook Form v7.56.4 + Zod v3.25.33 validation
* **Notifications:** Sonner v2.0.3 (toast notifications)

### **Visualization & Interaction**
* **Charts:** Recharts v2.15.3 dan ECharts v5.6.0 untuk visualisasi data
* **Animation:** Framer Motion v12.18.1 untuk micro-interactions
* **Icons:** Lucide React v0.511.0 (1000+ SVG icons)
* **Drag & Drop:** @dnd-kit untuk sortable interfaces

### **File Processing & Export**
* **Excel Processing:** xlsx v0.18.5 (SheetJS untuk import/export Excel)
* **CSV Processing:** papaparse v5.5.3 dan csv-parse v5.6.0
* **Document Generation:** docx v9.5.1 untuk generate Word documents
* **Image Export:** html-to-image v1.11.13 untuk export charts

### **Development & Quality**
* **Linting:** ESLint v9.28.0 dengan TypeScript ESLint v8.33.0
* **Type Checking:** Strict TypeScript dengan path mapping
* **Analytics:** Vercel Analytics untuk monitoring performa
* **Theme Support:** next-themes v0.4.6 untuk dark/light mode

## ✨ **Fitur Utama yang Sudah Diimplementasikan**

Berikut adalah fitur lengkap yang telah diimplementasikan, dikelompokkan berdasarkan menu dan fungsionalitasnya dengan detail teknologi yang digunakan.

### ⚙️ **Arsitektur & Konfigurasi Modern**

* **1. Arsitektur & Setup Proyek Next.js 15:**
    * **App Router Architecture**: Migrasi penuh dari Pages Router ke App Router untuk routing yang lebih modern
    * **Server Components & Actions**: Implementasi Server Components untuk performa optimal dan Server Actions untuk operasi backend
    * **TypeScript Strict Mode**: Type safety penuh dengan strict TypeScript configuration
    * **Supabase Integration**: Seamless integration dengan Supabase untuk database, auth, dan real-time features
    * **Modern Build Configuration**: Optimized Next.js 15 configuration dengan support untuk large file uploads (25MB limit)

* **2. Layout & Navigasi Responsif:**
    * **Dynamic Sidebar**: Sidebar yang dapat di-toggle dengan animasi smooth menggunakan CSS Grid dan Tailwind
    * **Responsive Navigation**: Navigation yang adaptif untuk desktop, tablet, dan mobile devices
    * **Route Protection**: Middleware-based route protection dengan automatic redirects
    * **Theme Support**: Dark/light mode dengan next-themes integration

* **3. Global State Management:**
    * **Year Context**: Global year filtering dengan React Context untuk konsistensi data di seluruh aplikasi
    * **Auth Context**: Centralized authentication state dengan user profile management
    * **Filter Contexts**: Specialized contexts untuk complex filtering (UbinanEvaluasiFilter, KsaEvaluasiFilter)
    * **SWR Caching**: Intelligent data caching dan revalidation dengan SWR

### 🔑 **Sistem Otentikasi & Manajemen Pengguna** (`/auth`, `/pengguna`)

* **4. Advanced Authentication System:**
    * **Supabase Auth Integration**: Full integration dengan Supabase Auth untuk secure authentication
    * **Role-Based Access Control**: Multi-role system (super_admin, admin, user) dengan dynamic UI adaptation
    * **Single Source of Truth**: Unified user profile management dengan `public.users` table
    * **Middleware Protection**: Route-level protection dengan Next.js middleware
    * **Session Management**: Automatic session refresh dan logout handling

* **5. User Management Interface:**
    * **Interactive User Table**: TanStack Table dengan sorting, filtering, dan pagination
    * **Modal-Based CRUD**: Modern dialog-based create, edit, dan delete operations
    * **Optimistic Updates**: Instant UI updates dengan optimistic state management
    * **Batch Operations**: Support untuk bulk user operations
    * **Advanced Registration**: Smart registration dengan satker selection via Combobox

### 🏠 **Dashboard Utama - Analytic Overview** (`/`)

* **6. Executive Dashboard dengan Real-time KPIs:**
    * **Grid-Based Layout**: Responsive 4-card layout dengan adaptive grid system
    * **Real-time Data**: Live data updates menggunakan SWR dengan automatic revalidation
    * **Interactive Cards**: Hover effects dan drill-down capabilities
    * **Progress Visualizations**: Advanced progress bars dan percentage indicators
    * **Status Badges**: Color-coded status indicators dengan dynamic theming
    * **Navigation Integration**: Seamless navigation ke detail pages

### 🔗 **Portal Bahan Produksi** (`/bahan-produksi`)

* **7. Interactive Content Portal:**
    * **3D Flip Animation**: Smooth card flip animations menggunakan Framer Motion
    * **Carousel Navigation**: Horizontal scrolling carousel dengan touch support
    * **Dynamic Content Loading**: Real-time content updates dengan skeleton loading
    * **Admin Content Management**: Comprehensive CMS untuk sektor dan link management
    * **Drag & Drop Reordering**: @dnd-kit integration untuk intuitive content reordering
    * **Modal-Based Editing**: Advanced dialog system untuk content management

### 📈 **Menu Monitoring - Real-time Dashboards**

#### **Monitoring Ubinan** (`/monitoring/ubinan`)
* **8. Dual-Table Monitoring System:**
    * **Padi Monitoring**: Real-time monitoring dengan expandable generative phase columns
    * **Palawija Monitoring**: Validation status tracking dengan clean/warning/error indicators
    * **Responsive Design**: Mobile-optimized tables dengan show/hide column controls
    * **Aggregate Footer**: Province-level totals dengan automatic calculations
    * **Filter Integration**: Global subround filtering dengan state persistence

#### **Monitoring KSA** (`/monitoring/ksa`)
* **9. Multi-Level KSA Dashboard:**
    * **District-Level Overview**: Interactive district table dengan drill-down capabilities
    * **Officer-Level Detail**: Detailed view per officer dengan performance metrics
    * **Berita Acara Generation**: Automated Word document generation untuk Kode 12 cases
    * **Modal Interactions**: Contextual modals untuk detailed data viewing
    * **RPC Integration**: PostgreSQL stored procedures untuk efficient data processing

#### **Monitoring SIMTP** (`/monitoring/simtp`)
* **10. SIMTP Reporting Dashboard:**
    * **Progress Tracking**: Visual progress indicators untuk monthly/yearly reports
    * **Multi-Category Monitoring**: Separate tracking untuk Lahan, Alsin, dan Benih
    * **Responsive Charts**: Mobile-friendly chart visualizations
    * **Real-time Updates**: Live data synchronization dengan Supabase

### 🔍 **Menu Evaluasi - Advanced Analytics**

#### **Evaluasi Ubinan** (`/evaluasi/ubinan`)
* **11. Statistical Analysis Dashboard:**
    * **Dual Analysis Modes**: Detail analysis dan time comparison modes
    * **Advanced Visualizations**: ECharts box plots dan Recharts comparison charts
    * **Interactive Filtering**: Multi-dimensional filtering dengan subround dan komoditas
    * **Modal Drill-Down**: Detailed data exploration dengan server-side pagination
    * **Export Capabilities**: Excel export untuk anomaly data dengan custom formatting
    * **Statistical Computing**: Complex descriptive statistics calculations

#### **Evaluasi KSA** (`/evaluasi/ksa`)
* **12. KSA Analytics & Anomaly Detection:**
    * **RPC-Based Architecture**: PostgreSQL functions untuk heavy data processing
    * **Interactive Visualizations**: Stacked area charts dan line charts untuk trend analysis
    * **Anomaly Detection System**: Automated anomaly detection dengan intelligent algorithms
    * **Tabbed Interface**: Organized content dengan main visualization dan anomaly validator tabs
    * **Calendar Visualizations**: Monthly harvest calendar displays
    * **Export Integration**: Filtered data export dengan Excel formatting

### 🕷️ **Data Crawling & Automation** (`/crawling-fasih`)

* **13. FASIH Data Crawler - NEW FEATURE:**
    * **Automated Data Extraction**: Intelligent crawler untuk FASIH survey data
    * **Multi-Step Process**: Period selection, region filtering, dan batch processing
    * **Progress Tracking**: Real-time crawling progress dengan status updates
    * **Error Handling**: Robust error handling dengan retry mechanisms
    * **Data Validation**: Automatic data validation dan quality checks
    * **Export Integration**: Direct export ke Excel dengan proper formatting

### 📊 **Analisis Statistik ATAP** (`/produksi-statistik`)

* **14. Comprehensive Statistical Analysis:**
    * **Database View Integration**: Optimized queries menggunakan laporan_atap_lengkap view
    * **Interactive Charts**: Recharts integration dengan drill-down capabilities
    * **Dynamic Filtering**: Multi-dimensional filtering dengan debounced inputs
    * **Comparison Analysis**: Year-over-year comparison dengan advanced visualizations
    * **Export Features**: Chart export ke PNG dan data export ke CSV
    * **Preset Management**: Saved filter configurations untuk quick access

### 🔄 **Menu Update Data - Data Management**

#### **Update Data Ubinan** (`/update-data/ubinan`)
* **15. Advanced Data Import System:**
    * **Tabbed Interface**: Separate tabs untuk raw data dan master sample imports
    * **Smart Column Mapping**: Intelligent CSV header matching dengan manual override options
    * **Excel Processing**: Multi-sheet Excel file processing dengan xlsx library
    * **Validation Pipeline**: Multi-step validation dengan error reporting
    * **Materialized View Refresh**: Automatic view refresh after successful imports
    * **History Tracking**: Import history dengan detailed logging

#### **Update Data KSA** (`/update-data/ksa`)
* **16. KSA Data Management:**
    * **Multi-File Upload**: Batch Excel file processing dengan progress tracking
    * **Smart Preview**: Client-side data preview dengan automatic metadata extraction
    * **Data Transformation**: Complex data transformation dari wide ke long format
    * **RPC Integration**: PostgreSQL functions untuk efficient bulk operations
    * **Conflict Resolution**: Intelligent handling of duplicate data

#### **Update Data ATAP** (`/update-data/atap`)
* **17. ATAP Data Pipeline:**
    * **Scalable Architecture**: Four specialized tables dengan unified view
    * **Dynamic Upload**: Generic uploader untuk multiple data types
    * **Data Unpivoting**: Wide-to-long format transformation
    * **Unit Parsing**: Intelligent unit extraction dan standardization
    * **Automatic Aggregation**: Monthly-to-yearly data aggregation via RPC

### 👤 **User Profile Management** (`/profil`)

* **18. Comprehensive Profile System:**
    * **Tabbed Interface**: Separate tabs untuk profile editing dan password changes
    * **Form Validation**: Zod schema validation dengan real-time error feedback
    * **Security Features**: Current password verification untuk sensitive changes
    * **Responsive Design**: Mobile-optimized forms dengan proper touch targets
    * **State Management**: Optimistic updates dengan error rollback

### 📋 **SIMTP Upload Portal** (`/simtp-upload`)

* **19. Document Upload & Management:**
    * **File Upload Interface**: Drag-and-drop file upload dengan progress tracking
    * **Upload History**: Detailed history tracking dengan timestamp dan user info
    * **File Validation**: Client-side dan server-side file validation
    * **Storage Integration**: Supabase storage integration untuk file management
    * **Access Control**: Role-based access untuk upload permissions

### 🗓️ **Jadwal & Calendar System** (`/jadwal`)

* **20. Interactive Calendar Dashboard:**
    * **Responsive Calendar**: Desktop dan mobile-optimized calendar views
    * **Event Management**: Dynamic event loading dengan real-time updates
    * **Filter Integration**: Multi-dimensional filtering dengan persistent state
    * **Mobile Optimization**: Touch-friendly navigation untuk mobile devices
    * **Integration Hooks**: Seamless integration dengan monitoring systems

### 🧪 **Testing & Development** (`/test`)

* **21. Development Testing Suite:**
    * **Data Integration Testing**: Cross-hook data validation dan consistency checks
    * **Performance Testing**: Component performance monitoring
    * **API Testing**: Server action dan RPC function testing
    * **UI Component Testing**: Interactive component behavior validation

## 🌐 **Routing & Navigation Structure**

### **Public Routes**
* `/auth/login` - Authentication login page
* `/auth/register` - User registration dengan smart satker selection

### **Protected Dashboard Routes**
* `/` - Executive dashboard dengan real-time KPIs
* `/bahan-produksi` - Interactive content portal dengan admin CMS
* `/monitoring/ubinan` - Dual-table ubinan monitoring system
* `/monitoring/ksa` - Multi-level KSA dashboard dengan anomaly detection
* `/monitoring/simtp` - SIMTP progress tracking dashboard
* `/monitoring/kehutanan` - Forestry monitoring dashboard
* `/crawling-fasih` - Automated FASIH data crawler (**NEW**)
* `/evaluasi/ubinan` - Statistical analysis dengan advanced visualizations
* `/evaluasi/ksa` - KSA analytics dengan anomaly validator
* `/produksi-statistik` - Comprehensive ATAP statistical analysis
* `/update-data/ubinan` - Advanced data import dengan smart mapping
* `/update-data/ksa` - KSA data management pipeline
* `/update-data/atap` - ATAP data processing system
* `/simtp-upload` - Document upload portal
* `/profil` - User profile management dengan security features
* `/jadwal` - Interactive calendar system
* `/pengguna` - User management interface (**Admin Only**)
* `/test` - Development testing suite

## 📁 **Arsitektur Folder & Struktur Modern**

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

```
Dashboard-HOPE-NextJS/
├── README.md                           # 📖 Comprehensive project documentation
├── package.json                       # 📦 Dependencies dan scripts terbaru
├── next.config.ts                     # ⚙️ Next.js 15 configuration
├── tailwind.config.ts                 # 🎨 Tailwind CSS v4 configuration
├── tsconfig.json                      # 📘 TypeScript configuration dengan path mapping
├── eslint.config.mjs                  # 🔍 ESLint v9 dengan TypeScript support
├── components.json                    # 🧩 shadcn/ui configuration
├── 
├── public/                            # 🌐 Static assets
│   ├── icon/hope.png                  # 🎯 Application favicon
│   ├── images/                        # 🖼️ UI images dan illustrations
│   │   ├── login-illustration.svg     # 🎨 SVG login illustration
│   │   └── login-illustration.png     # 🖼️ PNG fallback
│   ├── templates/                     # 📄 Excel/CSV templates untuk upload
│   │   ├── template_atap_*.xlsx       # 📊 ATAP data templates
│   │   ├── template_ksa_jagung.xlsx   # 🌽 KSA jagung template
│   │   └── template_ubinan.csv        # 🌾 Ubinan data template
│   └── logo-bps.png                   # 🏛️ Official BPS logo
│
├── src/                               # 💻 Source code directory
│   ├── middleware.ts                  # 🛡️ Route protection middleware
│   │
│   ├── app/                           # 📱 Next.js App Router structure
│   │   ├── layout.tsx                 # 🎯 Root layout dengan providers
│   │   ├── globals.css                # 🎨 Global styles dengan Tailwind
│   │   ├── client-layout-wrapper.tsx  # 🔄 Client-side layout wrapper
│   │   │
│   │   ├── auth/                      # 🔐 Authentication pages
│   │   │   ├── login/page.tsx         # 🚪 Login interface
│   │   │   └── register/              # ✍️ Registration dengan smart forms
│   │   │       ├── page.tsx           # 📝 Registration UI
│   │   │       ├── _actions.ts        # ⚡ Server actions untuk registration
│   │   │       └── schema.ts          # 📋 Zod validation schemas
│   │   │
│   │   ├── (dashboard)/               # 🏠 Protected dashboard routes
│   │   │   ├── layout.tsx             # 📐 Dashboard layout dengan sidebar
│   │   │   ├── page.tsx               # 📊 Executive dashboard homepage
│   │   │   │
│   │   │   ├── _components/           # 🧩 Shared dashboard components
│   │   │   │   └── homepage/          # 🏠 Homepage-specific components
│   │   │   │       ├── *SummaryCard.tsx # 📈 KPI summary cards
│   │   │   │       └── ...
│   │   │   │
│   │   │   ├── bahan-produksi/        # 🔗 Content portal dengan CMS
│   │   │   │   ├── page.tsx           # 🎯 Portal main page
│   │   │   │   ├── bahan-produksi-client.tsx # 🎡 Interactive carousel
│   │   │   │   ├── content-management-dialog.tsx # ⚙️ Admin CMS interface
│   │   │   │   ├── _actions.ts        # ⚡ CRUD server actions
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── crawling-fasih/        # 🕷️ NEW: Data crawler system
│   │   │   │   ├── page.tsx           # 🎯 Crawler main interface
│   │   │   │   ├── crawling-client.tsx # 🤖 Crawler logic dan UI
│   │   │   │   ├── _actions.ts        # 🔄 Crawling server actions
│   │   │   │   ├── data-table.tsx     # 📋 Results table
│   │   │   │   └── columns.tsx        # 📊 Table column definitions
│   │   │   │
│   │   │   ├── monitoring/            # 📊 Real-time monitoring dashboards
│   │   │   │   ├── ubinan/            # 🌾 Ubinan monitoring
│   │   │   │   │   ├── page.tsx       # 📈 Dual-table interface
│   │   │   │   │   ├── PadiTable.tsx  # 🌾 Padi monitoring table
│   │   │   │   │   └── PalawijaTable.tsx # 🥕 Palawija monitoring table
│   │   │   │   ├── ksa/               # 📋 KSA monitoring dengan drill-down
│   │   │   │   │   ├── page.tsx       # 🎯 KSA main dashboard
│   │   │   │   │   ├── ksa-monitoring-client-page.tsx # 📊 Client logic
│   │   │   │   │   ├── DistrictKsaTable.tsx # 🏘️ District-level table
│   │   │   │   │   ├── NamaKsaTable.tsx # 👤 Officer-level table
│   │   │   │   │   └── components/    # 🧩 KSA-specific components
│   │   │   │   │       └── BeritaAcaraModal.tsx # 📄 BA generation
│   │   │   │   ├── simtp/             # 📊 SIMTP progress tracking
│   │   │   │   │   ├── page.tsx       # 📈 SIMTP dashboard
│   │   │   │   │   └── SimtpMonitoringClient.tsx # 🔄 Real-time updates
│   │   │   │   └── kehutanan/         # 🌲 Forestry monitoring
│   │   │   │       └── page.tsx       # 🏞️ Forestry dashboard
│   │   │   │
│   │   │   ├── evaluasi/              # 🔍 Advanced analytics modules
│   │   │   │   ├── ubinan/            # 📊 Statistical analysis
│   │   │   │   │   ├── page.tsx       # 🎯 Analysis main page
│   │   │   │   │   ├── evaluasi-ubinan-client.tsx # 📈 Analysis client
│   │   │   │   │   ├── UbinanBoxPlot.tsx # 📊 ECharts box plot
│   │   │   │   │   ├── UbinanComparisonChart.tsx # 📈 Recharts comparison
│   │   │   │   │   ├── *-columns.tsx  # 📋 Table column definitions
│   │   │   │   │   ├── *Modal.tsx     # 🔍 Drill-down modals
│   │   │   │   │   └── _actions.ts    # ⚡ Analysis server actions
│   │   │   │   └── ksa/               # 🔍 KSA analytics dengan anomaly detection
│   │   │   │       ├── page.tsx       # 🎯 KSA analytics main
│   │   │   │       ├── evaluasi-ksa-client.tsx # 📊 Analytics client
│   │   │   │       ├── AnomalyValidatorTab.tsx # 🚨 Anomaly detection
│   │   │   │       ├── PhaseTimelineVisual.tsx # 📅 Phase timeline
│   │   │   │       └── *Modal.tsx     # 🔍 Detail modals
│   │   │   │
│   │   │   ├── produksi-statistik/    # 📊 ATAP statistical analysis
│   │   │   │   ├── page.tsx           # 🎯 Statistics main page
│   │   │   │   ├── statistik-client.tsx # 📈 Interactive client
│   │   │   │   ├── *-chart-wrapper.tsx # 📊 Recharts components
│   │   │   │   ├── data-table.tsx     # 📋 TanStack Table
│   │   │   │   └── columns.tsx        # 📊 Table definitions
│   │   │   │
│   │   │   ├── update-data/           # 🔄 Data management pipelines
│   │   │   │   ├── ubinan/            # 🌾 Ubinan data import
│   │   │   │   │   ├── page.tsx       # 🎯 Import main interface
│   │   │   │   │   ├── update-ubinan-client.tsx # 📤 Import client
│   │   │   │   │   ├── uploader-client-component.tsx # 📁 Smart uploader
│   │   │   │   │   ├── master-sample-uploader.tsx # 📊 Excel uploader
│   │   │   │   │   └── _actions.ts    # ⚡ Import server actions
│   │   │   │   ├── ksa/               # 📋 KSA data pipeline
│   │   │   │   │   ├── page.tsx       # 🎯 KSA import interface
│   │   │   │   │   ├── ksa-uploader.tsx # 📤 Multi-file uploader
│   │   │   │   │   └── _actions.ts    # ⚡ KSA import actions
│   │   │   │   └── atap/              # 📊 ATAP data processing
│   │   │   │       ├── page.tsx       # 🎯 ATAP import main
│   │   │   │       ├── atap-uploader.tsx # 📤 Generic uploader
│   │   │   │       └── _actions.ts    # ⚡ ATAP processing actions
│   │   │   │
│   │   │   ├── simtp-upload/          # 📁 Document upload portal
│   │   │   │   ├── page.tsx           # 🎯 Upload main page
│   │   │   │   ├── SimtpUploadClient.tsx # 📤 Upload interface
│   │   │   │   ├── UploadHistory.tsx  # 📜 Upload history
│   │   │   │   └── _actions.ts        # ⚡ Upload server actions
│   │   │   │
│   │   │   ├── profil/                # 👤 User profile management
│   │   │   │   └── page.tsx           # ⚙️ Profile editor dengan tabs
│   │   │   │
│   │   │   ├── pengguna/              # 👥 User management (Admin only)
│   │   │   │   ├── page.tsx           # 🎯 User management main
│   │   │   │   ├── user-management-client-page.tsx # 👥 User table
│   │   │   │   ├── user-import-dialog.tsx # 📤 Bulk user import
│   │   │   │   └── _actions.ts        # ⚡ User CRUD actions
│   │   │   │
│   │   │   ├── jadwal/                # 🗓️ Calendar system
│   │   │   │   ├── page.tsx           # 📅 Calendar main page
│   │   │   │   ├── jadwal-client.tsx  # 🗓️ Calendar client logic
│   │   │   │   ├── jadwal-desktop.tsx # 💻 Desktop calendar view
│   │   │   │   ├── jadwal-mobile.tsx  # 📱 Mobile calendar view
│   │   │   │   └── jadwal.config.tsx  # ⚙️ Calendar configuration
│   │   │   │
│   │   │   └── test/                  # 🧪 Development testing
│   │   │       └── page.tsx           # 🔬 Testing dashboard
│   │   │
│   │   └── api/                       # 🔄 API routes (optional)
│   │       ├── produksi/route.ts      # 📊 Production API endpoints
│   │       └── users/route.ts         # 👥 User API endpoints
│   │
│   ├── components/                    # 🧩 Reusable UI components
│   │   ├── layout/                    # 📐 Layout-specific components
│   │   │   ├── main-layout.tsx        # 🏗️ Main layout wrapper
│   │   │   ├── NewSidebar.tsx         # 📱 Modern sidebar dengan animations
│   │   │   ├── NavMainHope.tsx        # 🧭 Main navigation component
│   │   │   └── NavUserHope.tsx        # 👤 User navigation menu
│   │   │
│   │   └── ui/                        # 🎨 shadcn/ui components (50+ components)
│   │       ├── button.tsx             # 🔘 Button variants
│   │       ├── card.tsx               # 🃏 Card layouts
│   │       ├── table.tsx              # 📋 Table components
│   │       ├── dialog.tsx             # 🔲 Modal dialogs
│   │       ├── form.tsx               # 📝 Form components
│   │       ├── select.tsx             # 📋 Select dropdowns
│   │       ├── tabs.tsx               # 📑 Tab interfaces
│   │       ├── carousel.tsx           # 🎡 Carousel component
│   │       ├── chart.tsx              # 📊 Chart wrapper
│   │       ├── GenericPaginatedTable.tsx # 📊 Advanced table component
│   │       ├── CustomFileInput.tsx    # 📁 File upload component
│   │       └── ...                    # 🎨 40+ other UI components
│   │
│   ├── context/                       # 🔄 React Context providers
│   │   ├── AuthContext.tsx            # 🔐 Authentication state
│   │   ├── YearContext.tsx            # 📅 Global year filtering
│   │   ├── DarkModeContext.tsx        # 🌙 Theme management
│   │   ├── UbinanEvaluasiFilterContext.tsx # 🌾 Ubinan analysis filters
│   │   └── KsaEvaluasiFilterContext.tsx # 📋 KSA analysis filters
│   │
│   ├── hooks/                         # 🪝 Custom React hooks (20+ hooks)
│   │   ├── use-mobile.ts              # 📱 Mobile detection
│   │   ├── useDebounce.ts             # ⏱️ Debounced inputs
│   │   ├── useBahanProduksiData.ts    # 🔗 Content portal data
│   │   ├── useAtapStatistikData.ts    # 📊 ATAP statistics
│   │   ├── usePadiMonitoringData.ts   # 🌾 Padi monitoring
│   │   ├── usePalawijaMonitoringData.ts # 🥕 Palawija monitoring
│   │   ├── useKsaMonitoringData.ts    # 📋 KSA monitoring
│   │   ├── useKsaEvaluationData.ts    # 🔍 KSA analytics
│   │   ├── useKsaAnomalyData.ts       # 🚨 KSA anomaly detection
│   │   ├── useUbinanDescriptiveStatsData.ts # 📊 Ubinan statistics
│   │   ├── usePenggunaanBenihDanPupukData.ts # 🌱 Fertilizer data
│   │   ├── useSimtpKpiData.ts         # 📊 SIMTP KPIs
│   │   ├── useJadwalData.ts           # 🗓️ Calendar data
│   │   ├── useOfficerPerformanceData.ts # 👤 Officer performance
│   │   └── ...                        # 🪝 More specialized hooks
│   │
│   └── lib/                           # 📚 Utility libraries dan configurations
│       ├── supabase.ts                # 🗄️ Supabase client configuration
│       ├── supabase-server.ts         # 🖥️ Server-side Supabase client
│       ├── database.types.ts          # 📘 Auto-generated database types
│       ├── utils.ts                   # 🛠️ Utility functions (cn, formatters)
│       ├── schemas.ts                 # 📋 Zod validation schemas
│       ├── types.ts                   # 📘 TypeScript type definitions
│       ├── icon-map.tsx               # 🎨 Dynamic icon mapping
│       ├── sidebar-data.ts            # 🧭 Navigation configuration
│       ├── satker-data.ts             # 🏛️ Organization data
│       ├── docx-generator.ts          # 📄 Word document generation
│       ├── status-visuals.ts          # 🎨 Status visualization helpers
│       ├── dark-mode-utils.ts         # 🌙 Theme utilities
│       ├── useBreakpoint.ts           # 📱 Responsive breakpoint hook
│       └── ...                        # 📚 Additional utilities
```

### **Key Architectural Highlights:**

#### 🏗️ **Modern Next.js 15 Architecture**
- **App Router**: Full migration dari Pages Router ke App Router untuk better performance
- **Server Components**: Optimal data fetching dengan React Server Components
- **Server Actions**: Type-safe server-side operations tanpa API endpoints
- **Route Groups**: Organized routing dengan `(dashboard)` group untuk protected routes

#### 🔐 **Security & Type Safety**
- **Middleware Protection**: Route-level authentication dengan Next.js middleware
- **TypeScript Strict**: Full type safety dengan auto-generated database types
- **Zod Validation**: Runtime validation untuk forms dan API inputs
- **Role-Based Access**: Dynamic UI adaptation berdasarkan user roles

#### 🎨 **Modern UI Architecture**
- **shadcn/ui**: 50+ production-ready components dengan Radix UI primitives
- **Tailwind CSS v4**: Latest utility-first CSS framework
- **Responsive Design**: Mobile-first approach dengan adaptive layouts
- **Animation System**: Framer Motion untuk smooth micro-interactions

#### 📊 **Data Management Strategy**
- **SWR Caching**: Intelligent data caching dengan automatic revalidation
- **React Context**: Global state management untuk complex filtering
- **Custom Hooks**: 20+ specialized hooks untuk data fetching dan processing
- **PostgreSQL Views**: Optimized database queries dengan materialized views

## 🛠️ **Installation & Development Setup**

### **Prerequisites**
- **Node.js**: v18.0.0 atau lebih baru
- **npm/yarn**: Package manager terbaru
- **Supabase Account**: Untuk database dan authentication
- **Git**: Version control

### **Quick Start Guide**

1. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd dashboard-hope-nextjs
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Environment Configuration:**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Database Types Generation:**
   ```bash
   npm run gen:types
   ```

5. **Development Server:**
   ```bash
   npm run dev
   ```
   Visit: `http://localhost:3000`

### **Build & Production**

```bash
# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

### **Dependencies Overview**

#### **Core Framework** (Latest Versions)
- `next@15.3.2` - Next.js framework
- `react@19.0.0` - React library
- `typescript@5.8.3` - TypeScript support

#### **UI & Styling**
- `tailwindcss@4` - Utility-first CSS
- `@radix-ui/*` - Headless UI primitives
- `lucide-react@0.511.0` - 1000+ SVG icons
- `framer-motion@12.18.1` - Animation library

#### **Data & Forms**
- `@supabase/ssr@0.6.1` - Supabase integration
- `@tanstack/react-table@8.21.3` - Table management
- `react-hook-form@7.56.4` - Form handling
- `zod@3.25.33` - Schema validation
- `swr@2.3.3` - Data fetching

#### **Visualization & Export**
- `recharts@2.15.3` - Chart library
- `echarts@5.6.0` - Advanced charts
- `xlsx@0.18.5` - Excel processing
- `docx@9.5.1` - Word document generation

#### **Development Tools**
- `eslint@9.28.0` - Code linting
- `@typescript-eslint/*` - TypeScript linting
- `@types/*` - TypeScript definitions

## 🚀 **Performance & Optimization Features**

### **Build Optimizations**
- **Static Generation (SSG)**: Pre-rendered pages untuk faster loading
- **Incremental Static Regeneration (ISR)**: Dynamic content dengan caching
- **Image Optimization**: Next.js built-in image optimization
- **Bundle Splitting**: Automatic code splitting untuk optimal loading

### **Runtime Performance**
- **Memoization**: Extensive use of React.memo dan useMemo
- **Virtual Scrolling**: Efficient handling of large datasets
- **Debounced Inputs**: Optimized search dan filtering
- **Lazy Loading**: Component dan data lazy loading

### **Database Optimization**
- **Materialized Views**: Pre-computed aggregations
- **RPC Functions**: Complex queries di database level
- **Indexing**: Optimized database indexes
- **Connection Pooling**: Efficient database connections

## 📈 **Future Development Roadmap**

### **Planned Features**
- **Real-time Notifications**: WebSocket integration untuk live updates
- **Advanced Analytics**: Machine learning integration untuk predictive analytics
- **Mobile App**: React Native companion app
- **API Integration**: External data source integrations
- **Advanced Reporting**: PDF generation dengan custom templates

### **Technical Improvements**
- **Micro-frontend Architecture**: Modular application structure
- **Edge Computing**: Vercel Edge Functions integration
- **Progressive Web App**: PWA capabilities untuk offline usage
- **Advanced Caching**: Redis integration untuk enhanced performance

---

**📞 Support & Contact:**
Untuk pertanyaan teknis atau permintaan fitur, silakan hubungi tim development BPS Kalbar.

**🔧 Maintenance:**
Dashboard ini secara rutin di-maintain dan di-update untuk memastikan keamanan dan performa optimal.
---

**📞 Contact & Support:**  
Untuk pertanyaan teknis, feature requests, atau bantuan implementasi, silakan hubungi tim development BPS Kalbar.

**🔧 System Maintenance:**  
Dashboard ini di-maintain secara berkelanjutan dengan update security patches, performance improvements, dan feature enhancements untuk memastikan reliability dan optimal performance.

**💻 Development Team:**  
Dikembangkan dengan ❤️ oleh Tim IT BPS Provinsi Kalimantan Barat.