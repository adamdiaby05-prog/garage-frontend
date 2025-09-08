@echo off
echo 🤖 Démarrage IA GPT Garage AutoGenius
echo ======================================
echo.

echo 🔑 Vérification de la configuration GPT...
if not exist "config.env" (
    echo ❌ Fichier config.env manquant !
    echo 💡 Créez-le avec votre clé API GPT
    pause
    exit /b 1
)

echo ✅ Configuration trouvée
echo.

echo 🚀 Démarrage du serveur avec GPT...
start /B node server.js

echo ⏳ Attente du démarrage du serveur...
timeout /t 5 /nobreak >nul

echo 🧪 Test de l'IA GPT...
node test-gpt-ia.js

echo.
echo ✅ IA GPT démarrée avec succès !
echo.
echo 🌐 Interface web : http://localhost:3000/assistant-ia
echo 🔧 API serveur : http://localhost:5000/api
echo.
echo 💡 Votre IA utilise maintenant GPT pour des réponses professionnelles !
echo.
pause
