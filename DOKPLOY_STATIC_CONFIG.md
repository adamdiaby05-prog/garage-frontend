# Configuration simplifiée pour application React statique (sans API)

## Variables d'environnement minimales pour Dokploy :

```
PORT=3000
NODE_ENV=production
CI=false
GENERATE_SOURCEMAP=false
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

## Configuration Docker dans Dokploy :
- **Port** : 3000
- **Build Command** : npm run build
- **Start Command** : npx serve -s build -l 3000

## Avantages de cette configuration :
- ✅ Application React pure (pas de backend)
- ✅ Servie comme site statique
- ✅ Plus rapide et plus simple
- ✅ Pas de dépendances API
- ✅ Déploiement plus fiable
