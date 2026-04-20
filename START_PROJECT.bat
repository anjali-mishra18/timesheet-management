@echo off
TITLE Timesheet Management System - Launcher
COLOR 0B

echo ======================================================
echo    TIMESHEET MANAGEMENT SYSTEM - QUICK LAUNCHER
echo ======================================================
echo.

:: 1. Identify Dotnet Path
set DOTNET_PATH=dotnet
if exist "local-dotnet\dotnet.exe" (
    echo [INFO] Using local-dotnet instance...
    set DOTNET_PATH="%~dp0local-dotnet\dotnet.exe"
) else (
    echo [INFO] Using system dotnet...
)

:: 2. Setup Backend
echo.
echo [1/2] Preparing Backend...
cd backend
start "BACKEND SERVER" cmd /c "%DOTNET_PATH% run"
cd ..

:: 3. Setup Frontend
echo.
echo [2/2] Preparing Frontend...
cd frontend
if not exist "node_modules\" (
    echo [INFO] node_modules not found. Installing dependencies (this may take a few minutes)...
    call npm install
)

echo [INFO] Starting Frontend Portal...
start "FRONTEND PORTAL" cmd /c "npm start"
cd ..

echo.
echo ======================================================
echo    SUCCESS: BOTH SYSTEMS ARE LAUNCHING!
echo ======================================================
echo.
echo 	BACKEND: http://localhost:5254 (Running in separate window)
echo 	FRONTEND: http://localhost:4200 (Opening in separate window)
echo.
echo Press any key to close this launcher (the apps will keep running).
pause > nul
