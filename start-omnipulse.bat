@echo off
title OmniPulse AI - Platform Launcher
echo ========================================================
echo        OmniPulse AI - Full-Stack CX Platform
echo ========================================================
echo.

set PATH=C:\Users\faree\AppData\Local\Programs\nodejs;C:\Users\faree\AppData\Roaming\npm;%~dp0node_modules\.bin;%PATH%
cd /d "%~dp0"

echo [1/3] Checking Node.js installation...
node -v
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not recognized. Please install Node.js v18+.
    pause
    exit /b 1
)

echo.
echo [2/3] Starting OmniPulse Backend on port 5001...
start "OmniPulse Backend API (:5001)" cmd /k "cd server && node server.js"

echo.
echo [3/3] Starting OmniPulse React Client on port 5173...
start "OmniPulse React Client (:5173)" cmd /k "cd client && npm run dev"

echo.
echo ========================================================
echo   OmniPulse AI is launching!
echo   - Backend API:  http://localhost:5001/api/health
echo   - Frontend App: http://localhost:5173
echo.
echo   Demo Accounts (Pre-configured):
echo   - Support Agent: agent@omnipulse.ai / password123
echo   - Customer:      alex.rivera@techcorp.io / password123
echo   - Customer:      elena@novaworks.com / password123
echo ========================================================
echo.
timeout /t 3 /nobreak > nul
start http://localhost:5173/login
pause
