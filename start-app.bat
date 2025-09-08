@echo off
echo ========================================
echo   DEMARRAGE GARAGE FRONTEND
echo   Version Robuste
echo ========================================
echo.

echo 1. Verification de XAMPP MySQL...
echo    - Assurez-vous que MySQL est demarre dans XAMPP
echo    - Verifiez que le port 3306 est disponible
echo.

echo 2. Arret des processus existants...
echo    - Liberation du port 5000
echo    - Arret des serveurs precedents
echo.

REM Arrêter les processus sur le port 5000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Arret du processus %%a...
    taskkill /PID %%a /F >nul 2>&1
)

echo 3. Test de la base de donnees...
node test-connection.js

echo.
echo 4. Demarrage du serveur backend...
echo    Le serveur va tenter de se connecter a MySQL...
echo    Si la connexion echoue, verifiez que MySQL est demarre dans XAMPP
echo.
start "Backend Server" cmd /k "npm run server"

echo 5. Attente de 5 secondes pour laisser le serveur demarrer...
timeout /t 5 /nobreak > nul

echo 6. Test de la connexion au serveur...
curl -s http://localhost:5000/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Serveur backend connecte
) else (
    echo    ⚠️ Serveur backend en cours de demarrage...
    timeout /t 3 /nobreak > nul
)

echo 7. Demarrage du frontend React...
echo    L'application sera disponible sur http://localhost:3000
echo.
start "Frontend React" cmd /k "npm start"

echo.
echo ========================================
echo   Application demarree !
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   phpMyAdmin: http://localhost/phpmyadmin
echo ========================================
echo.
echo Si vous avez des erreurs:
echo 1. Verifiez que XAMPP MySQL est demarre
echo 2. Double-cliquez sur fix-everything.bat pour recréer la base
echo 3. Relancez avec start-app.bat
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul 