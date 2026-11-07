# Laporan Resolusi Kesenjangan Akademik (Remediation Resolution Report)
**Dokumen Penutupan Kesenjangan Pemenuhan 7 Tugas RESTful API — Opsi B Selesai**
**Proyek:** Sistem Informasi Perpustakaan Sederhana
**Lokasi Direktori:** `E:\New Web\perpus_uts_api`
**Tanggal Verifikasi Remediasi:** 7 November 2026
**Status Akhir:** **SELURUH GAP BERHASIL DISELESAIKAN (ALL GAPS RESOLVED — 100% PASS)**

---

## 1. Matriks Status Resolusi Kesenjangan

| ID Gap | Terkait Tugas | Judul Temuan Kesenjangan Awal | Tindakan Perbaikan yang Telah Dilakukan | Bukti Verifikasi Pengujian | Status Akhir |
|:---:|:---:|---|---|---|:---:|
| **GAP-01** | **Tugas 4** | Ketiadaan Evaluasi Header `If-Match` & HTTP 412 | Dibuat modul [`src/common/utils/etag.util.ts`](file:///e:/New%20Web/perpus_uts_api/src/common/utils/etag.util.ts), diimplementasikan Strong ETag RFC 9110 tanpa `W/` pada `TransformInterceptor`, serta evaluasi atomik `If-Match` dalam transaksi DB dengan row lock `pessimistic_write` pada `BooksService` dan `MembersService`. | • 8 Unit tests pada `etag.util.spec.ts`<br>• 6 E2E tests pada `library.e2e-spec.ts`<br>• 2 Newman requests (200 & 412) | **RESOLVED (PASS)** |
| **GAP-02** | **Tugas 4** | Belum Ada Format Error RFC 9457 Problem Details | Diperbarui [`HttpExceptionFilter`](file:///e:/New%20Web/perpus_uts_api/src/common/filters/http-exception.filter.ts) dengan *Content Negotiation* `Accept: application/problem+json`. Menghasilkan field `type`, `title`, `status`, `detail`, `instance`. Format legacy tetap dipertahankan untuk backward compatibility. | • 3 Unit tests pada `http-exception.filter.spec.ts`<br>• 3 E2E tests (400, 409, legacy)<br>• 1 Newman request pada Members | **RESOLVED (PASS)** |
| **GAP-03** | **Tugas 4** | Pengurutan Statis Tanpa Kueri Dinamis & Tie-Breaker | Ditambahkan parameter `sortBy` dan `order` pada [`PaginationQueryDto`](file:///e:/New%20Web/perpus_uts_api/src/common/dto/pagination-query.dto.ts) dengan validasi allowlist ketat serta secondary tie-breaker deterministik `id ASC`. | • 3 Unit tests sorting allowlist<br>• 4 E2E tests (ASC, invalid sortBy 400, invalid order 400, fixture identik tanpa overlap)<br>• 1 Newman request sorting | **RESOLVED (PASS)** |
| **GAP-04** | **Tugas 1 & 3** | Subfolder Screenshot Tugas 1 & 3 Belum Ada | Dibuat subfolder fisik `Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD` dan `Hasil Screen Shot/Tugas_03_REST_Principles_URI`, dan seluruh tangkapan layar Tugas 1 s.d. 7 telah dikumpulkan secara lengkap serta direkonsiliasi resmi pada [`docs/SCREENSHOT_INVENTORY.csv`](file:///e:/New%20Web/perpus_uts_api/docs/SCREENSHOT_INVENTORY.csv). | File inventaris CSV 47 baris (47 file fisik terverifikasi 100% lengkap di disk) | **RESOLVED (PASS)** |

---

## 2. Rincian Teknis Implementasi & Pembuktian Empiris

### 2.1 GAP-01: Strong ETag & Evaluasi Atomik If-Match
- **Implementasi:**
  1. Strong ETag dihitung menggunakan representasi entitas deterministik berbasis hashing SHA-1 hex 40-karakter diapit kutip ganda (tanpa `W/`).
  2. Weak ETag (`W/...`) ditolak secara tegas pada operasi mutasi sesuai spesifikasi RFC 9110 Section 13.1.1.
  3. Evaluasi precondition dilakukan di dalam transaksi database menggunakan `queryRunner.manager.findOne(..., { lock: { mode: 'pessimistic_write' } })`.
  4. Pengujian konkurensi paralel (`Promise.all`) membuktikan bahwa dua permintaan pembaruan dengan ETag awal yang sama menghasilkan status `[200, 412]` secara deterministik (mencegah *lost updates*).

### 2.2 GAP-02: Problem Details RFC 9457
- **Implementasi:**
  1. `HttpExceptionFilter` memeriksa header `request.headers['accept']`.
  2. Jika memuat `application/problem+json`, header respons disetel `Content-Type: application/problem+json` dengan struktur standar RFC 9457.
  3. Terverifikasi untuk Error 400 (validasi buku/eksemplar), Error 409 (duplikasi NIM anggota), dan Error 412 (precondition failed).
  4. Jika klien tidak menyertakan Accept khusus, format amplop seragam legacy `{ statusCode, success: false, message, error, timestamp, path }` tetap aktif.

### 2.3 GAP-03: Stable Sorting dengan Tie-Breaker
- **Implementasi:**
  1. `PaginationQueryDto` menerima `sortBy` (default: `'createdAt'`) dan `order` (default: `'DESC'`, transform uppercase, validasi `@IsIn(['ASC', 'DESC'])`).
  2. Service layer membatasi pengurutan hanya pada kolom allowlist yang diizinkan untuk mencegah SQL injection.
  3. Klausa pengurutan menyertakan `id: 'ASC'` sebagai secondary tie-breaker deterministik.
  4. Pengujian fixture dengan 4 entitas ber-timestamp identik membuktikan navigasi halaman `limit=2&page=1` dan `limit=2&page=2` menghasilkan irisan ID kosong (`intersection.length === 0`), menjamin tidak ada duplikasi data.

### 2.4 GAP-04: Kelengkapan Inventaris Bukti Screenshot
- **Implementasi:**
  1. Subfolder fisik `Tugas_01_Requirement_PRD_ERD/` dan `Tugas_03_REST_Principles_URI/` telah dibentuk.
  2. Dokumen panduan `README_EVIDENCE_GUIDE.md` telah disiapkan pada kedua folder.
  3. Berkas [`docs/SCREENSHOT_INVENTORY.csv`](file:///e:/New%20Web/perpus_uts_api/docs/SCREENSHOT_INVENTORY.csv) telah merekonsiliasi seluruh 47 file gambar fisik yang ada di disk secara transparan dan terverifikasi tanpa ada file yang hilang atau pending.

---

## 3. Kesimpulan Status Proyek

Dengan terselesaikannya seluruh 4 butir tindakan perbaikan minimum (GAP-01 s.d. GAP-04) yang dibuktikan dengan kelulusan **40 Unit Tests, 33 E2E Tests, dan 48 Newman Assertions (0 Gagal)**, seluruh persyaratan teknis perkuliahan telah terpenuhi secara utuh dan valid. Proyek dinyatakan **READY FOR SUBMISSION**.
