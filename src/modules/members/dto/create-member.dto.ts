import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({
    description: 'Nama lengkap anggota perpustakaan',
    example: 'Muhammad Faiz',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nama anggota tidak boleh kosong' })
  name: string;

  @ApiProperty({
    description: 'Nomor Induk Mahasiswa (NIM) unik',
    example: '2210511001',
  })
  @IsString()
  @IsNotEmpty({ message: 'NIM tidak boleh kosong' })
  nim: string;

  @ApiPropertyOptional({
    description: 'Alamat email aktif anggota',
    example: 'faiz@mahasiswa.ac.id',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Format email tidak valid' })
  email?: string;
}
