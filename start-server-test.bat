@echo off
echo Demarrage du serveur backend...
echo.
echo Si vous voyez des erreurs, cela peut etre du a:
echo 1. La table commandes_boutique n'existe pas encore
echo 2. Probleme de connexion MySQL
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
node server.js
pause
