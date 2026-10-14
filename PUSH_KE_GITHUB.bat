@echo off
title Update & Push QC ke GitHub - PT. SUKUN WARTONO INDONESIA
color 0A
cd /d "D:\APLIKASI\QC"
echo ===================================================================
echo   MENGIRIM PEMBARUAN APLIKASI QC KE GITHUB (developercerdas/sukun-qc)
echo ===================================================================
echo.
echo Sedang mengunggah fitur terbaru:
echo   [+] Perbaikan Engine Bulk Import: Kecepatan Tinggi (Batch 100 baris/detik)
echo   [+] Solusi Masalah Selisih Jumlah Data Import vs Data Aktual
echo   [+] Dukungan Multi-Sheet Excel ^& Penggabungan Semua Lembar Kerja
echo   [+] Toleransi Merged Cells ^& Auto-Fill Tanggal/Lokal Pabrik
echo   [+] Opsi Mode: Tambahkan (Append) vs Ganti Bersih Database (Clean Replace)
echo   [+] Tombol Reset / Kosongkan Data Produksi di Pengaturan
echo.
"C:\laragon\bin\git\cmd\git.exe" push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================================
    echo   BERHASIL 100%! Pembaruan sudah langsung online di GitHub Pages!
    echo ===================================================================
    echo.
    echo Kunjungi: https://developercerdas.github.io/sukun-qc/
) else (
    echo ===================================================================
    echo   Gagal mengirim. Pastikan koneksi internet aktif.
    echo ===================================================================
)
echo.
pause
