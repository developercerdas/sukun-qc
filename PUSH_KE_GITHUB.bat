@echo off
title Push QC ke GitHub - PT. SUKUN WARTONO INDONESIA
color 0A
cd /d "D:\APLIKASI\QC"
echo ===================================================================
echo   MENGIRIM APLIKASI QC KE GITHUB (developercerdas/sukun-qc)
echo ===================================================================
echo.
echo Sedang menghubungkan ke GitHub...
echo Jika muncul pop-up login di browser, silakan klik 'Sign in with your browser'.
echo.
"C:\laragon\bin\git\cmd\git.exe" push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================================
    echo   BERHASIL 100%! Seluruh kode aplikasi sudah ter-upload ke GitHub.
    echo ===================================================================
    echo.
    echo Silakan buka: https://github.com/developercerdas/sukun-qc/settings/pages
    echo dan pastikan Source dipilih: GitHub Actions
) else (
    echo ===================================================================
    echo   Gagal mengirim. Pastikan Anda sudah login ke akun GitHub Anda.
    echo ===================================================================
)
echo.
pause
