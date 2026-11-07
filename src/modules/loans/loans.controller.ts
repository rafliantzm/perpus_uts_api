import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateLoanDto } from './dto/create-loan.dto.js';
import { QueryLoanDto } from './dto/query-loan.dto.js';
import { ReturnLoanDto } from './dto/return-loan.dto.js';
import { LoansService } from './loans.service.js';

@ApiTags('Loans')
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Mencatat peminjaman buku baru (Atomic Transaction: validasi stok & kurangi eksemplar)',
  })
  @ApiResponse({
    status: 201,
    description: 'Peminjaman berhasil dicatat, stok buku otomatis berkurang',
  })
  @ApiResponse({
    status: 400,
    description: 'Stok buku habis atau tanggal pengembalian tidak valid',
  })
  @ApiResponse({
    status: 404,
    description: 'Buku atau anggota tidak ditemukan',
  })
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Mendapatkan daftar transaksi peminjaman (filter status, member, book)',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar transaksi peminjaman berhasil diambil',
  })
  findAll(@Query() query: QueryLoanDto) {
    return this.loansService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail transaksi peminjaman' })
  @ApiParam({ name: 'id', description: 'ID Transaksi Peminjaman (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Detail transaksi peminjaman berhasil diambil',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaksi peminjaman tidak ditemukan',
  })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.loansService.findOne(id);
  }

  @Patch(':id/return')
  @ApiOperation({
    summary:
      'Memproses pengembalian buku (Atomic Transaction: status jadi RETURNED & stok buku bertambah)',
  })
  @ApiParam({ name: 'id', description: 'ID Transaksi Peminjaman (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Pengembalian buku berhasil diproses, stok buku bertambah',
  })
  @ApiResponse({
    status: 400,
    description: 'Buku sudah pernah dikembalikan sebelumnya',
  })
  @ApiResponse({
    status: 404,
    description: 'Transaksi peminjaman tidak ditemukan',
  })
  returnBook(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() returnLoanDto: ReturnLoanDto,
  ) {
    return this.loansService.returnBook(id, returnLoanDto);
  }
}
