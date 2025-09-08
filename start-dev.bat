@echo off
echo ========================================
echo    Démarrage de l'application Garage
echo ========================================
echo.

echo [1/3] Vérification des dépendances...
if not exist "node_modules" (
    echo Installation des dépendances...
    npm install
) else (
    echo Dependances deja installees.
)

echo.
echo [2/3] Demarrage du serveur backend...
echo Serveur backend sur http://localhost:5000
start "Serveur Backend" cmd /k "npm run server"

echo.
echo [3/3] Attente du demarrage du serveur...
timeout /t 5 /nobreak > nul

echo.
echo [4/4] Demarrage du frontend...
echo Frontend sur http://localhost:3000
start "Frontend React" cmd /k "npm run start"

echo.
echo ========================================
echo    Application demarree avec succes!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul
