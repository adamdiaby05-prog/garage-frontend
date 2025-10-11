#!/bin/bash
# Script de test pour application React statique (sans API)

echo "=== Test de configuration React statique ==="
echo ""

# Vérifier les variables d'environnement
echo "Variables d'environnement :"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "CI: $CI"
echo "GENERATE_SOURCEMAP: $GENERATE_SOURCEMAP"
echo "HOST: $HOST"
echo "DANGEROUSLY_DISABLE_HOST_CHECK: $DANGEROUSLY_DISABLE_HOST_CHECK"
echo ""

# Test du build
echo "Test du build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
    echo ""
    echo "=== Configuration finale ==="
    echo "Port: ${PORT:-3000}"
    echo "Mode: ${NODE_ENV:-production}"
    echo "Type: Application React statique (sans API)"
    echo ""
    echo "🚀 Prêt pour le déploiement statique !"
    echo ""
    echo "📁 Fichiers générés dans le dossier 'build/'"
    echo "🌐 L'application sera servie comme site statique"
else
    echo "❌ Erreur lors du build"
    exit 1
fi
