#!/bin/bash
# Script de test pour vérifier la configuration Dokploy

echo "=== Test de configuration Dokploy ==="
echo ""

# Vérifier les variables d'environnement
echo "Variables d'environnement :"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "CI: $CI"
echo "GENERATE_SOURCEMAP: $GENERATE_SOURCEMAP"
echo "HOST: $HOST"
echo "DANGEROUSLY_DISABLE_HOST_CHECK: $DANGEROUSLY_DISABLE_HOST_CHECK"
echo "REACT_APP_API_BASE_URL: $REACT_APP_API_BASE_URL"
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
    echo "API URL: ${REACT_APP_API_BASE_URL:-non configurée}"
    echo ""
    echo "🚀 Prêt pour le déploiement !"
else
    echo "❌ Erreur lors du build"
    exit 1
fi
