@echo off
echo ========================================
echo   DEMARRAGE SERVEUR DE TEST
echo   Version avec gestion d'erreurs
echo ========================================
echo.

echo 1. Arret des processus existants...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Arret du processus %%a...
    taskkill /PID %%a /F >nul 2>&1
)

echo 2. Test de la connexion MySQL...
node test-connection.js

echo.
echo 3. Demarrage du serveur de test...
echo    Ce serveur fonctionne meme sans tables
echo    Il retourne des valeurs par defaut
echo.
start "Test Server" cmd /k "node server-test.js"

echo 4. Attente de 3 secondes...
timeout /t 3 /nobreak > nul

echo 5. Test de la connexion au serveur...
curl -s http://localhost:5000/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Serveur de test connecte
    echo    🌐 Test: http://localhost:5000/api/test
) else (
    echo    ⚠️ Serveur en cours de demarrage...
)

echo.
echo ========================================
echo   Serveur de test demarre !
echo   API: http://localhost:5000/api
echo   Test: http://localhost:5000/api/test
echo ========================================
echo.
echo Maintenant vous pouvez:
echo 1. Ouvrir http://localhost:3000 (frontend)
echo 2. Ou recréer la base de données avec fix-everything.bat
echo.
echo Appuyez sur une touche pour fermer...
pause > nul 