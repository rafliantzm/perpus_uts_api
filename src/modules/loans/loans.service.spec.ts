import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LoansService } from './loans.service.js';
import { Loan, LoanStatus } from './entities/loan.entity.js';
import { Book } from '../books/entities/book.entity.js';
import { Member } from '../members/entities/member.entity.js';

describe('LoansService (Atomic Business Logic & Stock Consistency)', () => {
  let service: LoansService;
  let mockLoanRepo: any;
  let mockBookRepo: any;
  let mockMemberRepo: any;
  let mockDataSource: any;

  const sampleBook: Book = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    title: 'Clean Architecture',
    author: 'Robert C. Martin',
    isbn: '978-0134494166',
    totalCopies: 3,
    availableCopies: 1, // 1 tersisa
    loans: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleMember: Member = {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    name: 'Budi Santoso',
    nim: '2210511003',
    email: 'budi.s@mahasiswa.ac.id',
    loans: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleLoan: Loan = {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    bookId: sampleBook.id,
    memberId: sampleMember.id,
    book: { ...sampleBook },
    member: { ...sampleMember },
    loanDate: '2026-11-01',
    dueDate: '2026-11-08',
    returnDate: null,
    status: LoanStatus.BORROWED,
    notes: 'Tugas kuliah',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockLoanRepo = {
      findAndCount: vi.fn().mockResolvedValue([[sampleLoan], 1]),
      findOne: vi.fn().mockResolvedValue(sampleLoan),
    };
    mockBookRepo = {};
    mockMemberRepo = {};

    mockDataSource = {
      transaction: vi.fn().mockImplementation(async (callback) => {
        const mockManager = {
          findOne: vi.fn().mockImplementation(async (entityClass, options) => {
            if (entityClass === Member) {
              return options.where.id === sampleMember.id ? { ...sampleMember } : null;
            }
            if (entityClass === Book) {
              return options.where.id === sampleBook.id ? { ...sampleBook } : null;
            }
            if (entityClass === Loan) {
              return options.where.id === sampleLoan.id ? { ...sampleLoan } : null;
            }
            return null;
          }),
          create: vi.fn().mockImplementation((entityClass, data) => ({
            id: 'generated-loan-id',
            ...data,
          })),
          save: vi.fn().mockImplementation(async (entityClassOrEntity, maybeEntity) => {
            return maybeEntity || entityClassOrEntity;
          }),
        };
        return await callback(mockManager);
      }),
    };

    service = new LoansService(
      mockLoanRepo,
      mockBookRepo,
      mockMemberRepo,
      mockDataSource,
    );
  });

  describe('Peminjaman Buku (create)', () => {
    it('harus berhasil meminjam buku dan mengurangi eksemplar tersedia secara atomik', async () => {
      const result = await service.create({
        bookId: sampleBook.id,
        memberId: sampleMember.id,
        loanDate: '2026-11-07',
        dueDate: '2026-11-14',
      });

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(result.status).toBe(LoanStatus.BORROWED);
      expect(result.book.availableCopies).toBe(0); // 1 dikurangi 1 menjadi 0
    });

    it('harus menolak peminjaman jika stok buku habis (availableCopies <= 0)', async () => {
      mockDataSource.transaction.mockImplementationOnce(async (callback: any) => {
        const mockManager = {
          findOne: vi.fn().mockImplementation(async (entityClass) => {
            if (entityClass === Member) return { ...sampleMember };
            if (entityClass === Book) return { ...sampleBook, availableCopies: 0 };
            return null;
          }),
        };
        return await callback(mockManager);
      });

      await expect(
        service.create({
          bookId: sampleBook.id,
          memberId: sampleMember.id,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('harus menolak peminjaman jika batas pengembalian lebih awal dari tanggal pinjam', async () => {
      await expect(
        service.create({
          bookId: sampleBook.id,
          memberId: sampleMember.id,
          loanDate: '2026-11-10',
          dueDate: '2026-11-05', // due date invalid
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('harus menolak peminjaman jika anggota tidak ditemukan (404)', async () => {
      await expect(
        service.create({
          bookId: sampleBook.id,
          memberId: 'non-existent-member',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Pengembalian Buku (returnBook)', () => {
    it('harus berhasil mengembalikan buku dan menambah stok eksemplar secara atomik', async () => {
      const result = await service.returnBook(sampleLoan.id, {
        returnDate: '2026-11-05',
        notes: 'Buku mulus',
      });

      expect(result.status).toBe(LoanStatus.RETURNED);
      expect(result.returnDate).toBe('2026-11-05');
      expect(result.book.availableCopies).toBe(2); // 1 ditambah 1 jadi 2
    });

    it('harus menolak pengembalian jika status buku sudah RETURNED sebelumnya', async () => {
      mockDataSource.transaction.mockImplementationOnce(async (callback: any) => {
        const mockManager = {
          findOne: vi.fn().mockImplementation(async (entityClass) => {
            if (entityClass === Loan) {
              return { ...sampleLoan, status: LoanStatus.RETURNED, returnDate: '2026-11-02' };
            }
            return null;
          }),
        };
        return await callback(mockManager);
      });

      await expect(
        service.returnBook(sampleLoan.id, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('harus menolak pengembalian jika ID transaksi tidak ditemukan (404)', async () => {
      mockDataSource.transaction.mockImplementationOnce(async (callback: any) => {
        const mockManager = {
          findOne: vi.fn().mockResolvedValue(null),
        };
        return await callback(mockManager);
      });

      await expect(
        service.returnBook('non-existent-loan', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
