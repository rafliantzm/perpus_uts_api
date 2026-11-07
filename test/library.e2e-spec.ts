import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter.js';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor.js';

// ==========================================
// PRE-FLIGHT SAFETY GUARD: Environment check
// Rejects any run if NODE_ENV is not 'test' or if DB_NAME targets production/primary DB
// ==========================================
if (process.env.NODE_ENV !== 'test') {
  throw new Error(
    `[SAFETY GUARD VIOLATION] E2E Tests must be run with NODE_ENV='test'. Current NODE_ENV='${process.env.NODE_ENV}'. Aborting to protect primary database!`,
  );
}

if (process.env.DB_NAME && process.env.DB_NAME !== 'perpus_uts_test_db') {
  throw new Error(
    `[SAFETY GUARD VIOLATION] E2E Tests are configured for '${process.env.DB_NAME}'. Must ONLY run on 'perpus_uts_test_db'. Aborting to protect primary database!`,
  );
}

describe('Library REST API (Comprehensive Integration Tests on Dedicated Test Database)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    // Secondary check before bootstrapping
    if (process.env.NODE_ENV !== 'test' || (process.env.DB_NAME && process.env.DB_NAME !== 'perpus_uts_test_db')) {
      throw new Error('[SAFETY GUARD VIOLATION] Invalid environment detected before test bootstrap.');
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1', {
      exclude: ['/', 'api/docs', 'api/docs-json'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();

    // ==========================================
    // RUNTIME SAFETY GUARD: Verify TypeORM DataSource & PostgreSQL Session
    // ==========================================
    dataSource = app.get(DataSource);
    const configuredDb = dataSource.options.database;
    if (configuredDb === 'perpus_uts_db' || configuredDb !== 'perpus_uts_test_db') {
      await app.close();
      throw new Error(
        `[SAFETY GUARD VIOLATION] DataSource is connected to '${configuredDb}'! E2E Tests strictly refuse connection to 'perpus_uts_db'.`,
      );
    }

    const sessionDbRes = await dataSource.query('SELECT current_database() as db_name');
    const actualDb = sessionDbRes[0]?.db_name;
    if (actualDb !== 'perpus_uts_test_db') {
      await app.close();
      throw new Error(
        `[SAFETY GUARD VIOLATION] Active PostgreSQL session is connected to '${actualDb}'! Expected 'perpus_uts_test_db'. Aborting!`,
      );
    }

    // ==========================================
    // SETUP: Clean test database tables before running tests
    // ==========================================
    await dataSource.query('TRUNCATE TABLE loans, books, members CASCADE');
  });

  afterAll(async () => {
    // ==========================================
    // TEARDOWN: Clean test database tables after tests finish
    // ==========================================
    if (dataSource && dataSource.isInitialized) {
      const sessionDbRes = await dataSource.query('SELECT current_database() as db_name');
      if (sessionDbRes[0]?.db_name === 'perpus_uts_test_db') {
        await dataSource.query('TRUNCATE TABLE loans, books, members CASCADE');
      }
    }
    if (app) {
      await app.close();
    }
  });

  const timestamp = Date.now().toString().slice(-6);
  let testBookId: string;
  let zeroStockBookId: string;
  let testMemberId: string;
  let testLoanId: string;
  const uniqueNim = `NIM${timestamp}`;

  // ==========================================
  // 1. CRUD DATA BUKU
  // ==========================================
  describe('CRUD Books', () => {
    it('POST /api/v1/books -> harus menambahkan buku baru (totalCopies = availableCopies)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/books')
        .send({
          title: `Buku Uji Stok ${timestamp}`,
          author: 'Penulis Uji',
          isbn: `978-602${timestamp}`,
          totalCopies: 3,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.totalCopies).toBe(3);
      expect(res.body.data.availableCopies).toBe(3);
      testBookId = res.body.data.id;
    });

    it('GET /api/v1/books -> harus mengembalikan daftar buku dengan pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/books?page=1&limit=5')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta.page).toBe(1);
      expect(res.headers).toHaveProperty('etag');
    });

    it('GET /api/v1/books/:id -> harus mengembalikan detail buku', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/books/${testBookId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testBookId);
    });

    it('PUT /api/v1/books/:id -> harus memperbarui data buku secara penuh', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/books/${testBookId}`)
        .send({
          title: `Buku Uji Stok ${timestamp} (Updated)`,
          author: 'Penulis Uji Revisi',
          isbn: `978-602${timestamp}`,
          totalCopies: 4, // Naikkan dari 3 ke 4
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalCopies).toBe(4);
      expect(res.body.data.availableCopies).toBe(4); // Karena belum ada loan, availableCopies ikut bertambah ke 4
    });

    it('POST /api/v1/books -> buat buku dengan stok 1 untuk pengujian stok habis', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/books')
        .send({
          title: `Buku Stok Tunggal ${timestamp}`,
          author: 'Penulis Cepat Habis',
          totalCopies: 1,
        })
        .expect(201);

      zeroStockBookId = res.body.data.id;
      expect(res.body.data.availableCopies).toBe(1);
    });
  });

  // ==========================================
  // 2. CRUD ANGGOTA (MEMBERS)
  // ==========================================
  describe('CRUD Members', () => {
    it('POST /api/v1/members -> harus mendaftarkan anggota baru dengan NIM unik', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/members')
        .send({
          name: `Anggota Test ${timestamp}`,
          nim: uniqueNim,
          email: `test${timestamp}@mahasiswa.ac.id`,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.nim).toBe(uniqueNim);
      testMemberId = res.body.data.id;
    });

    it('POST /api/v1/members -> harus menolak duplikasi NIM (409 Conflict)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/members')
        .send({
          name: 'Duplikat Anggota',
          nim: uniqueNim,
        })
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Conflict');
    });

    it('GET /api/v1/members/:id -> harus mengembalikan detail anggota beserta riwayat relasi', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/members/${testMemberId}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testMemberId);
      expect(res.body.data).toHaveProperty('loans');
    });

    it('PATCH /api/v1/members/:id -> harus memperbarui sebagian data anggota', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/members/${testMemberId}`)
        .send({
          name: `Anggota Test ${timestamp} (Updated)`,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('(Updated)');
    });
  });

  // ==========================================
  // 3. TRANSAKSI SIRKULASI & REGRESSION TESTS KONSISTENSI STOK
  // ==========================================
  describe('Peminjaman, Pengembalian & Konsistensi Stok', () => {
    it('POST /api/v1/loans -> harus meminjam buku & mengurangi stok eksemplar secara atomik', async () => {
      // Ambil stok buku awal
      const bookBefore = await request(app.getHttpServer())
        .get(`/api/v1/books/${testBookId}`)
        .expect(200);
      const initialAvailable = bookBefore.body.data.availableCopies;

      const res = await request(app.getHttpServer())
        .post('/api/v1/loans')
        .send({
          bookId: testBookId,
          memberId: testMemberId,
          notes: 'Uji peminjaman atomik',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('BORROWED');
      expect(res.body.data.book.availableCopies).toBe(initialAvailable - 1);
      testLoanId = res.body.data.id;

      // Verifikasi di DB bahwa availableCopies buku berkurang tepat 1
      const bookAfter = await request(app.getHttpServer())
        .get(`/api/v1/books/${testBookId}`)
        .expect(200);
      expect(bookAfter.body.data.availableCopies).toBe(initialAvailable - 1);
    });

    it('REGRESSION TEST: Konsistensi stok (totalCopies - availableCopies == activeLoans)', async () => {
      // Ambil detail buku
      const bookRes = await request(app.getHttpServer())
        .get(`/api/v1/books/${testBookId}`)
        .expect(200);
      const { totalCopies, availableCopies } = bookRes.body.data;

      // Ambil daftar pinjaman aktif untuk buku ini
      const loansRes = await request(app.getHttpServer())
        .get(`/api/v1/loans?bookId=${testBookId}&status=BORROWED`)
        .expect(200);

      const activeLoansForBook = loansRes.body.data.length;
      expect(totalCopies - availableCopies).toBe(activeLoansForBook);
    });

    it('PATCH /api/v1/loans/:id/return -> harus mengembalikan buku & menambah stok secara atomik', async () => {
      const bookBefore = await request(app.getHttpServer())
        .get(`/api/v1/books/${testBookId}`)
        .expect(200);
      const beforeAvailable = bookBefore.body.data.availableCopies;

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/loans/${testLoanId}/return`)
        .send({
          notes: 'Buku dikembalikan lengkap',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('RETURNED');
      expect(res.body.data.returnDate).toBeDefined();

      // Verifikasi stok kembali utuh
      const bookAfter = await request(app.getHttpServer())
        .get(`/api/v1/books/${testBookId}`)
        .expect(200);
      expect(bookAfter.body.data.availableCopies).toBe(beforeAvailable + 1);
    });

    it('REGRESSION TEST: Setelah pengembalian, activeLoans berkurang & stok kembali konsisten', async () => {
      const bookRes = await request(app.getHttpServer())
        .get(`/api/v1/books/${testBookId}`)
        .expect(200);
      const { totalCopies, availableCopies } = bookRes.body.data;

      const loansRes = await request(app.getHttpServer())
        .get(`/api/v1/loans?bookId=${testBookId}&status=BORROWED`)
        .expect(200);

      expect(totalCopies - availableCopies).toBe(loansRes.body.data.length);
    });
  });

  // ==========================================
  // 4. ERROR HANDLING & CONSTRAINTS VALIDATION
  // ==========================================
  describe('Error Handling & Edge Cases', () => {
    it('POST /api/v1/loans -> harus menolak peminjaman jika stok buku habis (400 Bad Request)', async () => {
      // Pinjam buku stok tunggal sampai habis
      await request(app.getHttpServer())
        .post('/api/v1/loans')
        .send({
          bookId: zeroStockBookId,
          memberId: testMemberId,
        })
        .expect(201);

      // Coba pinjam lagi saat stok 0
      const res = await request(app.getHttpServer())
        .post('/api/v1/loans')
        .send({
          bookId: zeroStockBookId,
          memberId: testMemberId,
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('stok eksemplar habis');
    });

    it('PATCH /api/v1/loans/:id/return -> harus menolak pengembalian ganda (400 Bad Request)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/loans/${testLoanId}/return`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('sudah dikembalikan sebelumnya');
    });

    it('POST /api/v1/loans -> harus menolak dueDate lebih awal dari loanDate (400 Bad Request)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/loans')
        .send({
          bookId: testBookId,
          memberId: testMemberId,
          loanDate: '2026-11-10',
          dueDate: '2026-11-05',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Batas pengembalian (dueDate) tidak boleh lebih awal');
    });

    it('POST /api/v1/loans -> harus menolak bookId non-existent (404 Not Found)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/loans')
        .send({
          bookId: '00000000-0000-4000-8000-000000000000',
          memberId: testMemberId,
        })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('DELETE /api/v1/books/:id -> harus menolak penghapusan buku jika memiliki peminjaman aktif', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/books/${zeroStockBookId}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('tidak dapat dihapus karena masih ada');
    });

    it('DELETE /api/v1/members/:id -> harus menolak penghapusan anggota jika masih meminjam buku aktif', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/members/${testMemberId}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('tidak dapat dihapus karena masih meminjam');
    });
  });

  // ==========================================
  // 5. DASHBOARD STATISTIK & SIRKULASI
  // ==========================================
  describe('Dashboard Summary Integrity', () => {
    it('GET /api/v1/dashboard/summary -> rumus (totalCopies - availableCopies) harus selalu sama dengan activeLoans', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/summary')
        .expect(200);

      expect(res.body.success).toBe(true);
      const data = res.body.data;
      expect(data.borrowedCopies).toBe(data.totalCopies - data.availableCopies);
      expect(data.borrowedCopies).toBe(data.activeLoans);
    });
  });

  // ==========================================
  // 6. STRONG ETAG & CONDITIONAL REQUESTS (IF-MATCH)
  // ==========================================
  describe('Strong ETag & Conditional Requests (If-Match)', () => {
    let bookETag: string;

    it('GET /api/v1/books/:id -> harus mengembalikan Strong ETag header (tanpa W/)', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/books/${testBookId}`)
        .expect(200);

      expect(res.headers.etag).toBeDefined();
      expect(res.headers.etag).toMatch(/^"[a-f0-9]{40}"$/);
      expect(res.headers.etag.startsWith('W/')).toBe(false);
      bookETag = res.headers.etag;
    });

    it('PUT /api/v1/books/:id -> update berhasil dengan If-Match valid dan mengembalikan ETag baru', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/v1/books/${testBookId}`)
        .set('If-Match', bookETag)
        .send({
          title: `Buku ETag Valid ${timestamp}`,
          author: 'Penulis ETag',
          totalCopies: 4,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.headers.etag).toBeDefined();
      expect(res.headers.etag).not.toBe(bookETag);
      bookETag = res.headers.etag;
    });

    it('PUT /api/v1/books/:id -> harus menolak dengan 412 Precondition Failed jika ETag usang (stale)', async () => {
      const staleETag = '"0000000000000000000000000000000000000000"';
      const res = await request(app.getHttpServer())
        .put(`/api/v1/books/${testBookId}`)
        .set('If-Match', staleETag)
        .send({
          title: 'Buku Tidak Boleh Berubah',
          author: 'Penulis Gagal',
          totalCopies: 4,
        })
        .expect(412);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(412);

      // Verifikasi bahwa resource di database TIDAK termutasi
      const checkRes = await request(app.getHttpServer())
        .get(`/api/v1/books/${testBookId}`)
        .expect(200);
      expect(checkRes.body.data.title).not.toBe('Buku Tidak Boleh Berubah');
    });

    it('PUT /api/v1/books/:id -> harus menolak Weak ETag (W/...) dengan 412 Precondition Failed', async () => {
      const weakETag = `W/${bookETag}`;
      const res = await request(app.getHttpServer())
        .put(`/api/v1/books/${testBookId}`)
        .set('If-Match', weakETag)
        .send({
          title: 'Buku Weak ETag Gagal',
          author: 'Penulis Gagal',
          totalCopies: 4,
        })
        .expect(412);

      expect(res.body.statusCode).toBe(412);
    });

    it('PATCH /api/v1/books/:id -> request legacy tanpa If-Match tetap kompatibel', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/books/${testBookId}`)
        .send({
          title: `Buku Tanpa If-Match ${timestamp}`,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Buku Tanpa If-Match');
    });

    it('CONCURRENCY: Dua update paralel dengan ETag awal yang sama tidak boleh keduanya menimpa data', async () => {
      const currentRes = await request(app.getHttpServer())
        .get(`/api/v1/books/${testBookId}`)
        .expect(200);
      const initialETag = currentRes.headers.etag;

      const req1 = request(app.getHttpServer())
        .put(`/api/v1/books/${testBookId}`)
        .set('If-Match', initialETag)
        .send({
          title: 'Pemenang Concurrency 1',
          author: 'Penulis Concurrency',
          totalCopies: 4,
        });

      const req2 = request(app.getHttpServer())
        .put(`/api/v1/books/${testBookId}`)
        .set('If-Match', initialETag)
        .send({
          title: 'Pemenang Concurrency 2',
          author: 'Penulis Concurrency',
          totalCopies: 4,
        });

      const [res1, res2] = await Promise.all([req1, req2]);
      const statuses = [res1.status, res2.status].sort();

      expect(statuses).toEqual([200, 412]);
    });
  });

  // ==========================================
  // 7. PROBLEM DETAILS RFC 9457 VS LEGACY ENVELOPE
  // ==========================================
  describe('Problem Details RFC 9457 vs Legacy Envelope', () => {
    it('POST /api/v1/books -> error validasi 400 mengembalikan application/problem+json saat diminta', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/books')
        .set('Accept', 'application/problem+json')
        .send({
          title: '',
          totalCopies: -5,
        })
        .expect(400);

      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body).toHaveProperty('type', 'https://api.perpus.ac.id/errors/bad-request');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('status', 400);
      expect(res.body).toHaveProperty('detail');
      expect(res.body).toHaveProperty('instance');
    });

    it('POST /api/v1/members -> error duplikasi NIM 409 mengembalikan application/problem+json', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/members')
        .set('Accept', 'application/problem+json')
        .send({
          name: 'Duplikat Anggota RFC9457',
          nim: uniqueNim,
        })
        .expect(409);

      expect(res.headers['content-type']).toContain('application/problem+json');
      expect(res.body).toHaveProperty('type', 'https://api.perpus.ac.id/errors/conflict');
      expect(res.body).toHaveProperty('title', 'Conflict');
      expect(res.body).toHaveProperty('status', 409);
      expect(res.body).toHaveProperty('detail');
      expect(res.body.detail).toContain('sudah terdaftar');
      expect(res.body).toHaveProperty('instance');
    });

    it('POST /api/v1/books -> error tanpa Accept khusus mempertahankan format legacy envelope', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/books')
        .set('Accept', 'application/json')
        .send({
          title: '',
        })
        .expect(400);

      expect(res.headers['content-type']).toContain('application/json');
      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('error');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('path');
    });
  });

  // ==========================================
  // 8. DYNAMIC STABLE SORTING & DETERMINISTIC TIE-BREAKER
  // ==========================================
  describe('Dynamic Stable Sorting & Deterministic Tie-Breaker', () => {
    it('GET /api/v1/books -> mendukung sortBy dan order ASC', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/books?sortBy=title&order=ASC')
        .expect(200);

      expect(res.body.success).toBe(true);
      const titles = res.body.data.map((b: any) => b.title);
      const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));
      expect(titles).toEqual(sortedTitles);
    });

    it('GET /api/v1/books -> menolak sortBy yang tidak valid dengan 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/books?sortBy=unauthorized_column')
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/books -> menolak order selain ASC/DESC dengan 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/books?order=RANDOM')
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('FIXTURE DETERMINISTIK: Dataset dengan createdAt sama terurut stabil tanpa duplikasi lintas halaman', async () => {
      const fixedTime = new Date('2026-11-07T12:00:00.000Z');
      for (let i = 1; i <= 4; i++) {
        await dataSource.query(
          `INSERT INTO books (id, title, author, "totalCopies", "availableCopies", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, 2, 2, $3, $3)`,
          [`Buku Stabil ${i} ${timestamp}`, `Penulis Stabil`, fixedTime],
        );
      }

      const page1Res = await request(app.getHttpServer())
        .get('/api/v1/books?sortBy=createdAt&order=DESC&limit=2&page=1')
        .expect(200);

      const page2Res = await request(app.getHttpServer())
        .get('/api/v1/books?sortBy=createdAt&order=DESC&limit=2&page=2')
        .expect(200);

      const page1Ids = page1Res.body.data.map((b: any) => b.id);
      const page2Ids = page2Res.body.data.map((b: any) => b.id);

      const intersection = page1Ids.filter((id: string) => page2Ids.includes(id));
      expect(intersection).toEqual([]);
      expect(page1Ids.length).toBe(2);
      expect(page2Ids.length).toBe(2);
    });
  });
});
