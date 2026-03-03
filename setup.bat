@echo off
REM ============================================================
REM  Surgical Procedure Listing App - Setup Script
REM  Automates the backend and frontend setup process
REM ============================================================

echo.
echo  ======================================================
echo    Surgical Procedure Listing App - Setup Script
echo  ======================================================
echo.

set "PROJECT_DIR=%~dp0"

echo [1/7] Installing Backend Dependencies...
cd /d "%PROJECT_DIR%backend"
call composer install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies.
    pause
    exit /b %errorlevel%
)
echo.

echo [2/7] Setting up Environment File...
if not exist .env (
    copy .env.example .env
    echo .env created. 
    echo PLEASE NOTE: You must configure WHO_API_CLIENT_ID and WHO_API_CLIENT_SECRET in backend/.env
) else (
    echo .env already exists.
)
echo.

echo [3/7] Generating Application Key...
call php artisan key:generate
echo.

echo [4/7] Running Migrations and Seeding Database...
echo Make sure your database connection in .env is configured correctly before continuing.
pause
call php artisan migrate --seed
if %errorlevel% neq 0 (
    echo Error running migrations and seeders.
    pause
    exit /b %errorlevel%
)
echo.

echo [5/7] Normalizing and Enriching Codes...
call php artisan procedures:normalize-codes --enrich
echo.

echo [6/7] Verifying Mappings...
call php artisan procedures:verify-mappings --delay=150
echo.

echo [7/7] Installing Frontend Dependencies...
cd /d "%PROJECT_DIR%frontend"
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies.
    pause
    exit /b %errorlevel%
)
echo.

cd /d "%PROJECT_DIR%"

echo  ======================================================
echo    Setup Complete!
echo  ======================================================
echo.
echo  Next steps:
echo  1. Configure WHO API credentials in backend/.env if you haven't already.
echo  2. Run the application using: start_dev.bat
echo.
pause
