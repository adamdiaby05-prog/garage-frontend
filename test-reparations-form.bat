@echo off
echo ========================================
echo    TEST - FORMULAIRE RÉPARATIONS
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
echo    - http://localhost:5000/api/clients
echo    - http://localhost:5000/api/vehicules
echo    - http://localhost:5000/api/employes
echo    - http://localhost:5000/api/reparations

echo.
echo 📱 Test du formulaire de réparations...
echo 💡 Allez sur http://localhost:3000/reparations et testez:
echo    1. Cliquez sur "Nouvelle Réparation"
echo    2. Sélectionnez un client dans la liste déroulante
echo    3. Vérifiez que les véhicules de ce client s'affichent
echo    4. Sélectionnez un véhicule
echo    5. Sélectionnez un mécanicien (optionnel)
echo    6. Remplissez le problème signalé
echo    7. Cliquez sur "Créer"
echo    8. Vérifiez que la réparation est créée

echo.
echo 🔧 Vérifications à faire:
echo    - Les véhicules s'affichent bien quand vous sélectionnez un client
echo    - Le formulaire se soumet sans erreur
echo    - La réparation apparaît dans la liste
echo    - Pas d'erreurs dans la console du navigateur

echo.
echo 🎯 Résultats attendus:
echo    ✅ Sélection client → Affichage des véhicules correspondants
echo    ✅ Formulaire fonctionnel sans erreur
echo    ✅ Création de réparation réussie
echo    ✅ Affichage correct dans la liste

echo.
echo ✅ Test terminé !
echo.
pause 