@echo off
echo ========================================
echo   RÉSOLUTION ERREUR TABLESPACE
echo   "Tablespace for table exists"
echo ========================================
echo.

echo ERREUR DÉTECTÉE:
echo Les fichiers de tablespace existent encore dans MySQL
echo Cela empêche la création des nouvelles tables
echo.

echo SOLUTIONS DISPONIBLES:
echo.

echo OPTION 1 - Via phpMyAdmin (Recommandé):
echo 1. Ouvrez http://localhost/phpmyadmin
echo 2. Sélectionnez la base "garage_db"
echo 3. Allez dans l'onglet "SQL"
echo 4. Copiez-collez le contenu de "fix-tablespace-error.sql"
echo 5. Cliquez sur "Exécuter"
echo 6. Puis importez "garage_complete_no_drop.sql"
echo.

echo OPTION 2 - Suppression manuelle des fichiers:
echo 1. Arrêtez MySQL dans XAMPP
echo 2. Allez dans: C:\xampp\mysql\data\
echo 3. Supprimez le dossier "garage_db" complet
echo 4. Redémarrez MySQL dans XAMPP
echo 5. Importez "garage_complete.sql"
echo.

echo OPTION 3 - Via ligne de commande MySQL:
echo 1. Ouvrez un terminal MySQL
echo 2. Exécutez: source fix-tablespace-error.sql
echo 3. Puis: source garage_complete_no_drop.sql
echo.

echo ========================================
echo   FICHIERS DISPONIBLES:
echo   - fix-tablespace-error.sql (Suppression forcée)
echo   - garage_complete_no_drop.sql (Base sans DROP)
echo   - garage_complete.sql (Base complète)
echo ========================================
echo.

echo Appuyez sur une touche pour ouvrir phpMyAdmin...
pause > nul

echo Ouverture de phpMyAdmin...
start http://localhost/phpmyadmin

echo.
echo ========================================
echo   INSTRUCTIONS COMPLÈTES:
echo ========================================
echo.
echo 1. Dans phpMyAdmin, sélectionnez "garage_db"
echo 2. Onglet "SQL" → Copiez "fix-tablespace-error.sql"
echo 3. Exécutez le script
echo 4. Puis importez "garage_complete_no_drop.sql"
echo 5. Testez avec: node test-connection.js
echo.
echo ========================================
echo   RÉSOLUTION TERMINÉE !
echo ========================================
echo.
echo Appuyez sur une touche pour fermer...
pause > nul 