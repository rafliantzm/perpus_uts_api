import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { MembersService } from './members.service.js';
import { Member } from './entities/member.entity.js';
import { computeEntityETag } from '../../common/utils/etag.util.js';

describe('MembersService', () => {
  let service: MembersService;
  let mockMemberRepository: any;
  let mockLoanRepository: any;

  const mockMember: Member = {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    name: 'Ahmad Farhan',
    nim: '2210511001',
    email: 'farhan@mahasiswa.ac.id',
    loans: [],
    createdAt: new Date('2026-11-07T10:00:00.000Z'),
    updatedAt: new Date('2026-11-07T10:00:00.000Z'),
  };

  beforeEach(() => {
    mockMemberRepository = {
      create: vi.fn().mockImplementation((dto) => dto),
      save: vi.fn().mockImplementation(async (member) => ({ id: 'new-member-id', ...member })),
      findAndCount: vi.fn().mockResolvedValue([[mockMember], 1]),
      findOne: vi.fn().mockImplementation(async ({ where }) => {
        if (where.nim === '2210511001' || where.id === mockMember.id) {
          return { ...mockMember };
        }
        return null;
      }),
      remove: vi.fn().mockResolvedValue(mockMember),
    };

    mockLoanRepository = {
      count: vi.fn().mockResolvedValue(0),
    };

    service = new MembersService(mockMemberRepository, mockLoanRepository);
  });

  it('harus berhasil mendaftarkan anggota baru jika NIM belum terdaftar', async () => {
    mockMemberRepository.findOne.mockResolvedValueOnce(null);

    const dto = {
      name: 'Dewi Sartika',
      nim: '2210511099',
      email: 'dewi@mahasiswa.ac.id',
    };

    const result = await service.create(dto);

    expect(mockMemberRepository.findOne).toHaveBeenCalledWith({
      where: { nim: dto.nim },
    });
    expect(mockMemberRepository.create).toHaveBeenCalledWith(dto);
    expect(mockMemberRepository.save).toHaveBeenCalled();
    expect(result).toHaveProperty('id');
  });

  it('harus menolak pendaftaran anggota baru jika NIM sudah terdaftar (ConflictException)', async () => {
    const dto = {
      name: 'Farhan Kloning',
      nim: '2210511001', // NIM duplikat
    };

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('harus menyertakan secondary tie-breaker id: ASC saat sorting dinamis anggota', async () => {
    await service.findAll({ page: 1, limit: 10, sortBy: 'name', order: 'ASC' });

    expect(mockMemberRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        order: {
          name: 'ASC',
          id: 'ASC',
        },
      }),
    );
  });

  it('harus menolak sortBy anggota di luar allowlist dengan BadRequestException (400)', async () => {
    await expect(
      service.findAll({ sortBy: 'secret_hash' as any }),
    ).rejects.toThrow(BadRequestException);
  });

  it('harus berhasil memperbarui anggota jika If-Match Strong ETag cocok', async () => {
    const strongETag = computeEntityETag(mockMember);
    const updated = await service.update(
      mockMember.id,
      { name: 'Ahmad Farhan, S.Kom.' },
      strongETag,
    );
    expect(updated.name).toBe('Ahmad Farhan, S.Kom.');
  });

  it('harus melempar PreconditionFailedException (412) jika If-Match stale pada pembaruan anggota', async () => {
    const staleETag = '"1111111111111111111111111111111111111111"';
    await expect(
      service.update(mockMember.id, { name: 'New Name' }, staleETag),
    ).rejects.toThrow(PreconditionFailedException);
  });

  it('harus melempar PreconditionFailedException (412) jika If-Match anggota menggunakan Weak ETag (W/...)', async () => {
    const strongETag = computeEntityETag(mockMember);
    await expect(
      service.update(mockMember.id, { name: 'New Name' }, `W/${strongETag}`),
    ).rejects.toThrow(PreconditionFailedException);
  });

  it('harus melemparkan NotFoundException jika ID anggota tidak ditemukan', async () => {
    mockMemberRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.findOne('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('harus menolak penghapusan anggota jika masih memiliki peminjaman aktif', async () => {
    mockLoanRepository.count.mockResolvedValueOnce(1); // Masih meminjam 1 buku

    await expect(service.remove(mockMember.id)).rejects.toThrow(
      BadRequestException,
    );
  });
});
