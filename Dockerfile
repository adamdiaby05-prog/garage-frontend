# Dockerfile pour application complète (Frontend + Backend)
FROM node:18-alpine

# Installer bash pour le script build.sh
RUN apk add --no-cache bash

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm install

# Copier le code source
COPY . .

# Build de l'application React
RUN npm run build

# Créer le dossier uploads
RUN mkdir -p uploads/images

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=5000

# Exposer le port 5000
EXPOSE 5000

# Commande pour démarrer l'application
CMD ["node", "server.js"]