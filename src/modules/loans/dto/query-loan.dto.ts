import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { LoanStatus } from '../entities/loan.entity.js';

export class QueryLoanDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter berdasarkan status peminjaman',
    enum: LoanStatus,
  })
  @IsOptional()
  @IsEnum(LoanStatus, { message: 'Status harus BORROWED atau RETURNED' })
  status?: LoanStatus;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID anggota',
  })
  @IsOptional()
  @IsUUID('4')
  memberId?: string;

  @ApiPropertyOptional({
    description: 'Filter berdasarkan ID buku',
  })
  @IsOptional()
  @IsUUID('4')
  bookId?: string;
}
