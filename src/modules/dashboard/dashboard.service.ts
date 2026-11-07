import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { Loan, LoanStatus } from '../loans/entities/loan.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async getSummary() {
    const totalTitles = await this.bookRepository.count();
    const totalMembers = await this.memberRepository.count();

    const activeLoans = await this.loanRepository.count({
      where: { status: LoanStatus.BORROWED },
    });

    const returnedLoans = await this.loanRepository.count({
      where: { status: LoanStatus.RETURNED },
    });

    const books = await this.bookRepository.find({
      select: {
        totalCopies: true,
        availableCopies: true,
      },
    });

    const totalCopies = books.reduce((acc, curr) => acc + (curr.totalCopies || 0), 0);
    const availableCopies = books.reduce(
      (acc, curr) => acc + (curr.availableCopies || 0),
      0,
    );

    const recentLoans = await this.loanRepository.find({
      take: 5,
      order: { createdAt: 'DESC' },
      relations: {
        book: true,
        member: true,
      },
    });

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      borrowedCopies: totalCopies - availableCopies,
      totalMembers,
      activeLoans,
      returnedLoans,
      recentLoans,
    };
  }
}
