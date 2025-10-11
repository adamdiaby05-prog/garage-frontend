# Dockerfile pour Dokploy
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Définir les variables d'environnement pour le build
ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV HOST=0.0.0.0
ENV DANGEROUSLY_DISABLE_HOST_CHECK=true

# Construire l'application
RUN npm run build

# Exposer le port
EXPOSE 3000

# Commande pour servir l'application
CMD ["npx", "serve", "-s", "build", "-l", "3000", "-n"]
