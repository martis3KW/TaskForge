@echo off
echo ================================
echo   Starting TaskForge Frontend
echo ================================
cd /d "%~dp0client"
npm run dev
pause
