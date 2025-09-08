@echo off
echo ========================================
echo   Recréation Base de Donnees XAMPP
echo   Solution Simple et Rapide
echo ========================================
echo.

echo ETAPE 1: Ouvrir phpMyAdmin
echo 1. Ouvrez votre navigateur
echo 2. Allez sur: http://localhost/phpmyadmin
echo 3. Connectez-vous avec root (pas de mot de passe)
echo.

echo ETAPE 2: Supprimer l'ancienne base
echo 1. Cliquez sur "garage_db" dans la liste a gauche
echo 2. Cliquez sur l'onglet "Operations" en haut
echo 3. Descendez jusqu'a "Supprimer la base de donnees"
echo 4. Cliquez sur "Supprimer"
echo 5. Confirmez la suppression
echo.

echo ETAPE 3: Créer la nouvelle base
echo 1. Cliquez sur "Nouvelle base de donnees" a gauche
echo 2. Nom: garage_db
echo 3. Interclassement: utf8mb4_unicode_ci
echo 4. Cliquez sur "Creer"
echo.

echo ETAPE 4: Importer le schéma
echo 1. Selectionnez "garage_db" dans la liste
echo 2. Cliquez sur l'onglet "Importer"
echo 3. Cliquez sur "Choisir un fichier"
echo 4. Selectionnez: garage_db.sql
echo 5. Cliquez sur "Executer"
echo.

echo ETAPE 5: Vérifier
echo 1. Vous devriez voir 11 tables créées
echo 2. Les tables: clients, employes, vehicules, etc.
echo.

echo ========================================
echo   Base de donnees recreee !
echo   Vous pouvez maintenant relancer l'app
echo ========================================
echo.
echo Appuyez sur une touche pour fermer...
pause > nul 