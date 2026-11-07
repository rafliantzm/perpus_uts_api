import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({
    description: 'Judul buku',
    example: 'Clean Code: A Handbook of Agile Software Craftsmanship',
  })
  @IsString()
  @IsNotEmpty({ message: 'Judul buku tidak boleh kosong' })
  title: string;

  @ApiProperty({
    description: 'Nama penulis / pengarang',
    example: 'Robert C. Martin',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama penulis tidak boleh kosong' })
  author: string;

  @ApiPropertyOptional({
    description: 'Nomor ISBN buku (opsional)',
    example: '978-0132350884',
  })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiProperty({
    description: 'Jumlah total eksemplar fisik buku',
    example: 5,
    default: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'Total eksemplar harus berupa bilangan bulat' })
  @Min(1, { message: 'Total eksemplar minimal 1' })
  totalCopies: number;
}
