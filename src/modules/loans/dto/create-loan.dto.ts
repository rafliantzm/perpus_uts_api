import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLoanDto {
  @ApiProperty({
    description: 'ID Buku (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID('4', { message: 'ID buku harus berupa format UUID v4 yang valid' })
  @IsNotEmpty({ message: 'ID buku wajib diisi' })
  bookId: string;

  @ApiProperty({
    description: 'ID Anggota (UUID)',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsUUID('4', { message: 'ID anggota harus berupa format UUID v4 yang valid' })
  @IsNotEmpty({ message: 'ID anggota wajib diisi' })
  memberId: string;

  @ApiPropertyOptional({
    description: 'Tanggal pinjam (format: YYYY-MM-DD, default: hari ini)',
    example: '2026-11-07',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal pinjam harus YYYY-MM-DD' })
  loanDate?: string;

  @ApiPropertyOptional({
    description: 'Batas tanggal pengembalian (format: YYYY-MM-DD, default: +7 hari)',
    example: '2026-11-14',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Format batas pengembalian harus YYYY-MM-DD' })
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Catatan tambahan transaksi peminjaman',
    example: 'Untuk keperluan tugas akhir',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
