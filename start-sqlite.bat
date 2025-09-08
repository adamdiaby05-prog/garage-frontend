@echo off
echo ========================================
echo    Démarrage Garage avec SQLite
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
echo [2/3] Demarrage du serveur SQLite...
echo Serveur backend sur http://localhost:5000
start "Serveur SQLite" cmd /k "node server-sqlite.js"

echo.
echo [3/3] Attente du demarrage du serveur...
timeout /t 3 /nobreak > nul

echo.
echo [4/4] Demarrage du frontend...
echo Frontend sur http://localhost:3000
start "Frontend React" cmd /k "npm run start"

echo.
echo ========================================
echo    Application demarree avec SQLite!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo ✅ Plus besoin de MySQL!
echo 💾 Base de données SQLite en mémoire
echo 📝 Donnees de test incluses
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul
