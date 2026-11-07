# Panduan Pengambilan Bukti Visual Manual (Manual Screenshot Capture Guide)
**Proyek:** Sistem Informasi Perpustakaan Sederhana (RESTful API `/api/v1`)
**Lokasi Direktori:** `E:\New Web\perpus_uts_api`
**Target Keamanan Basis Data:** Menggunakan Server Port 3001 (`perpus_uts_test_db`) untuk seluruh pengujian mutasi, menjamin `perpus_uts_db` tetap 100% utuh tanpa modifikasi.

---

## 1. Prosedur Keamanan Isolasi Server Pengujian (Safety First)

Sebelum membuka Postman untuk melakukan pengambilan screenshot pada request mutasi (`POST`, `PUT`, `PATCH`, `DELETE`):

1. **Jalankan Server Pengujian Terisolasi:**
   Buka terminal PowerShell baru dan jalankan:
   ```powershell
   npm run start:test
   ```
   *Server akan berjalan pada port 3001 dan terhubung khusus ke `perpus_uts_test_db`.*
2. **Atur Environment Postman:**
   Pastikan variabel `baseUrl` pada Postman mengarah ke:
   ```
   http://localhost:3001/api/v1
   ```
   *(Jangan gunakan port 3000 untuk pengujian mutatif agar database utama pustakawan `perpus_uts_db` tidak terpengaruh!)*

---

## 2. Checklist Target Screenshot yang Perlu Diambil

Berikut adalah daftar 16 file gambar yang dapat diambil secara manual untuk melengkapi arsip fisik:

| No | Target File Screenshot | Aplikasi Sumber | Metode / URL / Dokumen | Deskripsi Tampilan yang Harus Terlihat |
|:---:|---|:---:|:---:|---|
| 1 | `Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/T01_01_PRD_Scope_Requirements.png` | VS Code / Markdown Viewer | `docs/PRD_ERD_API_CONTRACT.md` | Bagian PRD, batasan lingkup, dan kebutuhan 4 resource perpustakaan. |
| 2 | `Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/T01_02_ERD_Database_Diagram.png` | VS Code / Markdown Viewer | `docs/PRD_ERD_API_CONTRACT.md` | Bagian diagram ERD ASCII/Mermaid dan relasi antar-entitas. |
| 3 | `Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/T01_03_Client_Server_Architecture.png` | Web Browser (Chrome/Edge) | `http://localhost:3000/` | Web frontend pustakawan dengan F12 Network tab terbuka memanggil `/api/v1/dashboard/summary`. |
| 4 | `Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/T01_04_API_Contract_Endpoints.png` | Swagger UI / Browser | `http://localhost:3000/api/docs` | Daftar 17 endpoint operations lengkap dengan tag Books, Members, Loans, Dashboard. |
| 5 | `Hasil Screen Shot/Tugas_03_REST_Principles_URI/T03_01_Resource_Oriented_URI_Books.png` | Swagger UI | `http://localhost:3000/api/docs#/Books` | URI kata benda jamak `/api/v1/books` dengan method GET, POST, PUT, PATCH, DELETE. |
| 6 | `Hasil Screen Shot/Tugas_03_REST_Principles_URI/T03_02_Resource_Oriented_URI_Members.png` | Swagger UI | `http://localhost:3000/api/docs#/Members` | URI kata benda jamak `/api/v1/members`. |
| 7 | `Hasil Screen Shot/Tugas_03_REST_Principles_URI/T03_03_Resource_Oriented_URI_Loans.png` | Swagger UI | `http://localhost:3000/api/docs#/Loans` | URI transaksi sirkulasi `/api/v1/loans` dan sub-resource aksi `/loans/{id}/return`. |
| 8 | `Hasil Screen Shot/Tugas_03_REST_Principles_URI/T03_04_Standard_Response_Envelope_Success.png` | Postman | `GET {{baseUrl}}/books/:id` | Respons JSON sukses `{ statusCode: 200, success: true, message: "...", data: { ... } }`. |
| 9 | `Hasil Screen Shot/Tugas_03_REST_Principles_URI/T03_05_Standard_Response_Envelope_Error.png` | Postman | `GET {{baseUrl}}/books/00000000-0000-0000-0000-000000000000` | Respons JSON error `{ statusCode: 404, success: false, message: "...", error: "Not Found", timestamp, path }`. |
| 10 | `Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_ET01_Strong_ETag_Header.png` | Postman | `GET {{baseUrl}}/books/:id` | Tab Headers pada respons Postman memperlihatkan `ETag: "[a-f0-9]{40}"` tanpa prefiks `W/`. |
| 11 | `Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_ET02_IfMatch_Valid_200_OK.png` | Postman | `PUT {{baseUrl}}/books/:id` | Header `If-Match: "{strongETag}"` menghasilkan status `200 OK` dan ETag baru. |
| 12 | `Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_ET03_IfMatch_Stale_412_Precondition_Failed.png` | Postman | `PUT {{baseUrl}}/books/:id` | Header `If-Match: "0000000000000000000000000000000000000000"` menghasilkan status `412 Precondition Failed`. |
| 13 | `Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_ST01_Sorting_Title_ASC.png` | Postman | `GET {{baseUrl}}/books?sortBy=title&order=ASC` | Respons daftar buku terurut alfabetis dari A ke Z. |
| 14 | `Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_ST02_Sorting_Title_DESC.png` | Postman | `GET {{baseUrl}}/books?sortBy=title&order=DESC` | Respons daftar buku terurut terbalik dari Z ke A. |
| 15 | `Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_PD01_Problem_Details_400_Bad_Request.png` | Postman | `POST {{baseUrl}}/books` | Header `Accept: application/problem+json`, body invalid `{}` -> Respons `400 Bad Request` berformat RFC 9457. |
| 16 | `Hasil Screen Shot/Tugas_04_REST_API_Lanjutan/T04_PD02_Problem_Details_409_Conflict.png` | Postman | `POST {{baseUrl}}/members` | Header `Accept: application/problem+json`, NIM duplikat -> Respons `409 Conflict` berformat RFC 9457. |

---

## 3. Template Permintaan Postman yang Aman (Safe Request Templates)

### A. Strong ETag & Conditional Update (Tugas 4)
#### Request 1: Ambil Strong ETag
- **Method:** `GET`
- **URL:** `http://localhost:3001/api/v1/books`
- **Langkah:** Salin `id` salah satu buku, lalu panggil:
  `GET http://localhost:3001/api/v1/books/<bookId>`
- **Periksa Response Headers:**
  Cari header `ETag`, nilainya berupa: `"b6c9b36021669466540bca80373dfa10522ff95f"`.
  *(Ambil screenshot tab Headers -> Simpan sebagai `T04_ET01_Strong_ETag_Header.png`)*

#### Request 2: Conditional Update dengan If-Match Valid
- **Method:** `PUT`
- **URL:** `http://localhost:3001/api/v1/books/<bookId>`
- **Headers:**
  - `Content-Type: application/json`
  - `If-Match: "b6c9b36021669466540bca80373dfa10522ff95f"` *(isi dengan nilai ETag dari Request 1)*
- **Body (raw JSON):**
  ```json
  {
    "title": "Clean Code (Revisi Valid ETag)",
    "author": "Robert C. Martin",
    "totalCopies": 5
  }
  ```
- **Expected Status:** `200 OK`
  *(Ambil screenshot Postman -> Simpan sebagai `T04_ET02_IfMatch_Valid_200_OK.png`)*

#### Request 3: Conditional Update dengan Stale ETag (412)
- **Method:** `PUT`
- **URL:** `http://localhost:3001/api/v1/books/<bookId>`
- **Headers:**
  - `Content-Type: application/json`
  - `If-Match: "0000000000000000000000000000000000000000"` *(ETag sengaja dibuat usang)*
- **Body (raw JSON):**
  ```json
  {
    "title": "Buku Tidak Boleh Berubah",
    "author": "Robert C. Martin",
    "totalCopies": 5
  }
  ```
- **Expected Status:** `412 Precondition Failed`
  *(Ambil screenshot Postman -> Simpan sebagai `T04_ET03_IfMatch_Stale_412_Precondition_Failed.png`)*

---

### B. Stable Dynamic Sorting (Tugas 4)
#### Request 4: Pengurutan Judul ASC
- **Method:** `GET`
- **URL:** `http://localhost:3001/api/v1/books?sortBy=title&order=ASC`
- **Expected Status:** `200 OK`
- **Tampilan:** Data buku tersusun rapi dari huruf A ke Z.
  *(Ambil screenshot Postman -> Simpan sebagai `T04_ST01_Sorting_Title_ASC.png`)*

#### Request 5: Pengurutan Judul DESC
- **Method:** `GET`
- **URL:** `http://localhost:3001/api/v1/books?sortBy=title&order=DESC`
- **Expected Status:** `200 OK`
- **Tampilan:** Data buku tersusun rapi dari huruf Z ke A.
  *(Ambil screenshot Postman -> Simpan sebagai `T04_ST02_Sorting_Title_DESC.png`)*

---

### C. Problem Details RFC 9457 (Tugas 4)
#### Request 6: Error 400 Bad Request
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/v1/books`
- **Headers:**
  - `Content-Type: application/json`
  - `Accept: application/problem+json`
- **Body (raw JSON):**
  ```json
  {
    "title": "",
    "totalCopies": -1
  }
  ```
- **Expected Status:** `400 Bad Request`
- **Expected Response Header:** `Content-Type: application/problem+json`
- **Expected Response Body:**
  ```json
  {
    "type": "https://api.perpus.ac.id/errors/bad-request",
    "title": "Bad Request",
    "status": 400,
    "detail": "title tidak boleh kosong; totalCopies harus minimal 1",
    "instance": "/api/v1/books"
  }
  ```
  *(Ambil screenshot Postman -> Simpan sebagai `T04_PD01_Problem_Details_400_Bad_Request.png`)*

#### Request 7: Error 409 Conflict (Duplikasi NIM)
- **Method:** `POST`
- **URL:** `http://localhost:3001/api/v1/members`
- **Headers:**
  - `Content-Type: application/json`
  - `Accept: application/problem+json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Anggota Duplikat",
    "nim": "2210511001",
    "email": "duplikat@perpus.ac.id"
  }
  ```
  *(Catatan: pastikan NIM tersebut sudah ada di database test, atau kirimkan request yang sama dua kali)*
- **Expected Status:** `409 Conflict`
- **Expected Response Header:** `Content-Type: application/problem+json`
- **Expected Response Body:**
  ```json
  {
    "type": "https://api.perpus.ac.id/errors/conflict",
    "title": "Conflict",
    "status": 409,
    "detail": "Anggota dengan NIM 2210511001 sudah terdaftar",
    "instance": "/api/v1/members"
  }
  ```
  *(Ambil screenshot Postman -> Simpan sebagai `T04_PD02_Problem_Details_409_Conflict.png`)*
