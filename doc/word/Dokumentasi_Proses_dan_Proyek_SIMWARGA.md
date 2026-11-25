# DOKUMENTASI PROSES DAN PROYEK PENGEMBANGAN SISTEM SIMWARGA
**Sistem Informasi Manajemen Warga, Iuran QR, e-Voting Musyawarah & Keuangan RT/RW**

---

## 1. IDENTITAS PROYEK & LEMBAR PENGESAHAN

| Atribut Proyek | Keterangan Detail |
| :--- | :--- |
| **Nama Proyek** | Sistem Informasi Manajemen Warga, Iuran QR & e-Voting (SIMWARGA) |
| **Kode Proyek** | `PRJ-SIMWARGA-2026` |
| **Versi Dokumen** | 1.2.0 (Tahap Stabilisasi & Rilis Operasional) |
| **Status Rilis** | Production Ready (Dual-Mode: Local Standalone & Hosted Jamstack) |
| **Klasifikasi Dokumen** | Dokumentasi Manajemen Proyek & Proses Rekayasa Perangkat Lunak |
| **Target Pengguna** | Pengurus RT/RW, Tim Pengembang, Administrator Sistem, dan Dewan Warga |

---

## 2. LATAR BELAKANG & ANALISIS PERMASALAHAN

Pengelolaan administrasi kemasyarakatan di tingkat Rukun Tetangga (RT) dan Rukun Warga (RW) di Indonesia umumnya masih menghadapi kendala operasional klasik yang menghambat efektivitas pelayanan dan transparansi kas:

1. **Inefisiensi Penagihan Iuran Manual (Door-to-Door):**
   Metode penagihan langsung ke rumah warga oleh pengurus atau petugas RT sering kali tidak efektif karena kesibukan warga yang jarang berada di rumah pada jam kerja. Di sisi lain, pengiriman struk transfer via grup perpesanan (WhatsApp) membuat berkas struk tertimbun obrolan harian, menyulitkan bendahara dalam proses rekapitulasi, dan rawan penyalahgunaan struk ganda (*fraud transfer*).

2. **Keterbatasan Transparansi dan Akurasi Buku Kas RT:**
   Pencatatan kas di buku tulis fisik atau lembar spreadsheet manual rentan terhadap selisih hitung, kesalahan ketik nominal, dan keterlambatan publikasi. Hal ini kerap memicu penurunan tingkat kepercayaan dan kedisiplinan warga dalam membayar iuran lingkungan.

3. **Kendala Penyelenggaraan Musyawarah dan Kuorum RT:**
   Rapat warga tatap muka kerap kali gagal mencapai kuorum sah karena kendala waktu dan mobilitas warga. Diperlukan mekanisme jajak pendapat dan musyawarah digital (*e-Voting*) yang menjamin asas Langsung, Umum, Bebas, dan Rahasia (Luber) dengan prinsip *1 Rumah 1 Suara*.

4. **Ketergantungan Akses Administrasi Fisik:**
   Kebutuhan surat pengantar RT, pencatatan tamu menginap, serta pemantauan jadwal ronda malam masih bergantung pada pertemuan fisik langsung dengan Ketua atau Sekretaris RT.

SIMWARGA hadir sebagai solusi rekayasa terintegrasi yang menjembatani seluruh kebutuhan tersebut secara mandiri (*standalone*), hemat biaya, tanpa keharusan sewa server mahal, dan ramah pengguna awam.

---

## 3. SASARAN PROYEK & INDIKATOR KINERJA UTAMA (KPI)

Proyek pengembangan SIMWARGA menetapkan target indikator keberhasilan (*Key Performance Indicators*) terukur sebagai berikut:

| Parameter Evaluasi | Sebelum Penerapan SIMWARGA | Target Capaian SIMWARGA | Status Capaian Saat Ini |
| :--- | :--- | :--- | :--- |
| **Durasi Pembayaran Warga** | 5 – 15 Menit (Manual/Chat) | $\le 45\text{ Detik}$ per transaksi | Tercapai ($\approx 30\text{ detik}$) |
| **Tingkat Kepatuhan Iuran Bulanan** | 50% – 65% per blok | $\ge 90\%$ dalam 3 bulan operasional | Terakselerasi via Matriks 12 Bulan |
| **Kecepatan Verifikasi Bendahara** | 1 – 3 Hari Rekap Mingguan | $< 10\text{ Detik}$ per struk | Tercapai via *Split-Screen Viewer* |
| **Ukuran Arsip Struk di Klien** | 2 – 5 MB (Foto Asli Kamera) | $\le 200\text{ KB}$ per berkas | Kompresi Canvas WebP ($40 - 150\text{ KB}$) |
| **Pencegahan Struk Duplikat** | 0% (Verifikasi memori manusia) | 100% deteksi penolakan | Terverifikasi 100% (SHA-256 Engine) |
| **Keandalan Eksekusi (Zero-Server)** | Wajib koneksi internet / server | 100% Berjalan Lokal via `file:///` | Teruji pada Chrome, Edge, Safari, Firefox |

---

## 4. METODOLOGI PENGEMBANGAN PERANGKAT LUNAK

Pengembangan SIMWARGA menerapkan metodologi **Agile-Iterative Software Engineering** yang dipadukan dengan pendekatan **Test-Driven Verification (TDD)** untuk menjamin stabilitas fungsional:

### 4.1 Fase Siklus Hidup Pengembangan (SDLC)

1. **Fase Inisiasi & Analisis Kebutuhan (Discovery & SRS):**
   * Penggalian kebutuhan pemangku kepentingan (Warga, Bendahara, Pengurus RT, Petugas Keamanan).
   * Perumusan batasan arsitektur *Dual-Mode: Local Standalone First & Hosted Jamstack*.
   * Penyusunan kamus data dan pemodelan skema entitas `SimStore`.

2. **Fase 1: Minimum Viable Product (MVP) - Fondasi Pembayaran QR & Kas:**
   * Implementasi payload QR Code stiker rumah tanpa autentikasi login warga.
   * Kompresi otomatis berbasis Canvas WebP dan sidik jari kriptografis SHA-256.
   * Dasbor verifikasi *split-screen*, persetujuan mutasi atomik, dan pembukuan kas.
   * Pembuatan kerangka kerja pengujian otomatis awal (18 kasus uji).

3. **Fase 2: Validasi Cerdas, Matriks Rekapitulasi & Komunikasi:**
   * Pembangunan mesin evaluasi cerdas berbasis aturan (*Rule-Based OCR Engine*).
   * Matriks rekapitulasi kepatuhan kas 12 bulan per blok.
   * Penyediaan kartu iuran digital warga di `bayar.html`.
   * Integrasi komunikasi ramah WhatsApp (*Human-in-the-Loop*).
   * Penambahan skenario uji multi-bulan, rollback kas, jurnal berpasangan, dan penerimaan tunai (29 kasus uji).

4. **Fase 3: Stabilisasi Sistem, Administrasi Lengkap & Quality Assurance:**
   * Penyempurnaan modul kependudukan (Warga CRUD), surat pengantar RT, dan keamanan/ronda.
   * Mekanisme cadangan penuh sistem (*Backup & Restore JSON Engine*).
   * Perluasan kasus uji fungsionalitas otomatis menjadi 49 kasus uji (100% Pass).

---

## 5. ANALISIS PEMANGKU KEPENTINGAN (STAKEHOLDER ANALYSIS)

Sistem SIMWARGA dirancang dengan mempertimbangkan empat persona pemangku kepentingan utama:

### 5.1 Persona 1: Warga dan Penghuni Unit Rumah
* **Peran:** Melakukan pembayaran iuran berkala, memantau riwayat lunas kartu iuran keluarga, dan berpartisipasi dalam musyawarah/pemilihan lingkungan.
* **Tantangan:** Keterbatasan waktu, enggan mengunduh aplikasi tambahan di toko aplikasi, dan tidak ingin menghafal nama pengguna/kata sandi baru.
* **Solusi SIMWARGA:** Portal ramah gawai (`bayar.html`) yang dapat dibuka instan cukup dengan memindai stiker QR di depan pintu rumah (*Zero-Login Architecture*).

### 5.2 Persona 2: Bendahara Kas RT
* **Peran:** Meneliti validitas struk transfer bank/QRIS, membukukan penerimaan dan pengeluaran, mencatat iuran tunai di tempat, serta menyajikan laporan pertanggungjawaban kas.
* **Tantangan:** Struk menumpuk di chat WhatsApp, risiko selisih hitung saldo, dan repot membuat kuitansi manual.
* **Solusi SIMWARGA:** Dasbor verifikasi berdampingan (*split-screen*), rekomendasi validasi cerdas (Badge Hijau/Kuning), pembukuan kas atomik 1-klik, fitur pembatalan (*rollback*), dan kuitansi instan ke WhatsApp pembayar.

### 5.3 Persona 3: Ketua dan Sekretaris RT/RW
* **Peran:** Pengambilan kebijakan wilayah, sensus warga tetap dan sementara, penerbitan surat pengantar resmi, serta penyelenggaraan pemilihan pengurus.
* **Tantangan:** Data warga tidak mutakhir, permohonan surat pengantar membutuhkan tatap muka fisik, dan kehadiran rapat warga minim.
* **Solusi SIMWARGA:** Dasbor terpadu master data warga, generator surat pengantar ber-QR Code validasi keaslian dokumen, serta modul e-voting berprinsip *Secret Ballot*.

### 5.4 Persona 4: Petugas Keamanan dan Koordinator Ronda Malam
* **Peran:** Memastikan ketertiban lingkungan pos ronda siskamling dan memantau keluar masuk tamu atau penghuni kontrakan/kost.
* **Tantangan:** Jadwal ronda di papan tulis rentan terhapus, dan data tamu asing tidak tercatat terpusat.
* **Solusi SIMWARGA:** Jadwal ronda digital 7 hari per regu dan buku tamu digital yang terintegrasi di sistem RT.

---

## 6. STRUKTUR RINCIAN KERJA (WORK BREAKDOWN STRUCTURE / WBS)

```text
PRJ-SIMWARGA-2026: SIMWARGA RT/RW Management System
├── 1.0 Manajemen Proyek & Perancangan Sistem
│   ├── 1.1 Analisis Persyaratan Sistem (SRS & Scope Boundaries)
│   ├── 1.2 Desain Arsitektur Dual-Mode & Multi-Tenancy Wilayah
│   ├── 1.3 Perancangan Kamus Data & Skema Penyimpanan Lokal (SimStore)
│   └── 1.4 Pemodelan Desain UI/UX Material Design 3
├── 2.0 Pengembangan Portal Warga Mobile (bayar.html)
│   ├── 2.1 Engine Parser Parameter URL QR Rumah
│   ├── 2.2 Kompresor Gambar Canvas ke WebP (< 200 KB)
│   ├── 2.3 Generator Fingerprint SHA-256 Anti-Duplikasi
│   └── 2.4 Antarmuka Kartu Iuran Digital 12 Bulan
├── 3.0 Pengembangan Dasbor Pengurus RT (index.html)
│   ├── 3.1 Dasbor Ringkasan Finansial & Statistik Warga
│   ├── 3.2 Modul Verifikasi Struk Split-Screen & Rule-Based OCR
│   ├── 3.3 Pembukuan Kas Otomatis & Jurnal Berpasangan (Double-Entry)
│   ├── 3.4 Modul Kas Masuk Tunai Langsung (Direct Cash Entry)
│   ├── 3.5 Matriks Rekapitulasi Iuran 12 Bulan per Blok
│   └── 3.6 Generator Lembar Cetak Stiker QR Rumah A4
├── 4.0 Modul Administrasi Kemasyarakatan & Keamanan
│   ├── 4.1 Master Data Kependudukan (Warga CRUD)
│   ├── 4.2 Pelayanan Surat Pengantar RT Ber-QR Validasi
│   ├── 4.3 Jadwal Ronda Mingguan & Buku Tamu/Kontrakan
│   └── 4.4 Pencatatan Mutasi Laporan Keamanan Lingkungan
├── 5.0 Utilitas Data & Cadangan Sistem
│   ├── 5.1 Ekspor Rekapitulasi ke Format Spreadsheet (CSV)
│   ├── 5.2 Backup Data Menyeluruh ke Berkas JSON
│   └── 5.3 Validasi & Restore Basis Data dari Berkas Cadangan JSON
└── 6.0 Jaminan Mutu, Pengujian & Dokumentasi
    ├── 6.1 Pembangunan Automated Test Suite (test_runner.html - 49 Tests)
    ├── 6.2 Pengujian Headless Browser & Verifikasi Regresi
    └── 6.3 Penyusunan Dokumentasi Teknis, Pengguna, dan Proyek
```

---

## 7. MANAJEMEN RISIKO & STRATEGI MITIGASI

Untuk mengantisipasi potensi kegagalan operasional, tim proyek menyusun register risiko teknis dan sosiologis berikut:

| ID Risiko | Deskripsi Risiko | Dampak | Probabilitas | Strategi Mitigasi Terimplementasi |
| :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | Kuota memori LocalStorage peramban penuh karena tumpukan foto struk. | Tinggi | Sedang | Kompresi wajib WebP ($\le 200\text{ KB}$), resolusi dibatasi $1200\text{ px}$, dan opsi ekspor cadangan berkala ke berkas JSON. |
| **RSK-02** | Struk transfer palsu atau pengunggahan berkas yang sama berulang kali oleh oknum. | Tinggi | Rendah | Kriptografi Web Crypto API menghitung nilai hash SHA-256 berkas. Sistem otomatis menolak unggahan yang memiliki hash identik. |
| **RSK-03** | Galat CORS saat pengurus membuka aplikasi secara lokal (`file:///`). | Kritis | Rendah | Aplikasi dirancang tanpa ketergantungan ES Module impor lintas berkas, menggunakan global modular namespace (`window.SimStore`, `window.AppState`). |
| **RSK-04** | Warga lanjut usia (lansia) kesulitan mengoperasikan gawai untuk scan QR. | Sedang | Tinggi | Bendahara menyediakan fitur *Penerimaan Tunai Langsung* di dasbor pengurus yang otomatis menerbitkan kuitansi sah tanpa memerlukan scan ponsel dari warga. |
| **RSK-05** | Kerusakan atau kehilangan perangkat komputer bendahara/pengurus. | Kritis | Rendah | Fitur *One-Click Backup JSON* memungkinkan seluruh data RT disalin ke flashdisk atau cloud storage kapan saja dan dapat dipulihkan dalam 1 detik. |

---

## 8. RIWAYAT PERUBAHAN & HASIL PENGUJIAN AKHIR

### 8.1 Riwayat Versi Proyek
* **Versi 1.0.0 (Tahap 1):** Rilis fondasi portal bayar QR, kompresi WebP, verifikasi split-screen, dan pembukuan kas otomatis (18 skenario uji).
* **Versi 1.1.0 (Tahap 2):** Implementasi validasi cerdas OCR, matriks 12 bulan per blok, pembayaran multi-bulan, rollback pembatalan, akuntansi jurnal berpasangan, dan pencatatan tunai (29 skenario uji).
* **Versi 1.2.0 (Tahap 3 - Saat Ini):** Integrasi menyeluruh administrasi kependudukan (Warga CRUD), modul surat pengantar RT, keamanan pos ronda & tamu, serta mesin backup/restore JSON (49 skenario uji).

### 8.2 Hasil Pengujian Regresi Otomatis (test_runner.html)
Pengujian otomatis dilakukan pada lingkungan peramban *headless* per 14 November 2026:
* **Total Skenario Uji:** 49 Kasus Uji Otomatis
* **Lulus (Pass):** 49 Kasus Uji (100%)
* **Gagal (Fail):** 0 Kasus Uji (0%)
* **Kesimpulan Pengujian:** Sistem dinyatakan **Lolos Uji Kualitas Mutu (Quality Assurance Passed)** dan siap dipergunakan dalam lingkungan operasional RT/RW sesungguhnya.

---
*Dokumen ini disusun dan disahkan oleh Tim Rekayasa SIMWARGA sebagai standar operasional proses pengembangan sistem.*
