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
  UNIT_RUMAH: 'simwarga_unit_rumah',
  CLOUD_CONFIG: 'simwarga_cloud_config',
  OFFLINE_QUEUE: 'simwarga_offline_queue',
  USERS: 'simwarga_users',
  AUTH_SESSION: 'simwarga_auth_session'
};

// Definisi Peran Pengguna & Matriks Hak Akses (RBAC)
const USER_ROLES = {
  ADMIN: 'admin',
  BENDAHARA: 'bendahara',
  SEKRETARIS: 'sekretaris',
  KEAMANAN: 'keamanan',
  WARGA: 'warga'
};

const ROLE_PERMISSIONS = {
  admin: {
    label: 'Ketua RT (Admin)',
    badgeColor: 'blue',
    allowedTabs: ['dashboard', 'warga', 'keuangan', 'surat', 'tamu', 'keamanan', 'settings'],
    canManageUsers: true
  },
  bendahara: {
    label: 'Bendahara RT',
    badgeColor: 'emerald',
    allowedTabs: ['dashboard', 'keuangan'],
    canManageUsers: false
  },
  sekretaris: {
    label: 'Sekretaris RT',
    badgeColor: 'purple',
    allowedTabs: ['dashboard', 'warga', 'surat', 'tamu'],
    canManageUsers: false
  },
  keamanan: {
    label: 'Petugas Keamanan & Ronda',
    badgeColor: 'amber',
    allowedTabs: ['dashboard', 'tamu', 'keamanan'],
    canManageUsers: false
  },
  warga: {
    label: 'Warga Lingkungan',
    badgeColor: 'slate',
    allowedTabs: ['dashboard', 'keuangan', 'surat'],
    canManageUsers: false
  }
};

// Data Default Pengguna Sistem (Akun Demo & Bawaan)
const DEFAULT_USERS = [
  {
    id: 'USR-001',
    username: 'admin',
    passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
    namaLengkap: 'H. Bambang Sudrajat',
    role: 'admin',
    roleLabel: 'Ketua RT (Admin)',
    jabatan: 'Ketua RT 03',
    status: 'aktif',
    lastLogin: null
  },
  {
    id: 'USR-002',
    username: 'bendahara',
    passwordHash: 'dff9cd137cab8b96431ccd81f8bb433fc71f0329eefb54bd4380b3fc3a9fc5d1', // bendahara123
    namaLengkap: 'Hj. Siti Aminah',
    role: 'bendahara',
    roleLabel: 'Bendahara RT',
    jabatan: 'Bendahara Keuangan RT',
    status: 'aktif',
    lastLogin: null
  },
  {
    id: 'USR-003',
    username: 'sekretaris',
    passwordHash: 'b266dd6db331e165a8be1a57d46b4f49572108e710d52ff9e92f608891e1d97b', // sekretaris123
    namaLengkap: 'Hendra Wijaya',
    role: 'sekretaris',
    roleLabel: 'Sekretaris RT',
    jabatan: 'Sekretaris Administrasi RT',
    status: 'aktif',
    lastLogin: null
  },
  {
    id: 'USR-004',
    username: 'keamanan',
    passwordHash: '4e85ff5ee3fe2b2181b50aa14d31846291406ba9cb5ae9c508b0bb7acd8d7866', // keamanan123
    namaLengkap: 'Pak Joko Sutrisno',
    role: 'keamanan',
    roleLabel: 'Petugas Keamanan & Ronda',
    jabatan: 'Koordinator Kamling RT',
    status: 'aktif',
    lastLogin: null
  },
  {
    id: 'USR-005',
    username: 'warga',
    passwordHash: '6b21de8534cbd0297f5217e53625b14f2ff44f317b262d6ea001da397b7552ea', // warga123
    namaLengkap: 'Budi Santoso',
    role: 'warga',
    roleLabel: 'Warga Lingkungan',
    jabatan: 'Warga Blok A No. 18',
    unitId: 'UNIT-A04',
    status: 'aktif',
    lastLogin: null
  }
];

// Konfigurasi Bawaan Cloud Sync (Mode Hosted Web)
const DEFAULT_CLOUD_CONFIG = {
  enabled: false,
  provider: 'supabase', // 'supabase' | 'rest' | 'custom'
  endpointUrl: '',
  apiKey: '',
  tenantId: 'KL-SUKAMAJU-RW07-RT03',
  lastSyncTime: null,
  syncStatus: 'idle' // 'idle' | 'syncing' | 'online' | 'offline' | 'error'
};

// Storage Adapter: RemoteSyncAdapter untuk Hosted Web & BaaS Sync
const RemoteSyncAdapter = {
  async pullBuktiBayar(config) {
    if (!config || !config.endpointUrl || !config.enabled) return null;
    try {
      const tenantId = config.tenantId || 'KL-SUKAMAJU-RW07-RT03';
      const url = config.endpointUrl.replace(/\/+$/, '');
      const headers = { 'Content-Type': 'application/json' };
      if (config.apiKey) {
        headers['apikey'] = config.apiKey;
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const fetchUrl = config.provider === 'supabase'
        ? `${url}/rest/v1/bukti_bayar?tenant_id=eq.${encodeURIComponent(tenantId)}&select=*`
        : `${url}/api/bukti-bayar?tenant_id=${encodeURIComponent(tenantId)}`;

      const resp = await fetch(fetchUrl, { method: 'GET', headers });
      if (!resp.ok) throw new Error(`HTTP Error ${resp.status}`);
      const data = await resp.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[RemoteSyncAdapter] Gagal menarik data remote:', err);
      throw err;
    }
  },

  async pushBuktiBayar(item, config) {
    if (!config || !config.endpointUrl || !config.enabled) return false;
    try {
      const url = config.endpointUrl.replace(/\/+$/, '');
      const headers = {
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      };
      if (config.apiKey) {
        headers['apikey'] = config.apiKey;
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      const postUrl = config.provider === 'supabase'
        ? `${url}/rest/v1/bukti_bayar`
        : `${url}/api/bukti-bayar`;

      const payload = {
        id: item.id,
        tenant_id: config.tenantId || item.tenantId || 'KL-SUKAMAJU-RW07-RT03',
        unit_id: item.unitId,
        nama: item.nama,
        blok: item.blok,
        nomor_rumah: item.nomorRumah,
        periode_bulan: item.periodeBulan,
        nominal: item.nominal,
        tanggal_bayar: item.tanggalBayar,
        nomor_referensi: item.nomorReferensi,
        status_verifikasi: item.statusVerifikasi,
        image_hash: item.imageHash,
        image_url: item.imageUrl,
        catatan: item.catatan,
        created_at: item.uploadedAt || new Date().toISOString()
      };

      const resp = await fetch(postUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      return resp.ok;
    } catch (err) {
      console.warn('[RemoteSyncAdapter] Gagal mengirim data ke remote:', err);
      return false;
    }
  }
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
  // Helper parsing aman tahan kerusakan JSON/Storage
  _safeParse(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data);
    } catch (e) {
      console.warn(`[SimStore] Data korup terdeteksi pada kunci ${key}, mengembalikan data awal.`, e);
      return fallback;
    }
  },

  getSettings() {
    return this._safeParse(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS });
  },
  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getWarga() {
    return this._safeParse(STORAGE_KEYS.WARGA, [...DEFAULT_WARGA]);
  },
  saveWarga(list) {
    localStorage.setItem(STORAGE_KEYS.WARGA, JSON.stringify(list));
  },
  addWarga(item) {
    const list = this.getWarga();
    item.id = item.id || ('W-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
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
    return this._safeParse(STORAGE_KEYS.TRANSAKSI, [...DEFAULT_TRANSAKSI]);
  },
  saveTransaksi(list) {
    localStorage.setItem(STORAGE_KEYS.TRANSAKSI, JSON.stringify(list));
  },
  addTransaksi(item) {
    const list = this.getTransaksi();
    item.id = item.id || ('TRX-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
    list.unshift(item);
    this.saveTransaksi(list);
    return item;
  },
  deleteTransaksi(id) {
    let list = this.getTransaksi();
    list = list.filter(item => item.id !== id);
    this.saveTransaksi(list);
  },
  getRingkasanKas() {
    const settings = this.getSettings();
    const transaksiList = this.getTransaksi();
    let totalMasuk = 0;
    let totalKeluar = 0;
    let saldoKasBank = Number(settings.saldoAwalBank) || (Number(settings.saldoAwal) ? Math.round(Number(settings.saldoAwal) * 0.8) : 2000000);
    let saldoKasTunai = Number(settings.saldoAwalTunai) || (Number(settings.saldoAwal) ? Math.round(Number(settings.saldoAwal) * 0.2) : 500000);

    transaksiList.forEach(t => {
      const nom = Number(t.nominal) || 0;
      const isTunai = (t.metodeBayar || '').toLowerCase().includes('tunai');
      if (t.tipe === 'Pemasukan') {
        totalMasuk += nom;
        if (isTunai) saldoKasTunai += nom;
        else saldoKasBank += nom;
      }
      if (t.tipe === 'Pengeluaran') {
        totalKeluar += nom;
        if (isTunai) saldoKasTunai -= nom;
        else saldoKasBank -= nom;
      }
    });
    const totalSaldo = saldoKasBank + saldoKasTunai;
    return {
      totalPemasukan: totalMasuk,
      totalPengeluaran: totalKeluar,
      saldoKasBank,
      saldoKasTunai,
      totalSaldo
    };
  },

  getSurat() {
    return this._safeParse(STORAGE_KEYS.SURAT, [...DEFAULT_SURAT]);
  },
  saveSurat(list) {
    localStorage.setItem(STORAGE_KEYS.SURAT, JSON.stringify(list));
  },
  addSurat(item) {
    const list = this.getSurat();
    item.id = item.id || ('SRT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
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
    return this._safeParse(STORAGE_KEYS.TAMU, [...DEFAULT_TAMU]);
  },
  saveTamu(list) {
    localStorage.setItem(STORAGE_KEYS.TAMU, JSON.stringify(list));
  },
  addTamu(item) {
    const list = this.getTamu();
    item.id = item.id || ('TM-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
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
    return this._safeParse(STORAGE_KEYS.RONDA, [...DEFAULT_RONDA]);
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
    return this._safeParse(STORAGE_KEYS.LAPORAN_KEAMANAN, [...DEFAULT_LAPORAN_KEAMANAN]);
  },
  saveLaporanKeamanan(list) {
    localStorage.setItem(STORAGE_KEYS.LAPORAN_KEAMANAN, JSON.stringify(list));
  },
  addLaporanKeamanan(item) {
    const list = this.getLaporanKeamanan();
    item.id = item.id || ('LK-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
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
    return this._safeParse(STORAGE_KEYS.UNIT_RUMAH, [...DEFAULT_UNIT_RUMAH]);
  },
  saveUnitRumah(list) {
    localStorage.setItem(STORAGE_KEYS.UNIT_RUMAH, JSON.stringify(list));
  },
  addUnitRumah(item) {
    const list = this.getUnitRumah();
    item.id = item.id || ('UNIT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
    list.push(item);
    this.saveUnitRumah(list);
    return item;
  },

  // ===== Token Tautan Pembayaran =====
  // Menyamarkan ID unit pada URL bayar.html agar tidak tampil di address bar
  // dan tidak bisa dienumerasi dengan menebak. Kunci ikut terkirim ke browser
  // karena situs statis, jadi ini penyamaran, bukan kerahasiaan sejati.
  _linkKey: 'SIMWARGA-RT01-2026',

  _hashKey(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  },

  _keyStream(seed, len) {
    let s = seed >>> 0;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      out[i] = s & 0xff;
    }
    return out;
  },

  _b64urlEncode(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },

  _b64urlDecode(str) {
    const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  },

  encryptUnitToken(unitId) {
    const data = new TextEncoder().encode(String(unitId));
    const ks = this._keyStream(this._hashKey(this._linkKey), data.length + 1);
    const out = new Uint8Array(data.length + 1);
    out[0] = data.length ^ ks[0];
    for (let i = 0; i < data.length; i++) {
      out[i + 1] = data[i] ^ ks[i + 1];
    }
    return this._b64urlEncode(out);
  },

  decryptUnitToken(token) {
    try {
      const bytes = this._b64urlDecode(token);
      if (bytes.length < 2) return null;
      const ks = this._keyStream(this._hashKey(this._linkKey), bytes.length);
      const len = bytes[0] ^ ks[0];
      if (len !== bytes.length - 1) return null;
      const out = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        out[i] = bytes[i + 1] ^ ks[i + 1];
      }
      const text = new TextDecoder().decode(out);
      return /^UNIT-[A-Z0-9]+$/.test(text) ? text : null;
    } catch (e) {
      return null;
    }
  },

  buildBayarUrl(unitId) {
    return `bayar.html?t=${this.encryptUnitToken(unitId)}`;
  },

  // Bukti Bayar Management
  getBuktiBayar() {
    return this._safeParse(STORAGE_KEYS.BUKTI_BAYAR, [...DEFAULT_BUKTI_BAYAR]);
  },
  saveBuktiBayar(list) {
    localStorage.setItem(STORAGE_KEYS.BUKTI_BAYAR, JSON.stringify(list));
  },
  addBuktiBayar(item) {
    const list = this.getBuktiBayar();
    item.id = item.id || ('BB-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8));
    item.uploadedAt = item.uploadedAt || new Date().toISOString();
    item.tenantId = item.tenantId || this.getTenantId();
    list.unshift(item);
    this.saveBuktiBayar(list);

    if (this.isHostedMode()) {
      this.dispatchCloudMutation('bukti_bayar', 'INSERT', item);
    }
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
    localStorage.removeItem(STORAGE_KEYS.CLOUD_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    try { sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION); } catch (e) {}
  },

  // Export full JSON backup
  exportBackupJSON() {
    const fullBackup = {
      version: '1.2',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      warga: this.getWarga(),
      transaksi: this.getTransaksi(),
      surat: this.getSurat(),
      tamu: this.getTamu(),
      ronda: this.getRonda(),
      laporanKeamanan: this.getLaporanKeamanan(),
      unitRumah: this.getUnitRumah(),
      buktiBayar: this.getBuktiBayar(),
      users: this.getUsers()
    };
    return JSON.stringify(fullBackup, null, 2);
  },

  // Import JSON backup
  importBackupJSON(jsonString) {
    try {
      if (!jsonString || typeof jsonString !== 'string') return false;
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') return false;
      const knownKeys = ['settings', 'warga', 'transaksi', 'surat', 'tamu', 'ronda', 'laporanKeamanan', 'unitRumah', 'buktiBayar', 'users'];
      const hasAny = knownKeys.some(k => k in data);
      if (!hasAny) return false;

      if (data.settings) this.saveSettings(data.settings);
      if (data.warga) this.saveWarga(data.warga);
      if (data.transaksi) this.saveTransaksi(data.transaksi);
      if (data.surat) this.saveSurat(data.surat);
      if (data.tamu) this.saveTamu(data.tamu);
      if (data.ronda) this.saveRonda(data.ronda);
      if (data.laporanKeamanan) this.saveLaporanKeamanan(data.laporanKeamanan);
      if (data.unitRumah) this.saveUnitRumah(data.unitRumah);
      if (data.buktiBayar) this.saveBuktiBayar(data.buktiBayar);
      if (data.users && Array.isArray(data.users)) this.saveUsers(data.users);
      return true;
    } catch (e) {
      console.error('Failed to import JSON backup', e);
      return false;
    }
  },

  // ==========================================
  // MODUL HOSTED WEB & STORAGE ADAPTER CLOUD
  // ==========================================

  // Deteksi mode runtime: Hosted Web (http/https) vs Standalone (file:///)
  isHostedMode() {
    return typeof window !== 'undefined' && !!window.location && window.location.protocol.startsWith('http');
  },

  // Konfigurasi Cloud Sync
  getCloudConfig() {
    return this._safeParse(STORAGE_KEYS.CLOUD_CONFIG, { ...DEFAULT_CLOUD_CONFIG });
  },

  saveCloudConfig(config) {
    const current = this.getCloudConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify(updated));
    return updated;
  },

  getTenantId() {
    const config = this.getCloudConfig();
    return config.tenantId || 'KL-SUKAMAJU-RW07-RT03';
  },

  // Antrean Mutasi Luring (Offline Mutation Queue)
  getOfflineQueue() {
    return this._safeParse(STORAGE_KEYS.OFFLINE_QUEUE, []);
  },

  enqueueOffline(action, entity, data) {
    const queue = this.getOfflineQueue();
    queue.push({
      id: 'MUT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      action,
      entity,
      data,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  },

  clearOfflineQueue() {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  },

  // Pengiriman Mutasi ke Cloud (Async Non-Blocking)
  async dispatchCloudMutation(entity, action, item) {
    const config = this.getCloudConfig();
    if (!config.enabled || !config.endpointUrl) {
      return { success: false, reason: 'cloud_disabled' };
    }
    try {
      if (entity === 'bukti_bayar' && action === 'INSERT') {
        const ok = await RemoteSyncAdapter.pushBuktiBayar(item, config);
        if (!ok) {
          this.enqueueOffline(action, entity, item);
        }
        return { success: ok };
      }
      return { success: true };
    } catch (e) {
      this.enqueueOffline(action, entity, item);
      return { success: false, error: e };
    }
  },

  // Pengujian Koneksi Cloud Endpoint
  async testCloudConnection(configToTest) {
    const config = configToTest || this.getCloudConfig();
    if (!config.endpointUrl) {
      return { ok: false, message: 'URL Endpoint Cloud belum diisi!' };
    }
    try {
      const url = config.endpointUrl.replace(/\/+$/, '');
      const testUrl = config.provider === 'supabase'
        ? `${url}/rest/v1/`
        : `${url}/api/health`;
      const headers = { 'Accept': 'application/json' };
      if (config.apiKey) headers['apikey'] = config.apiKey;

      const resp = await fetch(testUrl, { method: 'HEAD', headers }).catch(() => fetch(testUrl, { method: 'GET', headers }));
      return {
        ok: resp.ok || resp.status === 401 || resp.status === 404,
        status: resp.status,
        message: resp.ok ? 'Koneksi ke Server Cloud Berhasil!' : `Server merespons: Status HTTP ${resp.status}`
      };
    } catch (e) {
      return { ok: false, message: 'Gagal terhubung: ' + (e.message || 'Network error') };
    }
  },

  // Sinkronisasi Dua Arah (Bidirectional Remote Sync)
  async syncRemote() {
    const config = this.getCloudConfig();
    if (!config.enabled || !config.endpointUrl) {
      return { success: false, reason: 'Cloud Sync belum diaktifkan dalam pengaturan.' };
    }
    try {
      this.saveCloudConfig({ syncStatus: 'syncing' });
      const remoteItems = await RemoteSyncAdapter.pullBuktiBayar(config);
      let mergeCount = 0;

      if (Array.isArray(remoteItems) && remoteItems.length > 0) {
        const localList = this.getBuktiBayar();
        const existingIds = new Set(localList.map(b => b.id));
        const existingHashes = new Set(localList.map(b => b.imageHash).filter(Boolean));

        remoteItems.forEach(r => {
          const norm = {
            id: r.id,
            tenantId: r.tenant_id || r.tenantId || config.tenantId,
            unitId: r.unit_id || r.unitId,
            nama: r.nama,
            blok: r.blok,
            nomorRumah: r.nomor_rumah || r.nomorRumah,
            periodeBulan: r.periode_bulan || r.periodeBulan,
            nominal: Number(r.nominal),
            tanggalBayar: r.tanggal_bayar || r.tanggalBayar,
            nomorReferensi: r.nomor_referensi || r.nomorReferensi,
            statusVerifikasi: r.status_verifikasi || r.statusVerifikasi || 'Menunggu Verifikasi',
            transaksiId: r.transaksi_id || r.transaksiId || null,
            imageHash: r.image_hash || r.imageHash,
            imageUrl: r.image_url || r.imageUrl,
            catatan: r.catatan,
            uploadedAt: r.created_at || r.uploadedAt || new Date().toISOString()
          };

          if (!existingIds.has(norm.id) && (!norm.imageHash || !existingHashes.has(norm.imageHash))) {
            localList.unshift(norm);
            existingIds.add(norm.id);
            if (norm.imageHash) existingHashes.add(norm.imageHash);
            mergeCount++;
          }
        });

        if (mergeCount > 0) {
          this.saveBuktiBayar(localList);
        }
      }

      // Kirim mutasi luring yang tertunda jika ada
      const flushedCount = await this.flushOfflineQueue();

      const now = new Date().toISOString();
      this.saveCloudConfig({
        syncStatus: 'online',
        lastSyncTime: now
      });

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('simwarga:synced', {
          detail: { mergeCount, flushedCount, lastSyncTime: now }
        }));
      }

      return { success: true, mergeCount, flushedCount, timestamp: now };
    } catch (err) {
      this.saveCloudConfig({ syncStatus: 'error' });
      return { success: false, error: err.message };
    }
  },

  // Eksekusi Antrean Luring
  async flushOfflineQueue() {
    const queue = this.getOfflineQueue();
    if (!queue || queue.length === 0) return 0;
    const config = this.getCloudConfig();
    if (!config.enabled || !config.endpointUrl) return 0;

    const remaining = [];
    let flushedCount = 0;
    for (const item of queue) {
      try {
        if (item.entity === 'bukti_bayar' && item.action === 'INSERT') {
          const ok = await RemoteSyncAdapter.pushBuktiBayar(item.data, config);
          if (ok) flushedCount++;
          else remaining.push(item);
        } else {
          flushedCount++;
        }
      } catch (e) {
        remaining.push(item);
      }
    }
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remaining));
    return flushedCount;
  },

  // ==========================================
  // MODUL PENGGUNA & AUTENTIKASI (RBAC)
  // ==========================================

  getUsers() {
    return this._safeParse(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },

  saveUsers(list) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
  },

  getUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  },

  getUserByUsername(username) {
    if (!username) return null;
    const users = this.getUsers();
    return users.find(u => u.username.toLowerCase() === username.trim().toLowerCase()) || null;
  },

  // Perhitungan Hash SHA-256 (Mendukung Web Crypto & Pure JS Fallback)
  async hashPassword(password) {
    if (!password) return '';
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      // fallback
    }
    return this.hashPasswordSync(password);
  },

  // Synchronous SHA-256 Hash Calculation (Zero-Dependency & Offline Standalone)
  hashPasswordSync(ascii) {
    if (!ascii) return '';
    function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    var hash = [];
    var k = [];
    var primeCounter = 0;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while ((ascii[lengthProperty] % 64) !== 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength | 0);
    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var i2 = i + j;
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0
          );
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (var b = 3; b >= 0; b--) {
        var byte = (hash[i] >> (8 * b)) & 255;
        result += (byte < 16 ? '0' : '') + byte.toString(16);
      }
    }
    return result;
  },

  // Verifikasi Kredensial & Pembuatan Sesi Login
  async authenticate(username, password, remember = true) {
    if (!username || !password) {
      return { success: false, message: 'Username dan kata sandi wajib diisi.' };
    }
    const user = this.getUserByUsername(username);
    if (!user) {
      return { success: false, message: 'Username atau kata sandi tidak sesuai.' };
    }
    if (user.status !== 'aktif') {
      return { success: false, message: 'Akun ini dinonaktifkan. Hubungi Ketua RT / Administrator.' };
    }

    const inputHash = await this.hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return { success: false, message: 'Kata sandi tidak sesuai. Silakan periksa kembali.' };
    }

    // Catat timestamp login terakhir
    const nowIso = new Date().toISOString();
    user.lastLogin = nowIso;
    await this.updateUser(user.id, { lastLogin: nowIso });

    // Format objek sesi otorisasi
    const roleMeta = this.getRoleMeta(user.role);
    const sessionData = {
      userId: user.id,
      username: user.username,
      namaLengkap: user.namaLengkap,
      role: user.role,
      roleLabel: user.roleLabel || roleMeta.label,
      badgeColor: roleMeta.badgeColor,
      jabatan: user.jabatan || '',
      token: 'TKN-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now(),
      loginAt: nowIso,
      remember: !!remember
    };

    const sessionStr = JSON.stringify(sessionData);
    if (remember) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, sessionStr);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, sessionStr);
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }

    return {
      success: true,
      user: sessionData
    };
  },

  // Ambil Data Sesi Pengguna Aktif
  getCurrentUser() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION) || sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (!saved) return null;
      const session = JSON.parse(saved);
      if (!session || !session.userId) return null;

      // Pastikan akun pengguna masih terdaftar dan berstatus aktif
      const user = this.getUserById(session.userId);
      if (!user || user.status !== 'aktif') {
        this.logout();
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  },

  // Logout & Pembersihan Sesi
  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    try { sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION); } catch (e) {}
    return true;
  },

  // Matriks Otorisasi RBAC
  canAccessTab(role, tabId) {
    if (!role) return false;
    const perm = ROLE_PERMISSIONS[role];
    if (!perm) return false;
    return perm.allowedTabs.includes(tabId);
  },

  getAllowedTabs(role) {
    if (!role) return [];
    const perm = ROLE_PERMISSIONS[role];
    return perm ? [...perm.allowedTabs] : [];
  },

  getRoleMeta(role) {
    return ROLE_PERMISSIONS[role] || {
      label: role,
      badgeColor: 'slate',
      allowedTabs: ['dashboard'],
      canManageUsers: false
    };
  },

  // CRUD Akun Pengguna
  async addUser(item) {
    const list = this.getUsers();
    if (!item.username || !item.username.trim()) {
      throw new Error('Username wajib diisi.');
    }
    const cleanUsername = item.username.trim().toLowerCase();
    const existing = list.find(u => u.username.toLowerCase() === cleanUsername);
    if (existing) {
      throw new Error(`Username "${cleanUsername}" sudah terdaftar.`);
    }

    const id = item.id || `USR-${String(list.length + 1).padStart(3, '0')}`;
    const passwordHash = item.passwordHash || (item.password ? await this.hashPassword(item.password) : this.hashPasswordSync('123456'));
    const roleMeta = this.getRoleMeta(item.role || 'warga');

    const newUser = {
      id,
      username: cleanUsername,
      passwordHash,
      namaLengkap: item.namaLengkap ? item.namaLengkap.trim() : cleanUsername,
      role: item.role || 'warga',
      roleLabel: item.roleLabel || roleMeta.label,
      jabatan: item.jabatan ? item.jabatan.trim() : '',
      status: item.status || 'aktif',
      lastLogin: null
    };

    list.push(newUser);
    this.saveUsers(list);
    return newUser;
  },

  async updateUser(id, updatedFields) {
    let list = this.getUsers();
    const idx = list.findIndex(u => u.id === id);
    if (idx === -1) return false;

    const copy = { ...list[idx] };

    // Ganti password jika diisi
    if (updatedFields.password && updatedFields.password.trim()) {
      copy.passwordHash = await this.hashPassword(updatedFields.password.trim());
    } else if (updatedFields.passwordHash) {
      copy.passwordHash = updatedFields.passwordHash;
    }

    if (updatedFields.username && updatedFields.username.trim().toLowerCase() !== copy.username) {
      const cleanU = updatedFields.username.trim().toLowerCase();
      const existing = list.find(u => u.id !== id && u.username.toLowerCase() === cleanU);
      if (existing) throw new Error(`Username "${cleanU}" sudah dipakai oleh pengguna lain.`);
      copy.username = cleanU;
    }

    if (updatedFields.namaLengkap !== undefined) copy.namaLengkap = updatedFields.namaLengkap.trim();
    if (updatedFields.jabatan !== undefined) copy.jabatan = updatedFields.jabatan.trim();
    if (updatedFields.status !== undefined) copy.status = updatedFields.status;
    if (updatedFields.lastLogin !== undefined) copy.lastLogin = updatedFields.lastLogin;

    if (updatedFields.role !== undefined) {
      copy.role = updatedFields.role;
      const meta = this.getRoleMeta(updatedFields.role);
      copy.roleLabel = meta.label;
    }

    list[idx] = copy;
    this.saveUsers(list);
    return copy;
  },

  deleteUser(id) {
    if (id === 'USR-001') {
      throw new Error('Akun Administrator utama (Ketua RT) tidak dapat dihapus.');
    }
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.userId === id) {
      throw new Error('Tidak dapat menghapus akun yang sedang aktif digunakan saat ini.');
    }
    let list = this.getUsers();
    const prevLen = list.length;
    list = list.filter(u => u.id !== id);
    if (list.length === prevLen) return false;
    this.saveUsers(list);
    return true;
  }
};

// Ekspor Definisi Konstanta ke Namespace SimStore & Window
SimStore.USER_ROLES = USER_ROLES;
SimStore.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
SimStore.DEFAULT_USERS = DEFAULT_USERS;
if (typeof window !== 'undefined') {
  window.SimStore = SimStore;
}

