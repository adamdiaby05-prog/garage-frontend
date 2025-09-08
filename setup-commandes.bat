@echo off
echo ========================================
echo Configuration des commandes boutique
echo ========================================

echo.
echo 1. Creation de la table commandes_boutique...
mysql -u root -p garage_db < create-commandes-table.sql
if %errorlevel% neq 0 (
    echo ERREUR: Impossible de creer la table commandes_boutique
    echo Verifiez que MySQL est demarre et que la base garage_db existe
    pause
    exit /b 1
)

echo.
echo 2. Table commandes_boutique creee avec succes!
echo.
echo 3. Redemarrage des services...

echo Arret des services existants...
taskkill /f /im node.exe 2>nul

echo Demarrage du serveur backend...
start "Backend Server" cmd /k "node server.js"

echo Attente du demarrage du serveur...
timeout /t 3 /nobreak >nul

echo Demarrage du frontend...
start "Frontend React" cmd /k "npm start"

echo.
echo ========================================
echo Configuration terminee!
echo ========================================
echo.
echo Les services sont en cours de demarrage...
echo - Backend: http://localhost:5000
echo - Frontend: http://localhost:3002
echo - Page commandes: http://localhost:3002/commandes
echo.
echo Vous pouvez maintenant:
echo 1. Passer des commandes sur http://localhost:3002/boutique-client
echo 2. Les voir sur http://localhost:3002/commandes
echo.
pause
