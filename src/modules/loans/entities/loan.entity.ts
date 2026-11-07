import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Book } from '../../books/entities/book.entity.js';
import { Member } from '../../members/entities/member.entity.js';

export enum LoanStatus {
  BORROWED = 'BORROWED',
  RETURNED = 'RETURNED',
}

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bookId: string;

  @Column({ type: 'uuid' })
  memberId: string;

  @ManyToOne(() => Book, (book) => book.loans, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'bookId' })
  book: Relation<Book>;

  @ManyToOne(() => Member, (member) => member.loans, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'memberId' })
  member: Relation<Member>;

  @Column({ type: 'date' })
  loanDate: string;

  @Column({ type: 'date' })
  dueDate: string;

  @Column({ type: 'date', nullable: true })
  returnDate?: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: LoanStatus.BORROWED,
  })
  status: LoanStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
