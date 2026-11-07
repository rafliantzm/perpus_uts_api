import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { BooksService } from './books.service.js';
import { Book } from './entities/book.entity.js';
import { Loan, LoanStatus } from '../loans/entities/loan.entity.js';
import { computeEntityETag } from '../../common/utils/etag.util.js';

describe('BooksService', () => {
  let service: BooksService;
  let mockBookRepository: any;
  let mockLoanRepository: any;

  const mockBook: Book = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    totalCopies: 5,
    availableCopies: 5,
    loans: [],
    createdAt: new Date('2026-11-07T10:00:00.000Z'),
    updatedAt: new Date('2026-11-07T10:00:00.000Z'),
  };

  beforeEach(() => {
    mockBookRepository = {
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn().mockImplementation(async (book) => ({ id: 'new-id', ...book })),
      findAndCount: vi.fn().mockResolvedValue([[mockBook], 1]),
      findOne: vi.fn().mockImplementation(async ({ where }) => {
        if (where.id === mockBook.id) return { ...mockBook };
        return null;
      }),
      remove: vi.fn().mockResolvedValue(mockBook),
    };

    mockLoanRepository = {
      count: vi.fn().mockResolvedValue(0),
    };

    service = new BooksService(mockBookRepository, mockLoanRepository);
  });

  it('harus berhasil menambahkan buku baru dengan availableCopies sama dengan totalCopies', async () => {
    const dto = {
      title: 'The Pragmatic Programmer',
      author: 'David Thomas',
      isbn: '978-0135957059',
      totalCopies: 3,
    };

    const result = await service.create(dto);

    expect(mockBookRepository.create).toHaveBeenCalledWith({
      ...dto,
      availableCopies: 3,
    });
    expect(mockBookRepository.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('harus mengembalikan daftar buku dengan struktur pagination', async () => {
    const result = await service.findAll({ page: 1, limit: 10 });

    expect(mockBookRepository.findAndCount).toHaveBeenCalled();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
  });

  it('harus menyertakan secondary tie-breaker id: ASC saat sorting dinamis', async () => {
    await service.findAll({ page: 1, limit: 10, sortBy: 'title', order: 'ASC' });

    expect(mockBookRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        order: {
          title: 'ASC',
          id: 'ASC',
        },
      }),
    );
  });

  it('harus menolak sortBy di luar allowlist dengan BadRequestException (400)', async () => {
    await expect(
      service.findAll({ sortBy: 'injected_column_sql' as any }),
    ).rejects.toThrow(BadRequestException);
  });

  it('harus mengembalikan detail buku berdasarkan ID yang valid', async () => {
    const result = await service.findOne(mockBook.id);

    expect(result.id).toBe(mockBook.id);
    expect(result.title).toBe('Clean Code');
  });

  it('harus melemparkan NotFoundException jika ID buku tidak ditemukan', async () => {
    await expect(service.findOne('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('harus menolak pembaruan jika totalCopies baru lebih kecil dari buku yang sedang dipinjam', async () => {
    mockBookRepository.findOne.mockResolvedValueOnce({
      ...mockBook,
      totalCopies: 5,
      availableCopies: 2,
    });
    mockLoanRepository.count.mockResolvedValueOnce(3); // 3 buku sedang dipinjam aktif

    // Coba turunkan totalCopies jadi 2 (padahal sedang dipinjam 3)
    await expect(
      service.update(mockBook.id, { totalCopies: 2 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('harus menyesuaikan availableCopies secara konsisten saat totalCopies dinaikkan', async () => {
    mockBookRepository.findOne.mockResolvedValueOnce({
      ...mockBook,
      totalCopies: 5,
      availableCopies: 3, // 2 sedang dipinjam
    });
    mockLoanRepository.count.mockResolvedValueOnce(2);

    // Naikkan totalCopies dari 5 menjadi 7 (+2 eksemplar fisik baru)
    const updated = await service.update(mockBook.id, { totalCopies: 7 });

    expect(updated.totalCopies).toBe(7);
    expect(updated.availableCopies).toBe(5); // 3 + 2 = 5 (7 total - 2 dipinjam = 5)
  });

  it('harus berhasil memperbarui buku jika If-Match Strong ETag valid', async () => {
    const strongETag = computeEntityETag(mockBook);
    const updated = await service.update(
      mockBook.id,
      { title: 'Clean Code 2nd Edition' },
      strongETag,
    );
    expect(updated.title).toBe('Clean Code 2nd Edition');
  });

  it('harus melempar PreconditionFailedException (412) jika If-Match stale / mismatch', async () => {
    const staleETag = '"0000000000000000000000000000000000000000"';
    await expect(
      service.update(mockBook.id, { title: 'Updated' }, staleETag),
    ).rejects.toThrow(PreconditionFailedException);
  });

  it('harus melempar PreconditionFailedException (412) jika If-Match menggunakan Weak ETag (W/...)', async () => {
    const strongETag = computeEntityETag(mockBook);
    const weakETag = `W/${strongETag}`;
    await expect(
      service.update(mockBook.id, { title: 'Updated' }, weakETag),
    ).rejects.toThrow(PreconditionFailedException);
  });

  it('harus menolak penghapusan buku jika masih terdapat peminjaman aktif', async () => {
    mockLoanRepository.count.mockResolvedValueOnce(2);

    await expect(service.remove(mockBook.id)).rejects.toThrow(
      BadRequestException,
    );
  });
});
