import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { CreateLoanDto } from './dto/create-loan.dto.js';
import { QueryLoanDto } from './dto/query-loan.dto.js';
import { ReturnLoanDto } from './dto/return-loan.dto.js';
import { Loan, LoanStatus } from './entities/loan.entity.js';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Verifikasi Anggota
      const member = await manager.findOne(Member, {
        where: { id: createLoanDto.memberId },
      });
      if (!member) {
        throw new NotFoundException(
          `Anggota dengan ID ${createLoanDto.memberId} tidak ditemukan`,
        );
      }

      // 2. Verifikasi Buku dengan Pessimistic Write Lock untuk mencegah race condition stok
      const book = await manager.findOne(Book, {
        where: { id: createLoanDto.bookId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) {
        throw new NotFoundException(
          `Buku dengan ID ${createLoanDto.bookId} tidak ditemukan`,
        );
      }

      if (book.availableCopies <= 0) {
        throw new BadRequestException(
          `Buku "${book.title}" sedang tidak tersedia untuk dipinjam (stok eksemplar habis).`,
        );
      }

      // 3. Tentukan tanggal peminjaman & batas pengembalian
      const today = new Date().toISOString().split('T')[0];
      const loanDate = createLoanDto.loanDate || today;

      let dueDate = createLoanDto.dueDate;
      if (!dueDate) {
        const d = new Date(loanDate);
        d.setDate(d.getDate() + 7);
        dueDate = d.toISOString().split('T')[0];
      }

      if (new Date(dueDate) < new Date(loanDate)) {
        throw new BadRequestException(
          'Batas pengembalian (dueDate) tidak boleh lebih awal dari tanggal pinjam (loanDate).',
        );
      }

      // 4. Kurangi stok buku secara atomik dalam transaksi database
      book.availableCopies -= 1;
      await manager.save(Book, book);

      // 5. Simpan transaksi peminjaman baru
      const loan = manager.create(Loan, {
        bookId: book.id,
        memberId: member.id,
        loanDate,
        dueDate,
        status: LoanStatus.BORROWED,
        notes: createLoanDto.notes || null,
      });

      const savedLoan = await manager.save(Loan, loan);

      return {
        ...savedLoan,
        book,
        member,
      };
    });
  }

  async returnBook(id: string, returnLoanDto: ReturnLoanDto): Promise<Loan> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Kunci baris peminjaman tanpa outer join agar valid di PostgreSQL FOR UPDATE
      const loan = await manager.findOne(Loan, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!loan) {
        throw new NotFoundException(
          `Transaksi peminjaman dengan ID ${id} tidak ditemukan`,
        );
      }

      if (loan.status === LoanStatus.RETURNED) {
        throw new BadRequestException(
          `Buku sudah dikembalikan sebelumnya pada tanggal ${loan.returnDate}.`,
        );
      }

      const today = new Date().toISOString().split('T')[0];
      const returnDate = returnLoanDto.returnDate || today;

      // 2. Update status peminjaman menjadi RETURNED
      loan.status = LoanStatus.RETURNED;
      loan.returnDate = returnDate;
      if (returnLoanDto.notes) {
        loan.notes = loan.notes
          ? `${loan.notes} | Catatan Pengembalian: ${returnLoanDto.notes}`
          : returnLoanDto.notes;
      }
      await manager.save(Loan, loan);

      // 3. Tambah stok eksemplar buku yang tersedia secara atomik dengan lock
      const book = await manager.findOne(Book, {
        where: { id: loan.bookId },
        lock: { mode: 'pessimistic_write' },
      });
      if (book) {
        book.availableCopies = Math.min(
          book.availableCopies + 1,
          book.totalCopies,
        );
        await manager.save(Book, book);
        loan.book = book;
      }

      const member = await manager.findOne(Member, {
        where: { id: loan.memberId },
      });
      if (member) {
        loan.member = member;
      }

      return loan;
    });
  }

  async findAll(query: QueryLoanDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.memberId) {
      where.memberId = query.memberId;
    }
    if (query.bookId) {
      where.bookId = query.bookId;
    }

    const [data, total] = await this.loanRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: { book: true, member: true },
      order: { createdAt: 'DESC', id: 'ASC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: { book: true, member: true },
    });

    if (!loan) {
      throw new NotFoundException(
        `Transaksi peminjaman dengan ID ${id} tidak ditemukan`,
      );
    }

    return loan;
  }
}
