# Sukun Quality Control (SQC) — Sistem Pendataan Kerusakan Rokok Batangan
### PT. Sukun Wartono Indonesia — Divisi Pengawasan Mutu & Produksi

Aplikasi sistem pendataan dan pemantauan mutu kerusakan rokok batangan modern berbasis web. Menggantikan sistem Google Apps Script lama dengan performa tinggi, tampilan responsif, integrasi file Excel, serta dukungan database **Supabase (PostgreSQL Cloud)** dan deployment otomatis ke **GitHub Pages**.

---

## 🚀 Fitur-Fitur Utama

### 1. 📊 Dashboard Utama & KPI Mutu
- **Kartu Indikator Kunci (KPI)**: Total Garapan (Batang), Kerusakan Telak, Kerusakan Mandor, dan Rasio Kerusakan (%) secara realtime.
- **Filter Multi-Parameter**: Filter berdasarkan Tahun, Bulan, dan Lokal produksi.
- **Grafik Tren Produksi & Kerusakan**: Visualisasi bar chart perbandingan garapan dan defect 10 tanggal terakhir.
- **Distribusi 8 Kategori Kerusakan (Pareto Doughnut)**: Memetakan proporsi cacat terbesar di pabrik.

### 2. ✍️ Form Input Data Harian Ergonomis
- **Tombol Tally Counter Cepat (+ / -)**: Mempermudah petugas QC/operator mencatat defect rokok secara bertahap saat pemeriksaan di meja kerja.
- **Hitung Otomatis Kerusakan Telak**: Opsi kalkulasi otomatis dari penjumlahan 8 jenis cacat:
  - **CW (Cowong)**
  - **PK (Papir Kusut)**
  - **LK (Lem Kurang)**
  - **TK (Talipan Kotor)**
  - **MT (Muntir)**
  - **MD (Medot)**
  - **AT (Atos)**
  - **MM (Mekar Mingkup)**
- **Smart Autocomplete (Datalist)**: Nama Telak dan Lokal otomatis tersimpan dan dapat dipilih dari riwayat sebelumnya atau diketik baru.

### 3. 📥 Fitur Unggulan: Import & Upload File Excel
- **Input di Excel, Tinggal Upload**: Pengguna bisa mencatat data harian di Microsoft Excel terlebih dahulu, lalu cukup mengunggah file `.xlsx` / `.xls` / `.csv` ke aplikasi.
- **Unduh Template Excel Resmi**: Disediakan tombol 1-klik untuk mengunduh template spreadsheet dengan format kolom yang sudah standar PT. Sukun.
- **Pratinjau & Validasi Sebelum Simpan**: Sistem otomatis mendeteksi baris valid vs baris bermasalah sebelum disimpan ke database.
- **Sinkronisasi Referensi Otomatis**: Nama telak dan lokal baru pada file Excel otomatis terdaftar ke sistem.

### 4. 📦 Manajemen Data Produksi & Ekspor
- Tabel interaktif lengkap dengan pencarian realtime, sorting, dan pagination.
- Tombol **Ekspor ke Excel (.xlsx)** dan **Ekspor ke CSV**.
- Fitur Edit Data dan Hapus Data dengan konfirmasi aman.
- Toggle untuk membuka/menyembunyikan 8 kolom detail defect.

### 5. 🔍 Analisis Rincian Kerusakan & Panduan Mitigasi (CAPA)
- Pemeringkatan jenis cacat yang paling banyak terjadi (Aturan Pareto 80/20).
- Rekomendasi tindakan teknis untuk mandor dan mekanik mesin giling untuk masing-masing jenis kerusakan.

### 6. 🏆 Analisis & Peringkat Mutu (Leaderboard)
- **Operator Kualitas Terbaik**: Daftar operator telak dengan rasio kerusakan terendah (&lt; 0.8%).
- **Prioritas Pembinaan QC**: Daftar operator yang membutuhkan pendampingan teknis (&gt; 1.0% kerusakan).
- **Peringkat Antar Lokal**: Perbandingan kualitas antar sektor/lokal produksi.

### 7. 📄 Pusat Cetak Laporan Resmi PT. Sukun (Print Ready)
- Format cetak formal dengan Kop Surat resmi PT. Sukun Wartono Indonesia.
- Rekapitulasi produksi dan kolom tanda tangan digital untuk **Mandor QC** dan **Kepala Bagian Produksi**.
- Tampilan rapi untuk dicetak ke printer kertas atau disimpan sebagai **PDF**.

### 8. 🛡️ Audit Kualitas Data Otomatis
- Mendeteksi duplikasi baris data ganda (tanggal, nama, lokal sama).
- Mendeteksi anomali (garapan 0, atau kerusakan lebih besar dari garapan).
- Tombol 1-klik untuk pembersihan data duplikat secara otomatis.

### 9. ⚙️ Pengaturan & Fleksibilitas Database
- **Mode Offline (Lokal)**: Berjalan langsung di browser laptop tanpa memerlukan internet.
- **Mode Cloud (Supabase PostgreSQL)**: Data tersinkronisasi online di cloud secara gratis dan aman.
- Backup & Restore database dalam format JSON.
- Audit Trail (Log aktivitas sistem).

---

## 💻 Cara Menjalankan di Laptop (Pengembangan Lokal)

1. Buka PowerShell atau Command Prompt.
2. Masuk ke folder proyek:
   ```powershell
   cd D:\APLIKASI\QC
   ```
3. Jalankan server lokal:
   ```powershell
   npm run dev
   ```
4. Buka browser di alamat: `http://localhost:5173`

---

## ☁️ Rekomendasi Database: Supabase (PostgreSQL Cloud Gratis)

1. Buat akun gratis di [https://supabase.com](https://supabase.com).
2. Buat project baru (misal: `sukun-qc`).
3. Buka menu **SQL Editor**, salin isi file `supabase/schema.sql`, tempel, lalu klik **Run**.
4. Buka menu **Project Settings > API**, salin:
   - **Project URL**
   - **anon / public key**
5. Buka menu **Pengaturan & DB** di aplikasi Sukun QC, tempel kedua data tersebut, dan klik **Uji Koneksi Cloud > Simpan Konfigurasi**.

---

## 🌐 Panduan Deploy ke GitHub & GitHub Pages (100% Gratis)

Proyek ini telah dilengkapi GitHub Actions workflow (`.github/workflows/deploy.yml`).

1. Buka [https://github.com/new](https://github.com/new) dan buat repository baru bernama `sukun-qc`.
2. Di PowerShell, hubungkan folder lokal ke GitHub:
   ```powershell
   cd D:\APLIKASI\QC
   & "C:\laragon\bin\git\cmd\git.exe" init
   & "C:\laragon\bin\git\cmd\git.exe" add .
   & "C:\laragon\bin\git\cmd\git.exe" commit -m "Inisialisasi Aplikasi Sukun Quality Control v2.5"
   & "C:\laragon\bin\git\cmd\git.exe" branch -M main
   & "C:\laragon\bin\git\cmd\git.exe" remote add origin https://github.com/USERNAME_ANDA/sukun-qc.git
   & "C:\laragon\bin\git\cmd\git.exe" push -u origin main
   ```
3. Buka repository Anda di GitHub:
   - Masuk ke tab **Settings > Pages**
   - Pada bagian **Build and deployment > Source**, pilih **GitHub Actions**
4. Aplikasi akan otomatis ter-deploy online dan dapat diakses dari laptop, HP, atau tablet pengawas pabrik melalui URL:
   `https://USERNAME_ANDA.github.io/sukun-qc/`
