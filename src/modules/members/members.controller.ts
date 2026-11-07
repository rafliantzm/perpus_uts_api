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
import { CreateMemberDto } from './dto/create-member.dto.js';
import { QueryMemberDto } from './dto/query-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { MembersService } from './members.service.js';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Mendaftarkan anggota baru' })
  @ApiResponse({ status: 201, description: 'Anggota berhasil didaftarkan' })
  @ApiResponse({ status: 400, description: 'Payload tidak valid' })
  @ApiResponse({ status: 409, description: 'NIM sudah terdaftar' })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Mendapatkan daftar anggota (dengan pagination, search, dan sorting)',
  })
  @ApiResponse({ status: 200, description: 'Daftar anggota berhasil diambil' })
  @ApiResponse({ status: 400, description: 'Parameter kueri sortBy atau order tidak valid' })
  findAll(@Query() query: QueryMemberDto) {
    return this.membersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Mendapatkan detail anggota beserta riwayat peminjaman',
  })
  @ApiParam({ name: 'id', description: 'ID Anggota (UUID)' })
  @ApiResponse({ status: 200, description: 'Detail anggota berhasil diambil' })
  @ApiResponse({ status: 404, description: 'Anggota tidak ditemukan' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.membersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Memperbarui seluruh data anggota (dengan dukungan If-Match)' })
  @ApiParam({ name: 'id', description: 'ID Anggota (UUID)' })
  @ApiHeader({
    name: 'if-match',
    required: false,
    description: 'Strong ETag validator untuk optimistic concurrency control',
  })
  @ApiResponse({ status: 200, description: 'Data anggota berhasil diperbarui' })
  @ApiResponse({ status: 404, description: 'Anggota tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'NIM sudah digunakan anggota lain' })
  @ApiResponse({ status: 412, description: 'Precondition Failed - ETag usang atau tidak cocok' })
  updateFull(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @Headers('if-match') ifMatch?: string,
  ) {
    return this.membersService.update(id, updateMemberDto, ifMatch);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Memperbarui sebagian data anggota (dengan dukungan If-Match)' })
  @ApiParam({ name: 'id', description: 'ID Anggota (UUID)' })
  @ApiHeader({
    name: 'if-match',
    required: false,
    description: 'Strong ETag validator untuk optimistic concurrency control',
  })
  @ApiResponse({ status: 200, description: 'Data anggota berhasil diperbarui' })
  @ApiResponse({ status: 404, description: 'Anggota tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'NIM sudah digunakan anggota lain' })
  @ApiResponse({ status: 412, description: 'Precondition Failed - ETag usang atau tidak cocok' })
  updatePartial(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @Headers('if-match') ifMatch?: string,
  ) {
    return this.membersService.update(id, updateMemberDto, ifMatch);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus anggota' })
  @ApiParam({ name: 'id', description: 'ID Anggota (UUID)' })
  @ApiResponse({ status: 200, description: 'Anggota berhasil dihapus' })
  @ApiResponse({
    status: 400,
    description: 'Anggota tidak dapat dihapus karena masih meminjam buku',
  })
  @ApiResponse({ status: 404, description: 'Anggota tidak ditemukan' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.membersService.remove(id);
  }
}
