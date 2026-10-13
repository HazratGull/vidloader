@echo off
title Install VidLoader Desktop Shortcut
cd /d "%~dp0"

echo ============================================================
echo   CREATING VIDLOADER DESKTOP SHORTCUT FOR WINDOWS PC
echo ============================================================
echo.

node create-shortcut.cjs

echo.
pause
