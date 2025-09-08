@echo off
echo 🤖 Démarrage IA GPT avec SDK OpenAI
echo ====================================
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

echo 📦 Vérification du SDK OpenAI...
if not exist "node_modules\openai" (
    echo 📦 Installation du SDK OpenAI...
    npm install openai
)

echo ✅ SDK OpenAI prêt
echo.

echo 🚀 Démarrage du serveur avec SDK GPT...
start /B node server.js

echo ⏳ Attente du démarrage du serveur...
timeout /t 5 /nobreak >nul

echo 🧪 Test du SDK GPT...
node test-gpt-sdk.js

echo.
echo ✅ IA GPT avec SDK démarrée avec succès !
echo.
echo 🌐 Interface web : http://localhost:3000/assistant-ia
echo 🔧 API serveur : http://localhost:5000/api
echo.
echo 💡 Votre IA utilise maintenant le SDK OpenAI officiel !
echo 🚀 Avantages : Meilleure gestion d'erreur, métadonnées complètes
echo.
pause
