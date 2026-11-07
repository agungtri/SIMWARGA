# 🎨 Spesifikasi Mockup & Desain Sistem SIMWARGA (Material Design 3)

Dokumen ini memuat panduan arsitektur visual, fondasi desain (*design tokens*), dan mockup antarmuka (*mockup wireframes & layouts*) berbasis **Material Design 3 (M3 / Material You)** untuk sistem **SIMWARGA (Sistem Informasi Manajemen Data Warga, Iuran QR & Keuangan RT/RW)**.

---

## 🏛️ 1. Fondasi Desain Sistem (Material Design 3 Tokens)

Sistem antarmuka SIMWARGA mengadopsi prinsip desain **Material Design 3** dengan sentuhan modern, mengutamakan kontras tinggi, keterbacaan di layar ponsel (*mobile-first* untuk warga), serta efisiensi ruang kerja untuk pengurus RT/RW (*dense desktop dashboard*).

### 1.1 Palet Warna Semantik (M3 Color Roles)

| Peran Warna (*Color Role*) | Nilai HEX | Kelas Tailwind | Penggunaan Utama |
|---|---|---|---|
| **Primary** | `#1D4ED8` | `bg-blue-700` / `text-blue-700` | Aksi utama, tombol penting, active navigation |
| **Primary Container** | `#DBEAFE` | `bg-blue-100` | Chip aktif, badge status info, highlight card |
| **On Primary Container** | `#1E3A8A` | `text-blue-900` | Teks di atas Primary Container |
| **Secondary** | `#475569` | `bg-slate-600` / `text-slate-600` | Elemen navigasi sekunder, ikon non-aktif |
| **Secondary Container** | `#F1F5F9` | `bg-slate-100` | Hover menu, tab tidak aktif, filter pill |
| **Surface** | `#F8FAFC` | `bg-slate-50` | Latar belakang dasar aplikasi (*canvas*) |
| **Surface Container** | `#FFFFFF` | `bg-white` | Kartu (*Card*), modal dialog, top bar, sidebar |
| **Surface Container High**| `#F1F5F9` | `bg-slate-100` | Header tabel, input placeholder field |
| **Outline & Divider** | `#E2E8F0` | `border-slate-200` | Garis tepi kartu (*card border*), pemisah daftar |
| **Success / Approved** | `#10B981` | `text-emerald-600` / `bg-emerald-500` | Status Lunas, Bukti Diterima, Saldo Kas Positif |
| **Warning / Pending** | `#F59E0B` | `text-amber-500` / `bg-amber-100` | Menunggu Verifikasi Bendahara, Iuran Belum Lunas |
| **Error / Destructive** | `#EF4444` | `text-rose-600` / `bg-rose-500` | Bukti Ditolak, Hapus Data, Pembatalan Transaksi |

### 1.2 Skala Tipografi (M3 Typography Hierarchy)

Menggunakan keluarga huruf modern **Plus Jakarta Sans** (atau fallback Roboto/Inter) dengan hierarki skala:

* **Display Large / Medium** (`text-3xl` / `text-2xl`, *Bold 800*): Nominal saldo kas RT, nomor blok rumah di kartu QR.
* **Headline Small** (`text-xl`, *Bold 700*): Judul modul utama (Dasbor, Kas & Iuran, Data Warga).
* **Title Medium** (`text-base`, *Semi-Bold 600*): Header kartu komponen, nama seksi konfigurasi.
* **Body Large / Medium** (`text-sm`, *Regular 400 - Medium 500*): Teks konten, baris data tabel, deskripsi panduan.
* **Label Medium / Small** (`text-xs` / `text-[11px]`, *Semi-Bold 600*, Uppercase Tracking): Badge status, teks pembantu input, tanggal mutasi.

### 1.3 Elevasi & Kelengkungan Sudut (Elevation & Shape Tokens)

| Tingkat Elevasi | Nilai Shadow | Sudut (*Border Radius*) | Komponen Sasaran |
|---|---|---|---|
| **Level 0 (Flat)** | `shadow-none` | `rounded-none` | Latar kanvas aplikasi |
| **Level 1 (Card/List)** | `shadow-xs` / `border` | `rounded-2xl` (16px) | Kartu data warga, item transaksi kas |
| **Level 2 (Hover/Tonal)** | `shadow-md` | `rounded-2xl` (16px) | Kartu ringkasan saldo, QR Scanner box |
| **Level 3 (Modal/Sheet)**| `shadow-xl` | `rounded-3xl` (24px) | Modal verifikasi bukti bayar, dialog form |
| **Level 4 (Sticky Bar)** | `shadow-sm` | `rounded-none` | Top bar sticky navigasi, floating action bar |
| **Pill / Button Full** | `shadow-md shadow-blue-500/20` | `rounded-full` (9999px) | Floating Action Button (FAB), Chip periode |

---

## 📱 2. Mockup Arsitektur Tampilan Utama

### 2.1 Peta Layout Sistem (Responsive Shell)

```
+---------------------------------------------------------------------------------------+
|  [Logo SIMWARGA]  RT 03 / RW 07 Kel. Sukamaju           [Pencarian...]  (Bell) (Admin)|
+-------------------+-------------------------------------------------------------------+
|  [NAVIGATION]     | [BREADCRUMB / VIEW HEADER]                                        |
|                   |                                                                   |
|  * Dashboard      | +------------------+ +------------------+ +------------------+   |
|  * Data Warga     | | TOTAL WARGA      | | SALDO KAS RT     | | IURAN BULAN INI  |   |
|  * Kas & Iuran    | | 128 Jiwa (42 KK) | | Rp 18.450.000    | | 82% Terkumpul    |   |
|  * Layanan Surat  | +------------------+ +------------------+ +------------------+   |
|  * Tamu & Kost    |                                                                   |
|  * Keamanan/Ronda | +------------------------------------+ +------------------------+ |
|  * Pengaturan     | | GRAFIK REALISASI ARUS KAS RT       | | VERIFIKASI PENDING (3) | |
|                   | | [==== Pemasukan vs Pengeluaran ==] | | [Struk #B12] Rp 50.000 | |
|                   | |                                    | | [Struk #A04] Rp 100.00 | |
|                   | +------------------------------------+ +------------------------+ |
+-------------------+-------------------------------------------------------------------+
| Mode Offline: Standalone Active (file://)          | v1.0.0-prod | Database LocalStorage|
+---------------------------------------------------------------------------------------+
```

---

## 🖼️ 3. Rincian Mockup Antarmuka per Modul

### 3.1 Layar 1: Portal Warga - Konfirmasi Pembayaran QR (`bayar.html`)

Layar ini dirancang khusus dengan pendekatan **Mobile-First (Lebar maks. 480px di tengah layar)**, ramah gawai, responsif, dan dapat diakses seketika setelah warga memindai stiker QR di pintu rumah tanpa perlu login.

```
+---------------------------------------------------+
|  (QR) Konfirmasi Iuran Warga       [Bantuan] (x)  |
|  RT 03 / RW 07 Kelurahan Sukamaju                 |
+---------------------------------------------------+
|                                                   |
|  +---------------------------------------------+  |
|  | [Badge] QR Stiker Terverifikasi             |  |
|  | ALAMAT RUMAH WARGA                          |  |
|  | BLOK A NO. 14                               |  |
|  | Penghuni: Bpk. Hendra Wijaya                |  |
|  | Tarif Iuran Rutin: Rp 50.000 / Bulan        |  |
|  +---------------------------------------------+  |
|                                                   |
|  PILIH PERIODE IURAN:                             |
|  [ (v) November 2026 ]  [ (v) Desember 2026 ]     |
|  [ Januari 2027 ]       [ Februari 2027 ]         |
|  Total Tagihan: 2 Bulan x Rp 50.000 = Rp 100.000  |
|                                                   |
|  METODE PEMBAYARAN:                               |
|  (*) Transfer Bank Mandiri (Rek: 137-00-xxxxxx)   |
|  ( ) QRIS Kas RT (BCA / Gopay / OVO / Dana)       |
|  ( ) Bayar Tunai Langsung ke Pengurus             |
|                                                   |
|  UNGGAH BUKTI TRANSFER:                           |
|  +---------------------------------------------+  |
|  |        [ Ikon Awan Upload WebP ]            |  |
|  |   Sentuh untuk Ambil Foto / Pilih Struk     |  |
|  |   Otomatis dikompresi WebP (< 200 KB)       |  |
|  |   Sidik Jari Anti-Duplikasi: SHA-256 Valid  |  |
|  +---------------------------------------------+  |
|                                                   |
|  [ === KIRIM KONFIRMASI PEMBAYARAN (M3 Button) ==]|
|                                                   |
|  -----------------------------------------------  |
|  RIWAYAT PEMBAYARAN UNIT RUMAH (12 BULAN):        |
|  * Nov 2026 : Menunggu Persetujuan (Pending)       |
|  * Okt 2026 : LUNAS (Disetujui 02/10/2026)        |
|  * Sep 2026 : LUNAS (Disetujui 03/09/2026)        |
+---------------------------------------------------+
```

---

### 3.2 Layar 2: Verifikasi Pembayaran Split-Screen (Peran: Bendahara RT)

Antarmuka *split-screen* dirancang untuk memverifikasi kesesuaian struk transfer dengan data input warga secara berdampingan tanpa berpindah halaman.

```
+---------------------------------------------------------------------------------------------------+
| VERIFIKASI BUKTI TRANSFER #TRX-9482                                                        [X Tutup]|
+---------------------------------------------------+-----------------------------------------------+
| SISI KIRI: PRATINJAU BUKTI STRUK ASLI             | SISI KANAN: DATA & VALIDASI OCR OTOMATIS      |
|                                                   |                                               |
| +-----------------------------------------------+ | Identitas Unit Rumah:                         |
| |                                               | | * Blok/Nomor : Blok B No. 07 (Ibu Siti R.)   |
| |         [ GAMBAR STRUK TRANSFER ]             | | * Periode    : 2 Bulan (Nov & Des 2026)     |
| |             (Kompresi WebP)                   | | * Total Nilai: Rp 100.000                     |
| |                                               | |                                               |
| | Tanggal : 05/11/2026 14:22 WIB                | | HASIL PEMINDAIAN OCR (CERDAS):              |
| | Bank    : BCA Mobile                          | | [MATCH 98%] Nominal Rp 100.000 Terdeteksi   |
| | Rek Asal: a.n SITI RAHMAWATI                  | | [MATCH] Rek Tujuan Rekening Kas RT Cocok    |
| | Status  : BERHASIL                            | | [ANTI-DUPLIKASI] Hash SHA-256 Bersih (Unik) |
| |                                               | |                                               |
| +-----------------------------------------------+ | Rekening Tujuan: Kas RT 03 BCA 721-098-xxxx  |
| Resolusi: 1200x800px | Ukuran: 142 KB (WebP)      | Waktu Kirim    : 05 Nov 2026, 14:30 WIB       |
| SHA-256: 7f8a3c...e89b                           | Catatan Warga  : "Titip bayar 2 bulan ya pak" |
|                                                   |                                               |
| [ Zoom In (+) ]  [ Zoom Out (-) ]  [ Putar 90* ]  | AKSI BENDAHARA:                               |
|                                                   | [ X TOLAK STRUK ]   [ V SETUJUI & MASUK KAS ] |
+---------------------------------------------------+-----------------------------------------------+
```

---

### 3.3 Layar 3: Matriks Rekapitulasi Iuran 12 Bulan per Blok

Menampilkan matriks visual grid per unit rumah di setiap blok dengan indikator warna Material Design 3.

```
+---------------------------------------------------------------------------------------------------+
| REKAPITULASI IURAN WARGA TAHUN 2026                               [Pilih Blok: Blok A (16 Rumah) v]|
| Total Realisasi: Rp 9.600.000 / Target: Rp 11.520.000 (83.3%)     [ Ekspor CSV ]  [ Cetak A4 ]    |
+-------------------+---+---+---+---+---+---+---+---+---+---+---+---+-------------------------------+
| No. Rumah & Warga |Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des| Status Tahunan               |
+-------------------+---+---+---+---+---+---+---+---+---+---+---+---+-------------------------------+
| Blok A No. 01     | V | V | V | V | V | V | V | V | V | V | V | V | 100% Lunas Penuh (12 Bln)     |
| Bpk. Ahmad Dahlan |   |   |   |   |   |   |   |   |   |   |   |   | Rp 600.000                    |
+-------------------+---+---+---+---+---+---+---+---+---+---+---+---+-------------------------------+
| Blok A No. 02     | V | V | V | V | V | V | V | V | V | V | . | . | Menunggak 2 Bulan             |
| Ibu Ratna Sari    |   |   |   |   |   |   |   |   |   |   |   |   | Terbayar: Rp 500.000          |
+-------------------+---+---+---+---+---+---+---+---+---+---+---+---+-------------------------------+
| Blok A No. 03     | V | V | V | V | V | V | V | V | V | V | P | . | Pending Verifikasi (Nov)      |
| Sdr. Kevin Pratama|   |   |   |   |   |   |   |   |   |   |   |   | Tunggu Approval Struk         |
+-------------------+---+---+---+---+---+---+---+---+---+---+---+---+-------------------------------+
Keterangan Indikator M3:
[ V - Hijau ] = LUNAS (Disetujui)  |  [ P - Kuning ] = PENDING VERIFIKASI  |  [ . - Merah ] = MENUNGGAK
```

---

### 3.4 Layar 4: Generator Cetak Stiker QR Unit Rumah

Digunakan oleh Pengurus RT untuk memproduksi lembar stiker QR Code tahan air yang ditempelkan di pintu/pagar warga.

```
+---------------------------------------------------------------------------------------------------+
| CETAK STIKER QR CODE RUMAH RT/RW                                  [Pilih Blok: Semua Blok (A-D) v]|
| Format Kertas: A4 Label Stiker (Grid 3 Kolom x 4 Baris = 12 Stiker per Lembar)   [ CETAK STIKER ] |
+---------------------------------------------------------------------------------------------------+
|  +---------------------------+  +---------------------------+  +---------------------------+      |
|  | RT 03 / RW 07 SUKAMAJU    |  | RT 03 / RW 07 SUKAMAJU    |  | RT 03 / RW 07 SUKAMAJU    |      |
|  | +-----------------------+ |  | +-----------------------+ |  | +-----------------------+ |      |
|  | |     [ QR CODE ]       | |  | |     [ QR CODE ]       | |  | |     [ QR CODE ]       | |      |
|  | |   (Vektor High-Res)   | |  | |   (Vektor High-Res)   | |  | |   (Vektor High-Res)   | |      |
|  | +-----------------------+ |  | +-----------------------+ |  | +-----------------------+ |      |
|  | BLOK A NO. 01             |  | BLOK A NO. 02             |  | BLOK A NO. 03             |      |
|  | Scan untuk Bayar Iuran    |  | Scan untuk Bayar Iuran    |  | Scan untuk Bayar Iuran    |      |
|  +---------------------------+  +---------------------------+  +---------------------------+      |
+---------------------------------------------------------------------------------------------------+
```

---

## 📐 4. Standar Interaksi & Komponen (M3 Interaction Guidelines)

1. **State Layers (Interaksi Sentuh & Klik):**
   * Hover: Tingkat opacity 8% di atas warna elemen dasar (`hover:bg-slate-100`).
   * Pressed / Active: Tingkat opacity 12% dan sedikit efek skala mikroskopis (`active:scale-[0.98]`).
   * Focused: Outline ring ganda berjarak 2px (`focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`).

2. **Dialog & Sheet Rules:**
   * Modal form menggunakan latar belakang buram modern (*backdrop-blur-sm*).
   * Menekan tombol escape (`Esc`) atau klik di luar modal harus menutup dialog secara aman tanpa kehilangan data draf.

3. **Notifikasi Toast / Snackbar M3:**
   * Ditampilkan mengambang di pojok kanan atas (Desktop) atau pojok bawah (Mobile).
   * Otomatis menghilang dalam 3500ms dengan progress bar indikator durasi.

---

## 📂 5. Berkas Prototipe Visual Interaktif

Pratinjau antarmuka visual interaktif berbasis HTML mandiri dapat diakses langsung pada:
* Berkas: [`mockup-preview.html`](mockup-preview.html)
* Dapat dibuka langsung menggunakan peramban web (*double-click / file:///*) tanpa memerlukan server.
