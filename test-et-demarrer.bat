@echo off
echo 🚀 Test et démarrage du système IA Garage AutoGenius
echo ====================================================
echo.

echo 🗄️ Étape 1: Test de la base de données...
node test-connection.js

echo.
echo ⏳ Attente de 2 secondes...
timeout /t 2 /nobreak >nul

echo 🤖 Étape 2: Démarrage du serveur...
start /B node server.js

echo.
echo ⏳ Attente du démarrage du serveur...
timeout /t 5 /nobreak >nul

echo 🧪 Étape 3: Test de l'IA...
node test-ia-complet.js

echo.
echo ✅ Tests terminés !
echo.
echo 🌐 Interface web : http://localhost:3000/assistant-ia
echo 🔧 API serveur : http://localhost:5000/api
echo.
echo 💡 Votre IA est maintenant connectée à votre base de données !
echo.
pause
