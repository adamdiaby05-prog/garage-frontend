@echo off
echo ========================================
echo   TEST RAPIDE GARAGE FRONTEND
echo ========================================
echo.

echo 1. Test de la connexion MySQL...
node test-connection.js

echo.
echo 2. Test des endpoints API...
node test-all-endpoints.js

echo.
echo ========================================
echo   Test termine !
echo ========================================
echo.
echo Appuyez sur une touche pour fermer...
pause > nul 