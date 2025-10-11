# Configuration pour Dokploy - Variables d'environnement
# Ajoutez ces variables dans votre dashboard Dokploy :

# Variables d'environnement requises :
CI=false
GENERATE_SOURCEMAP=false
NODE_ENV=production
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
REACT_APP_API_BASE_URL=https://your-backend-url.com/api

# Configuration Docker :
# Port: 3000
# Build Command: npm run build
# Start Command: npx serve -s build -l 3000
