import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BooksService } from './books.service.js';
import { CreateBookDto } from './dto/create-book.dto.js';
import { QueryBookDto } from './dto/query-book.dto.js';
import { UpdateBookDto } from './dto/update-book.dto.js';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Menambahkan buku baru ke katalog perpustakaan' })
  @ApiResponse({ status: 201, description: 'Buku berhasil ditambahkan' })
  @ApiResponse({ status: 400, description: 'Payload tidak valid' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Mendapatkan daftar buku (dengan pagination, search, dan sorting)',
  })
  @ApiResponse({ status: 200, description: 'Daftar buku berhasil diambil' })
  @ApiResponse({ status: 400, description: 'Parameter kueri sortBy atau order tidak valid' })
  findAll(@Query() query: QueryBookDto) {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail buku berdasarkan ID (UUID)' })
  @ApiParam({ name: 'id', description: 'ID Buku (UUID)' })
  @ApiResponse({ status: 200, description: 'Detail buku berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.booksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui seluruh data buku (dengan dukungan If-Match)' })
  @ApiParam({ name: 'id', description: 'ID Buku (UUID)' })
  @ApiHeader({
    name: 'if-match',
    required: false,
    description: 'Strong ETag validator untuk optimistic concurrency control',
  })
  @ApiResponse({ status: 200, description: 'Data buku berhasil diperbarui' })
  @ApiResponse({ status: 400, description: 'Payload tidak valid atau konflik stok' })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  @ApiResponse({ status: 412, description: 'Precondition Failed - ETag usang atau tidak cocok' })
  updateFull(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateBookDto: UpdateBookDto,
    @Headers('if-match') ifMatch?: string,
  ) {
    return this.booksService.update(id, updateBookDto, ifMatch);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Memperbarui sebagian data buku (dengan dukungan If-Match)' })
  @ApiParam({ name: 'id', description: 'ID Buku (UUID)' })
  @ApiHeader({
    name: 'if-match',
    required: false,
    description: 'Strong ETag validator untuk optimistic concurrency control',
  })
  @ApiResponse({ status: 200, description: 'Data buku berhasil diperbarui' })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  @ApiResponse({ status: 412, description: 'Precondition Failed - ETag usang atau tidak cocok' })
  updatePartial(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateBookDto: UpdateBookDto,
    @Headers('if-match') ifMatch?: string,
  ) {
    return this.booksService.update(id, updateBookDto, ifMatch);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus buku dari katalog' })
  @ApiParam({ name: 'id', description: 'ID Buku (UUID)' })
  @ApiResponse({ status: 200, description: 'Buku berhasil dihapus' })
  @ApiResponse({
    status: 400,
    description: 'Buku tidak bisa dihapus karena masih ada peminjaman aktif',
  })
  @ApiResponse({ status: 404, description: 'Buku tidak ditemukan' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.booksService.remove(id);
  }
}
