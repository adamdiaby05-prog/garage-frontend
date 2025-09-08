@echo off
echo ========================================
echo   Demarrage Garage Frontend avec XAMPP
echo ========================================
echo.

echo 1. Verification de XAMPP MySQL...
echo    - Assurez-vous que XAMPP est installe
echo    - Demarrez MySQL dans le panneau XAMPP
echo    - Verifiez que le port 3306 est disponible
echo.

echo 2. Installation des dependances...
call npm install
echo.

echo 3. Demarrage du serveur backend...
echo    Le serveur va tenter de se connecter a MySQL...
echo    Si la connexion echoue, verifiez que MySQL est demarre dans XAMPP
echo.
start "Backend Server" cmd /k "npm run server"

echo 4. Attente de 3 secondes pour laisser le serveur demarrer...
timeout /t 3 /nobreak > nul

echo 5. Demarrage du frontend React...
echo    L'application sera disponible sur http://localhost:3000
echo.
start "Frontend React" cmd /k "npm start"

echo.
echo ========================================
echo   Application demarree !
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo ========================================
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul 