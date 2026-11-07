# Evaluasi Komprehensif Pengujian Sistem Informasi Perpustakaan
**Dokumen Laporan Akademik Pemenuhan Tugas 7: Automated Testing, Newman Automation, & API Contract Parity**
**Proyek:** Sistem Informasi Perpustakaan Sederhana (RESTful API `/api/v1`)
**Penulis / Pengembang:** Tim Pengembang API Perpustakaan
**Teknologi:** NestJS 12, TypeORM 1.1+, PostgreSQL 18, Vitest 4.1+, Supertest 7.0+, Newman 6.2+, OpenAPI 3.0 (JSON & YAML)
**Status Evaluasi Terakhir:** 7 November 2026 (Pasca Remediasi Final Opsi B)

---

## 1. Pendahuluan & Sasaran Evaluasi

Laporan evaluasi ini disusun secara metodis dan objektif untuk mengevaluasi kualitas fungsional, arsitektur perangkat lunak, keandalan transaksi, dan kepatuhan spesifikasi kontrak **Sistem Informasi Perpustakaan Sederhana** dalam rangka pemenuhan **Tugas 7 Mata Kuliah REST API**.

Evaluasi ini didasarkan pada eksekusi aktual tiga lapisan pengujian:
1. **Pengujian Unit Terotomasi (Automated Unit Tests):** Memverifikasi integritas algoritma, evaluasi strong ETag, penolakan weak ETag, filter RFC 9457 Problem Details, sorting allowlist, dan logika bisnis modular tanpa ketergantungan I/O eksternal.
2. **Pengujian Integrasi End-to-End (Automated E2E Tests):** Memverifikasi aliran HTTP penuh di atas mesin basis data PostgreSQL 18 lokal nyata pada `perpus_uts_test_db`, mencakup uji konkurensi paralel, validasi If-Match (412), determinisme sorting dengan fixture identik, dan pembatasan constraint integritas referensial.
3. **Pengujian Kontrak Klien Terotomasi (Newman & Postman Automation):** Memverifikasi interoperabilitas klien melalui koleksi Postman yang dieksekusi secara otomatis via Newman CLI (22 requests, 48 assertions).
4. **Verifikasi Kontrak Antarmuka (OpenAPI 3.0 JSON & YAML):** Memastikan representasi skema request, envelope respons, header ETag, header If-Match, status 412, parameter sorting, dan media type `application/problem+json` sinkron 100% dengan perilaku runtime sistem.

---

## 2. Metodologi Pengujian Berlapis

Sistem Informasi Perpustakaan ini menerapkan metodologi piramida pengujian perangkat lunak (*Test Pyramid*) dengan pembagian tugas yang jelas antar-lapisan:

```
            / \
           /   \      Layer 3: Automated Client Runner (Newman CLI on Postman Collection)
          / ----\     Target: Isolated Server (Port 3001, perpus_uts_test_db)
         /   E2E \    Layer 2: Integration Tests (Vitest + Supertest)
        / --------\   Target: Isolated Database (perpus_uts_test_db via Multi-Tier Guard)
       / Unit Tests\  Layer 1: Unit Tests (Vitest In-Memory Mocks)
      /_____________\ Target: Memory isolation via vi.fn()
```

### 2.1 Pengujian Unit (Unit Testing)
- **Framework:** Vitest 4.1.x dengan test runner bawaan Vite 8.
- **Pendekatan:** *Isolated White-Box Testing*. Pengujian unit difokuskan pada unit logika terkecil pada *Service Layer* (`BooksService`, `MembersService`, `LoansService`), *Controller Layer* (`AppController`), *Filter Layer* (`HttpExceptionFilter`), dan *Utility Layer* (`etag.util`).
- **Strategi Mocking:** Interaksi basis data digantikan oleh mock repository menggunakan `vi.fn()`.

### 2.2 Pengujian Integrasi End-to-End (E2E Integration Testing)
- **Framework:** Vitest 4.1.x dipadukan dengan Supertest 7.0.x.
- **Pendekatan:** *Full-Stack HTTP Integration Testing*. Menguji alur lengkap mulai dari penanganan routing, serialisasi DTO via `ValidationPipe`, pembungkusan respons via `TransformInterceptor`, pembuatan header Strong ETag, penanganan kesalahan via `HttpExceptionFilter` (RFC 9457), hingga eksekusi kueri transaksi atomik dengan row-level write lock pada PostgreSQL 18.
- **Target Lingkungan:** Basis data khusus pengujian `perpus_uts_test_db` yang terisolasi total dari database pengembangan.

### 2.3 Pengujian Otomasi Koleksi Klien (Newman CLI Runner)
- **Framework:** Newman 6.2.x (official CLI runner untuk Postman Collection).
- **Pendekatan:** Pengujian otomatis dari sudut pandang agen klien eksternal. Skrip otomasi [`scripts/run-newman-test.js`](file:///e:/New%20Web/perpus_uts_api/scripts/run-newman-test.js) menginisialisasi server pengujian pada port 3001 yang terhubung ke `perpus_uts_test_db`, mengeksekusi seluruh 22 permintaan dan 48 asersi `pm.test`, lalu mematikan server dan membersihkan data pengujian.

---

## 3. Arsitektur Isolasi Basis Data & Refleksi Batasan Zero-Mutation

Untuk mencegah pencemaran data demonstrasi lokal pustakawan, sistem menerapkan pemisahan basis data fisik:
- **Basis Data Pengembangan (`perpus_uts_db`):** Menyimpan data operasional katalog buku, anggota, dan riwayat sirkulasi (9 buku, 7 anggota, 6 peminjaman, invariant stok konsisten 100%).
- **Basis Data Pengujian (`perpus_uts_test_db`):** Basis data sementara khusus eksekusi pengujian otomatis.

### 3.1 Multi-Tier Safety Guard pada Pengujian E2E
Pengujian E2E pada [`test/library.e2e-spec.ts`](file:///e:/New%20Web/perpus_uts_api/test/library.e2e-spec.ts) dilindungi oleh sistem pengaman bertingkat:
1. **Pre-flight Environment Check:** Memvalidasi `NODE_ENV === 'test'` dan `DB_NAME === 'perpus_uts_test_db'`.
2. **Runtime Session Query Verification:** Mengeksekusi kueri native `SELECT current_database() AS db_name`. Jika terdeteksi koneksi mengarah ke basis data selain `'perpus_uts_test_db'`, pengujian seketika dibatalkan (`app.close()`).
3. **Pemisahan Konfigurasi Vitest:** [`vitest.config.ts`](file:///e:/New%20Web/perpus_uts_api/vitest.config.ts) mengecualikan file E2E, sementara [`vitest.config.e2e.ts`](file:///e:/New%20Web/perpus_uts_api/vitest.config.e2e.ts) mengunci target database secara terprogram.

### 3.2 Refleksi Kritis Batasan Garansi Zero-Mutation
Secara akademis dan transparan, perlu ditegaskan bahwa:
- **Garansi Zero-Mutation Berlaku Mutlak pada Vitest E2E & Newman Runner:** Seluruh eksekusi `npm run test:e2e` dan `npm run test:newman` terbukti 100% tidak menyentuh `perpus_uts_db` karena terblokir oleh Safety Guard ganda dan isolasi port 3001.
- **Keterbatasan pada Pengujian Klien Postman Manual:** Pada pengujian manual menggunakan aplikasi Postman GUI, variabel `baseUrl` secara default mengarah ke `http://localhost:3000/api/v1` (yang terhubung ke `perpus_uts_db`). Apabila pustakawan mengeksekusi operasi `POST`, `PUT`, `PATCH`, atau `DELETE` pada lingkungan tersebut, mutasi data pada `perpus_uts_db` akan terjadi secara wajar sesuai fungsi operasional sistem. Oleh sebab itu, eksekusi otomasi Newman diwajibkan menyuntikkan parameter `--env-var baseUrl=http://localhost:3001/api/v1` guna mengarahkan lalu lintas ke lingkungan pengujian terisolasi.

---

## 4. Ringkasan Hasil Pengujian Aktual yang Terverifikasi

Seluruh hasil pengujian di bawah ini didasarkan pada eksekusi terminal nyata (*actual verified execution* per 7 November 2026):

### 4.1 Hasil Automated Unit Tests (40 Tests Passed)
Perintah eksekusi: `npm test`
```text
> perpus_uts_api@0.0.1 test
> vitest run

 ✓ src/common/utils/etag.util.spec.ts (8 tests) 21ms
 ✓ src/common/filters/http-exception.filter.spec.ts (3 tests) 20ms
 ✓ src/app.controller.spec.ts (1 test) 353ms
 ✓ src/modules/members/members.service.spec.ts (9 tests) 22ms
 ✓ src/modules/loans/loans.service.spec.ts (7 tests) 18ms
 ✓ src/modules/books/books.service.spec.ts (12 tests) 30ms

 Test Files  6 passed (6)
      Tests  40 passed (40)
   Duration  2.86s
```

### 4.2 Hasil Automated E2E Tests (33 Tests Passed)
Perintah eksekusi: `npm run test:e2e`
```text
> perpus_uts_api@0.0.1 test:e2e
> vitest run --config ./vitest.config.e2e.ts

stderr | test/library.e2e-spec.ts
◇ injected env (10) from .env.test

 ✓ test/library.e2e-spec.ts (33 tests) 849ms

 Test Files  1 passed (1)
      Tests  33 passed (33)
   Duration  3.79s
```

### 4.3 Hasil Automated Newman Postman Runner (48 Assertions Passed)
Perintah eksekusi: `npm run test:newman`
```text
┌─────────────────────────┬─────────────────┬─────────────────┐
│                         │        executed │          failed │
├─────────────────────────┼─────────────────┼─────────────────┤
│              iterations │               1 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│                requests │              25 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│            test-scripts │              22 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│      prerequest-scripts │               3 │               0 │
├─────────────────────────┼─────────────────┼─────────────────┤
│              assertions │              48 │               0 │
├─────────────────────────┴─────────────────┴─────────────────┤
│ total run duration: 1995ms                                  │
├─────────────────────────────────────────────────────────────┤
│ total data received: 8.17kB (approx)                        │
├─────────────────────────────────────────────────────────────┤
│ average response time: 9ms [min: 3ms, max: 33ms, s.d.: 7ms] │
└─────────────────────────────────────────────────────────────┘
[Newman] All tests passed successfully!
```
- **Total Permintaan dalam Koleksi:** 22 permintaan (Dashboard: 1, Books: 9, Members: 7, Loans: 5).
- **Total Permintaan Terhitung pada Runner:** 25 permintaan (22 permintaan koleksi + 3 permintaan dinamis pada pre-request script).
- **Total Asersi Otomatis:** 48 asersi `pm.test`.
- **Hasil Asersi:** 48 Lulus (100%), 0 Gagal.

---

## 5. Verifikasi OpenAPI 3.0 & Paritas Kontrak

### 5.1 Penyempurnaan Skema Respons Envelope pada OpenAPI
File spesifikasi [`docs/openapi.json`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.json) dan [`docs/openapi.yaml`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.yaml) telah diperbarui dengan skema komponen lengkap:
- `BaseSuccessResponse`: `{ statusCode: integer, success: true, message: string }`.
- `ErrorResponseEnvelope`: `{ statusCode: integer, success: false, message: string | string[], error: string, timestamp: date-time, path: string }`.
- `ProblemDetailsResponse`: Skema standar RFC 9457 `{ type: uri, title: string, status: integer, detail: string, instance: string }`.
- `PaginationMeta`: `{ total, page, limit, totalPages }`.
- Parameter sorting `sortBy` dan `order` dengan allowlist terverifikasi.
- Header `ETag` (Strong ETag RFC 9110) pada respons GET detail resource.
- Header `If-Match` dan respons HTTP 412 Precondition Failed pada operasi mutasi PUT dan PATCH.

### 5.2 Pembuatan & Validasi Ekuivalensi `docs/openapi.yaml`
- File [`docs/openapi.yaml`](file:///e:/New%20Web/perpus_uts_api/docs/openapi.yaml) di-generate secara programatis menggunakan parser standar `js-yaml` dari `docs/openapi.json`.
- Pengujian komparasi mendalam (*deep equality test*) membuktikan bahwa hasil parsing `js-yaml.load(openapi.yaml)` dan `JSON.parse(openapi.json)` adalah **100% identik dan ekuivalen**.

---

## 6. Evaluasi Kritis Keterbatasan Pengujian (Nuanced Limitations)

Untuk menjaga kejujuran akademik dan standar pengujian perangkat lunak yang kredibel, berikut adalah batasan-batasan teknis yang telah diverifikasi batasannya:

1. **Batasan Pengujian Transaksi Rollback (*Rollback Boundary*):**
   Mekanisme pembatalan transaksi (*transaction rollback*) pada `LoansService` terverifikasi bekerja dengan baik terhadap **kesalahan tingkat logika perangkat lunak** (*software-level business exceptions*, seperti eksepsi stok habis atau validasi tanggal). Namun, sistem **belum diverifikasi** terhadap kegagalan tingkat fisik/infrastruktur (*hardware/OS fault injection*, seperti putusnya koneksi soket TCP basis data atau *process kill* di tengah penulisan halaman disk PostgreSQL).

2. **Batasan Uji Konkurensi Skala Ekstrem (*High Concurrency / Stress Boundary*):**
   Pengujian integrasi E2E telah memverifikasi mekanisme *optimistic concurrency control* dan row-level lock `pessimistic_write` melalui simulasi 2 pembaruan paralel secara konkuren (`Promise.all`), di mana tepat satu transaksi berhasil (HTTP 200) dan transaksi kedua tertolak (HTTP 412). Namun, pengujian beban ekstrem (seperti 500+ pengguna serentak dalam rentang 1 milidetik) belum dilakukan menggunakan perangkat lunak stress testing terdedikasi (k6/JMeter).

3. **Integritas Relasional ON DELETE RESTRICT:**
   Penghapusan buku yang sedang memiliki peminjaman aktif terbukti dicegah oleh pengecekan `activeLoans` pada layer aplikasi (HTTP 400) serta perlindungan foreign key constraint `ON DELETE RESTRICT` pada tabel database PostgreSQL.

---

## 7. Kesimpulan Akademik

Berdasarkan perancangan, implementasi, hardening konfigurasi basis data, penyelesaian seluruh celah teknis (Strong ETag, If-Match 412, Problem Details RFC 9457, Stable Sorting dengan tie-breaker `id ASC`), serta pembuktian pengujian aktual:

1. **Pemenuhan Komponen Tugas 7:**
   Sistem telah memenuhi seluruh kriteria evaluasi Tugas 7 Mata Kuliah REST API dalam batas operasional demonstrasi lokal:
   - Spesifikasi antarmuka OpenAPI 3.0 tersedia dalam format ganda **JSON** dan **YAML** yang divalidasi 100% ekuivalen.
   - Koleksi Postman v2.1 telah mencapai **paritas kontrak 100%** terhadap seluruh 22 operasi endpoint dengan **48 asersi otomatis** yang lulus 100%.
   - Otomasi pengujian berlapis (**40 Unit Tests, 33 E2E Tests, dan 48 Newman Assertions**) terbukti lulus secara aktual dengan status **VERIFIED (PASS)** tanpa kegagalan (0 failed).
2. **Kualitas Arsitektur & Keamanan Data:**
   Arsitektur modular NestJS yang dipadukan dengan pemisahan lingkungan basis data mandiri (`perpus_uts_test_db`) dan *Multi-Tier Safety Guard* berhasil mengisolasi pengujian otomatis, menjaga konsistensi invariant stok buku, dan menjamin **zero mutation** pada basis data utama `perpus_uts_db`.
