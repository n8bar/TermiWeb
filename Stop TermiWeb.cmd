@echo off
setlocal
set "ROOT=%~dp0"
set "PS_EXE="

where pwsh.exe >nul 2>nul
if not errorlevel 1 set "PS_EXE=pwsh.exe"
if not defined PS_EXE set "PS_EXE=powershell.exe"

rem Hand the work to a hidden PowerShell and exit. Waiting here would leave this
rem launcher's own console on screen with nothing in it, because the elevated
rem child writes to a console of its own.
start "" "%PS_EXE%" -NoLogo -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%ROOT%scripts\stop-hidden.ps1"
endlocal & exit /b 0
