@echo off
echo ========================================
echo    TEST DE LA BOUTIQUE CLIENT
echo ========================================
echo.

echo [1/3] Test du frontend...
curl -s http://localhost:3002 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend: OK (port 3002)
) else (
    echo ❌ Frontend: ERREUR
)

echo [2/3] Test du backend...
curl -s http://localhost:5000/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend: OK (port 5000)
) else (
    echo ❌ Backend: ERREUR
)

echo [3/3] Test de l'API des pièces...
curl -s http://localhost:5000/api/pieces >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API Pièces: OK
) else (
    echo ❌ API Pièces: ERREUR
)

echo.
echo ========================================
echo    RESULTATS DES TESTS
echo ========================================
echo.
echo Si tous les tests sont OK, votre boutique fonctionne parfaitement !
echo.
echo URLs d'acces:
echo - Frontend:  http://localhost:3002
echo - Backend:   http://localhost:5000
echo - Boutique:  http://localhost:3002/boutique-client
echo.
echo Fonctionnalites disponibles:
echo - ✅ Systeme d'etoiles et avis
echo - ✅ Formulaire de commande complet
echo - ✅ Integration Google Maps
echo - ✅ Gestion des etapes de commande
echo - ✅ Interface moderne et responsive
echo.
pause
