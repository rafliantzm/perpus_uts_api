import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { CreateMemberDto } from './dto/create-member.dto.js';
import { QueryMemberDto } from './dto/query-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { Member } from './entities/member.entity.js';
import { Loan, LoanStatus } from '../loans/entities/loan.entity.js';
import { computeEntityETag, validateIfMatch } from '../../common/utils/etag.util.js';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly dataSource?: DataSource,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const existing = await this.memberRepository.findOne({
      where: { nim: createMemberDto.nim },
    });
    if (existing) {
      throw new ConflictException(
        `Anggota dengan NIM ${createMemberDto.nim} sudah terdaftar`,
      );
    }

    const member = this.memberRepository.create(createMemberDto);
    return await this.memberRepository.save(member);
  }

  async findAll(query: QueryMemberDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const allowedSortBy = [
      'name',
      'nim',
      'email',
      'createdAt',
      'updatedAt',
      'id',
    ];
    const sortBy = query.sortBy || 'createdAt';
    if (!allowedSortBy.includes(sortBy)) {
      throw new BadRequestException(
        `Kolom sortBy '${sortBy}' tidak valid. Kolom yang diizinkan: ${allowedSortBy.filter((c) => c !== 'id').join(', ')}`,
      );
    }

    const orderDir = (query.order || 'DESC').toUpperCase() as 'ASC' | 'DESC';
    if (orderDir !== 'ASC' && orderDir !== 'DESC') {
      throw new BadRequestException('Parameter order harus berupa ASC atau DESC');
    }

    const order: Record<string, 'ASC' | 'DESC'> =
      sortBy === 'id'
        ? { id: orderDir }
        : {
            [sortBy]: orderDir,
            id: 'ASC', // Secondary deterministic tie-breaker
          };

    const whereConditions = query.search
      ? [
          { name: ILike(`%${query.search}%`) },
          { nim: ILike(`%${query.search}%`) },
          { email: ILike(`%${query.search}%`) },
        ]
      : {};

    const [data, total] = await this.memberRepository.findAndCount({
      where: whereConditions,
      skip,
      take: limit,
      order,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: {
        loans: {
          book: true,
        },
      },
    });
    if (!member) {
      throw new NotFoundException(`Anggota dengan ID ${id} tidak ditemukan`);
    }
    return member;
  }

  async update(
    id: string,
    updateMemberDto: UpdateMemberDto,
    ifMatch?: string,
  ): Promise<Member> {
    const executeUpdate = async (manager: {
      findOne: (entity: any, options: any) => Promise<Member | null>;
      save: (entity: any, member: Member) => Promise<Member>;
    }) => {
      const member = await manager.findOne(Member, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!member) {
        throw new NotFoundException(`Anggota dengan ID ${id} tidak ditemukan`);
      }

      // Evaluasi atomik If-Match precondition
      if (ifMatch !== undefined) {
        const currentETag = computeEntityETag(member);
        const validation = validateIfMatch(ifMatch, currentETag);
        if (!validation.matched) {
          throw new PreconditionFailedException(
            validation.reason ||
              'Precondition Failed: Resource ETag tidak cocok dengan header If-Match',
          );
        }
      }

      if (updateMemberDto.nim && updateMemberDto.nim !== member.nim) {
        const existing = await manager.findOne(Member, {
          where: { nim: updateMemberDto.nim },
        });
        if (existing) {
          throw new ConflictException(
            `NIM ${updateMemberDto.nim} sudah digunakan oleh anggota lain`,
          );
        }
        member.nim = updateMemberDto.nim;
      }

      if (updateMemberDto.name !== undefined) member.name = updateMemberDto.name;
      if (updateMemberDto.email !== undefined) member.email = updateMemberDto.email;

      return await manager.save(Member, member);
    };

    if (this.dataSource && typeof this.dataSource.transaction === 'function') {
      return await this.dataSource.transaction(executeUpdate);
    } else {
      return await executeUpdate({
        findOne: (_e, opts) => this.memberRepository.findOne(opts),
        save: (_e, m) => this.memberRepository.save(m),
      });
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const member = await this.findOne(id);

    const activeLoans = await this.loanRepository.count({
      where: {
        memberId: id,
        status: LoanStatus.BORROWED,
      },
    });

    if (activeLoans > 0) {
      throw new BadRequestException(
        `Anggota "${member.name}" tidak dapat dihapus karena masih meminjam ${activeLoans} buku.`,
      );
    }

    await this.memberRepository.remove(member);
    return { message: `Anggota "${member.name}" berhasil dihapus` };
  }
}
