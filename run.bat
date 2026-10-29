@echo off
echo ========================================================
echo   Starting Laboratory Test Report Analyzer (MERN Stack)
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Backend API Server (Port 5000)...
start "Lab Analyzer - Backend API" cmd /k "cd server && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend Vite App (Port 3000)...
start "Lab Analyzer - Client UI" cmd /k "cd client && npm run dev"

echo.
echo ========================================================
echo Both servers have been launched!
echo Frontend UI : http://localhost:3000
echo Backend API : http://localhost:5000
echo ========================================================
echo.
pause
