@echo off
echo ========================================
echo   Initialisation Base de Donnees XAMPP
echo ========================================
echo.

echo 1. Verification de XAMPP MySQL...
echo    - Assurez-vous que XAMPP est installe et MySQL demarre
echo    - Ouvrez phpMyAdmin: http://localhost/phpmyadmin
echo.

echo 2. Creation de la base de donnees...
echo    - Connectez-vous a phpMyAdmin avec root (pas de mot de passe)
echo    - Cliquez sur "Nouvelle base de donnees"
echo    - Nom: garage_db
echo    - Interclassement: utf8mb4_unicode_ci
echo    - Cliquez sur "Creer"
echo.

echo 3. Import du schema SQL...
echo    - Selectionnez la base garage_db
echo    - Cliquez sur "Importer"
echo    - Choisissez le fichier: garage_db.sql
echo    - Cliquez sur "Executer"
echo.

echo 4. Verification de la connexion...
echo    - Le serveur va tester la connexion automatiquement
echo    - Si tout est OK, vous verrez "Connexion etablie avec succes"
echo.

echo ========================================
echo   Instructions terminees !
echo   Vous pouvez maintenant lancer start-xampp.bat
echo ========================================
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul 