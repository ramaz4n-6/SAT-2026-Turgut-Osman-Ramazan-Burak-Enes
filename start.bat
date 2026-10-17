@echo off
echo ===================================================
echo   Bozok 66 Super Uygulama Baslatiliyor...
echo ===================================================

echo [1/2] Backend (FastAPI) baslatiliyor...
start "Backend (FastAPI)" cmd /k "cd backend && python -m venv venv && call .\venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo [2/2] Frontend (Expo) baslatiliyor...
start "Frontend (Expo)" cmd /k "cd frontend && npm install && npm start"

echo.
echo Her iki servis de ayri pencerelerde baslatildi!
echo Ana pencereyi kapatabilirsiniz.
