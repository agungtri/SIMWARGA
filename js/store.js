/**
 * SIMWARGA - Store & Storage Management
 * Handles local persistence via LocalStorage and seeds initial data.
 */

const STORAGE_KEYS = {
  SETTINGS: 'simwarga_settings',
  WARGA: 'simwarga_warga',
  TRANSAKSI: 'simwarga_transaksi',
  SURAT: 'simwarga_surat',
  TAMU: 'simwarga_tamu',
  RONDA: 'simwarga_ronda',
  LAPORAN_KEAMANAN: 'simwarga_laporan_keamanan',
  BUKTI_BAYAR: 'simwarga_bukti_bayar',
  UNIT_RUMAH: 'simwarga_unit_rumah'
};

// Data Default Pengaturan RT
const DEFAULT_SETTINGS = {
  namaRt: 'RT 03',
  namaRw: 'RW 07',
  kelurahan: 'Sukamaju',
  kecamatan: 'Cimahi Selatan',
  kota: 'Kota Cimahi',
  provinsi: 'Jawa Barat',
  kodePos: '40533',
  namaKetuaRt: 'H. Bambang Sudrajat',
  kontakKetuaRt: '081234567890',
  namaKetuaRw: 'Drs. H. Suryana',
  tarifIuranBulanan: 50000,
  saldoAwal: 2500000,
  saldoAwalBank: 2000000,
  saldoAwalTunai: 500000
};

// Data Default Warga
const DEFAULT_WARGA = [
  {
    id: 'W-001',
    nik: '3277011203750001',
    noKk: '3277011203000001',
    nama: 'H. Bambang Sudrajat',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Bandung',
    tanggalLahir: '1975-03-12',
    agama: 'Islam',
    pendidikan: 'S1',
    pekerjaan: 'Pegawai Negeri Sipil (PNS)',
    statusPerkawinan: 'Kawin',
    statusKeluarga: 'Kepala Keluarga',
    statusTinggal: 'Tetap',
    alamat: 'Jl. Merak No. 12',
    noHp: '081234567890',
    golDarah: 'O',
    disabilitas: 'Tidak'
  },
  {
    id: 'W-002',
    nik: '3277015507780002',
    noKk: '3277011203000001',
    nama: 'Hj. Siti Aminah',
    jenisKelamin: 'Perempuan',
    tempatLahir: 'Cimahi',
    tanggalLahir: '1978-07-15',
    agama: 'Islam',
    pendidikan: 'D3',
    pekerjaan: 'Wiraswasta',
    statusPerkawinan: 'Kawin',
    statusKeluarga: 'Istri',
    statusTinggal: 'Tetap',
    alamat: 'Jl. Merak No. 12',
    noHp: '081234567891',
    golDarah: 'A',
    disabilitas: 'Tidak'
  },
  {
    id: 'W-003',
    nik: '3277012005020003',
    noKk: '3277011203000001',
    nama: 'Dimas Pratama Sudrajat',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Bandung',
    tanggalLahir: '2002-05-20',
    agama: 'Islam',
    pendidikan: 'SMA/SMK',
    pekerjaan: 'Mahasiswa',
    statusPerkawinan: 'Belum Kawin',
    statusKeluarga: 'Anak',
    statusTinggal: 'Tetap',
    alamat: 'Jl. Merak No. 12',
    noHp: '081234567892',
    golDarah: 'O',
    disabilitas: 'Tidak'
  },
  {
    id: 'W-004',
    nik: '3277011508820004',
    noKk: '3277011508000002',
    nama: 'Hendra Wijaya',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Jakarta',
    tanggalLahir: '1982-08-15',
    agama: 'Kristen',
    pendidikan: 'S1',
    pekerjaan: 'Karyawan Swasta',
    statusPerkawinan: 'Kawin',
    statusKeluarga: 'Kepala Keluarga',
    statusTinggal: 'Tetap',
    alamat: 'Jl. Merak No. 14',
    noHp: '081398765432',
    golDarah: 'B',
    disabilitas: 'Tidak'
  },
  {
    id: 'W-005',
    nik: '3277016010850005',
    noKk: '3277011508000002',
    nama: 'Ratna Sari Dewi',
    jenisKelamin: 'Perempuan',
    tempatLahir: 'Bogor',
    tanggalLahir: '1985-10-20',
    agama: 'Kristen',
    pendidikan: 'S1',
    pekerjaan: 'Ibu Rumah Tangga',
    statusPerkawinan: 'Kawin',
    statusKeluarga: 'Istri',
    statusTinggal: 'Tetap',
    alamat: 'Jl. Merak No. 14',
    noHp: '081398765433',
    golDarah: 'AB',
    disabilitas: 'Tidak'
  },
  {
    id: 'W-006',
    nik: '3277011009140006',
    noKk: '3277011508000002',
    nama: 'Kevin Wijaya',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Cimahi',
    tanggalLahir: '2014-09-10',
    agama: 'Kristen',
    pendidikan: 'SD',
    pekerjaan: 'Pelajar',
    statusPerkawinan: 'Belum Kawin',
    statusKeluarga: 'Anak',
    statusTinggal: 'Tetap',
    alamat: 'Jl. Merak No. 14',
    noHp: '-',
    golDarah: 'B',
    disabilitas: 'Tidak'
  },
  {
    id: 'W-007',
    nik: '3277014201500007',
    noKk: '3277014201000003',
    nama: 'Hj. Rohana',
    jenisKelamin: 'Perempuan',
    tempatLahir: 'Cianjur',
    tanggalLahir: '1950-01-02',
    agama: 'Islam',
    pendidikan: 'SMP',
    pekerjaan: 'Pensiunan',
    statusPerkawinan: 'Cerai Mati',
    statusKeluarga: 'Kepala Keluarga',
    statusTinggal: 'Tetap',
    alamat: 'Jl. Merak No. 16',
    noHp: '085712345678',
    golDarah: 'A',
    disabilitas: 'Tidak'
  },
  {
    id: 'W-008',
    nik: '3277010506980008',
    noKk: '3277014201000003',
    nama: 'Rizky Maulana',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Bandung',
    tanggalLahir: '1998-06-05',
    agama: 'Islam',
    pendidikan: 'D3',
    pekerjaan: 'Teknisi IT',
    statusPerkawinan: 'Belum Kawin',
    statusKeluarga: 'Lainnya',
    statusTinggal: 'Tetap',
    alamat: 'Jl. Merak No. 16',
    noHp: '085712345679',
    golDarah: 'O',
    disabilitas: 'Tidak'
  },
  {
    id: 'W-009',
    nik: '3277011404880009',
    noKk: '3277011404000004',
    nama: 'Budi Santoso',
    jenisKelamin: 'Laki-laki',
    tempatLahir: 'Semarang',
    tanggalLahir: '1988-04-14',
    agama: 'Islam',
    pendidikan: 'S1',
    pekerjaan: 'Wiraswasta / Pedagang',
    statusPerkawinan: 'Kawin',
    statusKeluarga: 'Kepala Keluarga',
    statusTinggal: 'Tetap',
    alamat: 'Jl. Merak No. 18',
    noHp: '082155667788',
    golDarah: 'O',
    disabilitas: 'Tidak'
  },
  {
    id: 'W-010',
    nik: '3277015809900010',
    noKk: '3277011404000004',
    nama: 'Maya Kartika',
    jenisKelamin: 'Perempuan',
    tempatLahir: 'Solo',
    tanggalLahir: '1990-09-18',
    agama: 'Islam',
    pendidikan: 'S1',
    pekerjaan: 'Guru Honorer',
    statusPerkawinan: 'Kawin',
    statusKeluarga: 'Istri',
    statusTinggal: 'Tetap',
    alamat: 'Jl. Merak No. 18',
    noHp: '082155667789',
    golDarah: 'A',
    disabilitas: 'Tidak'
  }
];

// Data Default Transaksi Kas RT
const DEFAULT_TRANSAKSI = [
  {
    id: 'TRX-101',
    tanggal: '2026-10-01',
    tipe: 'Pemasukan',
    kategori: 'Iuran Bulanan',
    metodeBayar: 'Kas di Bank (BCA)',
    kodeAkunDebit: '1-102',
    kodeAkunKredit: '4-101',
    nominal: 500000,
    keterangan: 'Iuran Warga Oktober (10 KK)',
    pembayar: 'Kolektif Warga RT 03'
  },
  {
    id: 'TRX-102',
    tanggal: '2026-10-05',
    tipe: 'Pemasukan',
    kategori: 'Donasi',
    metodeBayar: 'Kas di Bank (BCA)',
    kodeAkunDebit: '1-102',
    kodeAkunKredit: '4-102',
    nominal: 250000,
    keterangan: 'Sumbangan warga untuk perbaikan jalan gang',
    pembayar: 'Bpk. Hendra Wijaya'
  },
  {
    id: 'TRX-103',
    tanggal: '2026-10-10',
    tipe: 'Pengeluaran',
    kategori: 'Operasional',
    metodeBayar: 'Kas Tunai',
    kodeAkunDebit: '5-101',
    kodeAkunKredit: '1-101',
    nominal: 175000,
    keterangan: 'Beli 4 buah lampu LED pos ronda dan fitting kabel',
    pembayar: 'Seksi Keamanan (Pak Budi)'
  },
  {
    id: 'TRX-104',
    tanggal: '2026-10-15',
    tipe: 'Pengeluaran',
    kategori: 'Kebersihan',
    metodeBayar: 'Kas Tunai',
    kodeAkunDebit: '5-101',
    kodeAkunKredit: '1-101',
    nominal: 200000,
    keterangan: 'Honor petugas angkut sampah lingkungan',
    pembayar: 'Petugas Kebersihan Pak Nana'
  },
  {
    id: 'TRX-105',
    tanggal: '2026-10-20',
    tipe: 'Pengeluaran',
    kategori: 'Sosial',
    metodeBayar: 'Kas Tunai',
    kodeAkunDebit: '5-101',
    kodeAkunKredit: '1-101',
    nominal: 150000,
    keterangan: 'Konsumsi kerja bakti membersihkan selokan',
    pembayar: 'Ibu-ibu PKK RT 03'
  }
];

// Data Default Surat Pengantar
const DEFAULT_SURAT = [
  {
    id: 'SRT-001',
    nomorSurat: '470/012/RT.03-RW.07/X/2026',
    tanggal: '2026-10-18',
    wargaId: 'W-003',
    nama: 'Dimas Pratama Sudrajat',
    nik: '3277012005020003',
    keperluan: 'Pengurusan SKCK untuk melamar pekerjaan',
    status: 'Selesai',
    keterangan: 'Sudah ditandatangani Ketua RT'
  },
  {
    id: 'SRT-002',
    nomorSurat: '470/013/RT.03-RW.07/X/2026',
    tanggal: '2026-10-22',
    wargaId: 'W-008',
    nama: 'Rizky Maulana',
    nik: '3277010506980008',
    keperluan: 'Surat Keterangan Domisili Tinggal Pembukaan Rekening Bank',
    status: 'Disetujui',
    keterangan: 'Menunggu pengambilan berkas'
  }
];

// Data Default Tamu & Warga Sementara
const DEFAULT_TAMU = [
  {
    id: 'TM-001',
    nama: 'Ahmad Fauzi',
    nik: '3302151406950002',
    jenis: 'Pengontrak/Kost',
    noHp: '081987654321',
    asal: 'Banyumas, Jawa Tengah',
    alamatTujuan: 'Rumah Kontrakan Bpk. Budi Santoso (Jl. Merak No. 18B)',
    tanggalMasuk: '2026-09-01',
    durasi: '1 Tahun',
    pekerjaan: 'Pegawai Bank BJB',
    status: 'Aktif'
  },
  {
    id: 'TM-002',
    nama: 'Siti Rahmawati',
    nik: '3204126011990001',
    jenis: 'Tamu Menginap (> 24 Jam)',
    noHp: '085811223344',
    asal: 'Soreang, Kab. Bandung',
    alamatTujuan: 'Rumah Bpk. Hendra Wijaya (Jl. Merak No. 14)',
    tanggalMasuk: '2026-10-23',
    durasi: '3 Hari',
    pekerjaan: 'Karyawan',
    status: 'Aktif'
  }
];

// Data Default Jadwal Ronda
const DEFAULT_RONDA = [
  { id: 'RD-1', hari: 'Senin', regu: 'Regu Elang', koordinator: 'Hendra Wijaya', anggota: 'Hendra Wijaya, Dimas Pratama, Pak Taufik', jam: '22:00 - 04:00' },
  { id: 'RD-2', hari: 'Selasa', regu: 'Regu Harimau', koordinator: 'Budi Santoso', anggota: 'Budi Santoso, Rizky Maulana, Pak Wawan', jam: '22:00 - 04:00' },
  { id: 'RD-3', hari: 'Rabu', regu: 'Regu Rajawali', koordinator: 'Agus Salim', anggota: 'Agus Salim, Pak Dedi, Pak Joko', jam: '22:00 - 04:00' },
  { id: 'RD-4', hari: 'Kamis', regu: 'Regu Garuda', koordinator: 'Ahmad Dani', anggota: 'Ahmad Dani, Pak Cecep, Mas Ahmad Fauzi', jam: '22:00 - 04:00' },
  { id: 'RD-5', hari: 'Jumat', regu: 'Regu Singa', koordinator: 'H. Bambang S.', anggota: 'H. Bambang S., Pak Eko, Pak Gunawan', jam: '22:00 - 04:00' },
  { id: 'RD-6', hari: 'Sabtu', regu: 'Regu Banteng', koordinator: 'Sopian Hadi', anggota: 'Sopian Hadi, Kevin (remaja), Pak Rahmat, Mas Aris', jam: '22:00 - 04:00' },
  { id: 'RD-7', hari: 'Minggu', regu: 'Regu Kancil', koordinator: 'Rizky Maulana', anggota: 'Rizky Maulana, Pak Yana, Dimas Pratama', jam: '22:00 - 04:00' }
];

// Data Default Laporan Keamanan
const DEFAULT_LAPORAN_KEAMANAN = [
  {
    id: 'LK-001',
    tanggal: '2026-10-23',
    jam: '02:30',
    pelapor: 'Regu Singa (H. Bambang)',
    jenisKejadian: 'Pemeriksaan Lingkungan',
    status: 'Aman Terkendali',
    lokasi: 'Portal Masuk RT 03 & Gang Utama',
    catatan: 'Portal terkunci rapi pukul 23:00. Kendaraan warga terparkir di garasi/halaman masing-masing dalam keadaan aman.'
  },
  {
    id: 'LK-002',
    tanggal: '2026-10-21',
    jam: '23:45',
    pelapor: 'Budi Santoso',
    jenisKejadian: 'Tamu Tak Dikenal',
    status: 'Terselesaikan',
    lokasi: 'Ujung Gang Merak',
    catatan: 'Ditemukan seorang kurir ekspedisi mencari alamat malam hari. Sudah diantarkan ke rumah warga tujuan dengan selamat.'
  }
];

// Data Default Unit Rumah / Blok
const DEFAULT_UNIT_RUMAH = [
  { id: 'UNIT-A01', blok: 'Blok A', nomorRumah: '12', namaPenghuni: 'H. Bambang Sudrajat', alamat: 'Jl. Merak Blok A No. 12', noHp: '081234567890', iuranWajib: 50000 },
  { id: 'UNIT-A02', blok: 'Blok A', nomorRumah: '14', namaPenghuni: 'Hendra Wijaya', alamat: 'Jl. Merak Blok A No. 14', noHp: '081398765432', iuranWajib: 50000 },
  { id: 'UNIT-A03', blok: 'Blok A', nomorRumah: '16', namaPenghuni: 'Hj. Rohana', alamat: 'Jl. Merak Blok A No. 16', noHp: '085712345678', iuranWajib: 50000 },
  { id: 'UNIT-B01', blok: 'Blok B', nomorRumah: '18', namaPenghuni: 'Budi Santoso', alamat: 'Jl. Merak Blok B No. 18', noHp: '082155667788', iuranWajib: 50000 },
  { id: 'UNIT-B02', blok: 'Blok B', nomorRumah: '20', namaPenghuni: 'Ahmad Sobari', alamat: 'Jl. Merak Blok B No. 20', noHp: '081288990011', iuranWajib: 50000 },
  { id: 'UNIT-C01', blok: 'Blok C', nomorRumah: '05', namaPenghuni: 'Deni Kurniawan', alamat: 'Jl. Merak Blok C No. 05', noHp: '087811223344', iuranWajib: 50000 },
  { id: 'UNIT-C02', blok: 'Blok C', nomorRumah: '07', namaPenghuni: 'Farhan Kamil', alamat: 'Jl. Merak Blok C No. 07', noHp: '089677889900', iuranWajib: 50000 }
];

// Data Default Bukti Bayar Masuk dari Scan QR
const DEFAULT_BUKTI_BAYAR = [
  {
    id: 'BB-101',
    unitId: 'UNIT-A02',
    nama: 'Hendra Wijaya',
    blok: 'Blok A',
    nomorRumah: '14',
    periodeBulan: '2026-10',
    nominal: 50000,
    tanggalBayar: '2026-10-24',
    nomorReferensi: 'TRX-BCA-202610240981',
    statusVerifikasi: 'Menunggu Verifikasi', // 'Menunggu Verifikasi' | 'Terverifikasi' | 'Ditolak'
    imageHash: 'a89fbc412354c7d',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    catatan: 'Transfer via BCA Mobile a.n Hendra Wijaya',
    uploadedAt: '2026-10-24T08:15:00Z'
  },
  {
    id: 'BB-102',
    unitId: 'UNIT-B01',
    nama: 'Budi Santoso',
    blok: 'Blok B',
    nomorRumah: '18',
    periodeBulan: '2026-10',
    nominal: 50000,
    tanggalBayar: '2026-10-23',
    nomorReferensi: 'MDR-202610238812',
    statusVerifikasi: 'Terverifikasi',
    imageHash: 'c77e810a9921ef1',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    catatan: 'Iuran Sampah & Keamanan Oktober',
    uploadedAt: '2026-10-23T19:30:00Z'
  }
];

// Storage Helper
window.SimStore = {
  getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : { ...DEFAULT_SETTINGS };
  },
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getWarga() {
    const data = localStorage.getItem(STORAGE_KEYS.WARGA);
    if (!data) {
      this.saveWarga(DEFAULT_WARGA);
      return [...DEFAULT_WARGA];
    }
    return JSON.parse(data);
  },
  saveWarga(list) {
    localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(list));
  },
  addWarga(item) {
    const list = this.getWarga();
    item.id = 'W-' + Date.now().toString().slice(-4);
    list.unshift(item);
    this.saveWarga(list);
    return item;
  },
  updateWarga(id, updatedItem) {
    let list = this.getWarga();
    list = list.map(item => item.id === id ? { ...item, ...updatedItem } : item);
    this.saveWarga(list);
  },
  deleteWarga(id) {
    let list = this.getWarga();
    list = list.filter(item => item.id !== id);
    this.saveWarga(list);
  },

  getTransaksi() {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSAKSI);
    if (!data) {
      this.saveTransaksi(DEFAULT_TRANSAKSI);
      return [...DEFAULT_TRANSAKSI];
    }
    return JSON.parse(data);
  },
  saveTransaksi(list) {
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(list));
  },
  addTransaksi(item) {
    const list = this.getTransaksi();
    item.id = item.id || ('TRX-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    list.unshift(item);
    this.saveTransaksi(list);
    return item;
  },
  deleteTransaksi(id) {
    let list = this.getTransaksi();
    list = list.filter(item => item.id !== id);
    this.saveTransaksi(list);
  },

  getSurat() {
    const data = localStorage.getItem(STORAGE_KEYS.SURAT);
    if (!data) {
      this.saveSurat(DEFAULT_SURAT);
      return [...DEFAULT_SURAT];
    }
    return JSON.parse(data);
  },
  saveSurat(list) {
    localStorage.setItem(STORAGE_KEYS.SURAT, JSON.stringify(list));
  },
  addSurat(item) {
    const list = this.getSurat();
    item.id = 'SRT-' + Date.now().toString().slice(-4);
    list.unshift(item);
    this.saveSurat(list);
    return item;
  },
  deleteSurat(id) {
    let list = this.getSurat();
    list = list.filter(item => item.id !== id);
    this.saveSurat(list);
  },

  getTamu() {
    const data = localStorage.getItem(STORAGE_KEYS.TAMU);
    if (!data) {
      this.saveTamu(DEFAULT_TAMU);
      return [...DEFAULT_TAMU];
    }
    return JSON.parse(data);
  },
  saveTamu(list) {
    localStorage.setItem(STORAGE_KEYS.TAMU, JSON.stringify(list));
  },
  addTamu(item) {
    const list = this.getTamu();
    item.id = 'TM-' + Date.now().toString().slice(-4);
    list.unshift(item);
    this.saveTamu(list);
    return item;
  },
  deleteTamu(id) {
    let list = this.getTamu();
    list = list.filter(item => item.id !== id);
    this.saveTamu(list);
  },

  getRonda() {
    const data = localStorage.getItem(STORAGE_KEYS.RONDA);
    if (!data) {
      this.saveRonda(DEFAULT_RONDA);
      return [...DEFAULT_RONDA];
    }
    return JSON.parse(data);
  },
  saveRonda(list) {
    localStorage.setItem(STORAGE_KEYS.RONDA, JSON.stringify(list));
  },
  updateRonda(id, updatedItem) {
    let list = this.getRonda();
    list = list.map(item => item.id === id ? { ...item, ...updatedItem } : item);
    this.saveRonda(list);
  },

  getLaporanKeamanan() {
    const data = localStorage.getItem(STORAGE_KEYS.LAPORAN_KEAMANAN);
    if (!data) {
      this.saveLaporanKeamanan(DEFAULT_LAPORAN_KEAMANAN);
      return [...DEFAULT_LAPORAN_KEAMANAN];
    }
    return JSON.parse(data);
  },
  saveLaporanKeamanan(list) {
    localStorage.setItem(STORAGE_KEYS.LAPORAN_KEAMANAN, JSON.stringify(list));
  },
  addLaporanKeamanan(item) {
    const list = this.getLaporanKeamanan();
    item.id = 'LK-' + Date.now().toString().slice(-4);
    list.unshift(item);
    this.saveLaporanKeamanan(list);
    return item;
  },
  deleteLaporanKeamanan(id) {
    let list = this.getLaporanKeamanan();
    list = list.filter(item => item.id !== id);
    this.saveLaporanKeamanan(list);
  },

  // Unit Rumah Management (Blok & No Rumah)
  getUnitRumah() {
    const data = localStorage.getItem(STORAGE_KEYS.UNIT_RUMAH);
    if (!data) {
      this.saveUnitRumah(DEFAULT_UNIT_RUMAH);
      return [...DEFAULT_UNIT_RUMAH];
    }
    return JSON.parse(data);
  },
  saveUnitRumah(list) {
    localStorage.setItem(STORAGE_KEYS.UNIT_RUMAH, JSON.stringify(list));
  },
  addUnitRumah(item) {
    const list = this.getUnitRumah();
    item.id = 'UNIT-' + Date.now().toString().slice(-4);
    list.push(item);
    this.saveUnitRumah(list);
    return item;
  },

  // Bukti Bayar Management
  getBuktiBayar() {
    const data = localStorage.getItem(STORAGE_KEYS.BUKTI_BAYAR);
    if (!data) {
      this.saveBuktiBayar(DEFAULT_BUKTI_BAYAR);
      return [...DEFAULT_BUKTI_BAYAR];
    }
    return JSON.parse(data);
  },
  saveBuktiBayar(list) {
    localStorage.setItem(STORAGE_KEYS.BUKTI_BAYAR, JSON.stringify(list));
  },
  addBuktiBayar(item) {
    const list = this.getBuktiBayar();
    item.id = item.id || ('BB-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    item.uploadedAt = item.uploadedAt || new Date().toISOString();
    list.unshift(item);
    this.saveBuktiBayar(list);
    return item;
  },
  updateBuktiBayar(id, updatedFields) {
    let list = this.getBuktiBayar();
    list = list.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    this.saveBuktiBayar(list);
  },
  deleteBuktiBayar(id) {
    let list = this.getBuktiBayar();
    list = list.filter(item => item.id !== id);
    this.saveBuktiBayar(list);
  },

  // Reset to default
  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.WARGA);
    localStorage.removeItem(STORAGE_KEYS.TRANSAKSI);
    localStorage.removeItem(STORAGE_KEYS.SURAT);
    localStorage.removeItem(STORAGE_KEYS.TAMU);
    localStorage.removeItem(STORAGE_KEYS.RONDA);
    localStorage.removeItem(STORAGE_KEYS.LAPORAN_KEAMANAN);
    localStorage.removeItem(STORAGE_KEYS.UNIT_RUMAH);
    localStorage.removeItem(STORAGE_KEYS.BUKTI_BAYAR);
  },

  // Export full JSON backup
  exportBackupJSON() {
    const fullBackup = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      warga: this.getWarga(),
      transaksi: this.getTransaksi(),
      surat: this.getSurat(),
      tamu: this.getTamu(),
      ronda: this.getRonda(),
      laporanKeamanan: this.getLaporanKeamanan(),
      unitRumah: this.getUnitRumah(),
      buktiBayar: this.getBuktiBayar()
    };
    return JSON.stringify(fullBackup, null, 2);
  },

  // Import JSON backup
  importBackupJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (data.warga) this.saveWarga(data.warga);
      if (data.transaksi) this.saveTransaksi(data.transaksi);
      if (data.surat) this.saveSurat(data.surat);
      if (data.tamu) this.saveTamu(data.tamu);
      if (data.ronda) this.saveRonda(data.ronda);
      if (data.laporanKeamanan) this.saveLaporanKeamanan(data.laporanKeamanan);
      if (data.unitRumah) this.saveUnitRumah(data.unitRumah);
      if (data.buktiBayar) this.saveBuktiBayar(data.buktiBayar);
      return true;
    } catch (e) {
      console.error('Failed to import JSON backup', e);
      return false;
    }
  }
};

