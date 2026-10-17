@echo off
echo ===================================================
echo   Bozok 66 Super Uygulama Baslatiliyor...
echo ===================================================

echo [1/2] Backend (FastAPI) baslatiliyor...
start "Backend (FastAPI)" cmd /k "cd backend && python -m venv venv && call .\venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [2/3] Frontend (Expo) baslatiliyor...
start "Frontend (Expo)" cmd /k "cd frontend && npm install && npm start"

echo [3/3] Appsmith / ToolJet Admin Paneli aciliyor...
start "" "%~dp0admin-panel\web-dashboard\index.html"

echo.
echo Backend, Frontend ve Admin Paneli baslatildi!
echo Ana pencereyi kapatabilirsiniz.
