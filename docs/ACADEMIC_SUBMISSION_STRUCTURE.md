# Struktur Laporan Tugas Akademik 1 s.d. 7 (Master Academic Submission Structure)
**Mata Kuliah:** Rekayasa Web / Pengembangan RESTful API
**Topik Tugas:** Sistem Informasi Perpustakaan Sederhana
**Lokasi Direktori:** `E:\New Web\perpus_uts_api`
**Status Evaluasi:** **READY FOR SUBMISSION** (Seluruh kode, pengujian, dan dokumentasi telah disinkronkan)

---

## Daftar Isi Laporan Akhir

- **BAGIAN I: IDENTITAS & RINGKASAN EKSEKUTIF**
  - 1.1 Data Mahasiswa & Mata Kuliah
  - 1.2 Ringkasan Proyek & Ruang Lingkup Sistem
  - 1.3 Matriks Rekapitulasi Pemenuhan Tugas 1–7
- **BAGIAN II: TUGAS 1 — ANALISIS KEBUTUHAN, PRD, ERD, & KONTRAK API**
  - 2.1 Analisis Kebutuhan Sistem Perpustakaan
  - 2.2 Arsitektur Client-Server & Pemisahan Komponen
  - 2.3 Pemodelan Data Relasional (ERD & Kamus Data)
  - 2.4 Matriks Kontrak 17 Endpoint Operations
- **BAGIAN III: TUGAS 2 — PROTOKOL HTTP, VERBS, HEADERS, STATUS CODES, & CACHING**
  - 3.1 Implementasi 5 HTTP Verbs (GET, POST, PUT, PATCH, DELETE)
  - 3.2 Analisis Safe Methods & Idempotency
  - 3.3 Standarisasi Request & Response Headers (Content-Type, Accept, ETag, If-Match)
  - 3.4 Klasifikasi HTTP Status Codes (200, 201, 400, 404, 409, 412)
- **BAGIAN IV: TUGAS 3 — PRINSIP ARSITEKTUR REST & UNIFORM INTERFACE**
  - 4.1 Pemenuhan 6 Constraints Arsitektur REST
  - 4.2 Perancangan Resource-Oriented URI Berbasis Kata Benda Jamak
  - 4.3 Standardisasi Format Envelope Respons Sukses & Gagal
- **BAGIAN V: TUGAS 4 — FITUR LANJUTAN REST API**
  - 5.1 Strategi API Versioning (`/api/v1`)
  - 5.2 Filtering Multi-Kolom & Offset Pagination
  - 5.3 Stable Dynamic Sorting dengan Allowlist & Secondary Tie-Breaker `id ASC`
  - 5.4 Strong ETag RFC 9110 & Evaluasi Atomik If-Match (412 Precondition Failed)
  - 5.5 Penanganan Error Standar RFC 9457 Problem Details (`application/problem+json`)
- **BAGIAN VI: TUGAS 5 — ARSITEKTUR MODULAR NESTJS, CONTROLLER, SERVICE, & DTO**
  - 6.1 Struktur Modul & Dependency Injection (Books, Members, Loans, Dashboard)
  - 6.2 Data Transfer Object (DTO) & Global ValidationPipe
  - 6.3 Pengujian Endpoint CRUD
- **BAGIAN VII: TUGAS 6 — PEMODELAN POSTGRESQL, MIGRATION, CONSTRAINTS, & TRANSAKSI**
  - 7.1 Entity & DDL Migration TypeORM
  - 7.2 Penerapan 5 Database Check Constraints & Foreign Keys
  - 7.3 Transaksi ACID Atomik Sirkulasi Stok dengan Row-Level Lock `pessimistic_write`
  - 7.4 Penanganan Eksepsi & Error Handling Representatif (400, 404, 409)
- **BAGIAN VIII: TUGAS 7 — DOKUMENTASI OPENAPI, POSTMAN, & AUTOMATED TESTING**
  - 8.1 Dokumentasi OpenAPI 3.0 Format Ganda (JSON & YAML 100% Ekuivalen)
  - 8.2 Swagger UI Interaktif (`/api/docs`)
  - 8.3 Koleksi Postman v2.1 & Otomasi Eksekusi Newman Runner (25 requests, 48 asersi)
  - 8.4 Hasil Pengujian Unit Terotomasi Vitest (40 Passed)
  - 8.5 Hasil Pengujian Integrasi E2E Supertest (33 Passed)
  - 8.6 Arsitektur Isolasi Database (`perpus_uts_test_db`) & Garansi Zero Mutation (`perpus_uts_db`)
- **BAGIAN IX: LAMPIRAN & MANIFEST BUKTI VISUAL**
  - 9.1 Inventarisasi Screenshot Resmi (`SCREENSHOT_INVENTORY.csv`)
  - 9.2 Panduan Pengambilan Bukti Manual (`MANUAL_SCREENSHOT_GUIDE.md`)
  - 9.3 Matriks Pengujian Lengkap (`TEST_MATRIX.md`)
  - 9.4 Laporan Evaluasi Pengujian (`TEST_EVALUATION.md`)

---

## Rincian Panduan Konten per Bagian Laporan

---

### BAGIAN II: TUGAS 1 — Kebutuhan, PRD, ERD, & Kontrak API
- **Dokumen Referensi Utama:** [`docs/PRD_ERD_API_CONTRACT.md`](file:///e:/New%20Web/perpus_uts_api/docs/PRD_ERD_API_CONTRACT.md)
- **Materi Wajib:**
  1. Latar belakang sistem: Aplikasi manajemen perpustakaan lokal untuk demonstrasi tanpa login, denda, atau pembayaran.
  2. Identifikasi 4 resource: `books`, `members`, `loans`, dan `dashboard`.
  3. Pemisahan Client-Server: Backend REST API di port 3000 dan web frontend pustakawan di folder `public/`.
  4. Diagram ERD relasi:
     - `members (1) ---- (N) loans` (Foreign Key `memberId` ON DELETE RESTRICT)
     - `books (1) -------- (N) loans` (Foreign Key `bookId` ON DELETE RESTRICT)
  5. Tabel kontrak 17 endpoint operations lengkap dengan query parameter, body payload, dan HTTP status codes.
- **Artefak Bukti Terkait:**
  - `T01_01_PRD_Scope_Requirements.png`
  - `T01_02_ERD_Database_Diagram.png`
  - `T01_03_Client_Server_Architecture.png`
  - `T01_03B_Client_Server_Diagram.png`
  - `T01_03C_Client_Server_Flow_Continuation.png`
  - `T01_04_API_Contract_Endpoints.png`

---

### BAGIAN III: TUGAS 2 — HTTP Request & Response, Verbs, Headers, & Caching
- **Dokumen Referensi Utama:** [`docs/PRD_ERD_API_CONTRACT.md`](file:///e:/New%20Web/perpus_uts_api/docs/PRD_ERD_API_CONTRACT.md), [`src/common/interceptors/transform.interceptor.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/interceptors/transform.interceptor.ts)
- **Materi Wajib:**
  1. Penjelasan 5 kata kerja HTTP:
     - `GET`: Safe & Idempotent (pengambilan katalog, anggota, transaksi, ringkasan dashboard).
     - `POST`: Non-idempotent (registrasi buku, anggota, pembuatan loan baru mengembalikan HTTP 201).
     - `PUT`: Idempotent (penggantian penuh entitas buku dan anggota).
     - `PATCH`: Non-idempotent / Idempotent parsial (pembaruan parsial entitas dan pengembalian sirkulasi buku).
     - `DELETE`: Idempotent (penghapusan buku dan anggota dari katalog).
  2. Request Headers: `Accept: application/json`, `Accept: application/problem+json`, `Content-Type: application/json`, `If-Match`.
  3. Response Headers: `Content-Type`, Strong `ETag` (RFC 9110).
  4. HTTP Status Codes representatif:
     - `200 OK`: Sukses GET, PUT, PATCH, DELETE.
     - `201 Created`: Sukses POST.
     - `400 Bad Request`: Validasi payload gagal, stok buku habis, tanggal tidak valid, penghapusan dengan loan aktif ditolak.
     - `404 Not Found`: UUID entitas tidak ditemukan di database.
     - `409 Conflict`: Duplikasi nomor induk mahasiswa (NIM).
     - `412 Precondition Failed`: Validator ETag pada header If-Match usang (*stale*) atau berupa weak tag.
- **Artefak Bukti Terkait:**
  - `Hasil Screen Shot/Tugas_02_HTTP_Request_Response/T02_GET_Dashboard_200_OK.png`

---

### BAGIAN IV: TUGAS 3 — Prinsip REST & Uniform Interface
- **Dokumen Referensi Utama:** [`src/main.ts`](file:///e:/New%20Web/perpus_uts_api/src/main.ts), [`src/common/interceptors/transform.interceptor.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/interceptors/transform.interceptor.ts), [`src/common/filters/http-exception.filter.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/filters/http-exception.filter.ts)
- **Materi Wajib:**
  1. Penjelasan ketaatan 6 REST Constraints: Client-Server, Stateless, Cacheable, Uniform Interface, Layered System, Code-on-Demand (opsional).
  2. URI berbasis kata benda jamak (*plural nouns*): `/api/v1/books`, `/api/v1/members`, `/api/v1/loans`.
  3. Standardisasi Response Envelope:
     - Format Sukses: `{ statusCode, success: true, message, data, meta }`.
     - Format Gagal Legacy: `{ statusCode, success: false, message, error, timestamp, path }`.
- **Artefak Bukti Terkait:**
  - `T03_01_Resource_Oriented_URI_Books.png`
  - `T03_02_Resource_Oriented_URI_Members.png`
  - `T03_03_Resource_Oriented_URI_Loans.png`
  - `T03_04_Standard_Response_Envelope_Success.png`
  - `T03_05_Standard_Response_Envelope_Error.png`

---

### BAGIAN V: TUGAS 4 — Fitur Lanjutan REST API
- **Dokumen Referensi Utama:** [`src/common/dto/pagination-query.dto.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/dto/pagination-query.dto.ts), [`src/common/utils/etag.util.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/utils/etag.util.ts), [`src/common/filters/http-exception.filter.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/filters/http-exception.filter.ts)
- **Materi Wajib:**
  1. **Filtering & Searching:** Kueri pencarian ILIKE multi-kolom pada judul, penulis, dan ISBN buku, serta filter status loan.
  2. **Pagination:** Offset pagination (`page`, `limit`) disertai metadata navigasi (`total`, `page`, `limit`, `totalPages`).
  3. **Stable Sorting & Deterministic Tie-Breaker:**
     - Parameter `sortBy` dan `order` tervalidasi allowlist kolom aman.
     - Secondary tie-breaker `id ASC` menjamin tidak ada duplikasi record lintas halaman pada timestamp identik.
  4. **Strong ETag RFC 9110 & Atomic If-Match (412):**
     - Strong ETag dihitung menggunakan hashing SHA-1 tanpa `W/`.
     - Evaluasi atomik di dalam transaksi database dengan row-level write lock `pessimistic_write`.
     - Mencegah kondisi *lost update* pada pembaruan konkuren.
  5. **Problem Details RFC 9457:**
     - Content negotiation `Accept: application/problem+json`.
     - Respons standar industri `{ type, title, status, detail, instance }` pada Error 400 dan Error 409.
- **Artefak Bukti Terkait:**
  - `T04_PG01` s.d. `T04_PG05` (Pagination)
  - `T04_SR01`, `T04_SR02` (Search)
  - `T04_ETAG01`, `T04_ETAG02`, `T04_ETAG03` (Strong ETag & If-Match)
  - `T04_SORT01`, `T04_SORT02` (Stable Sorting)
  - `T04_ERR01`, `T04_ERR02` (Problem Details RFC 9457)

---

### BAGIAN VI: TUGAS 5 — Arsitektur Modular NestJS & DTO
- **Dokumen Referensi Utama:** [`src/app.module.ts`](file:///e:/New%20Web/perpus_uts_api/src/app.module.ts), Controller, Service, dan DTO
- **Materi Wajib:**
  1. Pemisahan arsitektur Controller, Service, DTO, Repository, dan Module.
  2. Penerapan Dependency Injection (DI) NestJS.
  3. Validasi DTO berbasis decorator `class-validator` dan transformasi type `class-transformer`.
  4. Konfigurasi `ValidationPipe` global: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- **Artefak Bukti Terkait:**
  - `Hasil Screen Shot/Tugas_05_Implementasi_NestJS_CRUD/T05_CRUD01_POST_Create_Book.png` s.d. `T05_CRUD05_DELETE_Book.png` (5 screenshot lengkap).

---

### BAGIAN VII: TUGAS 6 — Basis Data PostgreSQL, Check Constraints & Transaksi
- **Dokumen Referensi Utama:** [`src/database/migrations/1715000000000-InitialLibrarySchema.ts`](file:///e:/New%20Web/perpus_uts_api/src/database/migrations/1715000000000-InitialLibrarySchema.ts), [`src/modules/loans/loans.service.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/loans/loans.service.ts)
- **Materi Wajib:**
  1. Pemodelan entitas TypeORM dan file migrasi DDL.
  2. Implementasi 5 database check constraints:
     - `CHK_books_total_copies`: `"totalCopies" >= 1`
     - `CHK_books_available_copies`: `"availableCopies" >= 0 AND "availableCopies" <= "totalCopies"`
     - `CHK_members_nim_not_empty`: `length(trim(nim)) > 0`
     - `CHK_loans_status`: `status IN ('BORROWED', 'RETURNED')`
     - `CHK_loans_dates`: `"dueDate" >= "loanDate"`
  3. Transaksi atomik sirkulasi pinjam dan kembali:
     - `this.dataSource.transaction(async (manager) => { ... })`
     - Row-level lock `pessimistic_write` pada entitas buku untuk menjamin atomisitas perubahan stok.
     - Invariant stok konsisten mutlak: `totalCopies - availableCopies == activeLoans`.
  4. Foreign key constraint `ON DELETE RESTRICT` mencegah penghapusan buku atau anggota yang sedang berstatus pinjam.
- **Artefak Bukti Terkait:**
  - `Hasil Screen Shot/Tugas_06_PostgreSQL_Validasi_Error/T06_ERR01` s.d. `T06_ERR04B` (Error cases).
  - `Hasil Screen Shot/Tugas_06_PostgreSQL_Validasi_Error/T06_TX01` s.d. `T06_TX06` (Transaksi atomik sirkulasi).

---

### BAGIAN VIII: TUGAS 7 — OpenAPI, Postman, & Automated Testing
- **Dokumen Referensi Utama:** [`docs/TEST_MATRIX.md`](file:///e:/New%20Web/perpus_uts_api/docs/TEST_MATRIX.md), [`docs/TEST_EVALUATION.md`](file:///e:/New%20Web/perpus_uts_api/docs/TEST_EVALUATION.md), [`docs/openapi.json`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.json), [`docs/openapi.yaml`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.yaml)
- **Materi Wajib:**
  1. Dokumentasi OpenAPI 3.0 dalam format ganda JSON dan YAML (100% ekuivalen) dengan Swagger UI di `/api/docs`.
  2. Koleksi Postman v2.1 memuat 22 requests dan 48 asersi otomatis `pm.test`.
  3. Hasil eksekusi terverifikasi:
     - **Automated Unit Tests:** 40 Passed / 0 Failed (`npm test`).
     - **Automated E2E Tests:** 33 Passed / 0 Failed (`npm run test:e2e`).
     - **Newman Runner:** 25 Requests executed, 48 Assertions Passed / 0 Failed (`npm run test:newman`).
  4. Multi-Tier Safety Guard & Database Isolation:
     - Guard runtime menolak koneksi ke `perpus_uts_db` saat testing.
     - Basis data utama `perpus_uts_db` terbukti 100% utuh tanpa mutasi (*Zero Mutation*).
- **Artefak Bukti Terkait:**
  - `Hasil Screen Shot/Tugas_07_OpenAPI_Automated_Testing/T07_01_Swagger_UI.png` s.d. `T07_05_Postman_Test_Results.png` (5 screenshot lengkap).
