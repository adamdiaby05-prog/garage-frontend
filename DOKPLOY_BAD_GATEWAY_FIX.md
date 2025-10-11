# Configuration optimisée pour résoudre "Bad Gateway" sur Dokploy

## 🎯 Configuration finale recommandée

### Variables d'environnement dans Dokploy :
```
PORT=3000
NODE_ENV=production
CI=false
GENERATE_SOURCEMAP=false
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

### Configuration Docker dans Dokploy :
- **Port** : `3000`
- **Build Command** : `npm run build`
- **Start Command** : `npx serve -s build -l 3000 -n`

### Alternative si problème persiste :
- **Port** : `8080`
- **Start Command** : `npx serve -s build -l 8080 -n`
- **Variables** : `PORT=8080`

## 🔧 Points de vérification

1. **Vérifiez les logs** dans Dokploy pour voir les erreurs exactes
2. **Assurez-vous** que le port 3000 est bien exposé
3. **Testez** avec le port 8080 si 3000 ne fonctionne pas
4. **Vérifiez** que l'application démarre sans erreur

## ✅ Test réussi localement

Le serveur démarre correctement sur les ports 3000 et 8080 en local, donc le problème est dans la configuration Dokploy.
