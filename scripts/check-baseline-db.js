import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new pg.Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'perpus_uts_db',
});

async function main() {
  await client.connect();
  const books = await client.query('SELECT COUNT(*) as count, SUM("totalCopies") as total_copies, SUM("availableCopies") as available_copies FROM books');
  const members = await client.query('SELECT COUNT(*) as count FROM members');
  const loans = await client.query("SELECT COUNT(*) as count, COUNT(*) FILTER (WHERE status = 'BORROWED') as active_loans FROM loans");
  console.log('=== BASELINE PERPUS_UTS_DB ===');
  console.log('Books count:', books.rows[0].count, 'total_copies:', books.rows[0].total_copies, 'available_copies:', books.rows[0].available_copies);
  console.log('Members count:', members.rows[0].count);
  console.log('Loans count:', loans.rows[0].count, 'active_loans:', loans.rows[0].active_loans);

  const invariantCheck = await client.query(`
    SELECT id, title, "totalCopies", "availableCopies",
           (SELECT COUNT(*) FROM loans WHERE "bookId" = books.id AND status = 'BORROWED') as actual_borrowed
    FROM books
    WHERE "totalCopies" - "availableCopies" != (SELECT COUNT(*) FROM loans WHERE "bookId" = books.id AND status = 'BORROWED')
  `);
  console.log('Invariant violations:', invariantCheck.rows.length);
  await client.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
