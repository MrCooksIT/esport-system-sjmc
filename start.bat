@echo off
title Esport System
cd /d "%~dp0"

echo Starting Esport System...
start "Esport Dev Server" cmd /k "npm run dev"

echo Waiting for server to be ready...
:wait
timeout /t 2 /nobreak >nul
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 goto wait

echo Opening browser...
start http://localhost:3000
