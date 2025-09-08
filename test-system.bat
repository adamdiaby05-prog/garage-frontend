@echo off
echo ========================================
echo    TEST DU SYSTEME COMPLET
echo ========================================
echo.

echo [1/3] Test du serveur backend...
curl -s http://localhost:5000/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend: OK (port 5000)
) else (
    echo ❌ Backend: ERREUR
)

echo [2/3] Test de l'API des factures...
curl -s http://localhost:5000/api/factures >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API Factures: OK
) else (
    echo ❌ API Factures: ERREUR
)

echo [3/3] Test du frontend...
curl -s http://localhost:3002 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend: OK (port 3002)
) else (
    echo ❌ Frontend: ERREUR
)

echo.
echo ========================================
echo    RESULTATS DES TESTS
echo ========================================
echo.
echo Si tous les tests sont OK, votre systeme fonctionne parfaitement !
echo.
echo URLs d'acces:
echo - Backend:  http://localhost:5000
echo - Frontend: http://localhost:3002
echo - API:      http://localhost:5000/api
echo.
pause
