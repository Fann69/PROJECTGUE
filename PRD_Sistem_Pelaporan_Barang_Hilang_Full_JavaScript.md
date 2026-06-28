# Product Requirement Document (PRD)

# Rancang Bangun Sistem Pelaporan Barang Hilang di Kampus Berbasis Web

**Platform:** Politeknik Negeri Lampung

------------------------------------------------------------------------

# 1. Ringkasan Proyek

Sistem dibangun menggunakan **Full JavaScript** dengan arsitektur
serverless.

## Tech Stack

### Frontend

-   React.js
-   Vite
-   Tailwind CSS
-   React Router DOM
-   React Hook Form
-   Zod (Schema Validation)
-   TanStack Query (Server State)
-   Zustand / Context API (Client State)
-   Chart.js
-   Framer Motion
-   SweetAlert2
-   React Hot Toast

### Backend

-   Supabase PostgreSQL
-   Supabase Auth
-   Supabase Storage
-   Supabase Realtime
-   Supabase Edge Functions

### Deployment

-   Frontend : Netlify
-   Backend : Supabase

------------------------------------------------------------------------

# 2. Arsitektur

``` text
User
 │
 ▼
React + Vite
 │
 ▼
Netlify
 │
 ▼
Supabase
├── PostgreSQL
├── Authentication
├── Storage
├── Realtime
└── Edge Functions
```

------------------------------------------------------------------------

# 3. Roles & Permissions (RBAC)

-   **Public (Unauthenticated):**
    - Melihat Landing Page, daftar barang hilang, dan barang ditemukan.
    - Tidak bisa melihat detail kontak pelapor atau melakukan klaim.
-   **User (Mahasiswa/Dosen/Civitas):**
    - Wajib Login.
    - Bisa membuat laporan barang hilang/ditemukan.
    - Mengelola laporan miliknya sendiri (Edit/Delete).
    - Melakukan klaim terhadap barang yang ditemukan orang lain.
-   **Admin (Petugas Keamanan/Admin Sistem):**
    - Akses ke Dashboard Admin.
    - Mengelola (CRUD) kategori barang.
    - Menyetujui (Approve) atau menolak (Reject) klaim barang.
    - Melihat statistik dan mengekspor laporan (PDF/Excel).
    - Manajemen user (Banned/Delete jika melanggar).

------------------------------------------------------------------------

# 4. Frontend Development Plan

## Routing & Access Control
-   **Public Routes:** `/`, `/login`, `/register`, `/items`
-   **Protected Routes (User):** `/dashboard`, `/reports/new`, `/claims`, `/profile`
-   **Admin Routes (Admin):** `/admin`, `/admin/categories`, `/admin/users`, `/admin/claims`, `/admin/reports`

## Landing Page
-   Navbar
-   Hero Section
-   Statistik
-   Barang Terbaru
-   Footer

## Authentication
### Login
-   Email
-   Password
-   Remember Me
-   Forgot Password
### Register
-   Nama
-   NIM (Validasi: Angka, minimal 8 digit)
-   Email (Validasi: Format email valid, diutamakan domain kampus jika ada)
-   Nomor HP (Validasi: Angka, minimal 10 digit)
-   Password (Validasi: Minimal 8 karakter, kombinasi huruf & angka)
-   Konfirmasi Password

## Dashboard User
-   Statistik Pribadi (Total laporan/klaim)
-   Aktivitas Terbaru
-   Notifikasi

## Modul
-   Barang Hilang
-   Barang Ditemukan
-   Detail Barang
-   Form Laporan (Batasan ukuran file gambar max 2MB)
-   Form Barang Ditemukan
-   Klaim Barang
-   Profil
-   Dashboard Admin

## UI & Design System
-   Responsive
-   Dark Mode
-   Toast Notification (React Hot Toast)
-   Alert (SweetAlert2)
-   Chart.js
-   **Primary Color:** Disesuaikan dengan identitas Polinela (misal: Biru/Kuning).

------------------------------------------------------------------------

# 5. Backend Development Plan

## Authentication
-   Register, Login, Logout, JWT Session

## Row Level Security (RLS)
-   `profiles`: User hanya bisa update profil sendiri. Publik bisa melihat basic info.
-   `lost_items` / `found_items`: Publik bisa melihat (*Read*). User hanya bisa *Insert/Update/Delete* miliknya sendiri. Admin bisa *Update/Delete* semua.
-   `claims`: User bisa insert klaim, melihat klaim miliknya. Admin bisa melihat semua klaim dan mengubah status.

## Supabase Storage Buckets
-   `avatars` (Public): Foto profil user (Max 1MB).
-   `item_images` (Public): Foto barang hilang/ditemukan (Max 2MB).
-   `claim_proofs` (Private): Foto bukti kepemilikan untuk klaim, hanya bisa diakses oleh Admin dan uploader (Max 2MB).

## Database Triggers & Edge Functions
-   **Triggers:** Otomatis update kolom `updated_at` pada setiap tabel saat terjadi perubahan. Menambahkan baris ke `activity_logs` secara otomatis.
-   **Edge Functions:** Direncanakan untuk meng-generate laporan rekapitulasi PDF bulanan agar tidak membebani frontend, serta (opsional) mengirim email notifikasi klaim ke user terkait.

## Lainnya
-   CRUD Categories, Items, Claims
-   Realtime Notification
-   Statistik Dashboard Admin

------------------------------------------------------------------------

# 6. Business Workflows

## Alur Klaim Barang (Claim Workflow)
1. User A melaporkan telah menemukan "Dompet Hitam" (tabel `found_items`).
2. User B (pemilik dompet) melihat postingan tersebut dan menekan tombol "Klaim Barang".
3. User B mengisi form klaim, menjelaskan ciri spesifik, dan mengunggah foto bukti kepemilikan (`claim_proofs`).
4. Status klaim menjadi `pending`. Notifikasi dikirimkan ke Admin.
5. Admin memverifikasi bukti dari User B melalui Dashboard Admin.
6. Jika bukti valid, Admin menekan `Approve`. 
   - Status klaim menjadi `approved`.
   - Status barang di `found_items` menjadi `claimed`.
   - Notifikasi diterima oleh User A (penemu) dan User B (pemilik) untuk bertemu di pos satpam.
7. Jika ditolak, status klaim menjadi `rejected`, User B mendapat notifikasi penolakan.

------------------------------------------------------------------------

# 7. Database

*Catatan: Secara umum relasi menggunakan `ON DELETE CASCADE` untuk data turunan user (seperti claims & activity_logs), sedangkan untuk kategori menggunakan `ON DELETE SET NULL` agar laporan barang tidak hilang jika kategori dihapus.*

## profiles
-   id (uuid, PK)
-   nama (varchar)
-   nim (varchar)
-   email (varchar)
-   nomor_hp (varchar)
-   role (enum: `user`, `admin`) - default: `user`
-   foto (varchar)
-   created_at (timestamp)
-   updated_at (timestamp)

## categories
-   id (uuid, PK)
-   nama (varchar)
-   deskripsi (text)

## lost_items
-   id (uuid, PK)
-   user_id (uuid, FK to profiles) - `ON DELETE CASCADE`
-   category_id (uuid, FK to categories) - `ON DELETE SET NULL`
-   nama_barang (varchar)
-   deskripsi (text)
-   lokasi_hilang (varchar)
-   tanggal_hilang (date)
-   foto (varchar)
-   status (enum: `pending`, `published`, `resolved`) - default: `published`

## found_items
-   id (uuid, PK)
-   user_id (uuid, FK to profiles) - `ON DELETE CASCADE`
-   category_id (uuid, FK to categories) - `ON DELETE SET NULL`
-   nama_barang (varchar)
-   deskripsi (text)
-   lokasi_ditemukan (varchar)
-   tanggal_ditemukan (date)
-   foto (varchar)
-   status (enum: `published`, `claimed`) - default: `published`

## claims
-   id (uuid, PK)
-   user_id (uuid, FK to profiles) - `ON DELETE CASCADE`
-   item_id (uuid, FK to found_items) - `ON DELETE CASCADE`
-   alasan (text)
-   foto_bukti (varchar)
-   status (enum: `pending`, `approved`, `rejected`) - default: `pending`

## notifications
-   id (uuid, PK)
-   user_id (uuid, FK to profiles) - `ON DELETE CASCADE`
-   judul (varchar)
-   pesan (text)
-   is_read (boolean) - default: `false`

## activity_logs
-   id (uuid, PK)
-   user_id (uuid, FK to profiles) - `ON DELETE CASCADE`
-   activity (varchar)
-   ip_address (varchar)

------------------------------------------------------------------------

# 8. Struktur Folder

``` text
src/
├── assets
├── components
├── pages
├── hooks
├── services
├── context       # (Atau store/ zustand untuk global state)
├── routes        # Konfigurasi Protected & Admin Routes
├── utils
├── validations   # Schema Zod
├── constants
├── lib           # Konfigurasi Supabase Client
├── App.jsx
└── main.jsx

supabase/
├── migrations    # Setup tabel, RLS, & Trigger
├── functions     # Edge Functions (opsional untuk Export PDF)
├── seed.sql
└── config.toml
```

# 9. Deployment

## Netlify
-   Auto Deploy GitHub
-   Environment Variables

## Supabase
-   Database
-   Auth
-   Storage
-   Realtime
-   Edge Functions

# 10. Environment Variables

``` env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

# 11. MVP Checklist

-   Login & Register (Validasi Zod)
-   CRUD Barang Hilang
-   CRUD Barang Ditemukan
-   CRUD Kategori (Khusus Admin)
-   CRUD User (Khusus Admin)
-   Klaim Barang (Submit & Approval)
-   Dashboard User & Admin
-   Upload Foto (Integrasi Supabase Storage)
-   Realtime Notification
-   Export PDF & Excel (Rekap Laporan Bulanan untuk Admin)
-   Responsive
-   Dark Mode

# 12. Future Development

-   PWA
-   Email Notification
-   QR Code
-   AI Image Matching
-   Push Notification
-   Mobile App
