@echo off
title Update & Push QC ke GitHub - PT. SUKUN WARTONO INDONESIA
color 0A
cd /d "D:\APLIKASI\QC"
echo ===================================================================
echo   MENGIRIM PEMBARUAN APLIKASI QC KE GITHUB (developercerdas/sukun-qc)
echo ===================================================================
echo.
echo Sedang mengunggah fitur terbaru:
echo   [+] Halaman Login Glassmorphism
echo   [+] Master Rule Hak Akses (Super Admin, Mandor QC, Operator)
echo   [+] Master Standar Baku Mutu QC PT. Sukun
echo   [+] Manajemen Akun Pengguna & Kata Sandi
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
