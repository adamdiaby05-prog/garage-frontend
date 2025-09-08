@echo off
echo ========================================
echo    Démarrage Garage avec MySQL Corrigé
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
echo [2/3] IMPORTANT: Exécutez d'abord fix-database.sql dans phpMyAdmin
echo.
echo Instructions:
echo 1. Ouvrez phpMyAdmin (http://localhost/phpmyadmin)
echo 2. Sélectionnez la base 'garage_db'
echo 3. Cliquez sur l'onglet 'SQL'
echo 4. Copiez-collez le contenu de 'fix-database.sql'
echo 5. Cliquez sur 'Exécuter'
echo.
echo [3/3] Démarrage du serveur MySQL...
echo Serveur backend sur http://localhost:5000
start "Serveur Backend MySQL" cmd /k "npm run server"
echo.
echo [4/4] Attente du démarrage du serveur...
timeout /t 5 /nobreak > nul
echo.
echo [5/5] Démarrage du frontend...
echo Frontend sur http://localhost:3000
start "Frontend React" cmd /k "npm run start"
echo.
echo ========================================
echo    Application démarrée avec succès!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo N'oubliez pas d'exécuter fix-database.sql dans phpMyAdmin !
echo.
pause




