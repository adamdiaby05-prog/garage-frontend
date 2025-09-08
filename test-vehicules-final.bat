@echo off
echo ========================================
echo    TEST FINAL - VÉHICULES
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
echo 🌐 Test de l'API véhicules...
echo 💡 Testez dans votre navigateur: http://localhost:5000/api/vehicules

echo.
echo 📱 Test de l'application...
echo 💡 Allez sur http://localhost:3000/vehicules et testez:
echo    1. Vérifiez que la page se charge sans erreur de compilation
echo    2. Vérifiez que la liste des véhicules s'affiche
echo    3. Créez un nouveau véhicule avec tous les champs
echo    4. Vérifiez que la création fonctionne sans erreur 500
echo    5. Vérifiez que les données s'affichent correctement

echo.
echo 🔧 Vérifications à faire:
echo    - Ouvrez la console du navigateur (F12)
echo    - Regardez s'il y a des erreurs de compilation
echo    - Vérifiez que la création de véhicules fonctionne
echo    - Vérifiez que les champs correspondent à la base de données

echo.
echo 🎯 Résultats attendus:
echo    ✅ Plus d'erreur de compilation
echo    ✅ Plus d'erreur 500 sur l'API véhicules
echo    ✅ Création de véhicules fonctionnelle
echo    ✅ Affichage correct des données
echo    ✅ Champs alignés avec la base de données

echo.
echo ✅ Test terminé !
echo.
pause 