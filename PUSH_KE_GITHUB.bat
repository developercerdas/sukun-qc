@echo off
title Update & Push QC ke GitHub - PT. SUKUN WARTONO INDONESIA
color 0A
cd /d "D:\APLIKASI\QC"
echo ===================================================================
echo   MENGIRIM PEMBARUAN APLIKASI QC KE GITHUB (developercerdas/sukun-qc)
echo ===================================================================
echo.
echo Sedang mengunggah fitur terbaru:
echo   [+] Sistem Akun Masing-masing Mandor (Lokal 1, L1C, L3B)
echo       - Isolasi Data Otomatis: Mandor hanya melihat data wilayahnya sendiri
echo       - Pilihan Toggle: Fokus Wilayah Saya vs Seluruh Pabrik
echo       - Auto-assign lokal di formulir input & laporan resmi
echo       - Sinkronisasi Akun Cloud Supabase
echo   [+] 3 Mode Input Manual Kilat (Grid, Express, Paste WA)
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
