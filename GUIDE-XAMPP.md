# Guide de Configuration XAMPP pour Garage Frontend

## 📋 Prérequis

1. **XAMPP installé** sur votre machine
2. **Node.js** installé (version 14 ou supérieure)
3. **Git** (optionnel, pour cloner le projet)

## 🚀 Démarrage Rapide

### Étape 1: Démarrer XAMPP
1. Ouvrez XAMPP Control Panel
2. Cliquez sur "Start" pour **MySQL**
3. Vérifiez que le port 3306 est disponible (voyant vert)

### Étape 2: Créer la base de données
1. Ouvrez votre navigateur
2. Allez sur `http://localhost/phpmyadmin`
3. Connectez-vous avec `root` (pas de mot de passe)
4. Cliquez sur "Nouvelle base de données"
5. Nom: `garage_db`
6. Interclassement: `utf8mb4_unicode_ci`
7. Cliquez sur "Créer"

### Étape 3: Importer le schéma
1. Sélectionnez la base `garage_db`
2. Cliquez sur "Importer"
3. Choisissez le fichier `garage_db.sql`
4. Cliquez sur "Exécuter"

### Étape 4: Démarrer l'application
Double-cliquez sur `start-xampp.bat`

## 🔧 Configuration Détaillée

### Fichier config.env
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=garage_db
DB_PORT=3306
PORT=5000
API_URL=http://localhost:5000/api
```

### Ports utilisés
- **Frontend React**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000`
- **MySQL XAMPP**: `localhost:3306`
- **phpMyAdmin**: `http://localhost/phpmyadmin`

## 🛠️ Dépannage

### Erreur "ECONNREFUSED"
- Vérifiez que MySQL est démarré dans XAMPP
- Vérifiez que le port 3306 n'est pas utilisé par un autre service

### Erreur "ER_ACCESS_DENIED_ERROR"
- Vérifiez que l'utilisateur `root` n'a pas de mot de passe
- Si vous avez défini un mot de passe, ajoutez-le dans `config.env`

### Erreur "ER_BAD_DB_ERROR"
- Vérifiez que la base `garage_db` existe
- Importez le fichier `garage_db.sql` dans phpMyAdmin

### L'application ne se charge pas
- Vérifiez que les deux serveurs (frontend et backend) sont démarrés
- Vérifiez les logs dans les fenêtres de commande

## 📁 Structure du Projet

```
garage-frontend/
├── config.env              # Configuration de la base de données
├── garage_db.sql           # Schéma de la base de données
├── start-xampp.bat         # Script de démarrage automatique
├── setup-xampp-database.bat # Script d'initialisation
├── server.js               # Serveur backend Express
└── src/                    # Code frontend React
```

## 🎯 Fonctionnalités

- **Gestion des clients**
- **Gestion des employés**
- **Gestion des véhicules**
- **Gestion des réparations**
- **Gestion des pièces**
- **Gestion des factures**
- **Gestion des rendez-vous**
- **Interface moderne avec Material-UI**

## 🔄 Mise à jour

Pour mettre à jour le projet :
1. Arrêtez les serveurs (Ctrl+C dans les fenêtres de commande)
2. Exécutez `npm install` pour les nouvelles dépendances
3. Relancez avec `start-xampp.bat`

## 📞 Support

En cas de problème :
1. Vérifiez les logs dans les fenêtres de commande
2. Vérifiez la connexion MySQL dans phpMyAdmin
3. Redémarrez XAMPP si nécessaire 