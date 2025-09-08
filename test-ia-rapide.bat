@echo off
echo 🤖 Test Rapide de l'IA Garage AutoGenius
echo ===========================================
echo.

echo 🚀 Démarrage du serveur...
start /B node server.js

echo ⏳ Attente du démarrage du serveur...
timeout /t 5 /nobreak >nul

echo 🧪 Test de l'IA...
node test-ai-web.js

echo.
echo ✅ Test terminé !
echo.
echo 💡 Pour tester manuellement, allez sur :
echo    http://localhost:3000/assistant-ia
echo.
pause
