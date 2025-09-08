@echo off
echo ========================================
echo    TEST - CORRECTION DES CLÉS CLIENTS
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
echo    1. Ouvrez la page Clients
echo    2. Vérifiez qu'il n'y a plus d'avertissement "unique key prop"
echo    3. Vérifiez que la liste s'affiche correctement
echo    4. Testez la création d'un client

echo.
echo 🔧 Vérifications à faire:
echo    - Ouvrez la console du navigateur (F12)
echo    - Regardez s'il y a des erreurs ou avertissements
echo    - Vérifiez que la liste des clients s'affiche
echo    - Testez la création d'un nouveau client

echo.
echo ✅ Test terminé !
echo.
pause 