@echo off
echo ========================================
echo    CONFIGURATION BASE DE DONNEES
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
echo 🔄 Installation des dépendances...
npm install mysql2 dotenv

echo.
echo 🔧 Configuration de la base de données...
node setup-database.js

echo.
echo ✅ Configuration terminée !
echo.
echo 🚀 Pour démarrer l'application :
echo    - Frontend : npm start
echo    - Backend  : node server.js
echo.
pause 