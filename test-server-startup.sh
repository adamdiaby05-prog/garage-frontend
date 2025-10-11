#!/bin/bash
# Script de test pour vérifier le démarrage de l'application

echo "=== Test de démarrage de l'application ==="
echo ""

# Vérifier que le build existe
if [ ! -d "build" ]; then
    echo "❌ Dossier build introuvable. Exécution du build..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors du build"
        exit 1
    fi
fi

echo "✅ Build trouvé"
echo ""

# Tester le serveur sur différents ports
echo "Test du serveur sur le port 3000..."
timeout 5s npx serve -s build -l 3000 -n &
SERVER_PID=$!
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Serveur démarre correctement sur le port 3000"
    kill $SERVER_PID
else
    echo "❌ Problème de démarrage sur le port 3000"
fi

echo ""
echo "Test du serveur sur le port 8080..."
timeout 5s npx serve -s build -l 8080 -n &
SERVER_PID=$!
sleep 3

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Serveur démarre correctement sur le port 8080"
    kill $SERVER_PID
else
    echo "❌ Problème de démarrage sur le port 8080"
fi

echo ""
echo "=== Configuration recommandée ==="
echo "Port: 3000"
echo "Start Command: npx serve -s build -l 3000 -n"
echo "Variables: PORT=3000"
