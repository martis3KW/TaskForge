@echo off
echo ================================
echo   Starting TaskForge Backend
echo ================================
cd /d "%~dp0server"
npm run dev
pause
