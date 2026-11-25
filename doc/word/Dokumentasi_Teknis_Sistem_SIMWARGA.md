# DOKUMENTASI TEKNIS SISTEM SIMWARGA
**Arsitektur Perangkat Lunak, Kamus Data, Kriptografi Klien & Spesifikasi Teknis**

---

## 1. IDENTITAS DOKUMEN & SPESIFIKASI SISTEM

| Parameter Teknis | Keterangan Spesifikasi |
| :--- | :--- |
| **Nama Sistem** | Sistem Informasi Manajemen Warga & Keuangan Lingkungan (SIMWARGA) |
| **Versi Rilis Teknis** | 1.2.0 |
| **Arsitektur Utama** | Client-Side Standalone First & Static Hosted Jamstack Ready |
| **Format Basis Data Lokal** | Web Storage API (LocalStorage) dengan Abstraksi Modular `SimStore` |
| **Kompresi & Kriptografi** | HTML5 Canvas WebP API & Web Crypto API (SHA-256) |
| **Bahasa & Kerangka Kerja** | Native JavaScript (ES6+), HTML5, Tailwind CSS, Lucide Icons |
| **Kompatibilitas Runtime** | Google Chrome 90+, Microsoft Edge 90+, Mozilla Firefox 88+, Safari 14+ |

---

## 2. PRINSIP DESAIN ARSITEKTUR UTAMA (DUAL-MODE)

SIMWARGA dibangun di atas prinsip arsitektur **Dual-Mode**, yaitu kemampuan aplikasi untuk dijalankan dalam dua lingkungan yang berbeda tanpa mengubah kode dasar:

### 2.1 Mode Standalone Lokal (`file:///`) - Offline First
* **Karakteristik:** Berjalan langsung di komputer pengurus RT hanya dengan melakukan klik ganda (*double click*) pada berkas `index.html` di File Explorer tanpa memerlukan koneksi internet, server web lokal (Apache/Nginx), maupun runtime backend (Node.js, PHP, Python).
* **Solusi Kendala CORS:** Seluruh modul dirancang menggunakan namespace global terstruktur (`window.SimStore`, `window.AppState`) alih-alih ES Module `import`/`export` lintas berkas yang umumnya diblokir oleh kebijakan keamanan peramban pada protokol `file:///`.

### 2.2 Mode Hosting Statis (`https://`) - Jamstack & Cloud Scalable
* **Karakteristik:** Siap di-deploy pada layanan Content Delivery Network (CDN) statis global seperti Cloudflare Pages, Vercel, Netlify, atau GitHub Pages secara instan.
* **Storage Adapter Pattern:** Lapisan abstraksi penyimpanan di `SimStore` dirancang modular. Pengurus dapat beralih dari driver `LocalStorageAdapter` ke driver sinkronisasi cloud (`RemoteSyncAdapter` berbasis Supabase / Cloudflare D1) dan Object Storage (Cloudflare R2 / AWS S3) untuk sinkronisasi multi-pengurus.

---

## 3. MODEL MULTI-TENANCY HIERARKIS BERBASIS WILAYAH

Data di dalam SIMWARGA diorganisasi menggunakan model multi-tenancy hierarkis berbasis wilayah administratif Indonesia. Model ini menjamin isolasi data antar-rukun tetangga dan memudahkan konsolidasi laporan ke tingkat yang lebih tinggi:

$$\text{Kelurahan} \longrightarrow \text{Rukun Warga (RW)} \longrightarrow \text{Rukun Tetangga (RT)} \longrightarrow \text{Blok Wilayah} \longrightarrow \text{Nomor Rumah}$$

Setiap unit rumah memiliki pengenal unik (*Unique Identifier*) dengan format standar:
$$\mathbf{UNIT}\text{-}[\text{Blok}][\text{Nomor}]$$
*Contoh:* `UNIT-A02` merepresentasikan Blok A Nomor 14 pada RT 03 / RW 07 Kelurahan Sukamaju.

---

## 4. KAMUS DATA & MODEL ENTITAS SIMSTORE

Lapisan penyimpanan lokal dikelola oleh modul [`js/store.js`](file:///c:/Users/Agung/netijen/js/store.js) yang memfasilitasi operasi Create, Read, Update, Delete (CRUD) untuk sembilan entitas utama:

### 4.1 Entitas 1: `settings` (Konfigurasi Lingkungan RT)
Menyimpan identitas wilayah, nama ketua RT/RW, rekening bank, saldo awal, dan tarif iuran standar.
* `namaRt` (string): Nama rukun tetangga (cth: "RT 03").
* `namaRw` (string): Nama rukun warga (cth: "RW 07").
* `kelurahan` (string): Nama kelurahan/desa.
* `kecamatan` (string): Nama kecamatan.
* `kota` (string): Nama kabupaten/kota.
* `tarifIuranBulanan` (number): Besaran tarif iuran standar per bulan (cth: 50000).
* `saldoAwalBank` (number): Saldo awal kas rekening bank RT.
* `saldoAwalTunai` (number): Saldo awal kas tunai fisik di tangan bendahara.

### 4.2 Entitas 2: `unit_rumah` (Master Unit Hunian & Blok)
* `id` (string, PK): Identifier unit (cth: "UNIT-A01").
* `blok` (string): Nama blok hunian (cth: "Blok A").
* `nomorRumah` (string): Nomor fisik rumah (cth: "12").
* `namaPenghuni` (string): Nama kepala keluarga atau penghuni unit.
* `noHp` (string): Nomor kontak WhatsApp penghuni.
* `iuranWajib` (number): Tarif kewajiban iuran bulanan unit.

### 4.3 Entitas 3: `bukti_bayar` (Log Bukti Transaksi Warga)
* `id` (string, PK): Nomor tiket bukti bayar (cth: "BB-1731548812").
* `unitId` (string, FK): Relasi ke `unit_rumah.id`.
* `nama` (string): Nama penyetor/pembayar.
* `periodeBulan` (string): Periode tagihan bulan iuran (cth: "2026-10" atau "2026-10, 2026-11").
* `nominal` (number): Nilai transfer yang tertera pada struk.
* `tanggalBayar` (string): Tanggal pelaksanaan transfer.
* `nomorReferensi` (string): Nomor referensi bank pengirim.
* `imageHash` (string, Unique): Nilai heksadesimal 64 karakter SHA-256 dari berkas struk.
* `imageUrl` (string): Data URL WebP Base64 struk terkompresi.
* `statusVerifikasi` (string): Status verifikasi: `'Menunggu Verifikasi'` | `'Terverifikasi'` | `'Ditolak'`.
* `transaksiId` (string, FK nullable): Relasi ke `transaksi.id` jika berstatus terverifikasi.
* `catatan` (string): Catatan bendahara (alasan tolak atau keterangan mutasi).

### 4.4 Entitas 4: `transaksi` (Buku Kas & Jurnal Keuangan RT)
* `id` (string, PK): Nomor bukti mutasi kas (cth: "TRX-1731549921").
* `tanggal` (string): Tanggal pencatatan buku kas (YYYY-MM-DD).
* `tipe` (string): `'Pemasukan'` atau `'Pengeluaran'`.
* `kategori` (string): Kategori mutasi (cth: "Iuran Bulanan", "Keamanan", "Operasional").
* `metodeBayar` (string): Kanal pembayaran (`'Kas di Bank (BCA)'` | `'Kas Tunai'` | `'QRIS'`).
* `kodeAkunDebit` (string): Kode akun debet sistem akuntansi berpasangan (cth: `1-101` Kas Tunai, `1-102` Bank).
* `kodeAkunKredit` (string): Kode akun kredit (cth: `4-101` Pendapatan Iuran).
* `nominal` (number): Besaran nominal kas masuk atau keluar.
* `keterangan` (string): Rincian narasi mutasi pembukuan.

### 4.5 Entitas Tambahan: `warga`, `surat`, `tamu`, `ronda`, `laporan_keamanan`
* `warga`: Master data sensus penduduk (NIK, No. KK, Tanggal Lahir, Pekerjaan, Golongan Darah, Status Tinggal).
* `surat`: Arsip permohonan surat pengantar resmi RT/RW ber-QR Code validasi keaslian berkas.
* `tamu`: Registrasi tamu menginap $> 24\text{ jam}$ dan warga pengontrak/kost sementara.
* `ronda`: Penjadwalan pembagian 7 regu jaga pos siskamling mingguan.
* `laporan_keamanan`: Buku mutasi patroli keamanan dan laporan kejadian darurat lingkungan.

---

## 5. SKEMA RELASIONAL POSTGRESQL (PANDUAN MIGRASI KE CLOUD)

Untuk kebutuhan pengembangan lanjutan menuju arsitektur backend terpusat atau serverless database (Supabase / Neon / Amazon RDS), skema `SimStore` telah dipetakan ke dalam DDL relasional PostgreSQL yang siap dieksekusi:

```sql
-- 1. TABEL PENGATURAN RT (SINGLETON ROW PER TENANT)
CREATE TABLE settings (
    tenant_id VARCHAR(50) PRIMARY KEY,
    nama_rt VARCHAR(50) NOT NULL,
    nama_rw VARCHAR(50) NOT NULL,
    kelurahan VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    kota VARCHAR(100) NOT NULL,
    tarif_iuran_bulanan NUMERIC(12,2) DEFAULT 50000,
    saldo_awal_bank NUMERIC(15,2) DEFAULT 0,
    saldo_awal_tunai NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL MASTER UNIT RUMAH
CREATE TABLE unit_rumah (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    blok VARCHAR(20) NOT NULL,
    nomor_rumah VARCHAR(20) NOT NULL,
    nama_penghuni VARCHAR(150) NOT NULL,
    no_hp VARCHAR(30),
    iuran_wajib NUMERIC(12,2) DEFAULT 50000,
    UNIQUE (tenant_id, blok, nomor_rumah)
);

-- 3. TABEL BUKTI BAYAR & STRUK TRANSFER
CREATE TABLE bukti_bayar (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    unit_id VARCHAR(50) REFERENCES unit_rumah(id) ON DELETE CASCADE,
    nama_penyetor VARCHAR(150) NOT NULL,
    periode_bulan VARCHAR(100) NOT NULL,
    nominal NUMERIC(12,2) NOT NULL,
    tanggal_bayar DATE NOT NULL,
    nomor_referensi VARCHAR(100),
    image_hash VARCHAR(64) UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    status_verifikasi VARCHAR(30) DEFAULT 'Menunggu Verifikasi',
    transaksi_id VARCHAR(50),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL BUKU KAS & TRANSAKSI
CREATE TABLE transaksi (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    tanggal DATE NOT NULL,
    tipe VARCHAR(20) CHECK (tipe IN ('Pemasukan', 'Pengeluaran')),
    kategori VARCHAR(50) NOT NULL,
    metode_bayar VARCHAR(50) NOT NULL,
    kode_akun_debit VARCHAR(20) NOT NULL,
    kode_akun_kredit VARCHAR(20) NOT NULL,
    nominal NUMERIC(12,2) NOT NULL,
    keterangan TEXT,
    pembayar VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. MEKANISME KOMPRESI KLIEN & SIDIK JARI SHA-256

Salah satu inovasi teknis kritis SIMWARGA adalah penanganan berkas gambar langsung pada peramban web warga (`bayar.html`) tanpa membebani penyimpanan perangkat:

```text
[Kamera HP Warga]
       │
       ▼ (Foto Asli Resolusi Tinggi 3-5 MB)
[HTML5 Canvas API] 
       │  • Skalasi dimensi maksimal lebar 1200 px
       │  • Konversi format ke image/webp (Kualitas 0.75)
       ▼
[WebP Terkompresi < 200 KB]
       │
       ├──► Disimpan sebagai Base64 Data URL (Aman di LocalStorage)
       │
       ▼
[Web Crypto API: crypto.subtle.digest('SHA-256')]
       │
       ▼
[Fingerprint Heksadesimal 64 Karakter] (Pencegahan Struk Duplikat Otomatis)
```

Fungsi perhitungan sidik jari kriptografis di sisi klien:
```javascript
async function calculateFileHash(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

---

## 7. MESIN VALIDASI CERDAS (RULE-BASED OCR) & MATRIKS REKAP

### 7.1 Aturan Evaluasi Otomatis (Rule Engine)
Saat pengurus membuka jendela verifikasi bukti bayar, asisten cerdas mengevaluasi integritas transaksi secara deterministik:
1. **Pemeriksaan Nominal:** Jika nominal bukti bayar $\ge$ tarif iuran bulanan RT, sistem menampilkan rekomendasi hijau **`LULUS OTOMATIS`**. Jika nominal di bawah tarif standar, sistem menampilkan tanda kuning **`PERLU CEK MANUAL`**.
2. **Pemeriksaan Hash Gambar:** Jika nilai `imageHash` telah terdaftar pada transaksi lain di database, sistem langsung menghentikan proses dan memberikan rekomendasi **`DITOLAK OTOMATIS (DUPLIKASI)`**.
3. **Pemeriksaan Nomor Referensi Bank:** Memvalidasi keberadaan nomor transaksi resmi bank (BCA, Mandiri, BRI, QRIS) untuk meminimalkan struk fiktif.

### 7.2 Logika Matriks Agregasi 12 Bulan per Blok
Sistem menyusun tabel matriks penagihan 12 kolom bulan (Januari s/d Desember) untuk setiap unit rumah:
* Status lunas dihitung dari keberadaan entitas `bukti_bayar` yang berstatus `'Terverifikasi'` dan memiliki kecocokan `unitId` serta substring `periodeBulan`.
* Formula persentase kepatuhan kas per blok:
$$\text{Persentase Kepatuhan (\%)} = \left( \frac{\sum \text{Unit Rumah Lunas}}{\text{Total Unit Terdaftar}} \right) \times 100\%$$

---

## 8. AKUNTANSI JURNAL BERPASANGAN & KANTONG KAS RT

Untuk memastikan tata kelola keuangan yang transparan dan akuntabel, SIMWARGA menerapkan prinsip akuntansi jurnal berpasangan (*Double-Entry Bookkeeping*):

| Kanal Penerimaan | Akun Debit (Penambahan Kas) | Akun Kredit (Pendapatan) | Keterangan |
| :--- | :--- | :--- | :--- |
| **Transfer Rekening Bank BCA** | `1-102` (Kas di Bank BCA) | `4-101` (Pendapatan Iuran) | Dana masuk langsung ke rekening bank RT |
| **Penerimaan Iuran Tunai** | `1-101` (Kas Tunai di Tangan) | `4-101` (Pendapatan Iuran) | Uang fisik diterima langsung oleh bendahara |
| **Pembayaran via QRIS Kas** | `1-103` (Kas di Rekening QRIS) | `4-101` (Pendapatan Iuran) | Transaksi pembayaran dompet digital |

### Mekanisme Atomik Pembatalan Verifikasi (*Rollback*)
Jika bendahara salah menyetujui struk atau mendapati transaksi perbankan tersebut dibatalkan (*reversal*), sistem menyediakan fungsi Rollback yang mengeksekusi dua operasi sekaligus secara atomik:
1. Menghapus transaksi mutasi kas terkait dari entitas `transaksi` sehingga saldo kas RT terkoreksi kembali seketika.
2. Mengembalikan status entitas `bukti_bayar` menjadi `'Menunggu Verifikasi'` dan menetralisir kolom `transaksiId` menjadi `null`.

---

## 9. SUITE PENGUJIAN OTOMATIS (AUTOMATED TEST SUITE)

Sistem pengujian dibangun tanpa ketergantungan pada pustaka eksternal (*Zero-Dependency Test Harness*) melalui berkas [`test_runner.html`](file:///c:/Users/Agung/netijen/test_runner.html). Sebanyak **49 skenario uji otomatis** mencakup seluruh lapisan sistem:

* **Skenario 1:** Master Data Unit Rumah & Tarif (Test 1-5)
* **Skenario 2:** Payload QR Code & Parser Parameter (Test 6-7)
* **Skenario 3:** Hashing Kriptografis SHA-256 Anti-Duplikasi (Test 8-10)
* **Skenario 4:** Verifikasi Bukti & Pembukuan Kas Otomatis (Test 11-15)
* **Skenario 5:** Penanganan Struk Ditolak & Isolasi Kas (Test 16-18)
* **Skenario 6:** Alur Pembayaran Multi-Bulan (Test 19-20)
* **Skenario 7:** Pembatalan Verifikasi (Rollback) & Koreksi Kas (Test 21-23)
* **Skenario 8:** Jurnal Akuntansi Berpasangan & Kantong Kas (Test 24-26)
* **Skenario 9:** Penerimaan Tunai Langsung & Kuitansi Instan (Test 27-29)
* **Skenario 10:** Manajemen Kependudukan (Warga CRUD & Integritas) (Test 30-33)
* **Skenario 11:** Layanan Surat Pengantar RT (Test 34-36)
* **Skenario 12:** Keamanan Pos Ronda, Jadwal 7 Hari & Buku Tamu (Test 37-41)
* **Skenario 13:** Integritas Cadangan Sistem Backup & Restore JSON (Test 42-44)
* **Skenario 14:** Mesin Validasi Cerdas (Rule-Based OCR) & Matriks Rekap 12 Bulan (Test 45-49)

Hasil eksekusi berkala memastikan seluruh 49 kasus uji berstatus **100% PASS** tanpa adanya regresi fungsi.

---
*Dokumen teknis ini merupakan acuan resmi rekayasa perangkat lunak sistem SIMWARGA.*
