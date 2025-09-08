@echo off
echo ========================================
echo    TEST SIMPLE DE LA BOUTIQUE
echo ========================================
echo.

echo [1/2] Test du frontend...
curl -s http://localhost:3002 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend: OK (port 3002)
) else (
    echo ❌ Frontend: ERREUR
)

echo [2/2] Test du backend...
curl -s http://localhost:5000/api/test >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend: OK (port 5000)
) else (
    echo ❌ Backend: ERREUR
)

echo.
echo ========================================
echo    RESULTATS DES TESTS
echo ========================================
echo.
echo URLs d'acces:
echo - Frontend:  http://localhost:3002
echo - Backend:   http://localhost:5000
echo - Boutique:  http://localhost:3002/boutique-client
echo.
echo Si les tests sont OK, ouvrez la boutique dans votre navigateur !
echo.
pause
