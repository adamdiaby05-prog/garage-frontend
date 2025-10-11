# Résolution de l'erreur "Bad Gateway" sur Dokploy

## 🔍 Diagnostic de l'erreur "Bad Gateway"

L'erreur "Bad Gateway" (502) indique que :
- Le serveur web (nginx/proxy) ne peut pas communiquer avec l'application
- L'application ne répond pas sur le port configuré
- Problème de configuration de port ou de démarrage

## 🛠️ Solutions à essayer

### Solution 1: Vérifier la configuration du port
Assurez-vous que dans Dokploy :
- **Port exposé** : 3000
- **Variables d'environnement** : PORT=3000

### Solution 2: Modifier la commande de démarrage
Essayez cette commande de démarrage dans Dokploy :
```bash
npx serve -s build -l 3000 -n
```

### Solution 3: Vérifier les logs
Dans Dokploy, consultez les logs pour voir :
- Si l'application démarre correctement
- Sur quel port elle écoute
- S'il y a des erreurs de démarrage

### Solution 4: Configuration alternative
Si le problème persiste, essayez :
- **Port** : 8080
- **Start Command** : `npx serve -s build -l 8080`
- **Variables** : PORT=8080

### Solution 5: Test local
Pour tester localement :
```bash
npm run build
npx serve -s build -l 3000
```
