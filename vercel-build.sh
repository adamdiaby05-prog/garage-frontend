#!/bin/bash
# Script de build pour Vercel
set -e

echo "🚀 Démarrage du build..."

# Vérifier que pnpm est installé
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installation de pnpm..."
    npm install -g pnpm
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
pnpm install --frozen-lockfile

# Build du projet
echo "🔨 Build du projet..."
pnpm run build

echo "✅ Build terminé avec succès!"
