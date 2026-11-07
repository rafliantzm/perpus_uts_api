/**
 * Client Application Logic - Sistem Informasi Perpustakaan Sederhana
 * Terhubung ke RESTful API: /api/v1
 */

const API_BASE = '/api/v1';

class LibraryApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.allBooks = [];
    this.allMembers = [];

    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.checkServerHealth();
    await this.loadDashboard();
    // Default today date for loan form
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const loanDateInput = document.getElementById('loan-date');
    const loanDueDateInput = document.getElementById('loan-due-date');
    if (loanDateInput) loanDateInput.value = today;
    if (loanDueDateInput) loanDueDateInput.value = nextWeek;
  }

  setupEventListeners() {
    // Navigation Tabs
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshCurrentTab());
    }

    // Search inputs with debounce
    const bookSearch = document.getElementById('book-search-input');
    if (bookSearch) {
      bookSearch.addEventListener('input', this.debounce(() => this.loadBooks(bookSearch.value), 350));
    }

    const memberSearch = document.getElementById('member-search-input');
    if (memberSearch) {
      memberSearch.addEventListener('input', this.debounce(() => this.loadMembers(memberSearch.value), 350));
    }

    // Loan Status Filter
    const loanStatusFilter = document.getElementById('loan-filter-status');
    if (loanStatusFilter) {
      loanStatusFilter.addEventListener('change', () => this.loadLoans(loanStatusFilter.value));
    }
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  switchTab(tabName) {
    this.currentTab = tabName;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Update tab visibility
    document.querySelectorAll('.tab-pane').forEach((pane) => {
      pane.classList.toggle('active', pane.id === `tab-${tabName}`);
    });

    // Update page title
    const titles = {
      dashboard: { title: 'Dashboard Operasional', desc: 'Ringkasan koleksi buku dan transaksi sirkulasi perpustakaan' },
      books: { title: 'Katalog Koleksi Buku', desc: 'Kelola judul, pengarang, ISBN, dan ketersediaan eksemplar' },
      members: { title: 'Data Anggota Perpustakaan', desc: 'Kelola identitas mahasiswa dan riwayat keanggotaan' },
      loans: { title: 'Sirkulasi Peminjaman Buku', desc: 'Pencatatan peminjaman aktif dan pemrosesan pengembalian' },
    };

    const info = titles[tabName] || titles.dashboard;
    document.getElementById('current-page-title').textContent = info.title;
    document.getElementById('current-page-desc').textContent = info.desc;

    this.refreshCurrentTab();
  }

  async refreshCurrentTab() {
    switch (this.currentTab) {
      case 'dashboard':
        await this.loadDashboard();
        break;
      case 'books':
        await this.loadBooks(document.getElementById('book-search-input')?.value || '');
        break;
      case 'members':
        await this.loadMembers(document.getElementById('member-search-input')?.value || '');
        break;
      case 'loans':
        await this.loadLoans(document.getElementById('loan-filter-status')?.value || '');
        break;
    }
  }

  async checkServerHealth() {
    const indicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    try {
      const res = await fetch(`${API_BASE}/dashboard/summary`);
      if (res.ok) {
        if (indicator) {
          indicator.className = 'status-indicator online';
          statusText.textContent = 'API v1 Aktif';
        }
      } else {
        throw new Error('API down');
      }
    } catch {
      if (indicator) {
        indicator.className = 'status-indicator offline';
        statusText.textContent = 'Koneksi Offline';
      }
    }
  }

  // --- API CALLS ---
  async apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, options);
      const result = await response.json();

      if (!response.ok) {
        let errorMsg = result.message || 'Terjadi kesalahan sistem';
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg.join(', ');
        }
        throw new Error(errorMsg);
      }

      return result.data !== undefined ? result.data : result;
    } catch (err) {
      this.showToast(err.message, 'error');
      throw err;
    }
  }

  // --- DASHBOARD ---
  async loadDashboard() {
    try {
      const summary = await this.apiRequest('/dashboard/summary');
      document.getElementById('stat-total-titles').textContent = summary.totalTitles || 0;
      document.getElementById('stat-total-copies').textContent = `${summary.totalCopies || 0} total eksemplar`;
      document.getElementById('stat-available-copies').textContent = summary.availableCopies || 0;
      document.getElementById('stat-active-loans').textContent = summary.activeLoans || 0;
      document.getElementById('stat-borrowed-copies').textContent = `${summary.borrowedCopies || 0} buku beredar`;
      document.getElementById('stat-total-members').textContent = summary.totalMembers || 0;

      // Update recent loans subtitle with actual count
      const subtitle = document.getElementById('recent-loans-subtitle');
      const recentList = summary.recentLoans || [];
      if (subtitle) {
        subtitle.textContent = recentList.length > 0
          ? `${recentList.length} transaksi sirkulasi terkini (maks. 5)`
          : 'Belum ada transaksi sirkulasi';
      }

      // Render recent loans
      const tbody = document.getElementById('recent-loans-table-body');
      if (!tbody) return;

      if (!summary.recentLoans || summary.recentLoans.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Belum ada riwayat transaksi peminjaman.</td></tr>';
        return;
      }

      tbody.innerHTML = summary.recentLoans.map(loan => `
        <tr>
          <td>
            <strong>${this.escapeHtml(loan.member?.name || 'N/A')}</strong><br>
            <small class="text-muted">NIM: ${this.escapeHtml(loan.member?.nim || '-')}</small>
          </td>
          <td>${this.escapeHtml(loan.book?.title || 'Buku Tidak Diketahui')}</td>
          <td>${loan.loanDate || '-'}</td>
          <td>${loan.dueDate || '-'}</td>
          <td>
            <span class="badge ${loan.status === 'BORROWED' ? 'badge-borrowed' : 'badge-returned'}">
              ${loan.status === 'BORROWED' ? 'Dipinjam' : 'Dikembalikan'}
            </span>
          </td>
          <td>
            ${loan.status === 'BORROWED' ? `
              <button class="btn btn-sm btn-success" onclick="app.handleReturn('${loan.id}')">Kembalikan</button>
            ` : '<span class="text-muted text-xs">Selesai</span>'}
          </td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }

  // --- BOOKS CRUD ---
  async loadBooks(search = '') {
    const tbody = document.getElementById('books-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Memuat data buku...</td></tr>';

    try {
      const url = search ? `/books?search=${encodeURIComponent(search)}` : '/books?limit=100';
      const books = await this.apiRequest(url);
      this.allBooks = Array.isArray(books) ? books : (books.data || []);

      if (this.allBooks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Tidak ada data buku yang ditemukan.</td></tr>';
        return;
      }

      tbody.innerHTML = this.allBooks.map(book => `
        <tr>
          <td><strong>${this.escapeHtml(book.title)}</strong></td>
          <td>${this.escapeHtml(book.author)}</td>
          <td><code>${this.escapeHtml(book.isbn || '-')}</code></td>
          <td class="badge-stock">${book.totalCopies}</td>
          <td>
            <span class="badge-stock ${book.availableCopies === 0 ? 'zero' : ''}">${book.availableCopies}</span>
          </td>
          <td class="text-right">
            <div class="action-btns">
              <button class="btn btn-sm btn-outline" onclick="app.openEditBookModal('${book.id}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="app.handleDeleteBook('${book.id}', '${this.escapeHtml(book.title)}')">Hapus</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Gagal memuat buku: ${err.message}</td></tr>`;
    }
  }

  openBookModal() {
    document.getElementById('book-form').reset();
    document.getElementById('book-id').value = '';
    document.getElementById('book-modal-title').textContent = 'Tambah Buku Baru';
    document.getElementById('book-submit-btn').textContent = 'Simpan Buku';
    this.openModal('book-modal');
  }

  openEditBookModal(id) {
    const book = this.allBooks.find(b => b.id === id);
    if (!book) return;

    document.getElementById('book-id').value = book.id;
    document.getElementById('book-title').value = book.title;
    document.getElementById('book-author').value = book.author;
    document.getElementById('book-isbn').value = book.isbn || '';
    document.getElementById('book-total').value = book.totalCopies;

    document.getElementById('book-modal-title').textContent = 'Edit Data Buku';
    document.getElementById('book-submit-btn').textContent = 'Perbarui Buku';
    this.openModal('book-modal');
  }

  async handleSaveBook(e) {
    e.preventDefault();
    const id = document.getElementById('book-id').value;
    const payload = {
      title: document.getElementById('book-title').value.trim(),
      author: document.getElementById('book-author').value.trim(),
      isbn: document.getElementById('book-isbn').value.trim() || undefined,
      totalCopies: parseInt(document.getElementById('book-total').value, 10),
    };

    try {
      if (id) {
        await this.apiRequest(`/books/${id}`, 'PUT', payload);
        this.showToast('Data buku berhasil diperbarui!', 'success');
      } else {
        await this.apiRequest('/books', 'POST', payload);
        this.showToast('Buku baru berhasil ditambahkan ke katalog!', 'success');
      }
      this.closeModal('book-modal');
      await this.loadBooks();
    } catch (err) {
      // handled in apiRequest
    }
  }

  async handleDeleteBook(id, title) {
    if (!confirm(`Apakah Anda yakin ingin menghapus buku "${title}"?`)) return;

    try {
      await this.apiRequest(`/books/${id}`, 'DELETE');
      this.showToast(`Buku "${title}" berhasil dihapus`, 'success');
      await this.loadBooks();
    } catch (err) {
      // handled in apiRequest
    }
  }

  // --- MEMBERS CRUD ---
  async loadMembers(search = '') {
    const tbody = document.getElementById('members-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Memuat data anggota...</td></tr>';

    try {
      const url = search ? `/members?search=${encodeURIComponent(search)}` : '/members?limit=100';
      const members = await this.apiRequest(url);
      this.allMembers = Array.isArray(members) ? members : (members.data || []);

      if (this.allMembers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Tidak ada data anggota.</td></tr>';
        return;
      }

      tbody.innerHTML = this.allMembers.map(member => `
        <tr>
          <td><strong>${this.escapeHtml(member.name)}</strong></td>
          <td><code>${this.escapeHtml(member.nim)}</code></td>
          <td>${this.escapeHtml(member.email || '-')}</td>
          <td>${member.createdAt ? member.createdAt.split('T')[0] : '-'}</td>
          <td class="text-right">
            <div class="action-btns">
              <button class="btn btn-sm btn-outline" onclick="app.openEditMemberModal('${member.id}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="app.handleDeleteMember('${member.id}', '${this.escapeHtml(member.name)}')">Hapus</button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Gagal memuat anggota: ${err.message}</td></tr>`;
    }
  }

  openMemberModal() {
    document.getElementById('member-form').reset();
    document.getElementById('member-id').value = '';
    document.getElementById('member-modal-title').textContent = 'Pendaftaran Anggota Baru';
    document.getElementById('member-submit-btn').textContent = 'Simpan Anggota';
    this.openModal('member-modal');
  }

  openEditMemberModal(id) {
    const member = this.allMembers.find(m => m.id === id);
    if (!member) return;

    document.getElementById('member-id').value = member.id;
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-nim').value = member.nim;
    document.getElementById('member-email').value = member.email || '';

    document.getElementById('member-modal-title').textContent = 'Edit Data Anggota';
    document.getElementById('member-submit-btn').textContent = 'Perbarui Anggota';
    this.openModal('member-modal');
  }

  async handleSaveMember(e) {
    e.preventDefault();
    const id = document.getElementById('member-id').value;
    const payload = {
      name: document.getElementById('member-name').value.trim(),
      nim: document.getElementById('member-nim').value.trim(),
      email: document.getElementById('member-email').value.trim() || undefined,
    };

    try {
      if (id) {
        await this.apiRequest(`/members/${id}`, 'PUT', payload);
        this.showToast('Data anggota berhasil diperbarui!', 'success');
      } else {
        await this.apiRequest('/members', 'POST', payload);
        this.showToast('Anggota baru berhasil didaftarkan!', 'success');
      }
      this.closeModal('member-modal');
      await this.loadMembers();
    } catch (err) {
      // handled
    }
  }

  async handleDeleteMember(id, name) {
    if (!confirm(`Apakah Anda yakin ingin menghapus anggota "${name}"?`)) return;

    try {
      await this.apiRequest(`/members/${id}`, 'DELETE');
      this.showToast(`Anggota "${name}" berhasil dihapus`, 'success');
      await this.loadMembers();
    } catch (err) {
      // handled
    }
  }

  // --- LOANS CRUD & TRANSACTIONS ---
  async loadLoans(status = '') {
    const tbody = document.getElementById('loans-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Memuat data sirkulasi...</td></tr>';

    try {
      const url = status ? `/loans?status=${status}&limit=100` : '/loans?limit=100';
      const loans = await this.apiRequest(url);
      const list = Array.isArray(loans) ? loans : (loans.data || []);

      if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Tidak ada data transaksi peminjaman.</td></tr>';
        return;
      }

      tbody.innerHTML = list.map(loan => `
        <tr>
          <td>
            <strong>${this.escapeHtml(loan.member?.name || '-')}</strong><br>
            <small class="text-muted">NIM: ${this.escapeHtml(loan.member?.nim || '-')}</small>
          </td>
          <td><strong>${this.escapeHtml(loan.book?.title || 'Buku Tidak Diketahui')}</strong></td>
          <td>${loan.loanDate || '-'}</td>
          <td>${loan.dueDate || '-'}</td>
          <td>${loan.returnDate || '-'}</td>
          <td>
            <span class="badge ${loan.status === 'BORROWED' ? 'badge-borrowed' : 'badge-returned'}">
              ${loan.status === 'BORROWED' ? 'Dipinjam' : 'Dikembalikan'}
            </span>
          </td>
          <td><small>${this.escapeHtml(loan.notes || '-')}</small></td>
          <td class="text-right">
            ${loan.status === 'BORROWED' ? `
              <button class="btn btn-sm btn-success" onclick="app.handleReturn('${loan.id}')">Kembalikan</button>
            ` : '<span class="text-muted text-xs">Selesai</span>'}
          </td>
        </tr>
      `).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Gagal memuat: ${err.message}</td></tr>`;
    }
  }

  async openLoanModal() {
    // Populate books & members dropdown
    const memberSelect = document.getElementById('loan-member-id');
    const bookSelect = document.getElementById('loan-book-id');

    memberSelect.innerHTML = '<option value="">-- Memuat Anggota... --</option>';
    bookSelect.innerHTML = '<option value="">-- Memuat Buku... --</option>';
    document.getElementById('loan-stock-info').textContent = '';

    this.openModal('loan-modal');

    try {
      const [membersRes, booksRes] = await Promise.all([
        this.apiRequest('/members?limit=100'),
        this.apiRequest('/books?limit=100'),
      ]);

      const members = Array.isArray(membersRes) ? membersRes : (membersRes.data || []);
      const books = Array.isArray(booksRes) ? booksRes : (booksRes.data || []);
      this.allBooks = books;

      memberSelect.innerHTML = '<option value="">-- Pilih Mahasiswa / Anggota --</option>' +
        members.map(m => `<option value="${m.id}">${this.escapeHtml(m.name)} (${this.escapeHtml(m.nim)})</option>`).join('');

      bookSelect.innerHTML = '<option value="">-- Pilih Buku dari Katalog --</option>' +
        books.map(b => `<option value="${b.id}" ${b.availableCopies <= 0 ? 'disabled' : ''}>
          ${this.escapeHtml(b.title)} [Tersedia: ${b.availableCopies}/${b.totalCopies}]
        </option>`).join('');
    } catch (err) {
      this.showToast('Gagal memuat opsi buku dan anggota', 'error');
    }
  }

  handleBookSelectChange() {
    const bookId = document.getElementById('loan-book-id').value;
    const info = document.getElementById('loan-stock-info');
    if (!bookId) {
      info.textContent = '';
      return;
    }
    const book = this.allBooks.find(b => b.id === bookId);
    if (book) {
      if (book.availableCopies > 0) {
        info.textContent = `✓ Stok siap dipinjam: ${book.availableCopies} dari ${book.totalCopies} eksemplar.`;
        info.style.color = 'var(--success)';
      } else {
        info.textContent = `✕ Stok habis! Seluruh ${book.totalCopies} eksemplar sedang dipinjam.`;
        info.style.color = 'var(--danger)';
      }
    }
  }

  async handleSaveLoan(e) {
    e.preventDefault();
    const payload = {
      memberId: document.getElementById('loan-member-id').value,
      bookId: document.getElementById('loan-book-id').value,
      loanDate: document.getElementById('loan-date').value,
      dueDate: document.getElementById('loan-due-date').value,
      notes: document.getElementById('loan-notes').value.trim() || undefined,
    };

    try {
      await this.apiRequest('/loans', 'POST', payload);
      this.showToast('Peminjaman buku berhasil dicatat! Stok buku otomatis berkurang.', 'success');
      this.closeModal('loan-modal');
      await this.loadLoans();
    } catch (err) {
      // handled
    }
  }

  async handleReturn(loanId) {
    if (!confirm('Apakah Anda yakin ingin memproses pengembalian buku ini?')) return;

    try {
      await this.apiRequest(`/loans/${loanId}/return`, 'PATCH', {});
      this.showToast('Pengembalian buku berhasil diproses! Stok buku otomatis bertambah.', 'success');
      if (this.currentTab === 'dashboard') {
        await this.loadDashboard();
      } else {
        await this.loadLoans();
      }
    } catch (err) {
      // handled
    }
  }

  // --- MODAL UTILS ---
  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('show');
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('show');
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Global instance for inline onclick handlers
window.app = new LibraryApp();
