# Skema & Model Basis Data

Dokumen ini memuat kamus data (*data dictionary*) lengkap untuk entitas yang dikelola oleh SIMWARGA, baik pada mode penyimpanan lokal (*LocalStorage*) saat ini maupun skrip DDL SQL untuk migrasi ke basis data relasional skala besar (*PostgreSQL*).

---

## 1. Kamus Data Penyimpanan Lokal (`LocalStorage`)

Semua data disimpan di dalam media penyimpanan peramban menggunakan kunci terenkapsulasi (`simwarga_*`):

### A. Entitas `simwarga_unit_rumah` (Master Unit/Rumah per Blok)
| Kolom | Tipe Data | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `id` | `String` (PK) | Identifier unik unit rumah | `"UNIT-A02"` |
| `blok` | `String` | Nama/Nomor Blok perumahan | `"Blok A"` |
| `nomorRumah` | `String` | Nomor rumah fisik | `"14"` |
| `namaPenghuni` | `String` | Nama kepala keluarga / penanggung jawab | `"Hendra Wijaya"` |
| `alamat` | `String` | Alamat jalan lengkap | `"Jl. Merak Blok A No. 14"` |
| `noHp` | `String` | Nomor kontak WhatsApp penghuni | `"081398765432"` |
| `iuranWajib` | `Number` | Besaran tarif iuran rutin bulanan (Rp) | `50000` |

### B. Entitas `simwarga_bukti_bayar` (Bukti Transfer Hasil Scan QR)
| Kolom | Tipe Data | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `id` | `String` (PK) | Identifier transaksi bukti bayar | `"BB-101"` |
| `unitId` | `String` (FK) | Relasi ke `unit_rumah.id` | `"UNIT-A02"` |
| `nama` | `String` | Nama warga pembayar | `"Hendra Wijaya"` |
| `blok` | `String` | Blok rumah pembayar | `"Blok A"` |
| `nomorRumah` | `String` | Nomor rumah pembayar | `"14"` |
| `periodeBulan` | `String` | Format tahun dan bulan penagihan (`YYYY-MM` atau daftar multi-bulan) | `"2026-10, 2026-11, 2026-12"` |
| `nominal` | `Number` | Nilai transfer rupiah | `150000` |
| `tanggalBayar` | `String` | Tanggal transaksi (`YYYY-MM-DD`) | `"2026-10-24"` |
| `nomorReferensi` | `String` | Kode referensi unik m-Banking / RRN | `"TRX-BCA-202610240981"` |
| `statusVerifikasi` | `String` | Status: `Menunggu Verifikasi`, `Terverifikasi`, `Ditolak` | `"Terverifikasi"` |
| `transaksiId` | `String` | Relasi ke `transaksi.id` kas masuk (untuk rollback) | `"TRX-101"` |
| `imageHash` | `String` | Fingerprint SHA-256 berkas (Anti-duplikasi) | `"a89fbc412354c7d..."` |
| `imageUrl` | `String` | Base64 data URI WebP atau URL berkas | `"data:image/webp;base64,..."` |
| `catatan` | `String` | Pesan warga atau catatan penolakan bendahara | `"Transfer via BCA a.n Hendra"` |
| `uploadedAt` | `String` | Timestamp waktu unggah (ISO-8601) | `"2026-10-24T08:15:00Z"` |

### C. Entitas `simwarga_transaksi` (Buku Kas & Riwayat Keuangan RT)
| Kolom | Tipe Data | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `id` | `String` (PK) | Kode mutasi kas | `"TRX-101"` |
| `tanggal` | `String` | Tanggal pencatatan kas (`YYYY-MM-DD`) | `"2026-10-24"` |
| `tipe` | `String` | Jenis aliran: `Pemasukan` atau `Pengeluaran` | `"Pemasukan"` |
| `kategori` | `String` | Kategori: `Iuran Bulanan`, `Donasi`, `Operasional`, dll. | `"Iuran Bulanan"` |
| `nominal` | `Number` | Jumlah nominal transaksi rupiah | `50000` |
| `metodeBayar` | `String` | Kanal bayar / kantong kas: `Kas di Bank (BCA)`, `Kas Tunai`, `QRIS` | `"Kas di Bank (BCA)"` |
| `kodeAkunDebit` | `String` | Kode akun debit sesuai CoA | `"1-102"` |
| `kodeAkunKredit` | `String` | Kode akun kredit sesuai CoA | `"4-101"` |
| `keterangan` | `String` | Rincian keperluan transaksi | `"Iuran 2026-10 - Blok A No. 14"` |
| `pembayar` | `String` | Pihak pembayar atau penerima dana | `"Hendra Wijaya (Blok A No. 14)"` |

### D. Entitas `simwarga_settings` (Konfigurasi Profil Wilayah)
| Kolom | Tipe Data | Deskripsi | Nilai Contoh |
| :--- | :--- | :--- | :--- |
| `namaRt` | `String` | Identitas RT | `"RT 03"` |
| `namaRw` | `String` | Identitas RW | `"RW 07"` |
| `kelurahan` | `String` | Nama Kelurahan / Desa | `"Sukamaju"` |
| `kecamatan` | `String` | Nama Kecamatan | `"Cimahi Selatan"` |
| `kota` | `String` | Nama Kota / Kabupaten | `"Kota Cimahi"` |
| `namaKetuaRt` | `String` | Nama resmi Ketua RT | `"H. Bambang Sudrajat"` |
| `namaKetuaRw` | `String` | Nama resmi Ketua RW | `"Drs. H. Suryana"` |
| `tarifIuranBulanan`| `Number` | Tarif standar iuran wajib bulanan | `50000` |
| `saldoAwal` | `Number` | Saldo kas permulaan pembukuan | `2500000` |
| `saldoAwalBank` | `Number` | Saldo permulaan rekening kas bank BCA | `2000000` |
| `saldoAwalTunai` | `Number` | Saldo permulaan kas tunai di bendahara | `500000` |
| `qrisImageUrl` | `String` | Gambar barcode QRIS resmi Kas RT | `"assets/img/qris_rt.png"` |

### E. Entitas `simwarga_users` (Master Akun Pengguna & Hak Akses RBAC)
| Kolom | Tipe Data | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `id` | `String` (PK) | Identifier unik pengguna | `"USR-001"` |
| `username` | `String` (Unique) | Nama pengguna login (huruf kecil) | `"admin"` |
| `passwordHash` | `String` | Hash kriptografis SHA-256 kata sandi | `"240be518fabd2724ddb..."` |
| `namaLengkap` | `String` | Nama lengkap resmi pemegang akun | `"H. Bambang Sudrajat"` |
| `role` | `String` | Peran hak akses: `admin`, `bendahara`, `sekretaris`, `keamanan`, `warga` | `"admin"` |
| `roleLabel` | `String` | Label deskriptif peran pengguna | `"Ketua RT (Admin)"` |
| `jabatan` | `String` | Jabatan dalam struktur pengurus/lingkungan | `"Ketua RT 03"` |
| `status` | `String` | Status keaktifan: `aktif` atau `nonaktif` | `"aktif"` |
| `lastLogin` | `String` | Timestamp ISO-8601 sesi login terakhir | `"2026-11-25T18:30:00Z"` |

### F. Entitas `simwarga_auth_session` (Sesi Aktif Terverifikasi)
| Kolom | Tipe Data | Deskripsi | Contoh |
| :--- | :--- | :--- | :--- |
| `userId` | `String` (FK) | Relasi ke `simwarga_users.id` | `"USR-001"` |
| `username` | `String` | Username sesi aktif | `"admin"` |
| `namaLengkap` | `String` | Nama lengkap pengguna aktif | `"H. Bambang Sudrajat"` |
| `role` | `String` | Peran aktif untuk pengecekan RBAC | `"admin"` |
| `token` | `String` | Token acak verifikasi sesi peramban | `"TKN-A1B2C3-1764123456"` |
| `loginAt` | `String` | Waktu mulai sesi (ISO-8601) | `"2026-11-25T18:30:00Z"` |
| `remember` | `Boolean` | Flag penyimpanan permanen (`localStorage`) vs sementara (`sessionStorage`) | `true` |

### G. Bagan Akun Standar (*Chart of Accounts / CoA*) Kas RT
| Kode Akun | Nama Akun | Kelompok Akun | Keterangan |
| :---: | :--- | :--- | :--- |
| **1-101** | **Kas di Tangan (Kas Tunai)** | Aset Lancar | Uang fisik yang dipegang Bendahara RT |
| **1-102** | **Kas di Bank (BCA Kas RT)** | Aset Lancar | Rekening bank operasional resmi RT |
| **1-103** | **Kas Penampungan QRIS** | Aset Lancar | Saldo penerimaan via e-wallet / barcode QRIS |
| **2-101** | **Iuran Diterima di Muka** | Kewajiban | Titipan dana iuran warga untuk bulan mendatang |
| **4-101** | **Pendapatan Iuran Wajib Bulanan** | Pendapatan | Hak kas RT atas iuran bulan berjalan |
| **4-102** | **Pendapatan Donasi / Sukarela** | Pendapatan | Sumbangan warga di luar iuran bulanan wajib |
| **5-101** | **Beban Operasional & Kebersihan** | Beban/Pengeluaran | Biaya sampah, satpam, lampu jalan, dll. |

---

## 2. Skrip DDL Relasional untuk Migrasi ke PostgreSQL

Jika sistem ditingkatkan ke skala terdistribusi multi-RT/Kelurahan, berikut adalah rancangan skema SQL dengan fitur *Row-Level Security* (RLS) dan partisi:

```sql
-- 1. Tabel Master Tenant (Wilayah RT)
CREATE TABLE tenants (
    tenant_id VARCHAR(50) PRIMARY KEY,
    nama_rt VARCHAR(10) NOT NULL,
    nama_rw VARCHAR(10) NOT NULL,
    kelurahan VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kota VARCHAR(100) NOT NULL,
    nama_ketua_rt VARCHAR(100) NOT NULL,
    tarif_iuran NUMERIC(12, 2) DEFAULT 50000,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Master Unit Rumah
CREATE TABLE unit_rumah (
    unit_id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    blok VARCHAR(20) NOT NULL,
    nomor_rumah VARCHAR(10) NOT NULL,
    nama_penghuni VARCHAR(100) NOT NULL,
    alamat_lengkap TEXT,
    no_hp VARCHAR(20),
    iuran_wajib NUMERIC(12, 2) DEFAULT 50000,
    CONSTRAINT uq_tenant_unit UNIQUE (tenant_id, blok, nomor_rumah)
);

-- 3. Tabel Bukti Pembayaran Iuran Warga (Diproporsikan untuk jutaan baris)
CREATE TABLE bukti_bayar (
    transaksi_id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    unit_id VARCHAR(50) NOT NULL REFERENCES unit_rumah(unit_id),
    periode_bulan VARCHAR(7) NOT NULL, -- Format 'YYYY-MM'
    nominal NUMERIC(12, 2) NOT NULL,
    tanggal_bayar DATE NOT NULL,
    nomor_referensi VARCHAR(100),
    status_verifikasi VARCHAR(25) DEFAULT 'Menunggu Verifikasi',
    image_hash CHAR(64) NOT NULL,      -- SHA-256 Hex Hash
    image_url TEXT NOT NULL,           -- URL Object Storage (S3 / Cloudflare R2)
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_tenant_hash UNIQUE (tenant_id, image_hash) -- Anti-duplikasi di level DB
);

-- 4. Tabel Buku Kas RT
CREATE TABLE transaksi_kas (
    kas_id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL REFERENCES tenants(tenant_id),
    tanggal DATE NOT NULL,
    tipe VARCHAR(20) NOT NULL CHECK (tipe IN ('Pemasukan', 'Pengeluaran')),
    kategori VARCHAR(50) NOT NULL,
    nominal NUMERIC(12, 2) NOT NULL,
    keterangan TEXT NOT NULL,
    pembayar VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Performa Laporan 12 Bulan per Blok
CREATE INDEX idx_laporan_matrix ON bukti_bayar (tenant_id, periode_bulan, status_verifikasi);
CREATE INDEX idx_kas_tenant_tanggal ON transaksi_kas (tenant_id, tanggal);

-- Pengaktifan Row-Level Security (RLS)
ALTER TABLE bukti_bayar ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_kas ENABLE ROW LEVEL SECURITY;

-- Kebijakan Isolasi Data per RT
CREATE POLICY tenant_isolation_bukti ON bukti_bayar
    USING (tenant_id = current_setting('app.current_tenant_id', true));

CREATE POLICY tenant_isolation_kas ON transaksi_kas
    USING (tenant_id = current_setting('app.current_tenant_id', true));
```

