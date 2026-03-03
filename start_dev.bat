@echo off
REM ============================================================
REM  Surgical Procedure Listing App — Development Server Launcher
REM  Starts the backend API and frontend dev server in separate
REM  terminal windows.
REM ============================================================

REM Set console to UTF-8 to display box-drawing characters correctly
chcp 65001 >nul

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║   Surgical Procedure Listing App — Dev Launcher      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

REM Get the directory where this script lives
set "PROJECT_DIR=%~dp0"

REM ── Backend API Server ──
echo  [1/2] Starting Laravel API server (port 8085)...
start "Backend API — Laravel (port 8085)" cmd /k "cd /d %PROJECT_DIR%backend && php artisan serve --port=8085"

REM Small delay to let backend start first
REM Using explicit Windows timeout to avoid conflict with Git Bash's GNU timeout
%SystemRoot%\System32\timeout.exe /t 2 /nobreak >nul

REM ── Frontend Dev Server ──
echo  [2/2] Starting Vite dev server...
start "Frontend — Vite React (port 5173)" cmd /k "cd /d %PROJECT_DIR%frontend && npm run dev -- --host"

echo.
echo  ✓ Both servers are starting in separate windows.
echo.
echo  Backend API:  http://127.0.0.1:8085
echo  Frontend:     http://localhost:5173
echo.
echo  Close the terminal windows to stop the servers.
echo.
pause
