# Manifest Bukti Artefak & Kode Sumber (Evidence Manifest)
**Pemetaan Komprehensif Seluruh Berkas Bukti, Tangkapan Layar, Kode Sumber, & Pengujian terhadap 7 Tugas REST API**
**Proyek:** Sistem Informasi Perpustakaan Sederhana
**Lokasi Direktori:** `E:\New Web\perpus_uts_api`
**Tanggal Audit Manifest:** 8 November 2026 (Pasca Rekonsiliasi Final Bukti Visual Lengkap)

---

## 1. Ikhtisar Direktori Artefak Bukti

Manifest ini memetakan seluruh berkas bukti fisik dan artefak spesifikasi sah pemenuhan rubrik Tugas 1 s.d. 7, mencakup:
- **Direktori Bukti Visual (`Hasil Screen Shot/`):** Terdiri dari 7 subfolder tugas, memuat **47 file gambar fisik PNG terverifikasi 100% lengkap dan valid di disk**, tanpa ada file yang berstatus pending, didokumentasikan resmi pada [`docs/SCREENSHOT_INVENTORY.csv`](file:///e:/New%20Web/perpus_uts_api/docs/SCREENSHOT_INVENTORY.csv) (Total: 47 entri terverifikasi).
- **Panduan Penangkapan Manual:** Tersedia pada [`docs/MANUAL_SCREENSHOT_GUIDE.md`](file:///e:/New%20Web/perpus_uts_api/docs/MANUAL_SCREENSHOT_GUIDE.md) lengkap dengan template request Postman terisolasi (port 3001).
- **Spesifikasi & Pengujian Klien:** Berada pada folder `postman/` (koleksi Postman v2.1 memuat 22 requests, 48 asersi) dan `docs/` (`openapi.json` & `openapi.yaml` 100% ekuivalen).
- **Pengujian Terotomasi (*Automated Test Suites*):** 40 kasus uji unit (`npm test`), 33 kasus uji integrasi E2E (`npm run test:e2e`), dan 48 asersi Newman CLI runner (`npm run test:newman`).
- **Dokumen Akademik:** Seluruh dokumen acuan tersedia lengkap di folder `docs/`.

---

## 2. Pemetaan Bukti per Tugas (Task-by-Task Evidence Mapping)

---

### TUGAS 1: Analisis Kebutuhan, PRD, ERD, Client-Server & Kontrak Endpoint

| Kategori Bukti | Nama Berkas & Path Relatif | Deskripsi Konten & Relevansi Rubrik | Status Verifikasi |
|---|---|---|:---:|
| **Dokumen Utama** | [`docs/PRD_ERD_API_CONTRACT.md`](file:///e:/New%20Web/perpus_uts_api/docs/PRD_ERD_API_CONTRACT.md) | Memuat PRD latar belakang, scope boundary, Arsitektur Client-Server, diagram ERD teks ASCII, dan kamus data 4 resource. | **VERIFIED** |
| **Kontrak API** | [`docs/PRD_ERD_API_CONTRACT.md#L109`](file:///e:/New%20Web/perpus_uts_api/docs/PRD_ERD_API_CONTRACT.md#L109) | Spesifikasi 17 endpoint operations lengkap dengan query parameter, path parameter, DTO body, dan status code. | **VERIFIED** |
| **Spesifikasi Mesin** | [`docs/openapi.json`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.json) & [`docs/openapi.yaml`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.yaml) | Definisi OpenAPI 3.0 standar industri untuk seluruh paths dan operations. | **VERIFIED** |
| **Klien Frontend** | [`public/index.html`](file:///e:/New%20Web/perpus_uts_api/public/index.html) & [`public/js/app.js`](file:///e:/New%20Web/perpus_uts_api/public/js/app.js) | Implementasi arsitektur Client-Server: Antarmuka web pustakawan yang mengonsumsi endpoint `/api/v1`. | **VERIFIED** |
| **Tangkapan Layar PRD & Scope** | [`Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/T01_01_PRD_Scope_Requirements.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_01_Requirement_PRD_ERD/T01_01_PRD_Scope_Requirements.png) | Bukti visual dokumen PRD ruang lingkup sistem dan batasan fungsional 4 resource. | **VERIFIED** |
| **Tangkapan Layar ERD** | [`Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/T01_02_ERD_Database_Diagram.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_01_Requirement_PRD_ERD/T01_02_ERD_Database_Diagram.png) | Bukti visual diagram skema relasional entitas books, members, loans, dan integritas referensial. | **VERIFIED** |
| **Tangkapan Layar Client-Server Web** | [`Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/T01_03_Client_Server_Architecture.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_01_Requirement_PRD_ERD/T01_03_Client_Server_Architecture.png) | Bukti visual antarmuka web pustakawan di browser memanggil REST API backend port 3000. | **VERIFIED** |
| **Tangkapan Layar Diagram Arsitektur** | [`Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/T01_03B_Client_Server_Diagram.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_01_Requirement_PRD_ERD/T01_03B_Client_Server_Diagram.png) | Bukti visual diagram Mermaid Three-Tier Client-Server Architecture. | **VERIFIED** |
| **Tangkapan Layar Alur Lifecycle** | [`Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/T01_03C_Client_Server_Flow_Continuation.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_01_Requirement_PRD_ERD/T01_03C_Client_Server_Flow_Continuation.png) | Bukti visual bagan alur deterministik request-response lifecycle. | **VERIFIED** |
| **Tangkapan Layar Kontrak Endpoint** | [`Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/T01_04_API_Contract_Endpoints.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_01_Requirement_PRD_ERD/T01_04_API_Contract_Endpoints.png) | Bukti visual matriks spesifikasi kontrak 17 endpoint operations. | **VERIFIED** |

---

### TUGAS 2: HTTP Request & Response, Verbs, Headers, Idempotency & Caching

| Kategori Bukti | Nama Berkas & Path Relatif | Deskripsi Konten & Relevansi Rubrik | Status Verifikasi |
|---|---|---|:---:|
| **Kode Sumber Interceptor** | [`src/common/interceptors/transform.interceptor.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/interceptors/transform.interceptor.ts) | Menghasilkan envelope respons seragam dan menyematkan header `ETag` Strong ETag RFC 9110. | **VERIFIED** |
| **Kode Sumber Controller** | [`src/modules/books/books.controller.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/books/books.controller.ts) | Implementasi 5 kata kerja HTTP: `GET` (@Get), `POST` (@Post), `PUT` (@Put), `PATCH` (@Patch), `DELETE` (@Delete). | **VERIFIED** |
| **Koleksi Permintaan** | [`postman/perpus_uts_api.postman_collection.json`](file:///e:/New%20Web/perpus_uts_api/postman/perpus_uts_api.postman_collection.json) | Menyertakan header eksplisit `Accept: application/json` dan `Content-Type: application/json`. | **VERIFIED** |
| **Tangkapan Layar** | [`Hasil Screen Shot/Tugas_02_HTTP_Request_Response/T02_GET_Dashboard_200_OK.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_02_HTTP_Request_Response/T02_GET_Dashboard_200_OK.png) | Bukti riil respons HTTP GET 200 OK dengan payload JSON ringkasan dashboard operasional. | **VERIFIED** |

---

### TUGAS 3: Prinsip Arsitektur REST, URI Berbasis Resource, & Standard Response

| Kategori Bukti | Nama Berkas & Path Relatif | Deskripsi Konten & Relevansi Rubrik | Status Verifikasi |
|---|---|---|:---:|
| **Router Prefix** | [`src/main.ts#L21`](file:///e:/New%20Web/perpus_uts_api/src/main.ts#L21) | Global prefixing `/api/v1` penjamin isolasi rute RESTful dari file statis. | **VERIFIED** |
| **Rute Berbasis Resource** | [`src/modules/books/books.controller.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/books/books.controller.ts)<br>[`src/modules/members/members.controller.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/members/members.controller.ts)<br>[`src/modules/loans/loans.controller.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/loans/loans.controller.ts) | Penamaan URI berbasis kata benda jamak: `/books`, `/members`, `/loans`, dan aksi sirkulasi `/loans/:id/return`. | **VERIFIED** |
| **Standard Response Envelope** | [`src/common/interceptors/transform.interceptor.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/interceptors/transform.interceptor.ts) | Standardisasi format sukses `{ statusCode, success: true, message, data, meta }`. | **VERIFIED** |
| **Standard Error Envelope** | [`src/common/filters/http-exception.filter.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/filters/http-exception.filter.ts) | Standardisasi format gagal `{ statusCode, success: false, message, error, timestamp, path }`. | **VERIFIED** |
| **Tangkapan Layar URI Books** | [`Hasil Screen Shot/Tugas_03_REST_Principles_URI/T03_01_Resource_Oriented_URI_Books.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_03_REST_Principles_URI/T03_01_Resource_Oriented_URI_Books.png) | Bukti visual URI berbasis kata benda jamak `/api/v1/books` pada Postman/Swagger. | **VERIFIED** |
| **Tangkapan Layar URI Members** | [`Hasil Screen Shot/Tugas_03_REST_Principles_URI/T03_02_Resource_Oriented_URI_Members.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_03_REST_Principles_URI/T03_02_Resource_Oriented_URI_Members.png) | Bukti visual URI berbasis kata benda jamak `/api/v1/members`. | **VERIFIED** |
| **Tangkapan Layar URI Loans** | [`Hasil Screen Shot/Tugas_03_REST_Principles_URI/T03_03_Resource_Oriented_URI_Loans.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_03_REST_Principles_URI/T03_03_Resource_Oriented_URI_Loans.png) | Bukti visual URI transaksi sirkulasi `/api/v1/loans`. | **VERIFIED** |
| **Tangkapan Layar Sukses Envelope** | [`Hasil Screen Shot/Tugas_03_REST_Principles_URI/T03_04_Standard_Response_Envelope_Success.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_03_REST_Principles_URI/T03_04_Standard_Response_Envelope_Success.png) | Bukti visual struktur format amplop sukses `{ statusCode: 200, success: true, ... }`. | **VERIFIED** |
| **Tangkapan Layar Galat Envelope** | [`Hasil Screen Shot/Tugas_03_REST_Principles_URI/T03_05_Standard_Response_Envelope_Error.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_03_REST_Principles_URI/T03_05_Standard_Response_Envelope_Error.png) | Bukti visual struktur format amplop galat standar `{ statusCode: 404, message: ... }`. | **VERIFIED** |

---

### TUGAS 4: Fitur Lanjutan REST API (Filtering, Pagination, Sorting, Caching, If-Match, RFC 9457)

| Kategori Bukti | Nama Berkas & Path Relatif | Deskripsi Konten & Relevansi Rubrik | Status Verifikasi |
|---|---|---|:---:|
| **Kode Sumber Pagination & Sorting DTO** | [`src/common/dto/pagination-query.dto.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/dto/pagination-query.dto.ts) | Parameter `page`, `limit`, `search`, `sortBy`, dan `order` tervalidasi via `@IsIn(['ASC', 'DESC'])`. | **VERIFIED** |
| **Kode Sumber Sorting & Tie-Breaker** | [`src/modules/books/books.service.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/books/books.service.ts)<br>[`src/modules/members/members.service.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/members/members.service.ts) | Allowlist kolom aman dan secondary deterministic tie-breaker `id: 'ASC'`. | **VERIFIED** |
| **Kode Sumber Strong ETag & If-Match** | [`src/common/utils/etag.util.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/utils/etag.util.ts) | Generator Strong ETag RFC 9110 dan evaluasi atomik `If-Match` dengan status HTTP 412 Precondition Failed. | **VERIFIED** |
| **Kode Sumber Problem Details** | [`src/common/filters/http-exception.filter.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/filters/http-exception.filter.ts) | Implementasi standar RFC 9457 `application/problem+json` dengan field `type`, `title`, `status`, `detail`, `instance`. | **VERIFIED** |
| **Tangkapan Layar Pagination** | [`Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_PG01_Pagination_Halaman_1.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_PG01_Pagination_Halaman_1.png) s.d. [`T04_PG04_Metadata_Pagination.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_PG04_Metadata_Pagination.png) | Bukti navigasi halaman 1, 2, 4 beserta objek metadata `total`, `page`, `limit`, dan `totalPages`. | **VERIFIED** |
| **Tangkapan Layar Automated Test Pagination** | [`Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_PG05_Automated_Test_5_PASS.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_PG05_Automated_Test_5_PASS.png) | Bukti terminal kelulusan 5 unit test fitur pagination. | **VERIFIED** |
| **Tangkapan Layar Search** | [`Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_SR01_Search_Clean_Code.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_SR01_Search_Clean_Code.png)<br>[`T04_SR02_Search_Tidak_Ditemukan.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_SR02_Search_Tidak_Ditemukan.png) | Bukti kueri pencarian buku berhasil dan respons array kosong saat kata kunci tidak cocok. | **VERIFIED** |
| **Tangkapan Layar Strong ETag** | [`Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_ETAG01_Strong_ETag_Header.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_ETAG01_Strong_ETag_Header.png) | Bukti header respons ETag Strong ETag RFC 9110 (SHA-1 40-hex) tanpa prefix `W/`. | **VERIFIED** |
| **Tangkapan Layar Valid If-Match** | [`Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_ETAG02_If_Match_Valid_200.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_ETAG02_If_Match_Valid_200.png) | Bukti keberhasilan pembaruan buku (HTTP 200 OK) dengan header `If-Match` yang cocok. | **VERIFIED** |
| **Tangkapan Layar Stale If-Match 412** | [`Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_ETAG03_If_Match_Stale_412.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_ETAG03_If_Match_Stale_412.png) | Bukti penolakan pembaruan (HTTP 412 Precondition Failed) akibat ETag usang atau weak tag. | **VERIFIED** |
| **Tangkapan Layar Stable Sorting ASC** | [`Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_SORT01_Sort_Title_ASC.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_SORT01_Sort_Title_ASC.png) | Bukti pengurutan buku alfabetis A-Z dengan tie-breaker deterministik `id ASC`. | **VERIFIED** |
| **Tangkapan Layar Stable Sorting DESC** | [`Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_SORT02_Sort_Title_DESC.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_SORT02_Sort_Title_DESC.png) | Bukti pengurutan buku alfabetis Z-A dengan tie-breaker deterministik `id ASC`. | **VERIFIED** |
| **Tangkapan Layar Problem Details 400** | [`Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_ERR01_Problem_Details_400.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_ERR01_Problem_Details_400.png) | Bukti format error RFC 9457 `application/problem+json` pada status 400 Bad Request. | **VERIFIED** |
| **Tangkapan Layar Problem Details 409** | [`Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_ERR02_Problem_Details_409.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_04_REST_API_Lanjutan/T04_ERR02_Problem_Details_409.png) | Bukti format error RFC 9457 `application/problem+json` pada status 409 Conflict. | **VERIFIED** |

---

### TUGAS 5: Arsitektur Modular NestJS, Controller, Service, DTO, Validation & CRUD Testing

| Kategori Bukti | Nama Berkas & Path Relatif | Deskripsi Konten & Relevansi Rubrik | Status Verifikasi |
|---|---|---|:---:|
| **Root & Sub-Modules** | [`src/app.module.ts`](file:///e:/New%20Web/perpus_uts_api/src/app.module.ts)<br>[`src/modules/books/books.module.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/books/books.module.ts)<br>[`src/modules/members/members.module.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/members/members.module.ts)<br>[`src/modules/loans/loans.module.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/loans/loans.module.ts) | Arsitektur modular bersih NestJS dengan pemisahan domain dan encapsulasi provider. | **VERIFIED** |
| **Validation DTOs** | [`src/modules/books/dto/create-book.dto.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/books/dto/create-book.dto.ts)<br>[`src/modules/members/dto/create-member.dto.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/members/dto/create-member.dto.ts)<br>[`src/modules/loans/dto/create-loan.dto.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/loans/dto/create-loan.dto.ts) | Validasi DTO kuat menggunakan `@IsNotEmpty`, `@IsString`, `@IsInt`, `@Min(1)`, `@IsUUID`, `@IsDateString`. | **VERIFIED** |
| **Tangkapan Layar CRUD** | [`Hasil Screen Shot/Tugas_05_Implementasi_NestJS_CRUD/T05_CRUD01_POST_Create_Book.png`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_05_Implementasi_NestJS_CRUD/T05_CRUD01_POST_Create_Book.png) s.d. `T05_CRUD05_DELETE_Book.png` | 5 file tangkapan layar lengkap operasi POST, GET detail, PUT, PATCH, dan DELETE. | **VERIFIED** |

---

### TUGAS 6: Pemodelan PostgreSQL, Migrasi, Database Constraints, Transaksi & Error Handling

| Kategori Bukti | Nama Berkas & Path Relatif | Deskripsi Konten & Relevansi Rubrik | Status Verifikasi |
|---|---|---|:---:|
| **Berkas Migrasi SQL & TS** | [`src/database/migrations/1715000000000-InitialLibrarySchema.ts`](file:///e:/New%20Web/perpus_uts_api/src/database/migrations/1715000000000-InitialLibrarySchema.ts)<br>[`001_initial_schema.sql`](file:///e:/New%20Web/perpus_uts_api/src/database/migrations/001_initial_schema.sql) | DDL pembuatan tabel `books`, `members`, `loans`, indeks, check constraints, dan foreign keys. | **VERIFIED** |
| **Transaksi Atomik ACID** | [`src/modules/loans/loans.service.ts`](file:///e:/New%20Web/perpus_uts_api/src/modules/loans/loans.service.ts) | Blok `this.dataSource.transaction` dengan row-level write lock `pessimistic_write`. | **VERIFIED** |
| **Tangkapan Layar Error & Transaksi** | [`Hasil Screen Shot/Tugas_06_PostgreSQL_Validasi_Error/`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_06_PostgreSQL_Validasi_Error/) | 11 file screenshot lengkap: validasi 400, not found 404, conflict 409, stok habis 400, dan 6 tahap transaksi atomik sirkulasi. | **VERIFIED** |

---

### TUGAS 7: Dokumentasi OpenAPI/Swagger, Postman Collection & Automated Testing

| Kategori Bukti | Nama Berkas & Path Relatif | Deskripsi Konten & Relevansi Rubrik | Status Verifikasi |
|---|---|---|:---:|
| **Dokumen OpenAPI JSON & YAML** | [`docs/openapi.json`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.json)<br>[`docs/openapi.yaml`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.yaml) | Spesifikasi OpenAPI 3.0.0 lengkap 8 paths, 17 operations, skema envelope, Strong ETag, If-Match, dan Problem Details. 100% ekuivalen. | **VERIFIED** |
| **Koleksi Postman v2.1** | [`postman/perpus_uts_api.postman_collection.json`](file:///e:/New%20Web/perpus_uts_api/postman/perpus_uts_api.postman_collection.json) | 22 requests lengkap mencakup seluruh CRUD, sorting, Strong ETag, If-Match 412, RFC 9457, dan 48 asersi `pm.test`. | **VERIFIED** |
| **Unit Test Suites** | `src/**/*.spec.ts` (6 suites) | **40 Kasus Uji Unit Logic**: 40 Passed, 0 Failed. | **VERIFIED** |
| **E2E Integration Test Suite** | [`test/library.e2e-spec.ts`](file:///e:/New%20Web/perpus_uts_api/test/library.e2e-spec.ts) | **33 Kasus Uji Integrasi HTTP di atas `perpus_uts_test_db`**: 33 Passed, 0 Failed. | **VERIFIED** |
| **Automated Newman Runner** | [`scripts/run-newman-test.js`](file:///e:/New%20Web/perpus_uts_api/scripts/run-newman-test.js) | **25 Requests Dieksekusi, 48 Assertions Passed (100% Lulus, 0 Failed)**. | **VERIFIED** |
| **Inventaris Screenshot** | [`docs/SCREENSHOT_INVENTORY.csv`](file:///e:/New%20Web/perpus_uts_api/docs/SCREENSHOT_INVENTORY.csv) | Inventarisasi rekonsiliasi resmi 47 berkas bukti visual (100% fisik terverifikasi). | **VERIFIED** |
| **Matriks & Evaluasi Pengujian** | [`docs/TEST_MATRIX.md`](file:///e:/New%20Web/perpus_uts_api/docs/TEST_MATRIX.md)<br>[`docs/TEST_EVALUATION.md`](file:///e:/New%20Web/perpus_uts_api/docs/TEST_EVALUATION.md) | Matriks pengujian lengkap dan laporan evaluasi akademik resmi. | **VERIFIED** |
| **Tangkapan Layar Tugas 7** | [`Hasil Screen Shot/Tugas_07_OpenAPI_Automated_Testing/`](file:///e:/New%20Web/perpus_uts_api/Hasil%20Screen%20Shot/Tugas_07_OpenAPI_Automated_Testing/) | 5 file screenshot Swagger UI, detail endpoint, unit test terminal, E2E terminal, dan Postman runner. | **VERIFIED** |
