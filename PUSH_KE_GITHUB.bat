@echo off
title Update & Push QC ke GitHub - PT. SUKUN WARTONO INDONESIA
color 0A
cd /d "D:\APLIKASI\QC"
echo ===================================================================
echo   MENGIRIM PEMBARUAN APLIKASI QC KE GITHUB (developercerdas/sukun-qc)
echo ===================================================================
echo.
echo Sedang mengunggah fitur terbaru:
echo   [+] 3 Mode Input Manual Kilat (Tanpa Perlu Excel):
echo       1. Tabel Grid Cepat (Spreadsheet Web: Muat Semua Operator Sekaligus)
echo       2. Express Form (Simpan ^& Lanjut Otomatis dalam 3 Detik)
echo       3. Smart Paste WA (Salin-Tempel Catatan Lapangan / WhatsApp Langsung)
echo       4. Formulir Standar Klasik
echo   [+] Engine Bulk Insert Supabase Kecepatan Tinggi (Batch 100 baris/detik)
echo   [+] Mode Clean Replace vs Append Import
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
