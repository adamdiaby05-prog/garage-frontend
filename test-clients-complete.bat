@echo off
echo ========================================
echo    TEST COMPLET - GESTION CLIENTS
echo ========================================
echo.

echo 🔍 Vérification du serveur backend...
netstat -ano | findstr :5000 >nul 2>&1
if errorlevel 1 (
    echo ❌ Port 5000 libre - Serveur non démarré
    echo 💡 Démarrez le serveur avec: node server.js
    pause
    exit /b 1
)

echo ✅ Port 5000 utilisé - Serveur démarré

echo.
echo 🌐 Test de l'API clients...
echo 💡 Testez dans votre navigateur: http://localhost:5000/api/clients

echo.
echo 📱 Test de l'application...
echo 💡 Allez sur http://localhost:3000 et testez:
echo    1. Affichage de la liste des clients
echo    2. Création d'un nouveau client
echo    3. Modification d'un client existant
echo    4. Suppression d'un client

echo.
echo ✅ Test terminé !
echo.
echo 🔧 Si vous avez des erreurs:
echo    - Vérifiez que le serveur backend fonctionne
echo    - Vérifiez que la base de données est configurée
echo    - Vérifiez la console du navigateur (F12)
echo.
pause 