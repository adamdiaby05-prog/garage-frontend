# Configuration Dokploy pour garage-frontend

## Variables d'environnement requises
- NODE_ENV=production
- REACT_APP_API_BASE_URL=https://your-backend-url.com/api

## Configuration Docker
- Port: 3000
- Build Command: npm run build
- Start Command: npx serve -s build -l 3000

## Notes importantes
- Le Dockerfile utilise Node.js 18 Alpine
- L'application est servie avec le package 'serve'
- Le build génère les fichiers statiques dans le dossier 'build'
