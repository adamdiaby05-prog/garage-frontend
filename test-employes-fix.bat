@echo off
echo ========================================
echo    TEST - CORRECTION DES EMPLOYÉS
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
echo 🌐 Test de l'API employés...
echo 💡 Testez dans votre navigateur: http://localhost:5000/api/employes

echo.
echo 📱 Test de l'application...
echo 💡 Allez sur http://localhost:3000/employes et testez:
echo    1. Vérifiez que la liste des employés s'affiche
echo    2. Créez un nouvel employé avec statut "Actif"
echo    3. Vérifiez que le statut s'affiche correctement comme "Actif"
echo    4. Vérifiez que le poste s'affiche correctement

echo.
echo 🔧 Vérifications à faire:
echo    - Ouvrez la console du navigateur (F12)
echo    - Regardez s'il y a des erreurs ou avertissements
echo    - Vérifiez que le statut "Actif" s'affiche bien comme "Actif"
echo    - Vérifiez que le poste s'affiche correctement

echo.
echo 🎯 Résultats attendus:
echo    ✅ Plus d'erreur 400/500 sur l'API employés
echo    ✅ Statut "Actif" affiché correctement comme "Actif"
echo    ✅ Poste affiché correctement
echo    ✅ Création d'employés fonctionnelle

echo.
echo ✅ Test terminé !
echo.
pause 