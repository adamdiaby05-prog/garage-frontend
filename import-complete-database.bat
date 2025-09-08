@echo off
echo ========================================
echo   IMPORT BASE DE DONNÉES COMPLÈTE
echo   Garage Management System v2.0
echo ========================================
echo.

echo 1. Vérification de XAMPP MySQL...
echo    - Assurez-vous que MySQL est démarré dans XAMPP
echo    - Vérifiez que le port 3306 est disponible
echo.

echo 2. Instructions d'importation:
echo.
echo    OPTION A - Via phpMyAdmin (Recommandé):
echo    1. Ouvrez http://localhost/phpmyadmin
echo    2. Cliquez sur "Importer" dans le menu
echo    3. Cliquez sur "Choisir un fichier"
echo    4. Sélectionnez le fichier "garage_complete.sql"
echo    5. Cliquez sur "Exécuter"
echo.
echo    OPTION B - Via ligne de commande:
echo    1. Ouvrez un terminal MySQL
echo    2. Exécutez: source garage_complete.sql
echo.

echo 3. Vérification après import:
echo    - La base "garage_db" doit être créée
echo    - 9 tables principales doivent être présentes
echo    - Des données de test doivent être insérées
echo    - 4 vues doivent être créées
echo    - 3 triggers doivent être créés
echo    - 3 procédures stockées doivent être créées
echo    - 2 fonctions doivent être créées
echo.

echo 4. Test de la base de données:
echo    - Exécutez: node test-connection.js
echo    - Vérifiez que toutes les tables sont présentes
echo.

echo ========================================
echo   FICHIERS DISPONIBLES:
echo   - garage_complete.sql (Base complète)
echo   - garage_db.sql (Base originale)
echo   - fix-all-tables-complete.sql (Corrections)
echo ========================================
echo.

echo 5. Après l'import, vous pouvez:
echo    - Démarrer l'application avec start-app.bat
echo    - Tester l'API avec test-api.js
echo    - Vérifier les données dans phpMyAdmin
echo.

echo Appuyez sur une touche pour ouvrir phpMyAdmin...
pause > nul

echo Ouverture de phpMyAdmin...
start http://localhost/phpmyadmin

echo.
echo ========================================
echo   IMPORT TERMINÉ !
echo   Base de données prête à l'utilisation
echo ========================================
echo.
echo Appuyez sur une touche pour fermer...
pause > nul 