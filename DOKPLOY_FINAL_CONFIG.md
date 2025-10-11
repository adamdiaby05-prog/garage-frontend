# Configuration optimisée pour Dokploy

## Variables d'environnement recommandées :

```
PORT=3000
NODE_ENV=production
CI=false
GENERATE_SOURCEMAP=false
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
REACT_APP_API_BASE_URL=https://your-backend-url.com/api
```

## Points d'attention dans votre configuration actuelle :

1. **PORT=3001** → Recommandé : **PORT=3000**
   - Le Dockerfile expose le port 3000
   - Le script serve utilise le port 3000 par défaut

2. **NODE_ENV=production** (en double)
   - Vous avez NODE_ENV deux fois, gardez seulement une occurrence

3. **REACT_APP_API_BASE_URL**
   - Remplacez `https://your-backend-url.com/api` par l'URL réelle de votre backend

## Configuration finale recommandée :

```
PORT=3000
NODE_ENV=production
CI=false
GENERATE_SOURCEMAP=false
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
REACT_APP_API_BASE_URL=https://votre-backend-reel.com/api
```

## Configuration Docker dans Dokploy :
- **Port** : 3000
- **Build Command** : npm run build
- **Start Command** : npx serve -s build -l 3000
