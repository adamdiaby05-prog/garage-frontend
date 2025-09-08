@echo off
echo ========================================
echo    ARRET DE TOUS LES SERVICES
echo ========================================
echo.

echo Arret de tous les processus Node.js...
taskkill /f /im node.exe >nul 2>&1

echo.
echo Services arretes avec succes !
echo.
pause
