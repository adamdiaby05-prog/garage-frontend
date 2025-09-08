@echo off
echo ========================================
echo    TEST FINAL - VÉRIFICATION COMPLÈTE
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
echo 🌐 Test de l'API test...
echo 💡 Testez dans votre navigateur: http://localhost:5000/api/test

echo.
echo 🌐 Test de l'API clients...
echo 💡 Testez dans votre navigateur: http://localhost:5000/api/clients

echo.
echo 🌐 Test de l'API employés...
echo 💡 Testez dans votre navigateur: http://localhost:5000/api/employes

echo.
echo 📱 Test de l'application...
echo 💡 Allez sur http://localhost:3000 et testez:
echo    1. Page Clients - Vérifiez qu'il n'y a plus d'avertissement "unique key prop"
echo    2. Page Employés - Testez la création d'un employé (plus d'erreur 400/500)
echo    3. Vérifiez que les listes s'affichent correctement

echo.
echo 🔧 Vérifications à faire:
echo    - Ouvrez la console du navigateur (F12)
echo    - Regardez s'il y a des erreurs ou avertissements
echo    - Vérifiez que les listes s'affichent correctement
echo    - Testez la création d'employés et de clients

echo.
echo 🎯 Résultats attendus:
echo    ✅ Plus d'avertissement "unique key prop"
echo    ✅ Plus d'erreur 400/500 sur l'API employés
echo    ✅ Création d'employés fonctionnelle
echo    ✅ Création de clients fonctionnelle

echo.
echo ✅ Test terminé !
echo.
pause 