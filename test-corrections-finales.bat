@echo off
echo ========================================
echo    TEST - CORRECTIONS FINALES
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
echo 🌐 Test des APIs...
echo 💡 Testez dans votre navigateur:
echo    - http://localhost:5000/api/vehicules
echo    - http://localhost:5000/api/reparations

echo.
echo 📱 Test de l'application...
echo 💡 Allez sur http://localhost:3000 et testez:
echo    1. Vérifiez que la page véhicules se charge sans warning React
echo    2. Vérifiez que la page réparations se charge sans erreur 500
echo    3. Créez un nouveau véhicule
echo    4. Créez une nouvelle réparation
echo    5. Vérifiez que tout fonctionne correctement

echo.
echo 🔧 Vérifications à faire:
echo    - Ouvrez la console du navigateur (F12)
echo    - Regardez s'il y a des warnings React (clés uniques)
echo    - Regardez s'il y a des erreurs 500
echo    - Vérifiez que toutes les pages se chargent

echo.
echo 🎯 Résultats attendus:
echo    ✅ Plus de warning React sur les clés uniques
echo    ✅ Plus d'erreur 500 sur l'API réparations
echo    ✅ Toutes les pages se chargent correctement
echo    ✅ Création de véhicules et réparations fonctionnelle

echo.
echo ✅ Test terminé !
echo.
pause 