# 🔧 Guide de Résolution des Erreurs - Garage Management System

## 🚨 Erreurs Rencontrées et Solutions

### 1. Erreur "Directory not empty" (#1010)
```
#1010 - Erreur en effaçant la base (rmdir '.\garage_db', erreur 41 "Directory not empty")
```

**Cause :** MySQL ne peut pas supprimer la base de données car elle contient encore des fichiers.

**Solution :**
1. Utilisez `fix-database-drop.sql` dans phpMyAdmin
2. Ou supprimez manuellement le dossier `C:\xampp\mysql\data\garage_db`

---

### 2. Erreur "Tablespace exists" (#1813)
```
#1813 - Tablespace for table '`garage_db`.`clients`' exists. Please DISCARD the tablespace before IMPORT
```

**Cause :** Les fichiers de tablespace des tables existent encore.

**Solution :**
1. Utilisez `fix-tablespace-error.sql` dans phpMyAdmin
2. Puis importez `garage_complete_no_drop.sql`

---

## 📋 Procédure de Résolution Complète

### Étape 1 : Nettoyage de la Base de Données

**Option A - Via phpMyAdmin (Recommandé) :**
1. Ouvrez http://localhost/phpmyadmin
2. Sélectionnez la base "garage_db"
3. Onglet "SQL"
4. Copiez-collez le contenu de `fix-tablespace-error.sql`
5. Cliquez sur "Exécuter"

**Option B - Suppression Manuelle :**
1. Arrêtez MySQL dans XAMPP
2. Allez dans `C:\xampp\mysql\data\`
3. Supprimez le dossier "garage_db"
4. Redémarrez MySQL dans XAMPP

### Étape 2 : Import de la Base de Données

**Option A - Import Complet :**
1. Dans phpMyAdmin, cliquez sur "Importer"
2. Sélectionnez `garage_complete.sql`
3. Cliquez sur "Exécuter"

**Option B - Import sans Suppression :**
1. Dans phpMyAdmin, sélectionnez "garage_db"
2. Onglet "SQL"
3. Copiez-collez le contenu de `garage_complete_no_drop.sql`
4. Cliquez sur "Exécuter"

### Étape 3 : Vérification

```bash
node test-database-import.js
```

---

## 🛠️ Scripts Disponibles

### Scripts de Nettoyage
- `fix-database-drop.sql` - Suppression forcée de la base
- `fix-tablespace-error.sql` - Résolution erreur tablespace
- `force-delete-database.bat` - Guide de suppression
- `resolve-tablespace-error.bat` - Guide de résolution

### Scripts d'Import
- `garage_complete.sql` - Base complète avec DROP DATABASE
- `garage_complete_no_drop.sql` - Base sans suppression
- `import-complete-database.bat` - Guide d'import

### Scripts de Test
- `test-database-import.js` - Test complet de l'import
- `test-connection.js` - Test de connexion simple
- `test-api-endpoints.js` - Test des endpoints API

---

## 🔍 Vérification de l'Import

Après l'import, vous devriez avoir :

### Tables (9)
- `clients` - Gestion des clients
- `employes` - Gestion du personnel
- `vehicules` - Gestion des véhicules
- `services` - Catalogue des services
- `pieces` - Gestion du stock
- `reparations` - Suivi des réparations
- `pieces_utilisees` - Pièces utilisées
- `factures` - Gestion des factures
- `rendez_vous` - Gestion des RDV

### Vues (4)
- `v_rdv_aujourdhui` - RDV du jour
- `v_stock_critique` - Stock critique
- `v_dashboard_stats` - Statistiques dashboard
- `v_reparations_details` - Détails réparations

### Triggers (3)
- `maj_stock_pieces` - Mise à jour stock
- `generer_numero_reparation` - Numéros réparation
- `generer_numero_facture` - Numéros facture

### Procédures (3)
- `CalculerTotalReparation` - Calcul totaux
- `VerifierStockCritique` - Vérification stock
- `GetDashboardStats` - Statistiques

### Fonctions (2)
- `CalculerAgeVehicule` - Âge véhicule
- `FormaterTelephone` - Format téléphone

---

## 📊 Données de Test

L'import inclut :
- **5 clients** avec informations complètes
- **5 employés** avec différents rôles
- **5 véhicules** de différentes marques
- **8 services** dans différentes catégories
- **15 pièces** dans différentes catégories
- **5 réparations** avec différents statuts
- **3 factures** avec différents modes de paiement
- **5 rendez-vous** programmés

---

## 🚀 Démarrage de l'Application

Une fois la base importée :

1. **Démarrer le serveur :**
   ```bash
   npm run server
   # ou
   node server.js
   ```

2. **Démarrer le frontend :**
   ```bash
   npm start
   ```

3. **Tester l'API :**
   ```bash
   node test-api-endpoints.js
   ```

---

## 🆘 En Cas de Problème

### Erreur de Connexion
- Vérifiez que MySQL est démarré dans XAMPP
- Vérifiez les paramètres dans `config.env`

### Erreur de Port
- Utilisez `start-app.bat` qui nettoie le port 5000
- Ou arrêtez manuellement les processus sur le port 5000

### Erreur de Tables Manquantes
- Réimportez la base de données
- Utilisez `garage_complete_no_drop.sql` si les tables existent

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs du serveur
2. Testez avec `test-database-import.js`
3. Consultez la documentation dans `DOCUMENTATION_BASE_DONNEES.md`

---

*Guide créé le 15 août 2025 - Garage Management System v2.0* 