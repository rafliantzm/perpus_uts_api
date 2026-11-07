import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialLibrarySchema1715000000000 implements MigrationInterface {
  name = 'InitialLibrarySchema1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table: books
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "books" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar(255) NOT NULL,
        "author" varchar(255) NOT NULL,
        "isbn" varchar(50),
        "totalCopies" integer NOT NULL DEFAULT 1,
        "availableCopies" integer NOT NULL DEFAULT 1,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "chk_books_total_copies" CHECK ("totalCopies" >= 1),
        CONSTRAINT "chk_books_available_copies" CHECK ("availableCopies" >= 0 AND "availableCopies" <= "totalCopies")
      );
    `);

    // Create table: members
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "members" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "nim" varchar(50) NOT NULL,
        "email" varchar(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "uq_members_nim" UNIQUE ("nim")
      );
    `);

    // Create table: loans
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "loans" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "bookId" uuid NOT NULL,
        "memberId" uuid NOT NULL,
        "loanDate" DATE NOT NULL,
        "dueDate" DATE NOT NULL,
        "returnDate" DATE,
        "status" varchar(20) NOT NULL DEFAULT 'BORROWED',
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_loans_book" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT,
        CONSTRAINT "fk_loans_member" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT,
        CONSTRAINT "chk_loans_status" CHECK ("status" IN ('BORROWED', 'RETURNED')),
        CONSTRAINT "chk_loans_due_date" CHECK ("dueDate" >= "loanDate")
      );
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_books_title" ON "books" ("title");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_members_nim" ON "members" ("nim");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_loans_status" ON "loans" ("status");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_loans_book" ON "loans" ("bookId");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_loans_member" ON "loans" ("memberId");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "loans";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "members";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "books";`);
  }
}
