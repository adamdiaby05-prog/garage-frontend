@echo off
echo ========================================
echo   Reparation Base de Donnees XAMPP
echo   Apres reinstallation - Probleme Tables
echo ========================================
echo.

echo PROBLEME DETECTE:
echo Les tables existent mais sont corrompues
echo "Table doesn't exist in engine"
echo.

echo SOLUTION:
echo 1. Ouvrez phpMyAdmin: http://localhost/phpmyadmin
echo 2. Connectez-vous avec root (pas de mot de passe)
echo 3. Selectionnez la base garage_db
echo 4. Cliquez sur "Operations" en haut
echo 5. Dans "Supprimer la base de donnees", cliquez sur "Supprimer"
echo 6. Confirmez la suppression
echo 7. Cliquez sur "Nouvelle base de donnees"
echo 8. Nom: garage_db
echo 9. Interclassement: utf8mb4_unicode_ci
echo 10. Cliquez sur "Creer"
echo 11. Selectionnez garage_db
echo 12. Cliquez sur "Importer"
echo 13. Choisissez le fichier: garage_db.sql
echo 14. Cliquez sur "Executer"
echo.

echo 15. Test de la connexion...
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