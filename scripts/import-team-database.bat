@echo off
REM Import shared team database (Windows + XAMPP). Edit MYSQL and PORT if needed.
set MYSQL=C:\xampp\mysql\bin\mysql
set HOST=127.0.0.1
set PORT=3307
set USER=root
set DB=nikayPastry
set DUMP=%~dp0..\server\database\team_data\nikayPastry.sql

echo Creating database if missing...
"%MYSQL%" -h %HOST% -P %PORT% -u %USER% -e "CREATE DATABASE IF NOT EXISTS %DB% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo Importing %DUMP% ...
"%MYSQL%" -h %HOST% -P %PORT% -u %USER% %DB% < "%DUMP%"

if %ERRORLEVEL% EQU 0 (
  echo Done. Run: cd server ^&^& php artisan storage:link
) else (
  echo Import failed. Check MySQL is running and PORT/USER in this script.
)
pause
