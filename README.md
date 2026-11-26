# SIMWARGA - Aplikasi Sistem Informasi Manajemen Data Warga RT/RW

Aplikasi web modern, ringan, dan mandiri (*standalone*) untuk pencatatan dan pengelolaan administrasi data warga, Kartu Keluarga (KK), kas & iuran, layanan pembuatan dan cetak surat pengantar resmi, pencatatan tamu/kontrakan, serta siskamling (keamanan lingkungan).

---

## 🌟 Fitur Unggulan

1. **Sistem Login Pengguna & Hak Akses Berjenjang (Role-Based Access Control / RBAC)**
   - Autentikasi aman berbasis enkripsi hash kriptografis **SHA-256**.
   - Pemisahan hak akses modul secara ketat berdasarkan peran (*Role*):
     - **Ketua RT (Admin)**: Akses menyeluruh ke semua modul sistem termasuk konfigurasi RT dan manajemen akun pengguna.
     - **Bendahara RT**: Fokus pada pembukuan kas, verifikasi bukti iuran QR warga, penerimaan iuran tunai, dan laporan rekapitulasi.
     - **Sekretaris RT**: Fokus pada pengelolaan data induk kependudukan & Kartu Keluarga (KK), pencetakan surat pengantar resmi, dan buku tamu.
     - **Petugas Keamanan**: Akses buku tamu, pendataan kontrakan, dan jadwal ronda siskamling lingkungan.
     - **Warga Lingkungan**: Portal monitoring transparansi kas RT, status kartu iuran rumah, dan pengajuan surat.
   - **Tombol Akses Cepat Demo (*Quick Login*)**: Masuk instan dengan sekali klik untuk pengujian seluruh peran tanpa perlu mengetik manual.
   - **Manajemen Akun Pengguna**: Tambah, edit kata sandi, ubah peran, dan aktifkan/nonaktifkan akun dari menu Pengaturan.

2. **Master Data Warga & Kartu Keluarga (KK)**
   - Pencatatan lengkap: NIK 16 digit, No. KK, Nama, TTL, Jenis Kelamin, Agama, Pendidikan, Pekerjaan, Status Perkawinan, Hubungan Keluarga, Status Domisili, Golongan Darah, No. WhatsApp, dan Alamat.
   - Dua tampilan fleksibel: **Daftar Semua Warga** dan **Kelompok Kartu Keluarga (KK)**.
   - Pencarian cepat (*instant search*) berdasarkan nama, NIK, KK, pekerjaan, alamat, serta filter gender dan hubungan keluarga.
   - Modal detail biodata warga lengkap dengan daftar anggota dalam satu KK.

2. **Dashboard Statistik & Demografi Interaktif**
   - Kartu metrik: Total Penduduk, Jumlah KK, Saldo Kas RT, Tamu/Kontrakan Aktif.
   - Klasifikasi usia: Anak (< 17 tahun), Usia Produktif (17–59 tahun), Lansia (60+ tahun).
   - Grafik interaktif dengan **Chart.js**: Diagram lingkaran komposisi penduduk dan grafik batang arus kas RT.
   - Widget aktivitas terbaru: Permohonan surat pengantar & mutasi kas terakhir.

3. **Manajemen Kas, Iuran Warga & Verifikasi Bukti QR**
   - Ringkasan otomatis: Total Saldo Kas, Total Pemasukan, Total Pengeluaran.
   - **Tahap 1: Portal Bukti Bayar Warga (`bayar.html`)**:
     - Warga memindai stiker QR di depan pintu rumah; halaman otomatis mengenali Blok, No. Rumah, dan Nama Penghuni tanpa perlu login.
     - Pengambilan foto langsung dari kamera HP atau unggah screenshot transfer m-Banking.
     - **Kompresi Gambar Sisi Klien (Canvas to WebP)**: Foto 5 MB otomatis menyusut menjadi ~150 KB untuk menghemat kuota dan mempercepat upload.
     - **Anti-Duplikasi (SHA-256 Hash)**: Mencegah unggah ulang struk transfer yang sama.
     - **Kartu Iuran Digital 12 Bulan**: Warga dapat memantau status pembayaran rumahnya dari Januari hingga Desember secara langsung di peramban.
   - **Tahap 2: Validasi Cerdas (OCR) & Laporan Rekapitulasi per Blok**:
     - **Analisis Validasi Cerdas (Rule-based & OCR)**: Memeriksa apakah nominal struk sesuai tarif, status "BERHASIL", dan nomor referensi bank unik. Memberikan rekomendasi *"LULUS OTOMATIS"*.
     - **Matriks Rekapitulasi 12 Bulan per Blok**: Menampilkan status pembayaran warga (Januari–Desember) per unit rumah secara visual (centang hijau untuk lunas, strip untuk belum bayar).
     - **Indikator Kepatuhan Wilayah**: Melacak persentase kepatuhan bayar per blok, total uang masuk, dan rumah yang menunggak.
     - **Cetak Laporan Rekapitulasi A4 Landscape**: Format resmi siap cetak lengkap dengan kop RT/RW dan kolom tanda tangan Ketua RT & Bendahara.
   - **Generator & Cetak Stiker QR Rumah (A4)**:
     - Pengurus RT dapat mencetak lembar stiker QR Code per Blok/Rumah (ukuran kartu siap gunting/tempel).
   - **Antarmuka Verifikasi Split-Screen Bendahara RT**:
     - Menampilkan foto struk (bisa di-zoom), nominal, periode, dan nomor referensi bank.
     - Tombol **Setujui**: Mengubah status menjadi "Terverifikasi" dan *otomatis mencatat ke Buku Kas Pemasukan*.
     - Tombol **Tolak**: Memberi catatan alasan penolakan kepada warga.
   - Kategori transaksi: Iuran Bulanan, Sampah, Keamanan, Donasi, Operasional, Sosial/Duka, Perbaikan Sarana.
   - Riwayat mutasi lengkap dengan penanda warna dan filter pemasukan/pengeluaran.

4. **Layanan Surat Pengantar RT/RW (Siap Cetak PDF)**
   - Penomoran surat otomatis dengan format baku penomoran dinas RT/RW (`470/xxx/RT.03-RW.07/X/2026`).
   - Pemilihan warga pemohon langsung otomatis mengisi data diri resmi pemohon.
   - Template cetak standar A4 resmi dilengkapi kop surat RT/RW/Kelurahan, isi keperluan surat, dan kolom tanda tangan Ketua RT & Ketua RW.
   - Tombol cetak langsung ke printer atau simpan sebagai file PDF (*Print to PDF*).

5. **Buku Tamu & Warga Sementara**
   - Pencatatan tamu menginap > 24 jam, penyewa kontrakan, atau penghuni kost lingkungan.
   - Informasi daerah asal, identitas induk semang (tuan rumah), durasi tinggal, dan status aktif.

6. **Keamanan Lingkungan & Jadwal Ronda Siskamling**
   - Jadwal giliran ronda harian (Senin s/d Minggu) dengan nama regu, koordinator, dan daftar anggota jaga.
   - Fitur edit penugasan ronda secara langsung.
   - Buku log patroli dan pelaporan insiden keamanan pos kamling.

7. **Backup, Restore & Ekspor Data**
   - Ekspor data warga ke format **CSV / Excel**.
   - Ekspor laporan buku kas ke format **CSV / Excel**.
   - **Download Backup JSON**: Cadangkan seluruh basis data lokal dalam 1 klik.
   - **Restore JSON**: Pulihkan database dari file cadangan kapan saja.
   - Tombol reset ke sample data bawaan.

8. **Pengaturan Wilayah RT/RW**
   - Kustomisasi nama RT, RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos, nama Ketua RT, kontak WhatsApp, nama Ketua RW, tarif iuran bulanan default, dan saldo awal kas.

---

## 🚀 Cara Menjalankan Aplikasi & Kredensial Login

Aplikasi ini bersifat **100% Client-Side Modern Web App** tanpa perlu konfigurasi web server (Apache/Node.js/PHP).

1. Buka aplikasi dengan salah satu cara berikut:
   - Akses via GitHub Pages: **[https://agungtri.github.io/SIMWARGA/](https://agungtri.github.io/SIMWARGA/)**
   - Atau **klik dua kali (*double click*) file `index.html`** langsung di File Explorer.
2. Masuk menggunakan salah satu akun bawaan berikut (atau klik tombol **Akses Cepat Pengujian (Demo)** di layar login):

| Peran (Role) | Username | Password | Nama Lengkap | Cakupan Akses Modul |
| :--- | :--- | :--- | :--- | :--- |
| **Ketua RT (Admin)** | `admin` | `admin123` | H. Bambang Sudrajat | Akses Penuh: Semua modul, Pengaturan & Manajemen Akun |
| **Bendahara RT** | `bendahara` | `bendahara123` | Hj. Siti Aminah | Dashboard, Buku Kas Umum, Verifikasi Bukti QR, Matriks Rekapitulasi |
| **Sekretaris RT** | `sekretaris` | `sekretaris123` | Hendra Wijaya | Dashboard, Data Warga & Kartu Keluarga (KK), Layanan Surat, Buku Tamu |
| **Petugas Keamanan** | `keamanan` | `keamanan123` | Pak Joko Sutrisno | Dashboard, Buku Tamu & Kontrakan, Jadwal Ronda Siskamling |
| **Warga Lingkungan** | `warga` | `warga123` | Budi Santoso | Dashboard Transparansi Kas, Kartu Iuran Rumah, Pengajuan Surat Pengantar |

> [!TIP]
> **Portal Pembayaran Warga Mandiri (`bayar.html`)**: Warga yang ingin mengonfirmasi transfer iuran via stiker QR di pintu rumah tetap dapat mengakses `bayar.html` secara langsung **tanpa perlu login (Zero-Login)**.

---

## 📖 Dokumentasi Aplikasi

* **[📘 Buku Panduan Pengguna (User Guide Mudah Dipahami)](doc/panduan-pengguna.md)** — Petunjuk praktis langkah demi langkah untuk **Warga**, **Bendahara RT**, dan **Pengurus RT**.

Dokumentasi teknis mendalam mengenai arsitektur, skema data, alur QR code, validasi OCR, serta panduan pengujian dapat dilihat pada folder [`doc/`](doc/README.md):
* [Arsitektur Sistem & Multi-Tenancy](doc/arsitektur-sistem.md) — Arsitektur modular, isolasi data alamat, dan strategi skala besar (*PostgreSQL + S3*).
* [Skema & Model Basis Data](doc/skema-database.md) — Kamus data LocalStorage dan DDL migrasi SQL relasional.
* [Alur Kerja Pembayaran QR Code & Anti-Duplikasi](doc/alur-kerja-pembayaran-qr.md) — Kompresi WebP, SHA-256 hash, dan alur verifikasi bendahara.
* [Validasi Cerdas (OCR) & Laporan Rekapitulasi per Blok](doc/validasi-ocr-dan-laporan.md) — Mesin validasi aturan, rekap matriks 12 bulan, dan kartu iuran digital.
* [Analisis Persyaratan & Cakupan Sistem Kas ke WhatsApp](doc/analisis-persyaratan-dan-cakupan-sistem.md) — Analisis kebutuhan, batasan cakupan, spesifikasi fungsional (FR/NFR), dan format template pesan.
* [Spesifikasi & Panduan Pengujian Teknis](doc/panduan-pengujian.md) — Kasus uji otomatis 18 skenario dan eksekusi *headless browser*.
