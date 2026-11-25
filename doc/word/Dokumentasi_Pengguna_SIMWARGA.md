# BUKU PANDUAN PENGGUNA SISTEM SIMWARGA
**Petunjuk Operasional Praktis untuk Warga, Bendahara Kas, dan Pengurus RT/RW**

---

## 1. PENDAHULUAN & GAMBARAN UMUM SISTEM

Selamat datang di **Buku Panduan Pengguna SIMWARGA (Sistem Informasi Manajemen Warga, Iuran QR & Keuangan RT/RW)**.

Aplikasi SIMWARGA dirancang khusus untuk memberikan kemudahan, transparansi, dan kecepatan pelayanan administrasi kemasyarakatan di lingkungan RT/RW. Aplikasi ini mengusung konsep kemudahan penggunaan:
* **Bagi Warga:** Tidak perlu mengunduh aplikasi tambahan dan tidak perlu membuat akun/kata sandi. Cukup pindai stiker QR yang tertempel di depan rumah Anda untuk membayar iuran dan memeriksa riwayat setoran.
* **Bagi Bendahara:** Verifikasi struk transfer selesai dalam hitungan detik dengan bantuan asisten cerdas, pembukuan kas otomatis tanpa kalkulator manual, serta penerimaan iuran tunai di tempat.
* **Bagi Ketua & Sekretaris RT:** Pengelolaan kependudukan terpadu, pembuatan surat pengantar resmi ber-QR validasi, jadwal ronda malam, serta laporan keuangan yang siap dipublikasikan ke warga kapan saja.

---

## 2. PANDUAN PRAKTIS UNTUK WARGA

Sebagai warga atau penghuni unit rumah, Anda dapat melakukan pembayaran iuran bulanan dan memeriksa kartu iuran digital langsung dari ponsel pintar (*smartphone*) Anda.

### 2.1 Cara Membayar Iuran Lingkungan via Scan QR Stiker Rumah

```text
[Langkah 1]               [Langkah 2]               [Langkah 3]               [Langkah 4]
Scan Stiker QR ──────► Pilih Bulan Iuran ──────► Transfer & Unggah ──────► Konfirmasi & Kartu
di Pintu Rumah          (1 atau Beberapa)           Foto Struk Transfer        Iuran Digital Update
```

1. **Langkah 1: Pindai Stiker QR di Depan Pintu Rumah**
   * Buka aplikasi Kamera bawaan ponsel Anda atau aplikasi pemindai QR.
   * Arahkan kamera ke stiker QR SIMWARGA yang tertempel di dekat pintu/pagar rumah Anda.
   * Ketuk tautan yang muncul di layar ponsel. Peramban web akan langsung membuka halaman **Portal Pembayaran Warga (`bayar.html`)**. Identitas rumah, blok, dan nama penghuni akan otomatis terisi tanpa perlu mengetik ulang!

2. **Langkah 2: Tentukan Periode Bulan Iuran**
   * Pilih bulan iuran yang ingin Anda bayarkan (misalnya: *Oktober 2026*).
   * **Tips Pembayaran Sekaligus (Multi-Bulan):** Jika Anda ingin membayar untuk beberapa bulan ke depan (contoh: Oktober, November, Desember), centang bulan-bulan yang diinginkan. Sistem akan secara otomatis mengakumulasikan total nominal tagihan secara tepat.

3. **Langkah 3: Lakukan Pembayaran & Ambil Foto Struk**
   * Lakukan transfer sesuai nominal tagihan ke rekening resmi kas RT atau pindai barcode QRIS Kas RT yang tertera di layar.
   * Simpan bukti transfer berupa tangkapan layar (*screenshot*) atau foto struk fisik dari mesin ATM.
   * Ketuk tombol **"Pilih Foto Struk / Tangkapan Layar"** pada halaman portal. Sistem SIMWARGA akan secara otomatis mengompresi gambar Anda agar hemat kuota internet sebelum dikirimkan.

4. **Langkah 4: Kirimkan Bukti Pembayaran**
   * Masukkan nomor referensi transfer (opsional namun disarankan).
   * Ketuk tombol hijau besar **"Kirim Bukti Pembayaran"**.
   * Bukti Anda akan langsung masuk ke antrean verifikasi Bendahara RT dengan status *"Menunggu Verifikasi"*.

### 2.2 Cara Melihat Kartu Iuran Digital 12 Bulan
Pada bagian bawah halaman portal warga, terdapat kisi kotak **Kartu Iuran Digital 12 Bulan** (Januari s/d Desember):
* **Kotak Hijau bertanda `✓ Lunas`:** Iuran bulan tersebut telah diverifikasi dan sah tercatat di Buku Kas RT.
* **Kotak Abu-abu bertanda `Belum`:** Iuran bulan tersebut belum dibayarkan atau masih menunggu verifikasi pengurus.
Fitur ini menggantikan fungsi kartu iuran kertas konvensional sehingga Anda dapat memantau status iuran keluarga kapan saja secara transparan.

---

## 3. PANDUAN OPERASIONAL UNTUK BENDAHARA RT

Modul Bendahara RT berfungsi untuk memverifikasi pembayaran warga, mengelola mutasi kas masuk/keluar, melayani iuran tunai di tempat, dan menyajikan laporan keuangan.

### 3.1 Verifikasi Struk Transfer Warga (Split-Screen Viewer)
1. Buka aplikasi SIMWARGA di komputer atau tablet Anda (`index.html`).
2. Masuk ke tab menu **"Verifikasi Iuran Masuk"**. Daftar pengajuan bukti bayar dari warga akan tertampil secara rapi.
3. Ketuk tombol **"Periksa Struk"** pada baris transaksi yang ingin diteliti. Jendela verifikasi berdampingan (*split-screen*) akan terbuka:
   * **Panel Kiri:** Menampilkan foto struk asli dari bank atau e-wallet yang dikirimkan warga (dapat diperbesar/zoom).
   * **Panel Kanan:** Menampilkan rincian isian data warga (nama, unit rumah, periode bulan, dan nominal transfer).
4. **Perhatikan Rekomendasi Validasi Cerdas:**
   * **Badge Hijau `LULUS OTOMATIS`:** Nominal struk cocok dengan kewajiban iuran, nomor referensi unik, dan rekening tujuan sah. Anda dapat langsung menekan tombol **"Setujui (Approve)"** dengan satu kali klik.
   * **Badge Kuning `PERLU CEK MANUAL`:** Nominal yang ditransfer kurang dari tarif bulanan, atau terdapat ketidaksesuaian data. Teliti kembali sebelum mengambil keputusan.
5. **Tindakan Persetujuan atau Penolakan:**
   * **Jika Sah:** Ketuk tombol hijau **"Setujui Bukti Bayar"**. Transaksi secara otomatis tercatat ke dalam Buku Kas RT sebagai *Pemasukan*, dan kuitansi digital siap dikirimkan ke nomor WhatsApp warga dengan 1 klik.
   * **Jika Tidak Sah / Kurang Bayar:** Ketuk tombol merah **"Tolak Bukti"**, lalu tuliskan alasan penolakan secara jelas (contoh: *"Nominal transfer kurang Rp 20.000, mohon lengkapi"*). Transaksi yang ditolak **tidak akan pernah mencemari** pembukuan kas RT.

### 3.2 Pembatalan Verifikasi (*Rollback Transaksi*)
Apabila Bendahara melakukan kekeliruan saat menyetujui struk atau terdapat laporan bahwa transfer dibatalkan oleh bank:
* Buka riwayat bukti bayar yang bersangkutan, lalu ketuk tombol **"Batalkan Verifikasi (Rollback)"**.
* Sistem secara atomik akan menghapus pencatatan pemasukan di Buku Kas RT dan mengembalikan status struk tersebut menjadi *"Menunggu Verifikasi"* untuk diperiksa ulang.

### 3.3 Penerimaan Iuran Tunai Langsung di Tempat (*Direct Cash Pay*)
Bagi warga lansia atau warga yang lebih nyaman membayar secara tunai langsung ke rumah pengurus:
1. Buka menu **"Buku Kas RT"** atau **"Penerimaan Tunai"**.
2. Pilih unit rumah dan nama warga pembayar dari daftar drop-down.
3. Tentukan periode bulan iuran yang dibayarkan dan nominal uang tunai yang diterima fisik.
4. Pilih metode pembayaran **"Kas Tunai di Tangan (1-101)"**.
5. Simpan transaksi. Sistem seketika mencatatkan kas masuk dan langsung menerbitkan **Kuitansi Tanda Terima Resmi** yang dapat dicetak atau dikirim via WhatsApp.

### 3.4 Matriks Rekapitulasi Iuran 12 Bulan per Blok
* Buka tab menu **"Matriks Rekap Blok"**.
* Anda akan melihat tabel matriks penagihan 12 bulan (Jan–Des) untuk seluruh rumah di Blok A, Blok B, dan Blok C.
* Warna hijau menandakan lunas, sedangkan tanda strip abu-abu menunjukkan tunggakan.
* Di bagian atas matriks, Anda dapat mengamati **Persentase Kepatuhan Iuran (%)** per blok secara *real-time*.
* **Ekspor & Cetak:** Tersedia tombol **"Ekspor ke CSV / Excel"** untuk pengolahan lebih lanjut, serta tombol **"Cetak A4 Landscape"** lengkap dengan format kop surat dan kolom tanda tangan Ketua & Bendahara RT.

---

## 4. PANDUAN PENGURUS: KETUA & SEKRETARIS RT

Modul ini dikhususkan bagi Ketua dan Sekretaris RT untuk tata kelola kependudukan, pencetakan perlengkapan administrasi, keamanan lingkungan, dan pengamanan data.

### 4.1 Cetak Stiker QR Pintu Rumah
1. Masuk ke menu **"Master Unit Rumah"** $\rightarrow$ **"Cetak Lembar Stiker QR"**.
2. Sistem akan menyusun tata letak lembar cetak standar kertas A4 yang memuat kartu stiker QR untuk setiap nomor rumah (Blok A, B, C).
3. Cetak dokumen ini menggunakan printer berwarna pada stiker vinil atau kertas stiker berperekat yang dilaminasi anti-air.
4. Tempelkan masing-masing stiker di pintu utama atau tiang pagar rumah warga sesuai nomor unit.

### 4.2 Pelayanan Surat Pengantar RT Ber-QR Validasi
1. Buka menu **"Layanan Surat Pengantar"**.
2. Untuk membuat surat baru, pilih nama warga pemohon, masukkan keperluan surat (contoh: *Pengurusan KTP Baru, SKCK Kepolisian, atau Domisili Bank*), dan pilih template nomor surat.
3. Setelah disetujui Ketua RT, ketuk tombol **"Cetak Surat Resmi"**.
4. Surat akan dicetak rapi dengan kop rukun tetangga dan dilengkapi **QR Code Validasi Dokumen**. Petugas kelurahan atau instansi tujuan dapat memindai QR tersebut untuk membuktikan keaslian surat pengantar tanpa risiko pemalsuan cap fisik.

### 4.3 Jadwal Ronda Siskamling & Buku Tamu
* **Jadwal Ronda:** Masuk ke menu **"Keamanan Lingkungan"** untuk membagikan warga ke dalam 7 regu jaga malam (Senin s/d Minggu), menunjuk koordinator regu, serta menentukan jam ronda.
* **Buku Tamu / Kontrakan:** Catat data warga pendatang atau tamu yang menginap lebih dari $24\text{ jam}$ lengkap dengan nomor identitas, alamat asal, dan penanggung jawab rumah tujuan.

### 4.4 Pengamanan & Cadangan Basis Data (Backup & Restore)
Untuk menjamin keamanan seluruh arsip administrasi RT:
* **Mencadangkan Data (Backup):**
  Masuk ke menu **"Pengaturan & Sistem"** $\rightarrow$ ketuk tombol **"Unduh Cadangan (Backup JSON)"**. Seluruh data RT (warga, transaksi, struk, surat, ronda) akan tersimpan rapi dalam satu berkas `.json` kecil. Simpan berkas ini ke flashdisk atau Google Drive setiap akhir bulan.
* **Memulihkan Data (Restore):**
  Jika Anda berganti komputer atau ingin memindahkan sistem, buka aplikasi di komputer baru, masuk ke menu yang sama, pilih tombol **"Pulihkan Data (Restore JSON)"**, lalu pilih berkas cadangan Anda. Sistem akan pulih 100% dalam waktu kurang dari satu detik.

---

## 5. TANYA JAWAB UMUM (FAQ) & PEMECAHAN MASALAH

**Q1: Apakah warga harus mengunduh aplikasi di Play Store atau App Store?**
> **Jawab:** Tidak perlu. SIMWARGA berbasis web murni yang ramah gawai (*Mobile Web*). Warga cukup membuka kamera ponsel untuk memindai stiker QR di pintu rumah.

**Q2: Bagaimana jika foto struk yang diunggah warga buram atau salah transfer?**
> **Jawab:** Bendahara dapat menolak struk tersebut dengan menekan tombol *"Tolak Bukti"* dan menyertakan keterangan (misal: *"Foto struk terpotong, silakan unggah ulang"*). Transaksi tersebut otomatis tidak masuk ke Buku Kas RT.

**Q3: Apakah sistem ini bisa digunakan di laptop pengurus yang tidak ada koneksi internet?**
> **Jawab:** Ya, SIMWARGA dirancang dengan prinsip *Standalone First*. Anda dapat membukanya kapan saja secara offline tanpa internet melalui peramban web di laptop Anda.

**Q4: Apakah data keuangan RT aman jika peramban dibersihkan (Clear Cache)?**
> **Jawab:** Data disimpan pada *LocalStorage* peramban. Sangat dianjurkan bagi Bendahara atau Sekretaris untuk mengklik tombol *"Unduh Cadangan (Backup JSON)"* secara berkala (misal: setiap akhir pekan atau setelah verifikasi iuran) agar salinan cadangan selalu aman tersimpan di luar peramban.

---
*Buku Panduan Pengguna SIMWARGA - Disusun untuk Mewujudkan Lingkungan RT/RW yang Mandiri, Tertib, dan Transparan.*
