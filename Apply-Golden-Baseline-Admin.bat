@echo off
title WinOptima 11 - Golden Baseline
cd /d "%~dp0"

:: Check for Administrator elevation
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator elevation...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell.exe -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%~dp0apply-golden-baseline.ps1\"\"' -Verb RunAs"
    exit /b
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apply-golden-baseline.ps1"
pause
