@echo off
echo ========================================
echo    DEMARRAGE DU SYSTEME COMPLET
echo ========================================
echo.

echo [1/3] Arret des processus Node.js existants...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Demarrage du serveur backend sur le port 5000...
start "Backend Server" cmd /k "node server.js"

echo [3/3] Attente du demarrage du backend...
timeout /t 5 /nobreak >nul

echo [4/4] Demarrage du frontend React sur le port 3002...
start "Frontend React" cmd /k "npm start"

echo.
echo ========================================
echo    SYSTEME DEMARRE AVEC SUCCES !
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3002
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul
