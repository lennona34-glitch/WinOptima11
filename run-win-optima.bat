@echo off
title WinOptima 11 - Launcher
echo ========================================================
echo   WinOptima 11 - Windows 11 Optimization Suite
echo ========================================================
echo.
echo Starting backend optimization engine & Fluent UI...
cd /d "%~dp0"
npm run dev
pause
