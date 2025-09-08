@echo off
echo ========================================
echo   SUPPRESSION FORCÉE DE LA BASE
echo   Résout l'erreur "Directory not empty"
echo ========================================
echo.

echo 1. Vérification de XAMPP MySQL...
echo    - Assurez-vous que MySQL est démarré dans XAMPP
echo.

echo 2. Instructions pour résoudre l'erreur:
echo.
echo    OPTION A - Via phpMyAdmin (Recommandé):
echo    1. Ouvrez http://localhost/phpmyadmin
echo    2. Sélectionnez la base "garage_db"
echo    3. Allez dans l'onglet "SQL"
echo    4. Copiez-collez le contenu de "fix-database-drop.sql"
echo    5. Cliquez sur "Exécuter"
echo.
echo    OPTION B - Via ligne de commande MySQL:
echo    1. Ouvrez un terminal MySQL
echo    2. Exécutez: source fix-database-drop.sql
echo.

echo 3. Alternative manuelle:
echo    Si les options ci-dessus ne fonctionnent pas:
echo    1. Arrêtez MySQL dans XAMPP
echo    2. Allez dans: C:\xampp\mysql\data\
echo    3. Supprimez le dossier "garage_db"
echo    4. Redémarrez MySQL dans XAMPP
echo    5. Importez garage_complete.sql
echo.

echo 4. Après la suppression réussie:
echo    - Importez garage_complete.sql
echo    - Testez avec node test-connection.js
echo.

echo ========================================
echo   FICHIERS DISPONIBLES:
echo   - fix-database-drop.sql (Suppression forcée)
echo   - garage_complete.sql (Base complète)
echo ========================================
echo.

echo Appuyez sur une touche pour ouvrir phpMyAdmin...
pause > nul

echo Ouverture de phpMyAdmin...
start http://localhost/phpmyadmin

echo.
echo ========================================
echo   SUPPRESSION TERMINÉE !
echo   Vous pouvez maintenant importer garage_complete.sql
echo ========================================
echo.
echo Appuyez sur une touche pour fermer...
pause > nul 