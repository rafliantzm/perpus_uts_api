import AppDataSource from '../typeorm.config.js';
import { Book } from '../../modules/books/entities/book.entity.js';
import { Member } from '../../modules/members/entities/member.entity.js';
import { Loan, LoanStatus } from '../../modules/loans/entities/loan.entity.js';

async function seed() {
  console.log('[Seeder] Menghubungkan ke database...');
  await AppDataSource.initialize();

  const bookRepo = AppDataSource.getRepository(Book);
  const memberRepo = AppDataSource.getRepository(Member);
  const loanRepo = AppDataSource.getRepository(Loan);

  console.log('[Seeder] Membersihkan data lama...');
  await AppDataSource.query(
    'TRUNCATE TABLE "loans", "members", "books" CASCADE;',
  );

  console.log('[Seeder] Menambahkan data buku...');
  // Aturan konsistensi: availableCopies = totalCopies - (jumlah peminjaman berstatus BORROWED)
  const books = await bookRepo.save([
    {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      totalCopies: 5,
      availableCopies: 4, // 1 sedang dipinjam (BORROWED) oleh Ahmad Farhan
    },
    {
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
      isbn: '978-0201633610',
      totalCopies: 3,
      availableCopies: 3, // Dipinjam lalu sudah dikembalikan (RETURNED), sehingga seluruh 3 eksemplar tersedia!
    },
    {
      title: 'Refactoring: Improving the Design of Existing Code',
      author: 'Martin Fowler',
      isbn: '978-0134757599',
      totalCopies: 4,
      availableCopies: 4, // 0 dipinjam
    },
    {
      title: 'The Pragmatic Programmer: Your Journey To Mastery',
      author: 'David Thomas, Andrew Hunt',
      isbn: '978-0135957059',
      totalCopies: 2,
      availableCopies: 1, // 1 sedang dipinjam (BORROWED) oleh Siti Nurhaliza
    },
    {
      title: 'Building Microservices: Designing Fine-Grained Systems',
      author: 'Sam Newman',
      isbn: '978-1492034025',
      totalCopies: 3,
      availableCopies: 3, // 0 dipinjam
    },
  ]);

  console.log('[Seeder] Menambahkan data anggota...');
  const members = await memberRepo.save([
    {
      name: 'Ahmad Farhan',
      nim: '2210511001',
      email: 'farhan@mahasiswa.ac.id',
    },
    {
      name: 'Siti Nurhaliza',
      nim: '2210511002',
      email: 'siti.nur@mahasiswa.ac.id',
    },
    {
      name: 'Budi Santoso',
      nim: '2210511003',
      email: 'budi.s@mahasiswa.ac.id',
    },
    {
      name: 'Dewi Lestari',
      nim: '2210511004',
      email: 'dewi.lestari@mahasiswa.ac.id',
    },
  ]);

  console.log('[Seeder] Menambahkan transaksi peminjaman...');
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  await loanRepo.save([
    {
      bookId: books[0].id,
      memberId: members[0].id,
      loanDate: today,
      dueDate: nextWeek,
      status: LoanStatus.BORROWED,
      notes: 'Peminjaman untuk tugas perancangan perangkat lunak',
    },
    {
      bookId: books[3].id,
      memberId: members[1].id,
      loanDate: today,
      dueDate: nextWeek,
      status: LoanStatus.BORROWED,
      notes: 'Peminjaman rutin mingguan',
    },
    {
      bookId: books[1].id,
      memberId: members[2].id,
      loanDate: lastWeek,
      dueDate: today,
      returnDate: yesterday,
      status: LoanStatus.RETURNED,
      notes: 'Dikembalikan dalam kondisi sangat baik',
    },
  ]);

  console.log('✅ [Seeder] Data contoh berhasil diisi ke database secara konsisten!');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ [Seeder] Gagal melakukan seeding:', err);
  process.exit(1);
});
