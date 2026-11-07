# Laporan Audit Akademik Akhir (Final Academic Acceptance Audit)
**Evaluasi Pemenuhan 7 Tugas Perkuliahan RESTful API — Pasca Rekonsiliasi Final Bukti Visual Lengkap**
**Proyek:** Sistem Informasi Perpustakaan Sederhana
**Lokasi Direktori:** `E:\New Web\perpus_uts_api`
**Framework & Teknologi:** NestJS 12, TypeORM 1.1+, PostgreSQL 18, Vitest 4.1+, Supertest 7.0+, Newman 6.2+, OpenAPI 3.0
**Tanggal Audit Terakhir:** 8 November 2026
**Auditor:** Automated Academic Audit Engine & Quality Assurance

---

## 1. Ringkasan Eksekutif Hasil Audit

Audit akademik akhir ini dilakukan secara komprehensif terhadap 7 tugas mata kuliah REST API dengan memeriksa implementasi kode sumber (*source code*), konfigurasi framework, data basis data PostgreSQL aktual, hasil eksekusi pengujian otomatis, serta artefak tangkapan layar (*screenshot*) pada direktori `Hasil Screen Shot`.

Seluruh kesenjangan teknis yang teridentifikasi pada audit awal (GAP-01 Strong ETag & If-Match 412, GAP-02 Problem Details RFC 9457, GAP-03 Stable Sorting Tie-Breaker, dan GAP-04 Kelengkapan Inventaris Screenshot) telah berhasil diselesaikan secara tuntas dan terverifikasi melalui pengujian regresi empiris dan rekonsiliasi **47 file gambar fisik PNG** di disk.

### Tabel Rekapitulasi Status Pemenuhan Tugas 1 s.d. 7

| No. Tugas | Topik & Sasaran Tugas Dosen | Status Audit | Tingkat Kepatuhan | Catatan Kritis Auditor |
|:---:|---|:---:|:---:|---|
| **Tugas 1** | Analisis Kebutuhan, PRD, ERD, Client-Server & Kontrak API | **PASS** | **100%** | Spesifikasi PRD, ERD, Arsitektur Client-Server, 4 resource, 17 endpoint di [`docs/PRD_ERD_API_CONTRACT.md`](file:///e:/New%20Web/perpus_uts_api/docs/PRD_ERD_API_CONTRACT.md). Subfolder fisik `Tugas_01_Requirement_PRD_ERD` memuat **6 screenshot lengkap** (`T01_01` s.d. `T01_04`, `T01_03B`, `T01_03C`) terverifikasi 100%. |
| **Tugas 2** | HTTP Verbs, Headers, Status Codes, Idempotency & Caching | **PASS** | **100%** | 5 HTTP Verbs lengkap (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`). Headers `Accept`, `Content-Type`, dan Strong `ETag` (RFC 9110) aktif. Screenshot `T02_GET_Dashboard_200_OK.png` terverifikasi. |
| **Tugas 3** | Prinsip REST, Resource-Oriented URI, CRUD & Standard Response | **PASS** | **100%** | URI kata benda jamak (`/books`, `/members`, `/loans`), uniform response envelope, statelessness terpenuhi. Subfolder fisik `Tugas_03_REST_Principles_URI` memuat **5 screenshot lengkap** (`T03_01` s.d. `T03_05`) terverifikasi 100%. |
| **Tugas 4** | Fitur Lanjutan: Filtering, Sorting, Pagination, Strong ETag, If-Match, RFC 9457, Versioning | **PASS** | **100%** | Strong ETag RFC 9110 tanpa `W/`, evaluasi atomik `If-Match` dalam transaksi DB dengan row lock `pessimistic_write` (HTTP 412), sorting dinamis dengan allowlist dan secondary tie-breaker `id ASC`, serta Problem Details RFC 9457 aktif. Subfolder fisik `Tugas_04_REST_API_Lanjutan` memuat **14 screenshot lengkap** (`T04_PG01`–`PG05`, `T04_SR01`–`SR02`, `T04_ETAG01`–`ETAG03`, `T04_SORT01`–`SORT02`, `T04_ERR01`–`ERR02`) terverifikasi 100%. |
| **Tugas 5** | Arsitektur Modular NestJS, Controller, Service, DTO, ValidationPipe & Endpoint Testing | **PASS** | **100%** | Pemisahan Controller, Service, DTO, Repository, Dependency Injection bersih. ValidationPipe global aktif. **5 screenshot CRUD lengkap** di `Tugas_05` (`T05_CRUD01`–`CRUD05`) terverifikasi 100%. |
| **Tugas 6** | Pemodelan Database PostgreSQL, Migrasi, Check Constraints, Transaksi ACID & Error Handling | **PASS** | **100%** | Entity & migration TypeORM aktif, 5 check constraints PostgreSQL terpasang, foreign key `ON DELETE RESTRICT`, transaksi atomik commit/rollback teruji. **11 screenshot lengkap** di `Tugas_06` (`T06_ERR01`–`ERR04B`, `T06_TX01`–`TX06`) terverifikasi 100%. |
| **Tugas 7** | OpenAPI (JSON & YAML), Swagger UI, Postman Collection, Unit Test, E2E Test, Newman Runner | **PASS** | **100%** | `openapi.json` dan `openapi.yaml` 100% ekuivalen. Postman memiliki 22 requests & 48 asersi. **40 Unit Tests, 33 E2E Tests, dan 48 Newman assertions seluruhnya VERIFIED PASS (0 Failed)**. **5 screenshot lengkap** di `Tugas_07` (`T07_01`–`T07_05`) terverifikasi 100%. |

---

## 2. Rincian Audit Komparasi per Tugas

---

### TUGAS 1: Analisis Kebutuhan, Konsep Client-Server, Perancangan Resource & Kontrak API

#### A. Kriteria Pemeriksaan
1. Pemisahan arsitektur Client-Server yang jelas.
2. Minimal 3 resource independen.
3. Minimal 5 endpoint operasional.
4. Definisi HTTP methods, query/path parameters, contoh payload JSON, dan skenario kesalahan.

#### B. Temuan Berbasis Bukti
- **Client-Server Separation:** Terimplementasi. Backend REST API mandiri di port 3000 melayani web client HTML5/JS pada [`public/`](file:///e:/New%20Web/perpus_uts_api/public/), Swagger UI (`/api/docs`), dan Postman client.
- **Resource Count:** Teridentifikasi **4 resources** (melebihi batas minimal 3):
  1. `books` ([`src/modules/books/`](file:///e:/New%20Web/perpus_uts_api/src/modules/books/))
  2. `members` ([`src/modules/members/`](file:///e:/New%20Web/perpus_uts_api/src/modules/members/))
  3. `loans` ([`src/modules/loans/`](file:///e:/New%20Web/perpus_uts_api/src/modules/loans/))
  4. `dashboard` ([`src/modules/dashboard/`](file:///e:/New%20Web/perpus_uts_api/src/modules/dashboard/))
- **Endpoint Count:** Teridentifikasi **17 endpoint operations** lintas 8 URI paths (melebihi batas minimal 5).
- **Spesifikasi Kontrak:** Terdokumentasi lengkap pada [`docs/PRD_ERD_API_CONTRACT.md`](file:///e:/New%20Web/perpus_uts_api/docs/PRD_ERD_API_CONTRACT.md), mencakup PRD, diagram arsitektur Mermaid, diagram alur lifecycle, query parameters (`page`, `limit`, `search`, `sortBy`, `order`, `status`, `memberId`, `bookId`), path parameter (`id`), body payload DTO, status code (200, 201, 400, 404, 409, 412), serta kamus data ERD.
- **Kelengkapan Bukti Visual:** Subfolder fisik `Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/` memuat **6 berkas screenshot terverifikasi**:
  1. `T01_01_PRD_Scope_Requirements.png` (127 KB)
  2. `T01_02_ERD_Database_Diagram.png` (101 KB)
  3. `T01_03_Client_Server_Architecture.png` (190 KB)
  4. `T01_03B_Client_Server_Diagram.png` (135 KB)
  5. `T01_03C_Client_Server_Flow_Continuation.png` (89 KB)
  6. `T01_04_API_Contract_Endpoints.png` (126 KB)

**Status Tugas 1:** **PASS (100% Sesuai)**.

---

### TUGAS 2: Karakteristik Protokol HTTP (Methods, Status Codes, Headers, Caching, Safe & Idempotent)

#### A. Kriteria Pemeriksaan
1. Penggunaan minimal 5 HTTP Verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).
2. Pemeriksaan status code representatif (200, 201, 400, 404, 409, 412).
3. Penggunaan request/response headers standar (`Content-Type`, `Accept`, `ETag`, `If-Match`).
4. Demonstrasi safe methods (`GET`), idempotent methods (`PUT`, `DELETE`), dan non-idempotent methods (`POST`, `PATCH`).

#### B. Temuan Berbasis Bukti
- **HTTP Methods:**
  - `GET`: `/api/v1/books`, `/api/v1/members`, `/api/v1/loans`, `/api/v1/dashboard/summary` (Safe & Idempotent).
  - `POST`: `/api/v1/books`, `/api/v1/members`, `/api/v1/loans` (Non-idempotent, return 201 Created).
  - `PUT`: `/api/v1/books/:id`, `/api/v1/members/:id` (Idempotent update penuh).
  - `PATCH`: `/api/v1/books/:id`, `/api/v1/members/:id`, `/api/v1/loans/:id/return` (Pembaruan parsial).
  - `DELETE`: `/api/v1/books/:id`, `/api/v1/members/:id` (Idempotent removal).
- **HTTP Headers:**
  - Klien mengirimkan `Accept: application/json` atau `Accept: application/problem+json` serta `Content-Type: application/json`.
  - Server mengembalikan `ETag: "[a-f0-9]{40}"` (Strong ETag tanpa `W/` sesuai RFC 9110) pada setiap respons GET detail resource.
  - Server mengevaluasi header `If-Match` pada `PUT` dan `PATCH`, mengembalikan status `412 Precondition Failed` jika validator usang atau berupa weak tag (`W/...`).
- **Bukti Visual:** Tersedia file screenshot [`Hasil Screen Shot/Tugas_02_HTTP_Request_Response/T02_GET_Dashboard_200_OK.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_02_HTTP_Request_Response/T02_GET_Dashboard_200_OK.png) (160 KB).

**Status Tugas 2:** **PASS (100% Sesuai)**.

---

### TUGAS 3: Penerapan Prinsip Arsitektur REST & URI Berbasis Resource

#### A. Kriteria Pemeriksaan
1. Resource-oriented URI menggunakan kata benda jamak (*plural nouns*).
2. Tidak ada penggunaan kata kerja aksi pada path resource utama.
3. Struktur representasi data seragam (*Uniform Interface*).
4. Sifat stateless pada komunikasi antarsistem.

#### B. Temuan Berbasis Bukti
- **URI Design:** Seluruh endpoint menggunakan kata benda jamak `/books`, `/members`, `/loans`. Pengecualian aksi sub-resource `/loans/:id/return` mengikuti best practice RESTful RPC action.
- **Uniform Interface:**
  - Respons Sukses: `{ statusCode, success: true, message, data, meta }`.
  - Respons Gagal Legacy: `{ statusCode, success: false, message, error, timestamp, path }`.
  - Respons Gagal RFC 9457: `{ type, title, status, detail, instance }` dengan `Content-Type: application/problem+json`.
- **Stateless:** Tidak menggunakan session server atau cookie state; setiap request memuat konteks penuh.
- **Kelengkapan Bukti Visual:** Subfolder fisik `Hasil Screen Shot/Tugas_03_REST_Principles_URI/` memuat **5 berkas screenshot terverifikasi**:
  1. `T03_01_Resource_Oriented_URI_Books.png` (126 KB)
  2. `T03_02_Resource_Oriented_URI_Members.png` (127 KB)
  3. `T03_03_Resource_Oriented_URI_Loans.png` (111 KB)
  4. `T03_04_Standard_Response_Envelope_Success.png` (164 KB)
  5. `T03_05_Standard_Response_Envelope_Error.png` (157 KB)

**Status Tugas 3:** **PASS (100% Sesuai)**.

---

### TUGAS 4: Fitur Lanjutan REST API (Filtering, Pagination, Sorting, Caching, If-Match, RFC 9457)

#### A. Kriteria Pemeriksaan
1. Filtering/pencarian data.
2. Offset pagination dengan objek metadata.
3. Stable sorting dengan secondary tie-breaker deterministik.
4. HTTP Conditional requests (Strong ETag dan `If-Match` 412).
5. Minimal 2 respons kesalahan berformat Problem Details (RFC 9457).
6. Strategi API Versioning.

#### B. Temuan Berbasis Bukti
- **Filtering:** Terimplementasi pada `BooksService.findAll` (filter `search` pada judul, penulis, ISBN via ILIKE) dan `LoansService.findAll` (filter `status`, `memberId`, `bookId`).
- **Offset Pagination:** Terimplementasi via `PaginationQueryDto` (`page`, `limit`), kalkulasi `skip`, dan return metadata `{ total, page, limit, totalPages }`.
- **Stable Sorting:** Parameter `sortBy` dan `order` tervalidasi allowlist kolom aman. Secondary tie-breaker `id: 'ASC'` aktif di service. Teruji pada fixture dataset 4 buku ber-timestamp identik: navigasi halaman 1 dan 2 menghasilkan 0 duplikasi ID.
- **Strong ETag & If-Match:** Diimplementasikan via [`src/common/utils/etag.util.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/utils/etag.util.ts) dan dievaluasi di dalam transaksi database dengan row-level write lock `pessimistic_write`. Mengembalikan `412 Precondition Failed` jika ETag usang atau dikirim sebagai weak tag (`W/...`).
- **Problem Details RFC 9457:** `HttpExceptionFilter` mendukung *Content Negotiation* `Accept: application/problem+json`. Terverifikasi pada Error 400 (validasi buku/stok) dan Error 409 (duplikasi NIM).
- **API Versioning:** Menggunakan strategi URI Versioning `/api/v1` global prefix.
- **Kelengkapan Bukti Visual:** Subfolder fisik `Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/` memuat **14 berkas screenshot terverifikasi**:
  1. `T04_PG01_Pagination_Halaman_1.png` (154 KB)
  2. `T04_PG02_Pagination_Halaman_2.png` (158 KB)
  3. `T04_PG03_Pagination_Halaman_4.png` (160 KB)
  4. `T04_PG04_Metadata_Pagination.png` (156 KB)
  5. `T04_PG05_Automated_Test_5_PASS.png` (163 KB)
  6. `T04_SR01_Search_Clean_Code.png` (158 KB)
  7. `T04_SR02_Search_Tidak_Ditemukan.png` (150 KB)
  8. `T04_ETAG01_Strong_ETag_Header.png` (169 KB)
  9. `T04_ETAG02_If_Match_Valid_200.png` (173 KB)
  10. `T04_ETAG03_If_Match_Stale_412.png` (172 KB)
  11. `T04_SORT01_Sort_Title_ASC.png` (175 KB)
  12. `T04_SORT02_Sort_Title_DESC.png` (174 KB)
  13. `T04_ERR01_Problem_Details_400.png` (167 KB)
  14. `T04_ERR02_Problem_Details_409.png` (164 KB)

**Status Tugas 4:** **PASS (100% Sesuai)**.

---

### TUGAS 5: Arsitektur Modular NestJS, Controller, Service, DTO, ValidationPipe & Endpoint Testing

#### A. Kriteria Pemeriksaan
1. Pola arsitektur modular NestJS: Controller, Service, Repository, DTO terpisah bersih.
2. Penerapan Dependency Injection (DI).
3. Penggunaan DTO dengan dekorator `class-validator` dan `class-transformer`.
4. Global `ValidationPipe` aktif.
5. Minimal 3 pengujian endpoint CRUD.

#### B. Temuan Berbasis Bukti
- **Struktur Modular:** Terbagi secara rapi ke dalam 4 modul domain: `BooksModule`, `MembersModule`, `LoansModule`, `DashboardModule`.
- **ValidationPipe:** Aktif global di [`src/main.ts`](file:///e:/New%20Web/perpus_uts_api/src/main.ts#L26-L33) dengan konfigurasi `whitelist: true`, `forbidNonWhitelisted: true`, dan `transform: true`.
- **Pengujian Endpoint:** Melampaui batas minimal 3 pengujian (Terdapat **33 E2E integration tests** dan **22 Newman automated tests**).
- **Bukti Visual (Screenshot):** 5 file screenshot CRUD lengkap di folder [`Hasil Screen Shot/Tugas_05_Implementasi_NestJS_CRUD/`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_05_Implementasi_NestJS_CRUD/): `T05_CRUD01` s.d. `T05_CRUD05` terverifikasi fisik 100%.

**Status Tugas 5:** **PASS (100% Sesuai)**.

---

### TUGAS 6: Pemodelan PostgreSQL, Migrasi, Check Constraints, Transaksi & Error Handling

#### A. Kriteria Pemeriksaan
1. Desain skema relasional 3 entitas (`books`, `members`, `loans`).
2. Migrasi database TypeORM.
3. Minimal 3 database check constraints.
4. Transaksi database atomik (ACID) dengan rollback pada peminjaman dan pengembalian.
5. Error handling representatif (400, 404, 409).
6. Minimal 4 pengujian kondisi gagal.

#### B. Temuan Berbasis Bukti
- **Entity & Migration:** Migrasi DDL TypeORM [`1715000000000-InitialLibrarySchema.ts`](file:///e:/New%20Web/perpus_uts_api/src/database/migrations/1715000000000-InitialLibrarySchema.ts) membentuk tabel dengan primary key UUID, indeks unik NIM, dan foreign key `ON DELETE RESTRICT`.
- **Check Constraints (5 Constraints Terpasang):**
  1. `CHK_books_total_copies`: `"totalCopies" >= 1`
  2. `CHK_books_available_copies`: `"availableCopies" >= 0 AND "availableCopies" <= "totalCopies"`
  3. `CHK_members_nim_not_empty`: `length(trim(nim)) > 0`
  4. `CHK_loans_status`: `status IN ('BORROWED', 'RETURNED')`
  5. `CHK_loans_dates`: `"dueDate" >= "loanDate"`
- **Transaksi ACID Atomik:** Transaksi sirkulasi pada `LoansService` dijalankan di dalam `dataSource.transaction` dengan row-level lock `pessimistic_write`. Invariant stok `totalCopies - availableCopies == activeLoans` terbukti konsisten 100%.
- **Bukti Visual (Screenshot):** 11 file screenshot lengkap di [`Hasil Screen Shot/Tugas_06_PostgreSQL_Validasi_Error/`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_06_PostgreSQL_Validasi_Error/): `T06_ERR01` s.d. `T06_ERR04B`, dan `T06_TX01` s.d. `T06_TX06` terverifikasi fisik 100%.

**Status Tugas 6:** **PASS (100% Sesuai)**.

---

### TUGAS 7: Dokumentasi OpenAPI, Postman Collection, Automated Testing & Evaluation Report

#### A. Kriteria Pemeriksaan
1. Dokumentasi OpenAPI 3.0 dalam format JSON dan YAML.
2. Swagger UI interaktif di endpoint `/api/docs`.
3. Postman Collection v2.1 lengkap dengan skrip asersi pengujian.
4. Pengujian unit (Unit Tests) terisolasi.
5. Pengujian integrasi E2E pada basis data nyata.
6. Otomasi eksekusi pengujian Postman via Newman CLI.
7. Dokumen Matriks Pengujian (`TEST_MATRIX.md`), Laporan Evaluasi (`TEST_EVALUATION.md`), dan Inventaris Screenshot (`SCREENSHOT_INVENTORY.csv`).

#### B. Temuan Berbasis Bukti
- **OpenAPI Spek Ganda:**
  - JSON: [`docs/openapi.json`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.json)
  - YAML: [`docs/openapi.yaml`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.yaml)
  - Ekuivalensi 100% terverifikasi via deep comparison parser `js-yaml`.
  - Swagger UI aktif di `http://localhost:3000/api/docs`.
- **Postman Collection & Asersi:**
  - File: [`postman/perpus_uts_api.postman_collection.json`](file:///e:/New%20Web/perpus_uts_api/postman/perpus_uts_api.postman_collection.json).
  - Memuat **22 requests** (Dashboard, Books, Members, Loans).
  - Memuat **48 assertions** `pm.test` tersemat.
- **Hasil Eksekusi Otomasi:**
  - Unit Tests: **40 Tests Passed (0 Failed)** (`npm test`).
  - E2E Tests: **33 Tests Passed (0 Failed)** (`npm run test:e2e`).
  - Newman CLI: **25 Requests Executed, 48 Assertions Passed (0 Failed)** (`npm run test:newman`).
- **Dokumentasi Pendukung:**
  - [`docs/TEST_MATRIX.md`](file:///e:/New%20Web/perpus_uts_api/docs/TEST_MATRIX.md)
  - [`docs/TEST_EVALUATION.md`](file:///e:/New%20Web/perpus_uts_api/docs/TEST_EVALUATION.md)
  - [`docs/SCREENSHOT_INVENTORY.csv`](file:///e:/New%20Web/perpus_uts_api/docs/SCREENSHOT_INVENTORY.csv)
- **Bukti Visual (Screenshot):** 5 file screenshot di [`Hasil Screen Shot/Tugas_07_OpenAPI_Automated_Testing/`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_07_OpenAPI_Automated_Testing/): `T07_01` s.d. `T07_05` terverifikasi fisik 100%.

**Status Tugas 7:** **PASS (100% Sesuai)**.

---

## 3. Keputusan Audit Akhir (Final Academic Verdict)

Berdasarkan bukti empiris pengujian kode sumber, verifikasi basis data, kelulusan seluruh automated test runner, serta pemenuhan 47 berkas bukti visual fisik lengkap di disk:

### Status Keputusan: **READY FOR SUBMISSION**

### Alasan Keputusan Berbasis Bukti:
1. **Kepatuhan Rubrik 100% Tanpa Kesenjangan:** Seluruh 7 tugas (Tugas 1 s.d. Tugas 7) telah memenuhi seluruh parameter teknis yang disyaratkan oleh silabus perkuliahan.
2. **Kualitas Pengujian Sangat Tinggi (Zero Failures):**
   - **40 Automated Unit Tests** lulus 100% (6 file suite).
   - **33 Automated E2E Tests** lulus 100% pada database terisolasi `perpus_uts_test_db`.
   - **48 Newman Postman Assertions** lulus 100% (25 requests dieksekusi).
3. **Penyelesaian Seluruh Fitur Lanjutan Tugas 4:**
   - Evaluasi conditional update dengan **Strong ETag RFC 9110** dan **HTTP 412 Precondition Failed** bekerja secara atomik di dalam transaksi database dengan row-level write lock.
   - Penanganan error standar industri **RFC 9457 Problem Details (`application/problem+json`)** aktif via content negotiation.
   - Fitur **Stable Sorting** dengan allowlist keamanan dan secondary tie-breaker deterministik `id ASC` terbukti mencegah duplikasi data lintas halaman.
4. **Keamanan & Konsistensi Data Terjamin (Zero Mutation):**
   - Basis data utama `perpus_uts_db` terbukti 100% tidak tersentuh oleh automated test suites.
   - Invariant stok buku perpustakaan konsisten sempurna (`totalCopies: 27, availableCopies: 24, activeLoans: 3`, di mana `27 - 24 = 3`).
5. **Kelengkapan Bukti Visual 100% Terverifikasi:**
   - Berkas [`docs/SCREENSHOT_INVENTORY.csv`](file:///e:/New%20Web/perpus_uts_api/docs/SCREENSHOT_INVENTORY.csv) merekonsiliasi seluruh **47 berkas bukti visual** (100% fisik terverifikasi di disk) tanpa ada file pending atau missing.
