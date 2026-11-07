# Panduan & Log Bukti Visual (Screenshot Evidence Guide) — Tugas 1
**Topik:** Analisis Kebutuhan, PRD, ERD, Client-Server & Kontrak Endpoint
**Lokasi Direktori:** `Hasil Screen Shot/Tugas_01_Requirement_PRD_ERD/`
**Status Audit:** **VERIFIED (6 Berkas Tangkapan Layar Lengkap & Terverifikasi Fisik di Disk)**

Seluruh 6 berkas tangkapan layar untuk Tugas 1 telah terverifikasi secara fisik:

1. **`T01_01_PRD_Scope_Requirements.png`** (127 KB)
   - **Sumber Tampilan:** Dokumen [`docs/PRD_ERD_API_CONTRACT.md`](../../docs/PRD_ERD_API_CONTRACT.md).
   - **Konten yang Ditampilkan:** Ringkasan latar belakang proyek, batasan ruang lingkup (*scope boundary*), serta tabel kebutuhan fungsional 4 resource (`books`, `members`, `loans`, `dashboard`).

2. **`T01_02_ERD_Database_Diagram.png`** (101 KB)
   - **Sumber Tampilan:** Dokumen [`docs/PRD_ERD_API_CONTRACT.md`](../../docs/PRD_ERD_API_CONTRACT.md).
   - **Konten yang Ditampilkan:** Diagram Entity-Relationship (ERD), relasi one-to-many antara members -> loans dan books -> loans, tipe data, serta foreign key constraints.

3. **`T01_03_Client_Server_Architecture.png`** (190 KB)
   - **Sumber Tampilan:** Browser membuka `http://localhost:3000/`.
   - **Konten yang Ditampilkan:** Bukti pemisahan arsitektur Client-Server, di mana Single Page Application HTML/JS memanggil backend RESTful API pada endpoint `/api/v1/dashboard/summary`.

4. **`T01_03B_Client_Server_Diagram.png`** (135 KB)
   - **Sumber Tampilan:** Dokumen [`docs/PRD_ERD_API_CONTRACT.md`](../../docs/PRD_ERD_API_CONTRACT.md).
   - **Konten yang Ditampilkan:** Diagram arsitektur Three-Tier Client-Server menggunakan Mermaid (Client Tier, Server Tier, Database Tier).

5. **`T01_03C_Client_Server_Flow_Continuation.png`** (89 KB)
   - **Sumber Tampilan:** Dokumen [`docs/PRD_ERD_API_CONTRACT.md`](../../docs/PRD_ERD_API_CONTRACT.md).
   - **Konten yang Ditampilkan:** Diagram alur deterministik request-response lifecycle (Client -> Router -> ValidationPipe -> Service -> TypeORM -> PostgreSQL -> TransformInterceptor).

6. **`T01_04_API_Contract_Endpoints.png`** (126 KB)
   - **Sumber Tampilan:** Dokumen [`docs/PRD_ERD_API_CONTRACT.md`](../../docs/PRD_ERD_API_CONTRACT.md).
   - **Konten yang Ditampilkan:** Matriks 17 endpoint operations lengkap dengan HTTP method, path parameter, query parameter, DTO body, dan status code.
