import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller.js';
import { BooksService } from './books.service.js';
import { Book } from './entities/book.entity.js';
import { Loan } from '../loans/entities/loan.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Loan])],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService, TypeOrmModule],
})
export class BooksModule {}
