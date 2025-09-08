# 🚨 RÉSOLUTION RAPIDE - ERREUR 404

## ❌ Problème identifié
```
Failed to load resource: the server responded with a status of 404 (Not Found)
Erreur API: AxiosError
```

## 🔍 Causes possibles

### 1. **Serveur backend non démarré** (Cause la plus fréquente)
- Le serveur Node.js n'est pas en cours d'exécution
- Port 5000 non accessible

### 2. **Base de données non configurée**
- MySQL/XAMPP non démarré
- Base de données `garage_db` n'existe pas

### 3. **Dépendances manquantes**
- Modules npm non installés
- Erreur de configuration

## 🚀 SOLUTIONS RAPIDES

### Solution 1 : Démarrage automatique (Recommandé)
```bash
# Double-cliquez sur
start-complete.bat
```

### Solution 2 : Démarrage manuel
```bash
# Terminal 1 : Configuration de la base de données
node setup-database.js

# Terminal 2 : Démarrage du serveur backend
node server.js

# Terminal 3 : Démarrage du frontend
npm start
```

### Solution 3 : Diagnostic complet
```bash
# Exécutez le diagnostic
diagnostic.bat
```

## ✅ Vérifications rapides

### 1. **Vérifier que le serveur fonctionne**
Ouvrez votre navigateur et allez sur :
```
http://localhost:5000/api/test
```
Vous devriez voir : `{"message":"API Garage fonctionne correctement!"}`

### 2. **Vérifier que MySQL est démarré**
- Ouvrez **XAMPP Control Panel**
- Vérifiez que **MySQL** est en vert (Running)

### 3. **Vérifier les ports**
- Port 5000 : Serveur backend
- Port 3000 : Frontend React
- Port 3306 : MySQL

## 🛠️ Dépannage étape par étape

### Étape 1 : Arrêter tout
```bash
# Fermez toutes les fenêtres de terminal
# Arrêtez XAMPP si nécessaire
```

### Étape 2 : Redémarrer XAMPP
1. Ouvrez **XAMPP Control Panel**
2. Cliquez **Stop** sur MySQL
3. Attendez 5 secondes
4. Cliquez **Start** sur MySQL
5. Vérifiez que le statut devient vert

### Étape 3 : Configuration de la base de données
```bash
node setup-database.js
```

### Étape 4 : Démarrage du serveur
```bash
node server.js
```
Vous devriez voir :
```
🚀 Serveur démarré sur le port 5000
📊 API disponible sur http://localhost:5000/api
```

### Étape 5 : Test de l'API
Ouvrez un nouveau terminal et testez :
```bash
curl http://localhost:5000/api/test
```

### Étape 6 : Démarrage du frontend
```bash
npm start
```

## 🔧 Messages d'erreur courants

### "Port 5000 déjà utilisé"
```bash
# Trouver le processus qui utilise le port
netstat -ano | findstr :5000

# Tuer le processus (remplacez XXXX par le PID)
taskkill /PID XXXX /F
```

### "Module non trouvé"
```bash
npm install
```

### "MySQL connection failed"
- Vérifiez que XAMPP est démarré
- Vérifiez le fichier `config.env`

## 📞 Support

### Si rien ne fonctionne :
1. Exécutez `diagnostic.bat`
2. Copiez-collez le résultat complet
3. Vérifiez que Node.js est installé : `node --version`

### Vérifications finales :
- [ ] XAMPP démarré et MySQL en vert
- [ ] Base de données créée (`node setup-database.js`)
- [ ] Serveur backend démarré (`node server.js`)
- [ ] API accessible sur http://localhost:5000/api/test
- [ ] Frontend accessible sur http://localhost:3000

---

**🎯 L'erreur 404 est généralement résolue en redémarrant le serveur backend !** 