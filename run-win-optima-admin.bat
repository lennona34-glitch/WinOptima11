@echo off
title WinOptima 11 (Administrator)
echo ========================================================
echo   WinOptima 11 - Windows 11 Optimization Suite (Admin)
echo ========================================================
echo.

:: Test for admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with elevated Administrator privileges.
) else (
    echo [ELEVATION] Requesting Administrator privileges...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~dpnx0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"
echo Starting backend optimization engine & Fluent UI...
npm run dev
pause
