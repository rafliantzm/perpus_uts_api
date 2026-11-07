-- Data Contoh (Seeds) untuk PostgreSQL

-- Hapus data sebelumnya
TRUNCATE TABLE "loans", "members", "books" CASCADE;

-- Insert Books (availableCopies konsisten dengan jumlah loan aktif berstatus BORROWED)
INSERT INTO "books" ("id", "title", "author", "isbn", "totalCopies", "availableCopies") VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 5, 4),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', '978-0201633610', 3, 3),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Refactoring: Improving the Design of Existing Code', 'Martin Fowler', '978-0134757599', 4, 4),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'The Pragmatic Programmer: Your Journey To Mastery', 'David Thomas, Andrew Hunt', '978-0135957059', 2, 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Building Microservices: Designing Fine-Grained Systems', 'Sam Newman', '978-1492034025', 3, 3);

-- Insert Members
INSERT INTO "members" ("id", "name", "nim", "email") VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Ahmad Farhan', '2210511001', 'farhan@mahasiswa.ac.id'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Siti Nurhaliza', '2210511002', 'siti.nur@mahasiswa.ac.id'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'Budi Santoso', '2210511003', 'budi.s@mahasiswa.ac.id'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'Dewi Lestari', '2210511004', 'dewi.lestari@mahasiswa.ac.id');

-- Insert Loans
INSERT INTO "loans" ("id", "bookId", "memberId", "loanDate", "dueDate", "returnDate", "status", "notes") VALUES
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', NULL, 'BORROWED', 'Peminjaman untuk tugas perancangan perangkat lunak'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', NULL, 'BORROWED', 'Peminjaman rutin mingguan'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, CURRENT_DATE - INTERVAL '1 days', 'RETURNED', 'Dikembalikan dalam kondisi sangat baik');
