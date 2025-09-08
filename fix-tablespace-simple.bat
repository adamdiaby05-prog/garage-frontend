@echo off
echo ========================================
echo   RÉSOLUTION ERREUR TABLESPACE - SIMPLE
echo   Version corrigée sans option FORCE
echo ========================================
echo.

echo ERREUR CORRIGÉE:
echo L'option FORCE n'existe pas en MySQL
echo Script simplifié créé: fix-tablespace-simple.sql
echo.

echo PROCÉDURE RECOMMANDÉE:
echo.

echo ÉTAPE 1 - Nettoyage via phpMyAdmin:
echo 1. Ouvrez http://localhost/phpmyadmin
echo 2. Sélectionnez la base "garage_db"
echo 3. Onglet "SQL"
echo 4. Copiez-collez le contenu de "fix-tablespace-simple.sql"
echo 5. Cliquez sur "Exécuter"
echo.

echo ÉTAPE 2 - Import de la base:
echo 1. Dans phpMyAdmin, sélectionnez "garage_db"
echo 2. Onglet "SQL"
echo 3. Copiez-collez le contenu de "garage_complete_no_drop.sql"
echo 4. Cliquez sur "Exécuter"
echo.

echo ÉTAPE 3 - Vérification:
echo 1. Testez avec: node test-database-import.js
echo 2. Si OK, démarrez: npm run server
echo.

echo ========================================
echo   FICHIERS DISPONIBLES:
echo   - fix-tablespace-simple.sql (Nettoyage)
echo   - garage_complete_no_drop.sql (Import)
echo   - test-database-import.js (Test)
echo ========================================
echo.

echo Appuyez sur une touche pour ouvrir phpMyAdmin...
pause > nul

echo Ouverture de phpMyAdmin...
start http://localhost/phpmyadmin

echo.
echo ========================================
echo   INSTRUCTIONS DÉTAILLÉES:
echo ========================================
echo.
echo 1. Dans phpMyAdmin, sélectionnez "garage_db"
echo 2. Onglet "SQL" → Copiez "fix-tablespace-simple.sql"
echo 3. Exécutez le script de nettoyage
echo 4. Puis copiez "garage_complete_no_drop.sql"
echo 5. Exécutez le script d'import
echo 6. Testez avec: node test-database-import.js
echo.
echo ========================================
echo   RÉSOLUTION SIMPLIFIÉE !
echo ========================================
echo.
echo Appuyez sur une touche pour fermer...
pause > nul 