# 🗄️ Guide de Connexion Base de Données - Garage Admin

## 📋 Prérequis

### 1. Installation des logiciels
- **Node.js** : https://nodejs.org/ (version 14 ou supérieure)
- **XAMPP** : https://www.apachefriends.org/ (pour MySQL)
- **Git** (optionnel) : https://git-scm.com/

### 2. Démarrage de MySQL
1. Ouvrez **XAMPP Control Panel**
2. Cliquez sur **Start** à côté de **MySQL**
3. Vérifiez que le statut devient **Running** (fond vert)

## 🚀 Démarrage Rapide

### Option 1 : Démarrage automatique (Recommandé)
```bash
# Double-cliquez sur le fichier
start-complete.bat
```

### Option 2 : Démarrage manuel
```bash
# 1. Configuration de la base de données
node setup-database.js

# 2. Démarrage du serveur backend
node server.js

# 3. Dans un autre terminal, démarrage du frontend
npm start
```

## 📊 Structure de la Base de Données

### Tables principales :
- **`clients`** - Gestion des clients
- **`employes`** - Gestion des employés
- **`vehicules`** - Gestion des véhicules
- **`reparations`** - Gestion des réparations
- **`pieces`** - Gestion des pièces détachées
- **`fournisseurs`** - Gestion des fournisseurs
- **`boutique_articles`** - Articles de la boutique
- **`categories_boutique`** - Catégories de la boutique
- **`vente_boutique`** - Ventes de la boutique

## 🔧 Configuration

### Fichier de configuration : `config.env`
```env
# Configuration de la base de données MySQL XAMPP
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=garage_db
DB_PORT=3306

# Configuration du serveur
PORT=5000

# Configuration de l'API
API_URL=http://localhost:5000/api
```

### Modification de la configuration
Si vous utilisez des paramètres différents :
1. Modifiez le fichier `config.env`
2. Redémarrez l'application

## 🌐 Accès à l'Application

### URLs d'accès :
- **Frontend Admin** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **API Endpoints** : http://localhost:5000/api

### Endpoints API disponibles :
- `GET /api/clients` - Liste des clients
- `GET /api/employes` - Liste des employés
- `GET /api/vehicules` - Liste des véhicules
- `GET /api/reparations` - Liste des réparations
- `GET /api/pieces` - Liste des pièces
- `GET /api/fournisseurs` - Liste des fournisseurs
- `GET /api/boutique/articles` - Articles de la boutique

## 🛠️ Dépannage

### Erreur de connexion MySQL
```
❌ Erreur de connexion à la base de données
```
**Solutions :**
1. Vérifiez que XAMPP est démarré
2. Vérifiez que MySQL est en cours d'exécution
3. Vérifiez les paramètres dans `config.env`

### Erreur "Base de données n'existe pas"
```
🗄️ La base de données n'existe pas
```
**Solution :**
```bash
node setup-database.js
```

### Erreur de port déjà utilisé
```
❌ Port 5000 déjà utilisé
```
**Solutions :**
1. Changez le port dans `config.env`
2. Ou arrêtez l'application qui utilise le port 5000

### Erreur de dépendances manquantes
```
❌ Module non trouvé
```
**Solution :**
```bash
npm install
```

## 📝 Données de Test

L'application inclut des données de test automatiques :
- **3 clients** de démonstration
- **3 employés** de démonstration
- **3 fournisseurs** de démonstration
- **4 catégories** de boutique

## 🔒 Sécurité

### Recommandations :
1. Changez le mot de passe MySQL par défaut
2. Utilisez un utilisateur MySQL dédié (pas root)
3. Limitez les permissions de l'utilisateur MySQL
4. Sauvegardez régulièrement votre base de données

### Sauvegarde de la base de données :
```bash
# Export de la base de données
mysqldump -u root -p garage_db > backup_garage_db.sql

# Import de la base de données
mysql -u root -p garage_db < backup_garage_db.sql
```

## 📞 Support

### En cas de problème :
1. Vérifiez les logs dans la console
2. Consultez ce guide de dépannage
3. Vérifiez que tous les prérequis sont installés
4. Redémarrez XAMPP et l'application

### Logs utiles :
- **Backend** : Console du serveur Node.js
- **Frontend** : Console du navigateur (F12)
- **Base de données** : Logs MySQL dans XAMPP

---

## ✅ Checklist de Vérification

- [ ] Node.js installé et dans le PATH
- [ ] XAMPP installé et MySQL démarré
- [ ] Fichier `config.env` configuré
- [ ] Base de données créée (`node setup-database.js`)
- [ ] Serveur backend démarré (`node server.js`)
- [ ] Frontend accessible sur http://localhost:3000
- [ ] API accessible sur http://localhost:5000/api

**🎉 Votre application Garage Admin est maintenant prête à être utilisée !** 