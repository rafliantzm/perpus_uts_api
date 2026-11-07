import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity.js';
import { Loan } from '../loans/entities/loan.entity.js';
import { MembersController } from './members.controller.js';
import { MembersService } from './members.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Loan])],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService, TypeOrmModule],
})
export class MembersModule {}
