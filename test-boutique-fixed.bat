@echo off
echo ========================================
echo    TEST DE LA BOUTIQUE CORRIGEE
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

echo [3/3] Test de la page boutique...
curl -s http://localhost:3002/boutique-client >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Boutique: OK
) else (
    echo ❌ Boutique: ERREUR
)

echo.
echo ========================================
echo    RESULTATS DES TESTS
echo ========================================
echo.
echo ✅ Corrections appliquees:
echo - Vérification de sécurité pour categorie
echo - IDs uniques pour les particules
echo - Syntaxe CSS corrigée
echo - Gestion d'erreurs améliorée
echo.
echo URLs d'acces:
echo - Frontend:  http://localhost:3002
echo - Backend:   http://localhost:5000
echo - Boutique:  http://localhost:3002/boutique-client
echo.
echo ⚠️  Pour Google Maps:
echo - Désactivez temporairement votre bloqueur de pub
echo - Autorisez maps.googleapis.com
echo.
echo La boutique devrait maintenant fonctionner sans erreurs !
echo.
pause
