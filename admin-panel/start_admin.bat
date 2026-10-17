@echo off
chcp 65001 > nul
echo ===================================================
echo   Bozok 66 - Appsmith & ToolJet Admin Paneli
echo ===================================================
echo.
echo [1/2] Tarayicida Admin Paneli Aciliyor...
start "" "%~dp0web-dashboard\index.html"
echo.
echo [2/2] FastAPI Sunucusu Kontrol Ediliyor...
echo Eger FastAPI henuz acik degilse ana klasordeki start.bat dosyasini calistirabilirsiniz.
echo API Adresi: http://localhost:8000/api/admin
echo Swagger Dokumantasyonu: http://localhost:8000/docs
echo.
pause
