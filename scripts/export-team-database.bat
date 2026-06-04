@echo off
REM Export current nikayPastry DB for teammates. Edit MYSQL and PORT if needed.
set MYSQLDUMP=C:\xampp\mysql\bin\mysqldump
set HOST=127.0.0.1
set PORT=3307
set USER=root
set DB=nikayPastry
set OUT=%~dp0..\server\database\team_data\nikayPastry.sql

"%MYSQLDUMP%" -h %HOST% -P %PORT% -u %USER% %DB% > "%OUT%"

if %ERRORLEVEL% EQU 0 (
  echo Exported to %OUT%
  echo Commit nikayPastry.sql and any new files in server/storage/app/public/products/
) else (
  echo Export failed.
)
pause
