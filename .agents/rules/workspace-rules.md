---
description: Aturan pengerjaan workspace SIMWARGA - Wajib membaca dokumentasi di folder doc sebelum memodifikasi kode.
trigger: always_on
---

# Aturan Pengerjaan Workspace SIMWARGA

Setiap agen AI atau pengembang yang memulai pengerjaan di workspace `netijen` **WAJIB** membaca dan mematuhi dokumentasi arsitektur di folder `doc/` sebelum melakukan perubahan kode.

## Berkas Referensi Utama:
* `doc/README.md` - Peta navigasi dokumentasi sistem.
* `doc/panduan-pengguna.md` - Panduan perspektif warga, bendahara, dan ketua RT.
* `doc/arsitektur-sistem.md` - Arsitektur multi-tenancy hierarkis wilayah.
* `doc/skema-database.md` - Kamus data `SimStore` & DDL PostgreSQL.
* `doc/alur-kerja-pembayaran-qr.md` - Alur QR stiker, kompresi WebP, hash SHA-256.
* `doc/validasi-ocr-dan-laporan.md` - Aturan OCR & matriks laporan 12 bulan per blok.
* `doc/panduan-pengujian.md` - Verifikasi 18 kasus uji otomatis `test_runner.html`.

## Batasan Kritis:
1. Pertahankan prinsip *Dual-Mode*: mode *client-side standalone first* (dapat langsung dibuka via `file:///` tanpa server) dan mode *hosted static-first* (siap deploy di hosting statis dengan storage adapter & direct upload).
2. Jangan simpan gambar biner mentah > 1 MB di LocalStorage (wajib WebP kompres).
3. Selalu jalankan `test_runner.html` untuk memverifikasi tidak terjadi regresi setelah mengedit kode.
4. **Larangan Menulis Usulan Tanpa Persetujuan di `doc/`:** Berkas di folder `doc/` hanya memuat keputusan yang sudah disetujui (*Approved*). Dilarang menuliskan usulan/proposal yang belum/tidak disetujui ke dalam folder `doc/`.

