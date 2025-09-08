@echo off
echo ========================================
echo    GARAGE ADMIN - DEMARRAGE COMPLET
echo ========================================
echo.

echo 🔄 Vérification de Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé ou n'est pas dans le PATH
    echo 💡 Installez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js détecté

echo.
echo 🔄 Vérification de MySQL/XAMPP...
echo 💡 Assurez-vous que MySQL est démarré dans XAMPP

echo.
echo 🔧 Configuration de la base de données...
node setup-database.js

if errorlevel 1 (
    echo ❌ Erreur lors de la configuration de la base de données
    echo 💡 Vérifiez que MySQL est démarré et accessible
    pause
    exit /b 1
)

echo.
echo 🚀 Démarrage du serveur backend...
start "Backend Server" cmd /k "node server.js"

echo.
echo ⏳ Attente du démarrage du serveur...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Démarrage du frontend...
start "Frontend" cmd /k "npm start"

echo.
echo ✅ Application démarrée avec succès !
echo.
echo 📊 Accès à l'application :
echo    - Frontend : http://localhost:3000
echo    - Backend  : http://localhost:5000
echo    - API      : http://localhost:5000/api
echo.
echo 🔧 Pour arrêter l'application, fermez les fenêtres de commande
echo.
pause 