@echo off
title VidLoader Desktop App Launcher
cd /d "%~dp0"

echo ============================================================
echo   VIDLOADER - PC DESKTOP APP LAUNCHER
echo ============================================================
echo.

:: 1. Check if VidLoader server is already running on port 5173
powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) | Measure-Object | ForEach-Object { if ($_.Count -gt 0) { exit 0 } else { exit 1 } }" >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] VidLoader server is already running on port 5173.
) else (
    echo [*] Starting VidLoader background service...
    start /min "" cmd /c "npm.cmd run dev"
    echo [*] Waiting for server to initialize...
    
    :: Wait up to 12 seconds for the server to respond
    powershell -NoProfile -Command "for ($i = 0; $i -lt 12; $i++) { Start-Sleep -Seconds 1; try { $res = Invoke-WebRequest -Uri 'http://localhost:5173/' -UseBasicParsing -TimeoutSec 1; if ($res.StatusCode -eq 200) { exit 0 } } catch {} }; exit 1" >nul 2>&1
)

echo [OK] VidLoader is ready. Launching desktop window...

:: 2. Find Microsoft Edge or Google Chrome to launch in standalone App Window mode
set BROWSER_FOUND=0

:: Check for Microsoft Edge
where msedge >nul 2>&1
if %errorlevel% equ 0 (
    start "" msedge --app=http://localhost:5173/ --window-size=1280,820
    set BROWSER_FOUND=1
    goto :done
)

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:5173/ --window-size=1280,820
    set BROWSER_FOUND=1
    goto :done
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:5173/ --window-size=1280,820
    set BROWSER_FOUND=1
    goto :done
)

:: Check for Google Chrome
where chrome >nul 2>&1
if %errorlevel% equ 0 (
    start "" chrome --app=http://localhost:5173/ --window-size=1280,820
    set BROWSER_FOUND=1
    goto :done
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:5173/ --window-size=1280,820
    set BROWSER_FOUND=1
    goto :done
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app=http://localhost:5173/ --window-size=1280,820
    set BROWSER_FOUND=1
    goto :done
)

:: Fallback to default browser
start "" "http://localhost:5173/"

:done
exit /b 0
