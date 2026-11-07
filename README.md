# Sistem Informasi Perpustakaan Sederhana (RESTful API)

Sistem Informasi Perpustakaan Sederhana yang dibangun untuk memenuhi **7 Tugas Mata Kuliah REST API**. Aplikasi ini dirancang menggunakan standar arsitektur RESTful modern, modular, dan bersih (Clean Modular Architecture) dengan pemisahan Controller, Service, DTO, Repository, serta Entity.

---

## 🛠️ Tech Stack

- **Backend**: NestJS (v12) & TypeScript (v5)
- **Database**: PostgreSQL dengan TypeORM (Mendukung Migrations, Constraints, & Transactions)
- **Frontend Client**: HTML5, CSS3 kustom (Plus Jakarta Sans, responsif, profesional), dan Vanilla JavaScript terhubung ke REST API
- **Dokumentasi API**: OpenAPI / Swagger UI (`/api/docs`)
- **Automated Testing**: Jest / Vitest & Supertest (Unit Testing & E2E Integration Testing)
- **API Testing**: Postman Collection v2.1 & OpenAPI Spec JSON

---

## 📋 Pemetaan 7 Tugas Mata Kuliah REST API

| No | Tugas Dosen | Implementasi dalam Proyek | Status |
|:---:|---|---|:---:|
| **1** | Analisis Kebutuhan & Desain Kontrak API | PRD, ERD, dan kontrak endpoint lengkap di `docs/PRD_ERD_API_CONTRACT.md` | ✅ Selesai |
| **2** | Inisialisasi Proyek & Arsitektur Modular | NestJS modular structure, `.env.example`, Global Exception Filter, Transform Interceptor, ValidationPipe | ✅ Selesai |
| **3** | Pemodelan Database, Migrations & Constraints | PostgreSQL TypeORM Entities (`Book`, `Member`, `Loan`), Check Constraints, Foreign Keys `ON DELETE RESTRICT`, File Migration SQL & TypeScript | ✅ Selesai |
| **4** | CRUD Data Buku & Anggota | Controller, Service, DTO dengan `class-validator`, UUID v4, pagination (`page`, `limit`), dan pencarian | ✅ Selesai |
| **5** | Transaksi Bisnis Peminjaman & Pengembalian | Transaksi database ACID (`dataSource.transaction`), validasi stok buku, due date, status mutasi aman | ✅ Selesai |
| **6** | Dokumentasi OpenAPI/Swagger & Postman | Swagger UI di `/api/docs`, OpenAPI 3.0 JSON spec, Postman Collection JSON v2.1 di folder `postman/` | ✅ Selesai |
| **7** | Automated Testing & Consumer Interface | 16 Unit Tests & 9 E2E Supertest (100% Pass), serta Dashboard Web Staff di `public/` | ✅ Selesai |

---

## 📂 Struktur Folder Proyek

```
perpus_uts_api/
├── docs/
│   └── PRD_ERD_API_CONTRACT.md          # Dokumen Perancangan PRD, ERD, & Kontrak API
├── postman/
│   ├── openapi-spec.json                # Spesifikasi OpenAPI 3.0.3 untuk Swagger / Postman
│   └── perpus_uts_api.postman_collection.json # Postman Collection v2.1 siap pakai
├── public/                              # Antarmuka Pengguna (Web Client)
│   ├── index.html                       # Layout antarmuka dashboard, katalog, & sirkulasi
│   ├── css/
│   │   └── styles.css                   # Custom modern & responsive design styling
│   └── js/
│       └── app.js                       # Logic fetch terhubung ke endpoint /api/v1
├── src/
│   ├── common/
│   │   ├── dto/
│   │   │   └── pagination-query.dto.ts  # Base DTO pagination & search
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts # Global Exception Filter (standard error JSON)
│   │   └── interceptors/
│   │       └── transform.interceptor.ts # Global Transform Interceptor & ETag header
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql   # Raw DDL SQL PostgreSQL
│   │   │   └── 1715000000000-InitialLibrarySchema.ts # TypeORM Migration
│   │   ├── seeds/
│   │   │   ├── seed.ts                  # Seeder script database (buku, anggota, pinjaman)
│   │   │   └── seed_data.sql            # Raw SQL Seeder data
│   │   └── typeorm.config.ts            # Konfigurasi koneksi TypeORM & DataSource
│   ├── modules/
│   │   ├── books/                       # Modul Katalog Buku
│   │   │   ├── dto/                     # CreateBookDto, UpdateBookDto, QueryBookDto
│   │   │   ├── entities/book.entity.ts  # Entity Book (UUID, constraints)
│   │   │   ├── books.controller.ts
│   │   │   ├── books.service.ts
│   │   │   ├── books.service.spec.ts    # Unit test modul buku
│   │   │   └── books.module.ts
│   │   ├── members/                     # Modul Data Anggota
│   │   │   ├── dto/                     # CreateMemberDto, UpdateMemberDto, QueryMemberDto
│   │   │   ├── entities/member.entity.ts# Entity Member (NIM unik, UUID)
│   │   │   ├── members.controller.ts
│   │   │   ├── members.service.ts
│   │   │   ├── members.service.spec.ts  # Unit test modul anggota
│   │   │   └── members.module.ts
│   │   ├── loans/                       # Modul Sirkulasi Peminjaman (Transaksi)
│   │   │   ├── dto/                     # CreateLoanDto, ReturnLoanDto, QueryLoanDto
│   │   │   ├── entities/loan.entity.ts  # Entity Loan (status, due date, foreign keys)
│   │   │   ├── loans.controller.ts
│   │   │   ├── loans.service.ts         # Business logic ACID transaction & decrement/increment stok
│   │   │   ├── loans.service.spec.ts    # Unit test transaksi peminjaman & pengembalian
│   │   │   └── loans.module.ts
│   │   └── dashboard/                   # Modul Ringkasan Dashboard
│   │       ├── dashboard.controller.ts
│   │       ├── dashboard.service.ts
│   │       └── dashboard.module.ts
│   ├── app.module.ts                    # Root Module (Config, TypeORM, Static Serve)
│   └── main.ts                          # Bootstrap (Prefix /api/v1, Swagger, Pipes, Filter)
├── test/
│   └── library.e2e-spec.ts              # Automated E2E Supertest (9 skenario)
├── docker-compose.yml                   # Container PostgreSQL instan
├── .env.example                         # Contoh variabel lingkungan
├── package.json
└── tsconfig.json
```

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat Lingkungan
- **Node.js**: v20+ atau v24+ (terverifikasi v24.19.0)
- **npm**: v10+ atau v11+ (terverifikasi 11.17.0)
- **PostgreSQL**: v14, v15, atau v16

### 2. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan parameter database di file `.env`:
```env
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=perpus_uts_db
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

### 3. Menjalankan Database PostgreSQL

#### Opsi A: Menggunakan Docker (Direkomendasikan & Paling Cepat)
Cukup jalankan satu perintah berikut di root folder:
```bash
docker compose up -d
```
Container PostgreSQL akan langsung aktif di port `5432` dengan database `perpus_uts_db`.

#### Opsi B: Menggunakan PostgreSQL Lokal (Windows / pgAdmin)
1. Buka pgAdmin atau SQL Shell (`psql`).
2. Buat database:
   ```sql
   CREATE DATABASE perpus_uts_db;
   ```
3. Pastikan username dan password di `.env` sesuai dengan user PostgreSQL Anda.

### 4. Menjalankan Migration & Seeder Data Contoh
Jalankan perintah berikut untuk mengeksekusi migrasi skema tabel dan mengisi data awal:
```bash
# Jalankan migrasi tabel
npm run migration:run

# Isi data contoh (buku, anggota, peminjaman)
npm run seed
```
*(Alternatif: Anda juga dapat mengeksekusi langsung file SQL `src/database/migrations/001_initial_schema.sql` dan `src/database/seeds/seed_data.sql` pada pgAdmin)*.

### 5. Memulai Server NestJS
```bash
# Mode development (dengan hot-reload)
npm run start:dev

# Atau mode production
npm run build
npm run start:prod
```

Setelah server aktif, Anda dapat membuka:
- **Web UI Client Perpustakaan**: `http://localhost:3000`
- **Dokumentasi Swagger / OpenAPI**: `http://localhost:3000/api/docs`
- **Prefix RESTful API**: `http://localhost:3000/api/v1`

---

## 🧪 Menjalankan Automated Testing (Pengujian Otomatis)

Proyek ini telah dilengkapi dengan pengujian otomatis komprehensif menggunakan **Jest / Vitest** dan **Supertest**:

```bash
# 1. Menjalankan Unit Testing (16 test suites)
npm test

# 2. Menjalankan E2E Integration Testing dengan Supertest (9 test suites)
npm run test:e2e

# 3. Menjalankan Test Coverage
npm run test:cov
```

**Hasil Eksekusi Riil:**
- Unit Test: **16/16 Passed** (BooksService, MembersService, LoansService ACID Logic)
- E2E Supertest: **9/9 Passed** (Books, Members, Loans, Dashboard HTTP Pipeline)

---

## 📮 Pengujian dengan Postman

Tersedia 2 berkas di dalam folder `postman/`:
1. **`postman/perpus_uts_api.postman_collection.json`**
   Koleksi Postman v2.1 siap pakai dengan pengelompokan folder (Dashboard, Books, Members, Loans) beserta variabel otomatis (`bookId`, `memberId`, `loanId`).
2. **`postman/openapi-spec.json`**
   Spesifikasi OpenAPI 3.0.3 yang dapat langsung diimpor via menu **Import** pada aplikasi Postman.

---

## 🌐 Ringkasan Endpoint RESTful API (`/api/v1`)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/v1/dashboard/summary` | Mengambil statistik ringkasan operasional perpustakaan |
| `GET` | `/api/v1/books` | Mengambil daftar katalog buku (filter search, pagination) |
| `POST` | `/api/v1/books` | Menambahkan buku baru ke katalog |
| `GET` | `/api/v1/books/:id` | Detail buku berdasarkan UUID |
| `PUT` | `/api/v1/books/:id` | Memperbarui seluruh data buku |
| `PATCH` | `/api/v1/books/:id` | Memperbarui sebagian field buku |
| `DELETE` | `/api/v1/books/:id` | Menghapus buku (ditolak jika memiliki pinjaman aktif) |
| `GET` | `/api/v1/members` | Mengambil daftar anggota (filter search, pagination) |
| `POST` | `/api/v1/members` | Mendaftarkan anggota baru (NIM harus unik) |
| `GET` | `/api/v1/members/:id` | Detail anggota beserta riwayat peminjamannya |
| `PUT` | `/api/v1/members/:id` | Memperbarui seluruh data anggota |
| `PATCH` | `/api/v1/members/:id` | Memperbarui sebagian field anggota |
| `DELETE` | `/api/v1/members/:id` | Menghapus anggota (ditolak jika sedang meminjam buku) |
| `GET` | `/api/v1/loans` | Daftar sirkulasi peminjaman (filter status, member, book) |
| `POST` | `/api/v1/loans` | Peminjaman buku baru (**Atomic Transaction**: kurangi stok eksemplar) |
| `GET` | `/api/v1/loans/:id` | Detail transaksi peminjaman |
| `PATCH` | `/api/v1/loans/:id/return` | Pengembalian buku (**Atomic Transaction**: tambah stok eksemplar) |
