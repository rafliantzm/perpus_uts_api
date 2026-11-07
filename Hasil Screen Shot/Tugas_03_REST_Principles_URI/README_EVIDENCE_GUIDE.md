# Panduan & Log Bukti Visual (Screenshot Evidence Guide) — Tugas 3
**Topik:** Prinsip Arsitektur REST, URI Berbasis Resource, CRUD & Standard Response Envelope
**Lokasi Direktori:** `Hasil Screen Shot/Tugas_03_REST_Principles_URI/`
**Status Audit:** **VERIFIED (5 Berkas Tangkapan Layar Lengkap & Terverifikasi Fisik di Disk)**

Seluruh 5 berkas tangkapan layar untuk Tugas 3 telah terverifikasi secara fisik:

1. **`T03_01_Resource_Oriented_URI_Books.png`** (126 KB)
   - **Sumber Tampilan:** Swagger UI (`http://localhost:3000/api/docs#/Books`) atau Postman tab Books.
   - **Konten yang Ditampilkan:** URI berbasis kata benda jamak `/api/v1/books` dengan method GET, POST, GET :id, PUT :id, PATCH :id, DELETE :id.

2. **`T03_02_Resource_Oriented_URI_Members.png`** (127 KB)
   - **Sumber Tampilan:** Swagger UI (`http://localhost:3000/api/docs#/Members`) atau Postman tab Members.
   - **Konten yang Ditampilkan:** URI berbasis kata benda jamak `/api/v1/members` dengan operasi CRUD lengkap.

3. **`T03_03_Resource_Oriented_URI_Loans.png`** (111 KB)
   - **Sumber Tampilan:** Swagger UI (`http://localhost:3000/api/docs#/Loans`) atau Postman tab Loans.
   - **Konten yang Ditampilkan:** URI sub-resource sirkulasi `/api/v1/loans` dan aksi pengembalian `/api/v1/loans/:id/return`.

4. **`T03_04_Standard_Response_Envelope_Success.png`** (164 KB)
   - **Sumber Tampilan:** Postman GET `/api/v1/books/:id` atau GET `/api/v1/members/:id`.
   - **Konten yang Ditampilkan:** Amplop seragam respons sukses `{ statusCode: 200, success: true, message: "...", data: { ... } }` beserta header Strong ETag.

5. **`T03_05_Standard_Response_Envelope_Error.png`** (157 KB)
   - **Sumber Tampilan:** Postman GET `/api/v1/books/invalid-id`.
   - **Konten yang Ditampilkan:** Amplop seragam respons kesalahan `{ statusCode: 404, success: false, message: "...", error: "Not Found", timestamp: "...", path: "..." }`.
