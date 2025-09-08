@echo off
echo ========================================
echo    TEST - STATUT DES EMPLOYÉS
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
echo    1. Créez un nouvel employé avec statut "Actif"
echo    2. Vérifiez que le statut s'affiche comme "Actif"
echo    3. Créez un autre employé avec statut "Inactif"
echo    4. Vérifiez que le statut s'affiche comme "Inactif"

echo.
echo 🔧 Vérifications à faire:
echo    - Ouvrez la console du navigateur (F12)
echo    - Regardez les logs du serveur (terminal où node server.js tourne)
echo    - Vérifiez que le statut correspond à ce qui est sélectionné

echo.
echo 🎯 Résultats attendus:
echo    ✅ Statut "Actif" sélectionné → Affiché comme "Actif"
echo    ✅ Statut "Inactif" sélectionné → Affiché comme "Inactif"
echo    ✅ Plus d'incohérence entre formulaire et affichage

echo.
echo ✅ Test terminé !
echo.
pause 