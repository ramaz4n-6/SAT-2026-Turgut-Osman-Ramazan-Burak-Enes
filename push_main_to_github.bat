@echo off
chcp 65001 > nul
echo ===================================================
echo   Bozok 66 - GitHub 'main' Branch Push Konsolu
echo ===================================================
echo.
echo Proje Dizini: %~dp0
echo Branch: main
echo Hedef: origin (https://github.com/MiethaSama/SAT-2026-Turgut-Osman-Ramazan-Burak-Enes.git)
echo.
echo Eger GitHub Personal Access Token (PAT) kullaniyorsaniz:
echo   Username: ramaz4n
echo   Password: [GitHub'dan aldiginiz ghp_ ile baslayan Token]
echo.
echo ===================================================
echo Push islemi baslatiliyor...
echo.

"C:\Users\PC\PortableGit\bin\git.exe" push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo [TEBRIKLER] 'main' branch'i GitHub'a basariyla gonderildi!
    echo ===================================================
) else (
    echo [HATA / BILGI] Eger sifre reddedildiyse:
    echo GitHub 2021'den beri normal sifreyi kabul etmiyor, Token gereklidir.
    echo 1 dakikada ucretsiz Token almak icin:
    echo https://github.com/settings/tokens/new
)
echo.
pause
