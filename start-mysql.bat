@echo off
echo ========================================
echo    Démarrage Garage avec MySQL XAMPP
echo ========================================
echo.

echo [1/4] Vérification des dépendances...
if not exist "node_modules" (
    echo Installation des dépendances...
    npm install
) else (
    echo Dependances deja installees.
)

echo.
echo [2/4] Vérification de XAMPP...
echo Assurez-vous que XAMPP est démarré avec MySQL actif
echo phpMyAdmin: http://localhost/phpmyadmin
echo.

echo [3/4] Demarrage du serveur MySQL...
echo Serveur backend sur http://localhost:5000
start "Serveur MySQL" cmd /k "npm run server"

echo.
echo [4/4] Attente du demarrage du serveur...
timeout /t 5 /nobreak > nul

echo.
echo [5/5] Demarrage du frontend...
echo Frontend sur http://localhost:3000
start "Frontend React" cmd /k "npm run start"

echo.
echo ========================================
echo    Application demarree avec MySQL!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo ⚠️  IMPORTANT: Importez setup-mysql.sql dans phpMyAdmin
echo 📊 Base de données: garage_db
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul
