# Sistem Informasi Perpustakaan Sederhana (RESTful API)

Sistem Informasi Perpustakaan Sederhana berbasis **RESTful API** yang dirancang dan dibangun untuk memenuhi seluruh persyaratan akademis **7 Tugas Mata Kuliah Rekayasa Web / Pengembangan RESTful API (UNISBANK)**.

Aplikasi mengadopsi arsitektur modular bersih (*Clean Modular Architecture*) dengan pemisahan tegas antara Controller, Service, DTO, Entity, dan Repository, serta mengimplementasikan standar protokol industri modern seperti **Strong ETag (RFC 9110)**, kontrol konkurensi **`If-Match` (HTTP 412)**, dan format galat **Problem Details (RFC 9457)**.

---

## 📊 Status Proyek & Ringkasan Kelulusan Audit

| Parameter Evaluasi | Status Aktual | Keterangan & Bukti Empiris |
|---|:---:|---|
| **Status Akademik** | **IMPLEMENTASI DAN PENGUJIAN SELESAI** | Seluruh implementasi teknis dan pengujian otomatis telah selesai; penyusunan laporan akhir PDF dan pengumpulan Google Drive masih perlu diselesaikan sesuai arahan dosen |
| **Unit Testing (Vitest)** | **40 / 40 Passed (100%)** | 6 test suites unit logic & validation (`npm test`) |
| **E2E Integration Testing** | **33 / 33 Passed (100%)** | HTTP Supertest di atas basis data terisolasi `perpus_uts_test_db` (`npm run test:e2e`) |
| **Postman / Newman Testing** | **48 / 48 Passed (100%)** | 25 request dieksekusi via Newman CLI runner (`npm run test:newman`) |
| **OpenAPI Specification** | **17 / 17 Operations Valid** | Spesifikasi ganda JSON & YAML 100% ekuivalen terverifikasi |
| **Bukti Visual (Screenshots)** | **47 / 47 File Fisik Valid** | Seluruh tangkapan layar Tugas 1–7 terverifikasi di disk (tanpa pending/fiktif) |
| **Konsistensi Basis Data Utama** | **Konsisten Sesuai Baseline** | Pemeriksaan berkala via `check-baseline-db.js` menunjukkan data `perpus_uts_db` konsisten pada 9 buku, 27 eksemplar, 24 tersedia, 3 pinjaman aktif |

---

## 🛠️ Stack Teknologi & Versi Aktual

Sesuai dengan implementasi nyata pada berkas [`package.json`](package.json) dan repositori:

- **Backend Framework**: [NestJS](https://nestjs.com/) v12.0.1 (ESM native dengan `"type": "module"`)
- **Bahasa Pemrograman**: [TypeScript](https://www.typescriptlang.org/) v6.0.2
- **Runtime Environment**: [Node.js](https://nodejs.org/) v24.19.0 (mendukung Node.js v20+, v22+, dan v24+)
- **Database Engine**: [PostgreSQL](https://www.postgresql.org/) v18 (serta container Docker `postgres:16-alpine`)
- **Object-Relational Mapping (ORM)**: [TypeORM](https://typeorm.io/) v1.1.2 melalui `@nestjs/typeorm` v12.0.3
- **Validasi & Transformasi Payload**: `class-validator` v0.15.1 & `class-transformer` v0.5.1
- **Standar Protokol IETF**:
  - **RFC 9110**: Strong ETag SHA-1 40-hex (tanpa `W/`) dan evaluasi atomik `If-Match` (412 Precondition Failed)
  - **RFC 9457**: Format galat terstruktur `application/problem+json` via *Content Negotiation*
- **Dokumentasi API**: OpenAPI 3.0 / Swagger UI v5.0.1 melalui `@nestjs/swagger` v12.1.1
- **Automated Testing Suite**: [Vitest](https://vitest.dev/) v4.1.2 & [Supertest](https://github.com/ladjs/supertest) v7.0.0
- **Automated Collection Runner**: [Newman](https://www.npmjs.com/package/newman) v6.2.1
- **Linter & Code Formatter**: [Oxlint](https://oxc.rs/) v1.58.0 & [Prettier](https://prettier.io/) v3.4.2
- **Frontend Client**: Vanilla HTML5, CSS3 kustom (desain modern responsif, font Plus Jakarta Sans), dan JavaScript murni (ES6+ Fetch API) di folder [`public/`](public/)

---

## 📋 Pemetaan Resmi 7 Tugas Perkuliahan (UNISBANK E-Learning)

Berikut adalah pemetaan komprehensif antara judul resmi tugas dosen, implementasi kode sumber aktual, dokumen acuan, dan bukti tangkapan layar fisik:

| No | Tugas Resmi Dosen | Ruang Lingkup & Persyaratan Akademis | Implementasi dalam Proyek | Dokumen & Bukti Visual | Status |
|:---:|---|---|---|---|:---:|
| **1** | **Analisis Kebutuhan, PRD, ERD, Client-Server & Kontrak Endpoint** | • Analisis kebutuhan pustakawan lokal<br>• Pemisahan arsitektur Client-Server<br>• Minimal 3 resource & 5 endpoint<br>• ERD, kamus data, status codes, dan skenario error | 4 resource (`books`, `members`, `loans`, `dashboard`), 17 endpoint operations, diagram Three-Tier Client-Server, ERD teks & Mermaid di [`docs/PRD_ERD_API_CONTRACT.md`](docs/PRD_ERD_API_CONTRACT.md) | • Dokumen: [PRD_ERD_API_CONTRACT.md](docs/PRD_ERD_API_CONTRACT.md)<br>• Bukti: [Hasil Screen Shot/Tugas_01](Hasil%20Screen%20Shot/Tugas_01_Requirement_PRD_ERD/) (6 file) | **PASS (100%)** |
| **2** | **Karakteristik Protokol HTTP (Verbs, Headers, Status Codes, Caching & Idempotency)** | • 5 HTTP Verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`)<br>• Headers `Content-Type`, `Accept`, `ETag`<br>• Status code 200, 201, 400, 404, 409, 412<br>• Demonstrasi safe & idempotent methods | Interceptor global [`TransformInterceptor`](src/common/interceptors/transform.interceptor.ts) menghasilkan Strong ETag SHA-1; Controller mengimplementasikan 5 kata kerja HTTP lengkap | • Bukti: [T02_GET_Dashboard_200_OK.png](Hasil%20Screen%20Shot/Tugas_02_HTTP_Request_Response/T02_GET_Dashboard_200_OK.png)<br>• Koleksi: [Postman Collection](postman/perpus_uts_api.postman_collection.json) | **PASS (100%)** |
| **3** | **Prinsip Arsitektur REST, URI Berbasis Resource & Uniform Interface** | • Ketaatan 6 constraints REST<br>• URI berbasis kata benda jamak (*plural nouns*)<br>• Tidak ada kata kerja pada URI resource<br>• Standard response envelope seragam | Endpoint modular `/api/v1/books`, `/api/v1/members`, `/api/v1/loans`; standard envelope `{ statusCode, success, message, data, meta }` dan error envelope seragam | • Dokumen: [PRD_ERD_API_CONTRACT.md](docs/PRD_ERD_API_CONTRACT.md)<br>• Bukti: [Hasil Screen Shot/Tugas_03](Hasil%20Screen%20Shot/Tugas_03_REST_Principles_URI/) (5 file) | **PASS (100%)** |
| **4** | **Fitur Lanjutan REST API (Filtering, Pagination, Sorting, ETag, If-Match, RFC 9457)** | • Filtering multi-kolom & offset pagination<br>• Stable sorting dengan secondary tie-breaker<br>• Strong ETag & `If-Match` 412 (concurrency)<br>• Minimal 2 error Problem Details RFC 9457<br>• Strategi URI versioning `/api/v1` | [`PaginationQueryDto`](src/common/dto/pagination-query.dto.ts) dengan allowlist kolom & tie-breaker `id ASC`; evaluasi atomik `If-Match` dengan lock `pessimistic_write`; [`HttpExceptionFilter`](src/common/filters/http-exception.filter.ts) mendukung `application/problem+json` | • Dokumen: [PRD_ERD_API_CONTRACT.md](docs/PRD_ERD_API_CONTRACT.md)<br>• Bukti: [Hasil Screen Shot/Tugas_04](Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/) (14 file) | **PASS (100%)** |
| **5** | **Arsitektur Modular NestJS, Controller, Service, DTO, ValidationPipe & CRUD Testing** | • Pemisahan Controller, Service, DTO, Module<br>• Dependency Injection bersih<br>• Validasi DTO via `class-validator`<br>• Global `ValidationPipe`<br>• Minimal 3 pengujian CRUD | 4 modul domain (`BooksModule`, `MembersModule`, `LoansModule`, `DashboardModule`); validasi ketat `whitelist: true`, `forbidNonWhitelisted: true`; 5 screenshot pengujian CRUD | • Kode: [src/modules/](src/modules/)<br>• Bukti: [Hasil Screen Shot/Tugas_05](Hasil%20Screen%20Shot/Tugas_05_Implementasi_NestJS_CRUD/) (5 file) | **PASS (100%)** |
| **6** | **Pemodelan PostgreSQL, Migrasi TypeORM, Constraints, Transaksi ACID & Error Handling** | • Relasi 3 entitas (`books`, `members`, `loans`)<br>• Migrasi skema TypeORM terstruktur<br>• Minimal 3 check constraints basis data<br>• Transaksi atomik sirkulasi pinjam/kembali<br>• Penanganan error 400, 404, 409 | 5 Check Constraints PostgreSQL terpasang; Foreign Key `ON DELETE RESTRICT`; transaksi `DataSource.transaction` dengan row lock `pessimistic_write` menjamin invariant `totalCopies - availableCopies == activeLoans` | • Migrasi: [1715000000000-InitialLibrarySchema.ts](src/database/migrations/1715000000000-InitialLibrarySchema.ts)<br>• Bukti: [Hasil Screen Shot/Tugas_06](Hasil%20Screen%20Shot/Tugas_06_PostgreSQL_Validasi_Error/) (11 file) | **PASS (100%)** |
| **7** | **Dokumentasi OpenAPI/Swagger, Postman Collection, Automated Testing & Laporan Evaluasi** | • Dokumen OpenAPI 3.0 (JSON & YAML)<br>• Swagger UI interaktif di `/api/docs`<br>• Koleksi Postman v2.1 dengan script asersi<br>• Unit Testing terisolasi<br>• E2E Integration Testing pada database nyata<br>• Otomasi Newman Runner | OpenAPI JSON & YAML 100% ekuivalen; Swagger UI aktif; Postman memuat 22 requests & 48 asersi; **40 Unit Tests PASS, 33 E2E Tests PASS, 48 Newman Assertions PASS (0 Gagal)** | • OpenAPI: [openapi.json](docs/openapi.json) & [openapi.yaml](docs/openapi.yaml)<br>• Koleksi: [postman_collection.json](postman/perpus_uts_api.postman_collection.json)<br>• Matriks & Evaluasi: [TEST_MATRIX.md](docs/TEST_MATRIX.md), [TEST_EVALUATION.md](docs/TEST_EVALUATION.md)<br>• Bukti: [Hasil Screen Shot/Tugas_07](Hasil%20Screen%20Shot/Tugas_07_OpenAPI_Automated_Testing/) (5 file) | **PASS (100%)** |

---

## 🛡️ Arsitektur Isolasi Database & Pemeriksaan Konsistensi Baseline

Pengujian otomatis dirancang untuk menggunakan basis data pengujian terpisah guna mencegah modifikasi pada data demonstrasi pustakawan:

```
┌───────────────────────────────────────┐      ┌───────────────────────────────────────┐
│     DATABASE UTAMA (PRODUCTION/DEV)   │      │       DATABASE TESTING (ISOLATED)     │
│             perpus_uts_db             │      │          perpus_uts_test_db           │
├───────────────────────────────────────┤      ├───────────────────────────────────────┤
│ • Port Server: 3000                   │      │ • Port Server: 3001                   │
│ • Melayani: Web UI & Demonstrasi      │      │ • Melayani: Vitest E2E & Newman Test  │
│ • Target Operasional Pustakawan       │      │ • Direset saat pengujian otomatis     │
│ • Konfigurasi: .env                   │      │ • Konfigurasi: .env.test              │
└───────────────────────────────────────┘      └───────────────────────────────────────┘
```

### Mekanisme Isolasi Database Aktual:
1. **Konfigurasi Khusus Pengujian (`.env.test` & `src/database/typeorm-test.config.ts`)**:
   - Berkas `src/database/typeorm-test.config.ts` menetapkan parameter koneksi `database: 'perpus_uts_test_db'` secara eksplisit untuk eksekusi migrasi pengujian (`npm run migration:run:test`).
   - Berkas `.env.test` mengatur `PORT=3001`, `NODE_ENV=test`, dan `DB_NAME=perpus_uts_test_db`.
2. **Pengujian Integrasi E2E (`vitest.config.e2e.ts` & `test/library.e2e-spec.ts`)**:
   - `vitest.config.e2e.ts` menginjeksi environment variable `NODE_ENV: 'test'` dan `DB_NAME: 'perpus_uts_test_db'`.
   - Di dalam `test/library.e2e-spec.ts`, terdapat pemeriksaan pra-eksekusi (*pre-flight check*) yang memvalidasi bahwa `NODE_ENV === 'test'` dan `DB_NAME === 'perpus_uts_test_db'`, serta memeriksa nama basis data aktif sesi PostgreSQL (`SELECT current_database()`) sebelum menjalankan perintah `TRUNCATE TABLE` pada tahap setup pengujian.
3. **Automasi Pengujian Postman Newman (`scripts/run-newman-test.js`)**:
   - Skrip runner secara eksplisit membuat koneksi client `pg` dengan target `database: 'perpus_uts_test_db'` untuk membersihkan tabel sebelum pengujian, lalu menjalankan NestJS pada port 3001 dengan variabel lingkungan `DB_NAME: 'perpus_uts_test_db'`.
4. **Server Pengujian Manual (`scripts/start-test-server.js`)**:
   - Menjalankan NestJS pada port 3001 dengan memuat `.env.test` dan `DB_NAME: 'perpus_uts_test_db'` agar pengujian manual Postman dapat dilakukan tanpa memodifikasi database utama.

### Hasil Pemeriksaan Konsistensi Baseline Database Utama (`perpus_uts_db`):
Pemeriksaan berkala menggunakan skrip `node scripts/check-baseline-db.js` memverifikasi bahwa data pada database utama `perpus_uts_db` tetap konsisten dan tidak terganggu:
- **Buku**: 9 judul katalog (total 27 eksemplar fisik, 24 eksemplar tersedia).
- **Anggota**: 7 mahasiswa aktif terdaftar.
- **Peminjaman**: 6 transaksi historis (3 peminjaman berstatus `BORROWED` aktif).
- **Konsistensi Invariant**: **0 pelanggaran** (stok buku konsisten dengan peminjaman aktif: `27 - 24 = 3`).

*(Catatan Metodologis: Verifikasi integritas database utama diukur melalui query konsistensi baseline data, bukan melalui snapshot/hash biner tingkat storage engine).*

---

## 📂 Indeks Navigasi Dokumentasi & Artefak Akademik

Seluruh dokumentasi proyek tersusun rapi pada direktori [`docs/`](docs/), [`postman/`](postman/), dan [`Hasil Screen Shot/`](Hasil%20Screen%20Shot/):

### 1. Dokumen Perancangan & Spesifikasi
- 📄 [PRD, ERD, Arsitektur Client-Server, & Kontrak API](docs/PRD_ERD_API_CONTRACT.md) — Dokumen induk PRD, diagram Mermaid arsitektur 3-tier, ERD teks, kamus data, dan 17 spesifikasi endpoint.
- 📄 [Spesifikasi OpenAPI 3.0 (Format YAML)](docs/openapi.yaml) — Definisi resmi OpenAPI standar industri dalam format YAML.
- 📄 [Spesifikasi OpenAPI 3.0 (Format JSON)](docs/openapi.json) — Definisi resmi OpenAPI dalam format JSON (100% ekuivalen dengan versi YAML).
- 📄 [Spesifikasi OpenAPI untuk Postman Import](postman/openapi-spec.json) — Berkas spesifikasi OpenAPI siap impor pada aplikasi Postman.

### 2. Dokumen Pengujian & Evaluasi Kualitas
- 📄 [Matriks Pengujian Lengkap (Test Matrix)](docs/TEST_MATRIX.md) — Matriks pemetaan 25 skenario pengujian endpoint, parameter input, expected status, dan hasil verifikasi aktual.
- 📄 [Laporan Evaluasi Pengujian Akademik](docs/TEST_EVALUATION.md) — Laporan metodologi pengujian, analisis isolasi database, evaluasi kepatuhan REST, dan keterbatasan sistem formal.
- 📄 [Laporan Audit Akademik Akhir (Final Academic Audit)](docs/FINAL_ACADEMIC_AUDIT.md) — Laporan audit komparasi 7 tugas perkuliahan dan evaluasi kesiapan submisi.
- 📄 [Laporan Resolusi Kesenjangan (Remaining Gaps Resolution)](docs/REMAINING_GAPS.md) — Dokumentasi penuntasan seluruh temuan teknis (GAP-01 hingga GAP-04).
- 📄 [Struktur Master Laporan Akhir Tugas 1–7](docs/ACADEMIC_SUBMISSION_STRUCTURE.md) — Garis besar struktur penyusunan laporan tertulis untuk pengumpulan akademik.

### 3. Artefak Klien & Inventaris Bukti Visual
- 📄 [Koleksi Postman v2.1 Siap Impor](postman/perpus_uts_api.postman_collection.json) — 22 requests dengan 48 asersi pengujian otomatis `pm.test`.
- 📄 [Inventaris Rekonsiliasi Screenshot CSV](docs/SCREENSHOT_INVENTORY.csv) — Tabel rekonsiliasi 47 bukti fisik tangkapan layar dengan ukuran byte riil dan status verifikasi.
- 📄 [Panduan Penangkapan Bukti Manual](docs/MANUAL_SCREENSHOT_GUIDE.md) — Prosedur operasional pengambilan tangkapan layar pada Postman, Swagger UI, dan peramban web.
- 📄 [Manifest Pemetaan Bukti Komprehensif](docs/EVIDENCE_MANIFEST.md) — Pemetaan task-by-task seluruh bukti kode sumber, pengujian, dan visual.

### 4. Direktori Bukti Visual Fisik (`Hasil Screen Shot/`)
- 📁 [Tugas 01: Analisis Kebutuhan, PRD, ERD, Client-Server & Kontrak](Hasil%20Screen%20Shot/Tugas_01_Requirement_PRD_ERD/) *(6 screenshot)*
- 📁 [Tugas 02: Karakteristik Protokol HTTP, Verbs & Headers](Hasil%20Screen%20Shot/Tugas_02_HTTP_Request_Response/) *(1 screenshot)*
- 📁 [Tugas 03: Prinsip REST, Resource URI & Standard Envelope](Hasil%20Screen%20Shot/Tugas_03_REST_Principles_URI/) *(5 screenshot)*
- 📁 [Tugas 04: Fitur Lanjutan (Pagination, Search, ETag, Sorting, Problem Details)](Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/) *(14 screenshot)*
- 📁 [Tugas 05: Implementasi NestJS & Operasi CRUD Data Buku](Hasil%20Screen%20Shot/Tugas_05_Implementasi_NestJS_CRUD/) *(5 screenshot)*
- 📁 [Tugas 06: PostgreSQL Constraints, Validasi Galat & 6 Tahap Transaksi Sirkulasi](Hasil%20Screen%20Shot/Tugas_06_PostgreSQL_Validasi_Error/) *(11 screenshot)*
- 📁 [Tugas 07: OpenAPI Swagger UI, Hasil Unit Test, E2E Test & Newman](Hasil%20Screen%20Shot/Tugas_07_OpenAPI_Automated_Testing/) *(5 screenshot)*

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Sistem
- **Node.js**: v20+ atau v24+ (terverifikasi penuh pada Node.js v24.19.0).
- **npm**: v10+ atau v11+ (terverifikasi pada npm v11.17.0).
- **PostgreSQL**: PostgreSQL 18 lokal atau via Docker Compose.

### 2. Pengaturan Variabel Lingkungan
Salin berkas konfigurasi template:
```bash
cp .env.example .env
```
Sesuaikan parameter koneksi basis data pada berkas `.env`:
```env
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<password_postgresql_anda>
DB_NAME=perpus_uts_db
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

Untuk pengujian otomatis, salin atau pastikan berkas `.env.test` telah terkonfigurasi ke database khusus pengujian:
```env
PORT=3001
NODE_ENV=test
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<password_postgresql_anda>
DB_NAME=perpus_uts_test_db
DB_SYNCHRONIZE=false
DB_LOGGING=false
```

### 3. Menyiapkan Basis Data PostgreSQL

#### Opsi A: Menggunakan Docker Compose (Direkomendasikan)
```bash
docker compose up -d
```
Layanan PostgreSQL container akan aktif di port `5432` dengan database `perpus_uts_db`.

#### Opsi B: Menggunakan PostgreSQL Lokal
Buka shell `psql` atau pgAdmin, lalu buat dua basis data terpisah:
```sql
CREATE DATABASE perpus_uts_db;
CREATE DATABASE perpus_uts_test_db;
```

### 4. Eksekusi Migrasi & Pengisian Data Awal (Seeding)
Jalankan migrasi skema tabel DDL dan seeder data katalog:
```bash
# 1. Jalankan migrasi pada database utama
npm run migration:run

# 2. Jalankan migrasi pada database pengujian terisolasi
npm run migration:run:test

# 3. Masukkan data awal (9 buku, 7 anggota, 6 riwayat sirkulasi)
npm run seed
```

### 5. Memulai Server Backend NestJS
```bash
# Mode pengembangan (dengan auto hot-reload)
npm run start:dev

# Atau mode produksi
npm run build
npm run start:prod
```

Setelah server aktif, layanan dapat diakses melalui:
- **Antarmuka Web Pustakawan**: [`http://localhost:3000`](http://localhost:3000)
- **Dokumentasi Swagger UI**: [`http://localhost:3000/api/docs`](http://localhost:3000/api/docs)
- **Namespace Endpoint RESTful API**: [`http://localhost:3000/api/v1`](http://localhost:3000/api/v1)

Untuk pengujian manual Postman yang memodifikasi data secara aman di atas database pengujian:
```bash
# Menjalankan server pengujian port 3001 (terhubung ke perpus_uts_test_db)
npm run start:test
```

---

## 🧪 Panduan Menjalankan Pengujian Otomatis (Automated Testing)

Seluruh perintah pengujian disinkronkan langsung dengan script pada [`package.json`](package.json):

```bash
# 1. Menjalankan Unit Testing (40 kasus uji unit logika & utilitas)
npm test

# 2. Menjalankan E2E Integration Testing (33 kasus uji integrasi HTTP di atas perpus_uts_test_db)
npm run test:e2e

# 3. Menjalankan Newman Automated Postman Collection Runner (25 requests, 48 asersi)
npm run test:newman

# 4. Memeriksa cakupan kode pengujian (Code Coverage)
npm run test:cov

# 5. Menjalankan linter kode berkecepatan tinggi (Oxlint)
npm run lint

# 6. Memeriksa konsistensi baseline stok database utama
node scripts/check-baseline-db.js
```

---

## 🌐 Katalog 17 Endpoint Operations RESTful API (`/api/v1`)

| HTTP Method | URI Endpoint | Parameter / Payload | HTTP Status Code | Deskripsi & Aturan Bisnis |
|:---:|---|---|:---:|---|
| `GET` | `/api/v1/dashboard/summary` | *None* | `200 OK` | Mengambil ringkasan statistik koleksi, anggota, dan sirkulasi aktif. |
| `GET` | `/api/v1/books` | Query: `page`, `limit`, `search`, `sortBy`, `order` | `200 OK` | Mengambil katalog buku terpaginasi dengan sorting stabil & Strong ETag. |
| `POST` | `/api/v1/books` | Body: `CreateBookDto` (`title`, `author`, `isbn?`, `totalCopies`) | `201 Created` / `400` | Menambah judul buku baru; `availableCopies` diset sama dengan `totalCopies`. |
| `GET` | `/api/v1/books/:id` | Path: `id` (UUID v4) | `200 OK` / `404` | Mengambil detail spesifik satu buku berdasarkan ID beserta header ETag. |
| `PUT` | `/api/v1/books/:id` | Path: `id`, Header: `If-Match?`, Body: `UpdateBookDto` | `200 OK` / `400` / `404` / `412` | Memperbarui seluruh data buku; menolak update serentak jika ETag usang (412). |
| `PATCH` | `/api/v1/books/:id` | Path: `id`, Header: `If-Match?`, Body: `UpdateBookDto` | `200 OK` / `400` / `404` / `412` | Memperbarui sebagian atribut buku secara kondisional. |
| `DELETE` | `/api/v1/books/:id` | Path: `id` (UUID v4) | `200 OK` / `400` / `404` | Menghapus buku; ditolak jika masih terdapat transaksi peminjaman aktif. |
| `GET` | `/api/v1/members` | Query: `page`, `limit`, `search`, `sortBy`, `order` | `200 OK` | Mengambil daftar anggota terpaginasi dengan header Strong ETag. |
| `POST` | `/api/v1/members` | Body: `CreateMemberDto` (`name`, `nim`, `email?`) | `201 Created` / `400` / `409` | Mendaftarkan anggota baru; menolak NIM duplikat dengan HTTP 409 Conflict. |
| `GET` | `/api/v1/members/:id` | Path: `id` (UUID v4) | `200 OK` / `404` | Mengambil profil anggota lengkap dengan riwayat peminjaman bukunya. |
| `PUT` | `/api/v1/members/:id` | Path: `id`, Header: `If-Match?`, Body: `UpdateMemberDto` | `200 OK` / `400` / `404` / `412` | Memperbarui profil lengkap anggota secara kondisional. |
| `PATCH` | `/api/v1/members/:id` | Path: `id`, Header: `If-Match?`, Body: `UpdateMemberDto` | `200 OK` / `400` / `404` / `412` | Memperbarui sebagian data anggota secara kondisional. |
| `DELETE` | `/api/v1/members/:id` | Path: `id` (UUID v4) | `200 OK` / `400` / `404` | Menghapus data anggota; ditolak jika anggota sedang meminjam buku. |
| `GET` | `/api/v1/loans` | Query: `status`, `memberId`, `bookId`, `page`, `limit`, `sortBy`, `order` | `200 OK` | Mengambil daftar riwayat transaksi sirkulasi peminjaman. |
| `POST` | `/api/v1/loans` | Body: `CreateLoanDto` (`bookId`, `memberId`, `loanDate?`, `dueDate?`, `notes?`) | `201 Created` / `400` / `404` | **Transaksi Atomik Pinjam**: Memvalidasi stok (`availableCopies > 0`), mengunci baris data buku via `pessimistic_write`, mengurangi stok buku (-1), dan menerbitkan tiket loan `BORROWED`. |
| `GET` | `/api/v1/loans/:id` | Path: `id` (UUID v4) | `200 OK` / `404` | Mengambil rincian spesifik satu transaksi peminjaman. |
| `PATCH` | `/api/v1/loans/:id/return` | Path: `id` (UUID v4) | `200 OK` / `400` / `404` | **Transaksi Atomik Kembali**: Memvalidasi status `BORROWED`, mengubah status menjadi `RETURNED`, mencatat `returnDate`, dan menambah stok buku (+1). |

---

## 🏛️ Format Representasi Data & Penanganan Galat

### 1. Standard Success Envelope (Uniform Interface)
Setiap respons sukses mengembalikan format amplop seragam:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Resource fetched successfully",
  "data": { ... },
  "meta": {
    "total": 9,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 2. Standard Error Envelope (Legacy / Default Clients)
```json
{
  "statusCode": 404,
  "success": false,
  "message": "Book with ID 00000000-0000-0000-0000-000000000000 not found",
  "error": "Not Found",
  "timestamp": "2026-11-08T00:00:00.000Z",
  "path": "/api/v1/books/00000000-0000-0000-0000-000000000000"
}
```

### 3. RFC 9457 Problem Details Envelope (`Accept: application/problem+json`)
Ketika klien mengirimkan header `Accept: application/problem+json`, backend merespons dengan standar IETF RFC 9457:
```json
{
  "type": "https://httpstatuses.com/409",
  "title": "Conflict",
  "status": 409,
  "detail": "Member with NIM NIM908268 already exists",
  "instance": "/api/v1/members"
}
```

---

## 📜 Lisensi & Catatan Akademis

Proyek ini dikembangkan secara mandiri untuk tujuan evaluasi akademik mata kuliah RESTful API. Seluruh logika transaksi dan kendali konkurensi diimplementasikan secara asli tanpa menggunakan bypass fiktif atau pustaka in-memory pengganti.
