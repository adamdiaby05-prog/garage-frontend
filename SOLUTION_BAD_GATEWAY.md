# SOLUTION EXACTE pour "Bad Gateway" sur Dokploy

## 🎯 Configuration EXACTE à utiliser dans Dokploy

### Variables d'environnement (✅ Vous les avez déjà) :
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

## 🔧 Si ça ne marche toujours pas, essayez ces alternatives :

### Alternative 1 - Port 8080 :
- **Port** : `8080`
- **Start Command** : `npx serve -s build -l 8080 -n`
- **Variables** : Ajoutez `PORT=8080`

### Alternative 2 - Commande simple :
- **Start Command** : `npx serve -s build`

### Alternative 3 - Avec timeout :
- **Start Command** : `timeout 30s npx serve -s build -l 3000 -n || npx serve -s build -l 8080 -n`

## 🚨 POINTS IMPORTANTS :

1. **Vérifiez les logs** dans Dokploy pour voir l'erreur exacte
2. **Le port doit correspondre** entre la variable PORT et la commande
3. **Attendez 2-3 minutes** après le déploiement
4. **Redéployez** après chaque changement de configuration

## ✅ Test rapide :
Votre configuration actuelle est correcte, le problème vient de la commande de démarrage !









