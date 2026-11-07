import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Loan } from '../../loans/entities/loan.entity.js';

@Entity('books')
@Check(`"totalCopies" >= 1`)
@Check(`"availableCopies" >= 0 AND "availableCopies" <= "totalCopies"`)
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  author: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  isbn?: string | null;

  @Column({ type: 'int', default: 1 })
  totalCopies: number;

  @Column({ type: 'int', default: 1 })
  availableCopies: number;

  @OneToMany(() => Loan, (loan) => loan.book)
  loans: Relation<Loan[]>;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
