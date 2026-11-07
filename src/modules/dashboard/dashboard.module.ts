import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity.js';
import { Member } from '../members/entities/member.entity.js';
import { Loan } from '../loans/entities/loan.entity.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Member, Loan])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
