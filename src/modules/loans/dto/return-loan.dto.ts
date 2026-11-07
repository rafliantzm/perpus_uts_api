import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ReturnLoanDto {
  @ApiPropertyOptional({
    description: 'Tanggal pengembalian buku (format: YYYY-MM-DD, default: hari ini)',
    example: '2026-11-10',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal pengembalian harus YYYY-MM-DD' })
  returnDate?: string;

  @ApiPropertyOptional({
    description: 'Catatan kondisi buku saat dikembalikan',
    example: 'Kondisi buku baik dan lengkap',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
