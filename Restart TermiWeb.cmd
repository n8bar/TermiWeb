@echo off
setlocal
set "ROOT=%~dp0"
set "PS_EXE="

where pwsh.exe >nul 2>nul
if not errorlevel 1 set "PS_EXE=pwsh.exe"
if not defined PS_EXE set "PS_EXE=powershell.exe"

"%PS_EXE%" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%ROOT%scripts\start-hidden.ps1" -Restart
set "EXITCODE=%ERRORLEVEL%"
endlocal & exit /b %EXITCODE%
