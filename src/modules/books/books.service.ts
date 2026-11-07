import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto.js';
import { QueryBookDto } from './dto/query-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';
import { Book } from './entities/book.entity.js';
import { Loan, LoanStatus } from '../loans/entities/loan.entity.js';
import { computeEntityETag, validateIfMatch } from '../../common/utils/etag.util.js';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly dataSource?: DataSource,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create({
      ...createBookDto,
      availableCopies: createBookDto.totalCopies,
    });
    return await this.bookRepository.save(book);
  }

  async findAll(query: QueryBookDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const allowedSortBy = [
      'title',
      'author',
      'isbn',
      'totalCopies',
      'availableCopies',
      'createdAt',
      'updatedAt',
      'id',
    ];
    const sortBy = query.sortBy || 'createdAt';
    if (!allowedSortBy.includes(sortBy)) {
      throw new BadRequestException(
        `Kolom sortBy '${sortBy}' tidak valid. Kolom yang diizinkan: ${allowedSortBy.filter((c) => c !== 'id').join(', ')}`,
      );
    }

    const orderDir = (query.order || 'DESC').toUpperCase() as 'ASC' | 'DESC';
    if (orderDir !== 'ASC' && orderDir !== 'DESC') {
      throw new BadRequestException('Parameter order harus berupa ASC atau DESC');
    }

    const order: Record<string, 'ASC' | 'DESC'> =
      sortBy === 'id'
        ? { id: orderDir }
        : {
            [sortBy]: orderDir,
            id: 'ASC', // Secondary deterministic tie-breaker
          };

    const whereConditions = query.search
      ? [
          { title: ILike(`%${query.search}%`) },
          { author: ILike(`%${query.search}%`) },
          { isbn: ILike(`%${query.search}%`) },
        ]
      : {};

    const [data, total] = await this.bookRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order,
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

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Buku dengan ID ${id} tidak ditemukan`);
    }
    return book;
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
    ifMatch?: string,
  ): Promise<Book> {
    const executeUpdate = async (manager: {
      findOne: (entity: any, options: any) => Promise<Book | null>;
      count: (entity: any, options: any) => Promise<number>;
      save: (entity: any, book: Book) => Promise<Book>;
    }) => {
      const book = await manager.findOne(Book, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!book) {
        throw new NotFoundException(`Buku dengan ID ${id} tidak ditemukan`);
      }

      // Evaluasi atomik If-Match precondition
      if (ifMatch !== undefined) {
        const currentETag = computeEntityETag(book);
        const validation = validateIfMatch(ifMatch, currentETag);
        if (!validation.matched) {
          throw new PreconditionFailedException(
            validation.reason ||
              'Precondition Failed: Resource ETag tidak cocok dengan header If-Match',
          );
        }
      }

      if (
        updateBookDto.totalCopies !== undefined &&
        updateBookDto.totalCopies !== book.totalCopies
      ) {
        const activeLoans = await manager.count(Loan, {
          where: {
            bookId: id,
            status: LoanStatus.BORROWED,
          },
        });

        if (updateBookDto.totalCopies < activeLoans) {
          throw new BadRequestException(
            `Total eksemplar tidak boleh lebih kecil dari jumlah peminjaman aktif (${activeLoans} eksemplar sedang dipinjam).`,
          );
        }

        const diff = updateBookDto.totalCopies - book.totalCopies;
        const newAvailable = book.availableCopies + diff;

        if (newAvailable < 0) {
          throw new BadRequestException(
            `Total eksemplar tidak boleh lebih kecil dari jumlah buku yang saat ini sedang dipinjam.`,
          );
        }
        book.totalCopies = updateBookDto.totalCopies;
        book.availableCopies = newAvailable;
      }

      if (updateBookDto.title !== undefined) book.title = updateBookDto.title;
      if (updateBookDto.author !== undefined) book.author = updateBookDto.author;
      if (updateBookDto.isbn !== undefined) book.isbn = updateBookDto.isbn;

      return await manager.save(Book, book);
    };

    if (this.dataSource && typeof this.dataSource.transaction === 'function') {
      return await this.dataSource.transaction(executeUpdate);
    } else {
      return await executeUpdate({
        findOne: (_e, opts) => this.bookRepository.findOne(opts),
        count: (_e, opts) => this.loanRepository.count(opts),
        save: (_e, b) => this.bookRepository.save(b),
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const book = await this.findOne(id);

    const activeLoans = await this.loanRepository.count({
      where: {
        bookId: id,
        status: LoanStatus.BORROWED,
      },
    });

    if (activeLoans > 0) {
      throw new BadRequestException(
        `Buku "${book.title}" tidak dapat dihapus karena masih ada ${activeLoans} peminjaman aktif.`,
      );
    }

    await this.bookRepository.remove(book);
    return { message: `Buku "${book.title}" berhasil dihapus dari katalog` };
  }
}
