# 📋 Aturan Pengerjaan Workspace SIMWARGA (Claude Guidelines)

Aturan ini bersifat **WAJIB (MANDATORY)** bagi Claude / Claude Code sebelum dan selama mengerjakan tugas di workspace `netijen`.

---

## 🛑 Protokol Memulai Pekerjaan (Wajib Baca `doc/`)

Sebelum melakukan analisis kode, penambahan fitur baru, perbaikan bug, atau perubahan kode apapun, **Anda WAJIB membaca berkas dokumentasi di folder `doc/`** sesuai topik yang relevan:

1. **[doc/README.md](doc/README.md)** — Indeks utama seluruh modul dan dokumentasi arsitektur.
2. **[doc/panduan-pengguna.md](doc/panduan-pengguna.md)** — Pahami perspektif Warga, Bendahara, dan Pengurus RT.
3. **[doc/arsitektur-sistem.md](doc/arsitektur-sistem.md)** — Pahami arsitektur modular, alur data, dan model multi-tenancy hierarkis wilayah (`Kelurahan` $\rightarrow$ `RW` $\rightarrow$ `RT` $\rightarrow$ `Blok` $\rightarrow$ `No. Rumah`).
4. **[doc/skema-database.md](doc/skema-database.md)** — Pahami struktur entitas `SimStore` (`unit_rumah`, `bukti_bayar`, `transaksi`, `settings`) dan konvensi penamaannya.
5. **[doc/alur-kerja-pembayaran-qr.md](doc/alur-kerja-pembayaran-qr.md)** — Pahami standar kompresi Canvas WebP (< 200 KB) dan sidik jari anti-duplikasi SHA-256.
6. **[doc/validasi-ocr-dan-laporan.md](doc/validasi-ocr-dan-laporan.md)** — Pahami logika evaluasi OCR dan matriks rekapitulasi iuran 12 bulan per blok.
7. **[doc/panduan-pengujian.md](doc/panduan-pengujian.md)** — Pahami ke-18 kasus uji otomatis pada `test_runner.html`.

---

## 🛡️ Prinsip & Batasan Teknis yang Wajib Dijaga

1. **Prinsip Client-Side Standalone First:**
   * Aplikasi harus tetap dapat dijalankan langsung dengan **klik dua kali (*double click*) pada `index.html`** tanpa perlu runtime server (Node.js/PHP/Python).
   * Hindari penggunaan ES Module `import`/`export` lintas file yang dapat memicu galat CORS pada protokol `file:///`. Gunakan namespace global modular (`window.SimStore`, `window.AppState`).

2. **Hierarki Multi-Tenancy Berbasis Wilayah:**
   * Seluruh entitas transaksi dan unit rumah wajib menyertakan identitas wilayah (`tenant_id`, `blok`, `nomorRumah`).
   * Jangan pernah mencampuradukkan data antar-blok atau antar-RT tanpa isolasi tenant yang jelas.

3. **Standar Penanganan Bukti Pembayaran:**
   * **Dilarang** menyimpan berkas biner gambar mentah berukuran besar (> 1 MB) ke `localStorage`.
   * Gambar struk wajib dikompresi di sisi klien menjadi format WebP beresolusi maksimal $1200\text{ px}$.
   * Setiap unggahan bukti transfer wajib dihitung nilai hash SHA-256-nya untuk mencegah duplikasi.

4. **Integritas Pembukuan Kas:**
   * Bukti transfer yang disetujui (*Approved*) wajib otomatis mencatatkan mutasi `'Pemasukan'` ke dalam `SimStore.addTransaksi()`.
   * Bukti yang ditolak (*Rejected*) **tidak boleh** masuk ke pembukuan kas.

5. **Kewajiban Pengujian (Regression Testing):**
   * Setiap kali mengubah kode di `js/store.js` atau `js/app.js`, jalankan `test_runner.html` untuk memastikan ke-18 pengujian unit dan integrasi tetap **100% PASS**.

6. **Integritas Dokumentasi:**
   * Setiap ada penambahan fitur baru atau perubahan struktur data, berkas dokumentasi di `doc/` dan `README.md` **wajib diperbarui**.

