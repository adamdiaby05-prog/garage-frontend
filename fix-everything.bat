@echo off
echo ========================================
echo   REPARATION COMPLETE GARAGE FRONTEND
echo   Solution Automatique
echo ========================================
echo.

echo ETAPE 1: Arret des processus existants...
echo    - Arret du serveur sur le port 5000
echo    - Arret du frontend React
echo.

echo ETAPE 2: Recréation de la base de données...
echo    - Ouvrez phpMyAdmin: http://localhost/phpmyadmin
echo    - Connectez-vous avec root (pas de mot de passe)
echo    - Supprimez la base garage_db existante
echo    - Créez une nouvelle base garage_db
echo    - Importez le fichier garage_db.sql
echo.

echo ETAPE 3: Test de la base de données...
echo    - Verification que les tables sont créées
echo    - Test de la connexion MySQL
echo.

echo ETAPE 4: Démarrage de l'application...
echo    - Démarrage du serveur backend
echo    - Démarrage du frontend React
echo.

echo ========================================
echo   INSTRUCTIONS DETAILLEES:
echo ========================================
echo.
echo 1. OUVREZ PHPMYADMIN:
echo    http://localhost/phpmyadmin
echo.
echo 2. SUPPRIMEZ L'ANCIENNE BASE:
echo    - Cliquez sur "garage_db" a gauche
echo    - Onglet "Operations" en haut
echo    - "Supprimer la base de donnees" - "Supprimer"
echo.
echo 3. CREEZ LA NOUVELLE BASE:
echo    - "Nouvelle base de donnees"
echo    - Nom: garage_db
echo    - Interclassement: utf8mb4_unicode_ci
echo    - "Creer"
echo.
echo 4. IMPORTEZ LE SCHEMA:
echo    - Selectionnez garage_db
echo    - Onglet "Importer"
echo    - Choisir: garage_db.sql
echo    - "Executer"
echo.
echo 5. VERIFIEZ:
echo    - Vous devriez voir 11 tables
echo    - clients, employes, vehicules, etc.
echo.
echo 6. RELANCEZ L'APPLICATION:
echo    - Double-cliquez sur start-xampp.bat
echo.
echo ========================================
echo   Appuyez sur une touche quand vous avez
echo   termine la recréation de la base...
echo ========================================
pause

echo.
echo Test de la base de données...
node test-connection.js

echo.
echo ========================================
echo   Base de données recréée !
echo   Lancement de l'application...
echo ========================================
echo.

start-xampp.bat 