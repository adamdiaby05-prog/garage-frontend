@echo off
echo ========================================
echo    REDEMARRAGE RAPIDE - GARAGE ADMIN
echo ========================================
echo.

echo 🚨 Résolution de l'erreur 404...
echo.

echo 🔄 Arrêt des processus existants...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Processus Node.js arrêtés

echo.
echo 🔄 Vérification de XAMPP...
echo 💡 Assurez-vous que MySQL est démarré dans XAMPP

echo.
echo 🔧 Configuration de la base de données...
node setup-database.js

if errorlevel 1 (
    echo ❌ Erreur lors de la configuration de la base de données
    echo 💡 Vérifiez que MySQL est démarré
    pause
    exit /b 1
)

echo.
echo 🚀 Démarrage du serveur backend...
start "Backend Server" cmd /k "node server.js"

echo.
echo ⏳ Attente du démarrage du serveur...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Test de l'API...
curl -s http://localhost:5000/api/test >nul 2>&1
if errorlevel 1 (
    echo ⚠️ L'API n'est pas encore accessible, attendez quelques secondes
) else (
    echo ✅ API accessible !
)

echo.
echo 🌐 Démarrage du frontend...
start "Frontend" cmd /k "npm start"

echo.
echo ✅ Redémarrage terminé !
echo.
echo 📊 Accès à l'application :
echo    - Frontend : http://localhost:3000
echo    - Backend  : http://localhost:5000
echo    - API      : http://localhost:5000/api
echo.
echo 🔧 Si l'erreur 404 persiste, attendez 10 secondes et rechargez la page
echo.
pause 