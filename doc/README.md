# 📚 Dokumentasi Teknis SIMWARGA

> [!IMPORTANT]
> **Aturan Wajib Memulai Pekerjaan & Integritas Dokumen:**
> 1. Setiap pengembang atau AI Assistant yang bekerja di workspace `netijen` wajib membaca dan mematuhi aturan kerja di [AGENTS.md](../AGENTS.md) dan modul dokumentasi di folder ini sebelum melakukan perubahan kode.
> 2. **Folder `doc/` adalah Single Source of Truth:** Hanya memuat arsitektur, skema, dan spesifikasi yang **telah resmi disetujui (*Approved*)**. DILARANG KERAS menuliskan usulan, ide, atau draf proposal yang belum/tidak disetujui ke dalam berkas di folder `doc/`. Usulan baru wajib diajukan via dialog terlebih dahulu.

Selamat datang di pusat dokumentasi teknis sistem **SIMWARGA (Sistem Informasi Manajemen Data Warga, Iuran QR & Keuangan RT/RW)**.

Dokumentasi ini disusun untuk pengembang, arsitek perangkat lunak, maupun administrator sistem yang ingin memahami arsitektur, struktur basis data, alur bisnis, serta mekanisme teknis yang digunakan di dalam aplikasi.

---

## 📑 Daftar Isi Dokumentasi

### 👤 Panduan Pengguna (Non-Teknis)
* **[Buku Panduan Pengguna SIMWARGA (Mudah Dipahami)](panduan-pengguna.md)**
  - Petunjuk langkah demi langkah untuk **Warga** (cara bayar iuran via scan QR).
  - Petunjuk untuk **Bendahara RT** (cara verifikasi struk dan melihat rekap lunas/menunggak).
  - Petunjuk untuk **Ketua/Sekretaris RT** (cetak stiker QR, surat pengantar, dan data warga).
  - Tanya Jawab Umum (*FAQ*) & Solusi Kendala.

---

### ⚙️ Dokumentasi Teknis & Arsitektur
1. [Arsitektur Sistem & Multi-Tenancy](arsitektur-sistem.md)
   - Gambaran umum arsitektur (*High-Level Architecture*).
   - Strategi Multi-Tenancy hierarkis berbasis wilayah (`Kelurahan` $\rightarrow$ `RW` $\rightarrow$ `RT` $\rightarrow$ `Blok`).
   - Diagram alir data (*Data Flow Diagram*).
   - Rencana skala besar (*Scale-Out Strategy* ke PostgreSQL + Object Storage).
   - **Prinsip Dual-Mode (*Local Standalone & Hosted Web*):** Aturan teknis mode offline mandiri (`file:///`) vs mode hosting statis (`https://`).

2. [Skema & Model Data](skema-database.md)
   - Struktur entitas penyimpanan lokal (*LocalStorage Data Dictionary*).
   - Definisi entitas: `settings`, `unit_rumah`, `bukti_bayar`, `transaksi`, `warga`, `surat`, `ronda`, `laporan_keamanan`.
   - DDL Skema Relasional PostgreSQL (Panduan Migrasi ke Cloud/Serverless).

3. [Alur Pembayaran QR Code, Alternatif Metode, & Anti-Duplikasi (Tahap 1)](alur-kerja-pembayaran-qr.md)
   - Generator dan format payload QR Code stiker rumah.
   - Portal warga ramah ponsel (`bayar.html`) tanpa autentikasi login.
   - Kompresi gambar sisi klien (*HTML5 Canvas to WebP*) & hashing kriptografis SHA-256.
   - Alternatif metode pembayaran: QRIS Kas RT (lintas bank/e-wallet) dan pencatatan iuran tunai langsung (*Direct Cash Pay*).
   - Antarmuka verifikasi *split-screen*, persetujuan massal (*batch*), pembatalan (*rollback*), & pembukuan otomatis ke Buku Kas RT.

4. [Validasi Cerdas (OCR) & Laporan Rekapitulasi per Blok (Tahap 2)](validasi-ocr-dan-laporan.md)
   - Logika analisis cerdas ekstraksi teks struk transfer (*Rule Engine & OCR*).
   - Matriks rekapitulasi iuran 12 bulan per blok.
   - Kartu iuran digital 12 bulan di sisi warga.
   - Template cetak resmi A4 Landscape dan ekspor data CSV.

5. [Analisis Persyaratan & Cakupan Sistem (SRS & Scope)](analisis-persyaratan-dan-cakupan-sistem.md)
   - Analisis kebutuhan pemangku kepentingan (Warga, Bendahara, Pengurus RT, Keamanan).
   - Batasan cakupan (*In-Scope* vs *Out-of-Scope*) dan batasan teknis operasional (*Dual-Mode Constraints*).
   - Spesifikasi fungsional (FR-01 s/d FR-20, e-Voting Musyawarah Warga, Integrasi WhatsApp).
   - Desain analisis integrasi Core Banking / Payment Gateway (Virtual Account & Webhook).
   - Arsitektur ERD, WBS, Matriks Kriteria Keberhasilan (KPI), dan Register Risiko (RSK-01 s/d RSK-05).

6. [Spesifikasi Pengujian & Verifikasi](panduan-pengujian.md)
   - Arsitektur *Automated Test Suite* ([test_runner.html](../test_runner.html)).
   - Rincian 80 kasus uji (*Unit, Integration, Hardness & Hosted Web Tests* lintas 21 seksi).
   - Panduan eksekusi pengujian di peramban *headless* (Chrome / Edge).

7. [Desain Antarmuka & Mockup Material Design 3](design/mockup-material-design.md)
   - Fondasi desain sistem (*Design Tokens, M3 Color Roles, Typography, Elevation*).
   - Wireframe modul Dasbor, Portal Bayar Warga Mobile, Verifikasi Struk Split-Screen, dan Matriks Blok 12 Bulan.
   - Prototipe visual interaktif mandiri ([design/mockup-preview.html](design/mockup-preview.html)).

---

## 💻 Lingkungan & Teknologi

* **Frontend:** HTML5, Tailwind CSS (CDN), Lucide Icons, Chart.js.
* **Kompresi & Kriptografi Klien:** Canvas API (`image/webp`), Web Crypto API (`crypto.subtle.digest('SHA-256')`).
* **Penyimpanan Klien:** LocalStorage API dengan abstraksi modular di `js/store.js`.
* **Generator QR Code:** QRCode.js (vektor/canvas).
* **Kompatibilitas:** Google Chrome, Microsoft Edge, Mozilla Firefox, Safari, Brave (Desktop & Mobile).

