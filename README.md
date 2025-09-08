# Garage Management System

Système de gestion de garage avec interface React et API Node.js.

## 🚀 Démarrage rapide

### Option 1: Démarrage automatique (Recommandé)
```bash
# Double-cliquez sur le fichier start-dev.bat
# Ou exécutez dans PowerShell:
.\start-dev.bat
```

### Option 2: Démarrage manuel
```bash
# Terminal 1: Démarrer le serveur backend
npm run server

# Terminal 2: Démarrer le frontend (dans un nouveau terminal)
npm run start
```

### Option 3: Démarrage simultané
```bash
npm run dev
```

## ⚠️ Résolution des problèmes

### Erreur "Erreur lors du chargement des statistiques"

**Causes possibles:**
1. Le serveur backend n'est pas démarré
2. La base de données MySQL n'est pas accessible
3. Les informations de connexion sont incorrectes

**Solutions:**
1. Vérifiez que le serveur backend tourne sur le port 5000
2. Vérifiez que MySQL est démarré
3. Configurez `config.env` avec vos informations de base de données

### Lenteur de chargement

**Causes possibles:**
1. Conflit entre le serveur et le frontend
2. Base de données lente ou inaccessible
3. Trop de requêtes simultanées

**Solutions:**
1. Utilisez `start-dev.bat` pour un démarrage séquentiel
2. Vérifiez la performance de votre base de données
3. Redémarrez l'application

## 🔧 Configuration

### Base de données
1. Créez une base de données MySQL nommée `garage_db`
2. Modifiez `config.env` avec vos informations de connexion
3. Importez le schéma SQL: `garage_db.sql`

### Variables d'environnement
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=garage_db
DB_PORT=3306
PORT=5000
```

## 📁 Structure du projet

```
garage-frontend/
├── src/                    # Code source React
├── server.js              # Serveur Express
├── config.env             # Configuration
├── start-dev.bat          # Script de démarrage Windows
└── package.json           # Dépendances
```

## 🛠️ Commandes utiles

```bash
# Installer les dépendances
npm install

# Démarrer uniquement le serveur
npm run server

# Démarrer uniquement le frontend
npm run start

# Démarrer les deux (peut causer des conflits)
npm run dev

# Construire pour la production
npm run build
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Test API**: http://localhost:5000/api/test

## 📝 Logs

Les erreurs sont affichées dans:
- Console du navigateur (F12)
- Terminal du serveur backend
- Terminal du frontend

## 🆘 Support

En cas de problème:
1. Vérifiez que MySQL est démarré
2. Vérifiez la configuration dans `config.env`
3. Redémarrez l'application avec `start-dev.bat`
4. Consultez les logs dans les terminaux
