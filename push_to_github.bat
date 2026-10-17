@echo off
chcp 65001 > nul
echo ===================================================
echo   Bozok 66 - GitHub 'dev' Branch Push Konsolu
echo ===================================================
echo.
echo Proje Dizini: %~dp0
echo Branch: dev
echo Hedef: origin (https://github.com/MiethaSama/SAT-2026-Turgut-Osman-Ramazan-Burak-Enes.git)
echo.
echo Eger GitHub Personal Access Token (PAT) kullaniyorsaniz:
echo   Username: ramaz4n
echo   Password: [Olusturdugunuz ghp_ ile baslayan Token]
echo.
echo ===================================================
echo Push islemi baslatiliyor...
echo.

"C:\Users\PC\PortableGit\bin\git.exe" push -u origin dev

echo.
if %ERRORLEVEL% EQU 0 (
    echo [BASARILI] dev branch'i GitHub'a basariyla yuklendi!
) else (
    echo [BILGI] Push basarisiz olduysa lutfen GitHub Token (PAT) kullanin:
    echo Token linki: https://github.com/settings/tokens/new
)
echo.
pause
