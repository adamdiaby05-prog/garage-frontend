@echo off
echo ========================================
echo    TEST RAPIDE DE L'API
echo ========================================
echo.

echo 🔍 Vérification du port 5000...
netstat -ano | findstr :5000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Port 5000 libre - Serveur non démarré
    echo 💡 Démarrez le serveur avec: node server.js
    pause
    exit /b 1
)

echo ✅ Port 5000 utilisé - Serveur probablement démarré

echo.
echo 🌐 Test de l'API...
echo 💡 Ouvrez votre navigateur sur: http://localhost:5000/api/test

echo.
echo 📱 Test de création d'un client...
echo 💡 Allez sur votre application et essayez de créer un client

echo.
echo ✅ Test terminé !
echo.
pause 