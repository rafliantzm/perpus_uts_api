# Matriks Pengujian Sistem Informasi Perpustakaan (Test Matrix)
**Dokumen Referensi Pemenuhan Tugas 7: Automated Testing & API Contract Verification**
**Proyek:** Sistem Informasi Perpustakaan Sederhana (REST API `/api/v1`)
**Lingkungan Eksekusi:** NestJS 12, TypeORM 1.1+, PostgreSQL 18, Vitest 4.1+, Supertest 7.0+, Newman 6.2+
**Status Audit & Sinkronisasi Terakhir:** 7 November 2026 (Pasca Remediasi Final Opsi B)

---

## 1. Ringkasan Status Pengujian Berbasis Bukti Aktual

Pengujian dikategorikan secara transparan dan objektif menjadi tiga status:
- **VERIFIED (PASS):** Skenario telah dieksekusi secara nyata melalui automated runner dan seluruh asersi terbukti lulus.
- **FAILED:** Skenario dieksekusi namun menghasilkan kegagalan asersi atau kesalahan runtime.
- **NOT VERIFIED:** Skenario berada di luar cakupan pengujian terotomasi saat ini (misalnya pengujian beban ekstrem atau pemutusan jaringan fisik).

| Kategori Pengujian | Framework / Runner | Target Basis Data | Total Skenario | VERIFIED (PASS) | FAILED | NOT VERIFIED |
|---|---|---|:---:|:---:|:---:|:---:|
| **Automated Unit Tests** | Vitest 4.1.x (In-Memory Mock) | Memory / Mock Repositories | 40 | 40 | 0 | 0 |
| **Automated E2E Tests** | Vitest + Supertest | `perpus_uts_test_db` (Terisolasi) | 33 | 33 | 0 | 0 |
| **Automated Postman (Newman)** | Newman 6.2.x (CLI Runner) | `perpus_uts_test_db` (Port 3001) | 22 (48 asersi) | 22 (48 asersi) | 0 | 0 |
| **Stress & High Concurrency** | - | - | 2 | 0 | 0 | 2 |
| **Physical Crash Fault-Injection** | - | - | 1 | 0 | 0 | 1 |
| **Total Evaluasi Pengujian** | - | - | **98** | **95** | **0** | **3** |

---

## 2. Matriks Pengujian End-to-End (E2E Tests)
Dieksekusi melalui: `npm run test:e2e`
File konfigurasi: [`vitest.config.e2e.ts`](file:///e:/New%20Web/perpus_uts_api/vitest.config.e2e.ts)
File implementasi: [`test/library.e2e-spec.ts`](file:///e:/New%20Web/perpus_uts_api/test/library.e2e-spec.ts)
Target basis data: `perpus_uts_test_db` (terkunci dengan Multi-Tier Safety Guard ganda).

| ID Skenario | Endpoint | Method | Input (Payload / Query / Param) | Expected Status | Hasil Aktual yang Terverifikasi | Status |
|---|---|:---:|---|:---:|---|:---:|
| **E2E-01** | `/api/v1/books` | `POST` | `{"title":"Buku Uji Stok {ts}","author":"Penulis Uji","isbn":"978-602{ts}","totalCopies":3}` | `201 Created` | Respons `{success: true, data: {id, totalCopies: 3, availableCopies: 3}}`. Kolom `id` UUID v4 terbentuk, `availableCopies` sama dengan `totalCopies`. | **VERIFIED** |
| **E2E-02** | `/api/v1/books` | `GET` | Query: `?page=1&limit=5` | `200 OK` | Respons `{success: true, data: Array, meta: {total, page: 1}}`, header `etag` Strong ETag tersemat. | **VERIFIED** |
| **E2E-03** | `/api/v1/books/:id` | `GET` | Param: `id = testBookId` | `200 OK` | Respons `{success: true, data: {id: testBookId, title: "Buku Uji Stok..."}}`. | **VERIFIED** |
| **E2E-04** | `/api/v1/books/:id` | `PUT` | Param: `id = testBookId`<br>Body: `{"title":"... (Updated)","author":"Penulis Uji Revisi","isbn":"...","totalCopies":4}` | `200 OK` | Respons `{success: true, data: {totalCopies: 4, availableCopies: 4}}`. Stok bertambah secara presisi. | **VERIFIED** |
| **E2E-05** | `/api/v1/books` | `POST` | `{"title":"Buku Stok Tunggal {ts}","author":"Penulis Cepat Habis","totalCopies":1}` | `201 Created` | Respons `{success: true, data: {availableCopies: 1}}`. Menghasilkan `zeroStockBookId`. | **VERIFIED** |
| **E2E-06** | `/api/v1/members` | `POST` | `{"name":"Anggota Test {ts}","nim":"NIM{ts}","email":"test{ts}@mahasiswa.ac.id"}` | `201 Created` | Respons `{success: true, data: {id, nim: "NIM{ts}"}}`. Menghasilkan `testMemberId`. | **VERIFIED** |
| **E2E-07** | `/api/v1/members` | `POST` | `{"name":"Duplikat Anggota","nim":"NIM{ts}"}` (NIM sama persis dengan E2E-06) | `409 Conflict` | Respons `{statusCode: 409, success: false, error: "Conflict"}`. Menolak duplikasi nomor identitas mahasiswa. | **VERIFIED** |
| **E2E-08** | `/api/v1/members/:id` | `GET` | Param: `id = testMemberId` | `200 OK` | Respons `{success: true, data: {id: testMemberId, loans: []}}`. Relasi relasional `loans` ikut dimuat. | **VERIFIED** |
| **E2E-09** | `/api/v1/members/:id` | `PATCH` | Param: `id = testMemberId`<br>Body: `{"name":"Anggota Test {ts} (Updated)"}` | `200 OK` | Respons `{success: true, data: {name: "... (Updated)"}}`. Pembaruan parsial berhasil tanpa mengubah kolom lain. | **VERIFIED** |
| **E2E-10** | `/api/v1/loans` | `POST` | `{"bookId": testBookId, "memberId": testMemberId, "notes":"Uji peminjaman atomik"}` | `201 Created` | Respons `{success: true, data: {id, status: "BORROWED"}}`. `availableCopies` berkurang dari 4 menjadi 3 secara atomik. | **VERIFIED** |
| **E2E-11** | `/api/v1/books/:id` & `/api/v1/loans` | `GET` | Verifikasi invariant buku pasca peminjaman | `200 OK` | Nilai `(totalCopies - availableCopies)` tepat bernilai 1, sama dengan jumlah loan berstatus `BORROWED` (Regression Check Valid). | **VERIFIED** |
| **E2E-12** | `/api/v1/loans/:id/return` | `PATCH` | Param: `id = testLoanId`<br>Body: `{"notes":"Buku dikembalikan lengkap"}` | `200 OK` | Respons `{success: true, data: {status: "RETURNED", returnDate: "..."}}`. `availableCopies` buku kembali bertambah menjadi 4. | **VERIFIED** |
| **E2E-13** | `/api/v1/books/:id` & `/api/v1/loans` | `GET` | Verifikasi invariant buku pasca pengembalian | `200 OK` | Nilai `(totalCopies - availableCopies)` kembali bernilai 0, loan aktif berkurang menjadi 0 (Regression Check Valid). | **VERIFIED** |
| **E2E-14** | `/api/v1/loans` | `POST` | `{"bookId": zeroStockBookId, "memberId": testMemberId}` dipinjam 2 kali berturut-turut | `400 Bad Request` | Peminjaman pertama sukses (stok sisa 0). Peminjaman kedua ditolak dengan pesan: `"stok eksemplar habis"`. | **VERIFIED** |
| **E2E-15** | `/api/v1/loans/:id/return` | `PATCH` | Param: `id = testLoanId`<br>Body: `{}` (dipanggil ulang pada pinjaman yang sudah `RETURNED`) | `400 Bad Request` | Respons `{success: false, message: "... sudah dikembalikan sebelumnya"}`. Menolak mutasi pengembalian ganda. | **VERIFIED** |
| **E2E-16** | `/api/v1/loans` | `POST` | `{"bookId": testBookId, "memberId": testMemberId, "loanDate":"2026-11-10", "dueDate":"2026-11-05"}` | `400 Bad Request` | Respons `{success: false, message: "... Batas pengembalian (dueDate) tidak boleh lebih awal ..."}`. | **VERIFIED** |
| **E2E-17** | `/api/v1/loans` | `POST` | `{"bookId": "00000000-0000-4000-8000-000000000000", "memberId": testMemberId}` | `404 Not Found` | Respons `{success: false, message: "Buku dengan ID ... tidak ditemukan"}`. | **VERIFIED** |
| **E2E-18** | `/api/v1/books/:id` | `DELETE` | Param: `id = zeroStockBookId` (memiliki active loans) | `400 Bad Request` | Respons `{success: false, message: "... tidak dapat dihapus karena masih ada ... peminjaman aktif"}`. Integritas relasional terjaga. | **VERIFIED** |
| **E2E-19** | `/api/v1/members/:id` | `DELETE` | Param: `id = testMemberId` (memiliki active loans) | `400 Bad Request` | Respons `{success: false, message: "... tidak dapat dihapus karena masih meminjam ... buku"}`. | **VERIFIED** |
| **E2E-20** | `/api/v1/dashboard/summary` | `GET` | Akses endpoint statistik | `200 OK` | Respons `{success: true, data: {totalCopies, availableCopies, borrowedCopies, activeLoans}}`. Rumus matematis `total - available == activeLoans` valid 100%. | **VERIFIED** |
| **E2E-21** | `/api/v1/books/:id` | `GET` | Param: `id = testBookId` | `200 OK` | Header `ETag` tersemat dengan format Strong ETag RFC 9110 (`"[a-f0-9]{40}"`) tanpa prefiks `W/`. | **VERIFIED** |
| **E2E-22** | `/api/v1/books/:id` | `PUT` | Header: `If-Match: "{bookETag}"`<br>Body: data update | `200 OK` | Pembaruan berhasil dan menghasilkan Strong ETag baru yang berbeda. | **VERIFIED** |
| **E2E-23** | `/api/v1/books/:id` | `PUT` | Header: `If-Match: "0000000000000000000000000000000000000000"` (stale ETag) | `412 Precondition Failed` | Respons ditolak dengan status 412 dan resource di database terbukti TIDAK termutasi. | **VERIFIED** |
| **E2E-24** | `/api/v1/books/:id` | `PUT` | Header: `If-Match: W/"{bookETag}"` (weak ETag) | `412 Precondition Failed` | Weak validator ditolak sesuai kaidah strong comparison RFC 9110 Section 13.1.1. | **VERIFIED** |
| **E2E-25** | `/api/v1/books/:id` | `PATCH` | Tanpa header If-Match | `200 OK` | Pembaruan legacy tanpa If-Match tetap berhasil (backward compatibility). | **VERIFIED** |
| **E2E-26** | `/api/v1/books/:id` | `PUT` (Paralel) | Dua permintaan pembaruan konkuren dengan ETag awal yang sama | `[200, 412]` | Concurrency lock menjamin tepat satu transaksi berhasil (200) dan transaksi kedua ditolak (412) karena ETag telah basi. | **VERIFIED** |
| **E2E-27** | `/api/v1/books` | `POST` | Header: `Accept: application/problem+json`<br>Body: data tidak valid | `400 Bad Request` | Header `Content-Type: application/problem+json`, memuat field `type`, `title`, `status`, `detail`, `instance` (RFC 9457). | **VERIFIED** |
| **E2E-28** | `/api/v1/members` | `POST` | Header: `Accept: application/problem+json`<br>Body: NIM duplikat | `409 Conflict` | Header `Content-Type: application/problem+json`, field `type: https://api.perpus.ac.id/errors/conflict` (RFC 9457). | **VERIFIED** |
| **E2E-29** | `/api/v1/books` | `POST` | Header: `Accept: application/json`<br>Body: data tidak valid | `400 Bad Request` | Format respons mempertahankan envelope legacy `{statusCode, success: false, message, error, timestamp, path}`. | **VERIFIED** |
| **E2E-30** | `/api/v1/books` | `GET` | Query: `?sortBy=title&order=ASC` | `200 OK` | Daftar buku terurut abjad secara deterministik dari A ke Z. | **VERIFIED** |
| **E2E-31** | `/api/v1/books` | `GET` | Query: `?sortBy=unauthorized_column` | `400 Bad Request` | Kolom di luar allowlist ditolak dengan HTTP 400 Bad Request. | **VERIFIED** |
| **E2E-32** | `/api/v1/books` | `GET` | Query: `?order=RANDOM` | `400 Bad Request` | Arah pengurutan selain ASC/DESC ditolak dengan HTTP 400 Bad Request. | **VERIFIED** |
| **E2E-33** | `/api/v1/books` | `GET` | Fixture: 4 buku dengan `createdAt` sama persis, dipaginasi `limit=2&page=1` dan `limit=2&page=2` | `200 OK` | Tidak ada irisan ID antara halaman 1 dan 2 (tie-breaker `id ASC` deterministik 100%). | **VERIFIED** |

---

## 3. Matriks Pengujian Unit (Unit Tests)
Dieksekusi melalui: `npm test`
Lingkungan: Vitest in-memory mocks

| Unit Test Suite | Komponen yang Diuji | Skenario Pengujian | Hasil Aktual | Status |
|---|---|---|---|:---:|
| `etag.util.spec.ts` (8 tests) | Strong ETag & If-Match Evaluator | Strong ETag tanpa W/, konsistensi hashing, deteksi perubahan data, penolakan Weak ETag W/..., pencocokan valid, penolakan stale ETag, wildcard *, backward compatibility tanpa header. | 8 Passed | **VERIFIED** |
| `http-exception.filter.spec.ts` (3 tests) | RFC 9457 Problem Details Filter | Format application/problem+json pada error 400, format application/problem+json pada error 409, format legacy envelope pada Accept application/json. | 3 Passed | **VERIFIED** |
| `app.controller.spec.ts` (1 test) | Root Controller | Hello World root verification | 1 Passed | **VERIFIED** |
| `books.service.spec.ts` (12 tests) | Books Logic & Concurrency | Penambahan buku, pagination, sorting allowlist, tie-breaker id ASC, penolakan invalid sortBy, detail buku, 404 not found, proteksi stok vs loans aktif, penambahan stok, If-Match valid, stale If-Match 412, Weak ETag 412, proteksi delete. | 12 Passed | **VERIFIED** |
| `members.service.spec.ts` (9 tests) | Members Logic & Concurrency | Pendaftaran anggota, penolakan duplikasi NIM 409, sorting allowlist, tie-breaker id ASC, penolakan invalid sortBy, If-Match valid, stale If-Match 412, Weak ETag 412, proteksi delete dengan pinjaman aktif. | 9 Passed | **VERIFIED** |
| `loans.service.spec.ts` (7 tests) | Circulation Logic & Atomicity | Peminjaman valid, pengurangan stok, penolakan stok habis, penolakan dueDate invalid, pengembalian valid, penambahan stok kembali, penolakan pengembalian ganda. | 7 Passed | **VERIFIED** |
| **Total Unit Tests** | **6 Suites** | **40 Kasus Uji Unit Logic** | **40 Passed (0 Failed)** | **VERIFIED** |

---

## 4. Matriks Pengujian Koleksi Postman via Newman CLI
Dieksekusi melalui: `npm run test:newman`
Koleksi: [`postman/perpus_uts_api.postman_collection.json`](file:///e:/New%20Web/perpus_uts_api/postman/perpus_uts_api.postman_collection.json)

| No. Request | Nama Operasi Postman | Method | Endpoint URL | Status Code | Asersi yang Terverifikasi |
|:---:|---|:---:|---|:---:|---|
| 1 | Get Summary Statistik | `GET` | `/dashboard/summary` | 200 OK | Status 200, Envelope sukses, Metrik lengkap |
| 2 | Get All Books | `GET` | `/books?page=1&limit=10&search=` | 200 OK | Status 200, Books list envelope |
| 3 | Get Books Sorted ASC (Stable Sorting) | `GET` | `/books?sortBy=title&order=ASC` | 200 OK | Status 200, Array terurut stabil |
| 4 | Create Book | `POST` | `/books` | 201 Created | Status 201, ID buku UUID terbentuk |
| 5 | Get Book Detail by ID | `GET` | `/books/{{bookId}}` | 200 OK | Status 200, Strong ETag header tanpa W/ |
| 6 | Update Book with Valid If-Match (Strong ETag) | `PUT` | `/books/{{bookId}}` | 200 OK | Status 200, Conditional update sukses |
| 7 | Update Book with Stale ETag (412 Precondition Failed) | `PUT` | `/books/{{bookId}}` | 412 Precondition Failed | Status 412, Resource tidak termutasi |
| 8 | Update Book (PUT) | `PUT` | `/books/{{bookId}}` | 200 OK | Status 200, Legacy update penuh berhasil |
| 9 | Update Book Partial (PATCH) | `PATCH` | `/books/{{bookId}}` | 200 OK | Status 200, Legacy update parsial berhasil |
| 10 | Delete Book | `DELETE` | `/books/{{bookToDeleteId}}` | 200 OK | Status 200, Buku terhapus dari katalog |
| 11 | Get All Members | `GET` | `/members?page=1&limit=10&search=` | 200 OK | Status 200, Members list envelope |
| 12 | Register Member | `POST` | `/members` | 201 Created | Status 201, NIM unik terdaftar |
| 13 | Register Member Duplicate NIM (RFC 9457 Problem Details) | `POST` | `/members` | 409 Conflict | Status 409, Content-Type application/problem+json, Schema RFC 9457 valid |
| 14 | Get Member Detail by ID | `GET` | `/members/{{memberId}}` | 200 OK | Status 200, Detail anggota valid |
| 15 | Update Member (PUT) | `PUT` | `/members/{{memberId}}` | 200 OK | Status 200, Update penuh berhasil |
| 16 | Update Member Partial (PATCH) | `PATCH` | `/members/{{memberId}}` | 200 OK | Status 200, Update parsial berhasil |
| 17 | Delete Member | `DELETE` | `/members/{{memberToDeleteId}}` | 200 OK | Status 200, Anggota terhapus |
| 18 | Get All Loans | `GET` | `/loans?page=1&limit=10` | 200 OK | Status 200, Loans list envelope |
| 19 | Get Borrowed Loans Only | `GET` | `/loans?status=BORROWED` | 200 OK | Status 200, Filter status BORROWED |
| 20 | Create Loan (Borrow Book - Decrements Stock) | `POST` | `/loans` | 201 Created | Status 201, Peminjaman status BORROWED |
| 21 | Get Loan Detail by ID | `GET` | `/loans/{{loanId}}` | 200 OK | Status 200, Detail peminjaman cocok |
| 22 | Return Book (Increments Stock) | `PATCH` | `/loans/{{loanId}}/return` | 200 OK | Status 200, Status berubah RETURNED |
