import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { Loan } from './entities/loan.entity.js';
import { LoansController } from './loans.controller.js';
import { LoansService } from './loans.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, Book, Member])],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService, TypeOrmModule],
})
export class LoansModule {}
