# 📊 Documentation Base de Données - Garage Management System

## 🎯 Vue d'ensemble

Le système de gestion de garage utilise une base de données MySQL complète avec **9 tables principales**, **4 vues**, **3 triggers**, **3 procédures stockées** et **2 fonctions** pour gérer tous les aspects d'un garage automobile.

---

## 🗂️ Structure des Tables

### 1. **Table `clients`** - Gestion des clients
```sql
CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telephone` varchar(20) NOT NULL,
  `adresse` text DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);
```

**Fonction :** Stockage des informations des clients du garage
**Index :** `idx_clients_nom`, `idx_clients_email`, `idx_clients_ville`

---

### 2. **Table `employes`** - Gestion du personnel
```sql
CREATE TABLE `employes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `role` enum('gerant','mecanicien','vendeur','secretaire') DEFAULT 'mecanicien',
  `salaire` decimal(10,2) DEFAULT NULL,
  `date_embauche` date DEFAULT NULL,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);
```

**Fonction :** Gestion du personnel du garage
**Rôles :** gérant, mécanicien, vendeur, secrétaire
**Index :** `idx_employes_role`, `idx_employes_statut`

---

### 3. **Table `vehicules`** - Gestion des véhicules
```sql
CREATE TABLE `vehicules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `marque` varchar(50) NOT NULL,
  `modele` varchar(50) NOT NULL,
  `immatriculation` varchar(15) NOT NULL,
  `annee` year(4) DEFAULT NULL,
  `kilometrage` int(11) DEFAULT 0,
  `carburant` enum('essence','diesel','hybride','electrique') DEFAULT 'essence',
  `couleur` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);
```

**Fonction :** Stockage des véhicules des clients
**Types de carburant :** essence, diesel, hybride, électrique
**Contrainte :** `vehicules_ibfk_1` → `clients.id`

---

### 4. **Table `services`** - Catalogue des services
```sql
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `categorie` varchar(50) DEFAULT 'maintenance',
  `prix` decimal(10,2) NOT NULL,
  `duree_minutes` int(11) DEFAULT 60,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);
```

**Fonction :** Catalogue des services proposés par le garage
**Catégories :** entretien, freinage, roues, diagnostic, climatisation, électricité, suspension
**Index :** `idx_services_categorie`, `idx_services_statut`

---

### 5. **Table `pieces`** - Gestion du stock de pièces
```sql
CREATE TABLE `pieces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `nom` varchar(200) NOT NULL,
  `categorie` varchar(50) DEFAULT 'accessoires',
  `fournisseur` varchar(100) DEFAULT NULL,
  `prix_achat` decimal(10,2) DEFAULT NULL,
  `prix_vente` decimal(10,2) NOT NULL,
  `stock_actuel` int(11) DEFAULT 0,
  `stock_minimum` int(11) DEFAULT 5,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);
```

**Fonction :** Gestion du stock de pièces détachées
**Catégories :** filtres, lubrifiants, freinage, électricité, moteur, transmission, suspension, carrosserie, accessoires
**Index :** `idx_pieces_categorie`, `idx_pieces_stock`, `idx_pieces_fournisseur`

---

### 6. **Table `reparations`** - Suivi des réparations
```sql
CREATE TABLE `reparations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) NOT NULL,
  `client_id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `employe_id` int(11) DEFAULT NULL,
  `date_debut` datetime DEFAULT current_timestamp(),
  `date_fin` datetime DEFAULT NULL,
  `probleme` text DEFAULT NULL,
  `diagnostic` text DEFAULT NULL,
  `statut` enum('ouvert','en_cours','termine','facture') DEFAULT 'ouvert',
  `total_ht` decimal(10,2) DEFAULT 0.00,
  `total_ttc` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);
```

**Fonction :** Suivi des réparations effectuées
**Statuts :** ouvert, en_cours, termine, facture
**Contraintes :** `reparations_ibfk_1` → `clients.id`, `reparations_ibfk_2` → `vehicules.id`, `reparations_ibfk_3` → `employes.id`

---

### 7. **Table `pieces_utilisees`** - Pièces utilisées dans les réparations
```sql
CREATE TABLE `pieces_utilisees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reparation_id` int(11) NOT NULL,
  `piece_id` int(11) NOT NULL,
  `quantite` int(11) DEFAULT 1,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);
```

**Fonction :** Liaison entre réparations et pièces utilisées
**Contraintes :** `pieces_utilisees_ibfk_1` → `reparations.id`, `pieces_utilisees_ibfk_2` → `pieces.id`

---

### 8. **Table `factures`** - Gestion des factures
```sql
CREATE TABLE `factures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) NOT NULL,
  `client_id` int(11) NOT NULL,
  `reparation_id` int(11) DEFAULT NULL,
  `date_facture` date NOT NULL,
  `total_ht` decimal(10,2) NOT NULL,
  `total_ttc` decimal(10,2) NOT NULL,
  `statut` enum('brouillon','envoyee','payee') DEFAULT 'brouillon',
  `mode_paiement` enum('especes','carte','cheque','virement') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);
```

**Fonction :** Gestion des factures clients
**Statuts :** brouillon, envoyee, payee
**Modes de paiement :** espèces, carte, chèque, virement
**Contraintes :** `factures_ibfk_1` → `clients.id`, `factures_ibfk_2` → `reparations.id`

---

### 9. **Table `rendez_vous`** - Gestion des rendez-vous
```sql
CREATE TABLE `rendez_vous` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `employe_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `date_rdv` datetime NOT NULL,
  `motif` text DEFAULT NULL,
  `statut` enum('programme','en_cours','termine','annule') DEFAULT 'programme',
  `notes` text DEFAULT NULL,
  `duree_estimee` int(11) DEFAULT 60,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
);
```

**Fonction :** Gestion des rendez-vous clients
**Statuts :** programme, en_cours, termine, annule
**Contraintes :** `rendez_vous_ibfk_1` → `clients.id`, `rendez_vous_ibfk_2` → `vehicules.id`, `rendez_vous_ibfk_3` → `employes.id`, `rendez_vous_ibfk_4` → `services.id`

---

## 🔄 Triggers Automatiques

### 1. **`maj_stock_pieces`** - Mise à jour automatique du stock
```sql
CREATE TRIGGER `maj_stock_pieces` AFTER INSERT ON `pieces_utilisees` 
FOR EACH ROW 
BEGIN
    UPDATE pieces 
    SET stock_actuel = stock_actuel - NEW.quantite
    WHERE id = NEW.piece_id;
END
```

**Fonction :** Diminue automatiquement le stock quand une pièce est utilisée

### 2. **`generer_numero_reparation`** - Génération automatique des numéros
```sql
CREATE TRIGGER `generer_numero_reparation` BEFORE INSERT ON `reparations` 
FOR EACH ROW 
BEGIN
    IF NEW.numero IS NULL OR NEW.numero = '' THEN
        SET NEW.numero = CONCAT('REP-', YEAR(NOW()), '-', LPAD((SELECT COUNT(*) + 1 FROM reparations WHERE YEAR(created_at) = YEAR(NOW())), 4, '0'));
    END IF;
END
```

**Fonction :** Génère automatiquement les numéros de réparation (ex: REP-2025-0001)

### 3. **`generer_numero_facture`** - Génération automatique des numéros de facture
```sql
CREATE TRIGGER `generer_numero_facture` BEFORE INSERT ON `factures` 
FOR EACH ROW 
BEGIN
    IF NEW.numero IS NULL OR NEW.numero = '' THEN
        SET NEW.numero = CONCAT('FAC-', YEAR(NOW()), '-', LPAD((SELECT COUNT(*) + 1 FROM factures WHERE YEAR(created_at) = YEAR(NOW())), 4, '0'));
    END IF;
END
```

**Fonction :** Génère automatiquement les numéros de facture (ex: FAC-2025-0001)

---

## 👁️ Vues de Données

### 1. **`v_rdv_aujourdhui`** - Rendez-vous du jour
```sql
CREATE VIEW `v_rdv_aujourdhui` AS 
SELECT 
    r.id, r.date_rdv, CONCAT(c.nom, ' ', c.prenom) AS client,
    v.immatriculation, v.marque, v.modele,
    s.nom AS service, r.statut, e.nom AS employe_nom
FROM rendez_vous r
JOIN clients c ON r.client_id = c.id
JOIN vehicules v ON r.vehicule_id = v.id
LEFT JOIN services s ON r.service_id = s.id
LEFT JOIN employes e ON r.employe_id = e.id
WHERE CAST(r.date_rdv AS DATE) = CURDATE()
ORDER BY r.date_rdv ASC;
```

### 2. **`v_stock_critique`** - Pièces en stock critique
```sql
CREATE VIEW `v_stock_critique` AS 
SELECT reference, nom, stock_actuel, stock_minimum, fournisseur, categorie
FROM pieces 
WHERE stock_actuel <= stock_minimum 
ORDER BY stock_actuel ASC;
```

### 3. **`v_dashboard_stats`** - Statistiques du tableau de bord
```sql
CREATE VIEW `v_dashboard_stats` AS 
SELECT 
    (SELECT COUNT(*) FROM clients) AS total_clients,
    (SELECT COUNT(*) FROM vehicules) AS total_vehicules,
    (SELECT COUNT(*) FROM reparations) AS total_reparations,
    (SELECT COUNT(*) FROM factures) AS total_factures,
    (SELECT COUNT(*) FROM reparations WHERE statut = 'en_cours') AS reparations_en_cours,
    (SELECT COUNT(*) FROM reparations WHERE statut = 'termine') AS reparations_terminees,
    (SELECT COUNT(*) FROM pieces WHERE stock_actuel <= stock_minimum) AS pieces_stock_critique,
    (SELECT COUNT(*) FROM rendez_vous WHERE DATE(date_rdv) = CURDATE()) AS rdv_aujourdhui;
```

### 4. **`v_reparations_details`** - Détails complets des réparations
```sql
CREATE VIEW `v_reparations_details` AS 
SELECT 
    r.id, r.numero, r.date_debut, r.date_fin, r.statut,
    r.total_ht, r.total_ttc,
    CONCAT(c.nom, ' ', c.prenom) AS client,
    CONCAT(v.marque, ' ', v.modele) AS vehicule,
    v.immatriculation,
    CONCAT(e.nom, ' ', e.prenom) AS employe,
    r.probleme, r.diagnostic
FROM reparations r
JOIN clients c ON r.client_id = c.id
JOIN vehicules v ON r.vehicule_id = v.id
LEFT JOIN employes e ON r.employe_id = e.id
ORDER BY r.date_debut DESC;
```

---

## 🛠️ Procédures Stockées

### 1. **`CalculerTotalReparation(rep_id)`** - Calcul automatique des totaux
```sql
CREATE PROCEDURE `CalculerTotalReparation`(IN rep_id INT)
BEGIN
    DECLARE total_pieces DECIMAL(10,2) DEFAULT 0;
    
    SELECT COALESCE(SUM(quantite * prix_unitaire), 0) INTO total_pieces
    FROM pieces_utilisees
    WHERE reparation_id = rep_id;
    
    UPDATE reparations 
    SET total_ht = total_pieces,
        total_ttc = total_pieces * 1.20
    WHERE id = rep_id;
    
    SELECT total_pieces AS total_ht, (total_pieces * 1.20) AS total_ttc;
END
```

### 2. **`VerifierStockCritique()`** - Vérification du stock critique
```sql
CREATE PROCEDURE `VerifierStockCritique`()
BEGIN
    SELECT reference, nom, stock_actuel, stock_minimum, fournisseur, categorie
    FROM pieces 
    WHERE stock_actuel <= stock_minimum 
    ORDER BY stock_actuel ASC;
END
```

### 3. **`GetDashboardStats()`** - Statistiques du dashboard
```sql
CREATE PROCEDURE `GetDashboardStats`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM clients) AS total_clients,
        (SELECT COUNT(*) FROM vehicules) AS total_vehicules,
        (SELECT COUNT(*) FROM reparations) AS total_reparations,
        (SELECT COUNT(*) FROM factures) AS total_factures,
        (SELECT COUNT(*) FROM reparations WHERE statut = 'en_cours') AS reparations_en_cours,
        (SELECT COUNT(*) FROM reparations WHERE statut = 'termine') AS reparations_terminees,
        (SELECT COUNT(*) FROM pieces WHERE stock_actuel <= stock_minimum) AS pieces_stock_critique,
        (SELECT COUNT(*) FROM rendez_vous WHERE DATE(date_rdv) = CURDATE()) AS rdv_aujourdhui;
END
```

---

## 🔧 Fonctions Utilitaires

### 1. **`CalculerAgeVehicule(annee_vehicule)`** - Calcul de l'âge d'un véhicule
```sql
CREATE FUNCTION `CalculerAgeVehicule`(annee_vehicule YEAR) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN YEAR(CURDATE()) - annee_vehicule;
END
```

### 2. **`FormaterTelephone(tel)`** - Formatage des numéros de téléphone
```sql
CREATE FUNCTION `FormaterTelephone`(tel VARCHAR(20)) 
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN CONCAT(LEFT(tel, 2), ' ', MID(tel, 3, 2), ' ', MID(tel, 5, 2), ' ', MID(tel, 7, 2), ' ', RIGHT(tel, 2));
END
```

---

## 📊 Données de Test Incluses

Le script inclut des données de test complètes :

- **5 clients** avec informations complètes
- **5 employés** avec différents rôles
- **5 véhicules** de différentes marques
- **8 services** dans différentes catégories
- **15 pièces** dans différentes catégories
- **5 réparations** avec différents statuts
- **3 factures** avec différents modes de paiement
- **5 rendez-vous** programmés
- **5 pièces utilisées** dans les réparations

---

## 🔗 Relations entre Tables

```
clients (1) ←→ (N) vehicules
clients (1) ←→ (N) reparations
clients (1) ←→ (N) factures
clients (1) ←→ (N) rendez_vous

employes (1) ←→ (N) reparations
employes (1) ←→ (N) rendez_vous

vehicules (1) ←→ (N) reparations
vehicules (1) ←→ (N) rendez_vous

services (1) ←→ (N) rendez_vous

reparations (1) ←→ (N) pieces_utilisees
reparations (1) ←→ (N) factures

pieces (1) ←→ (N) pieces_utilisees
```

---

## 📈 Index de Performance

### Index Principaux
- `idx_clients_nom`, `idx_clients_email`, `idx_clients_ville`
- `idx_employes_role`, `idx_employes_statut`
- `idx_vehicules_marque`, `idx_vehicules_immat`
- `idx_services_categorie`, `idx_services_statut`
- `idx_pieces_categorie`, `idx_pieces_stock`, `idx_pieces_fournisseur`
- `idx_reparations_statut`, `idx_reparations_date`
- `idx_factures_statut`, `idx_factures_date`
- `idx_rdv_date`, `idx_rdv_statut`

### Index Composés
- `idx_rdv_employe_date` (employe_id, date_rdv)
- `idx_pieces_stock` (stock_actuel, stock_minimum)

---

## 🚀 Utilisation

### 1. **Import de la base de données**
```bash
# Via phpMyAdmin
1. Ouvrir http://localhost/phpmyadmin
2. Importer le fichier garage_complete.sql

# Via ligne de commande
mysql -u root -p < garage_complete.sql
```

### 2. **Test de la connexion**
```bash
node test-connection.js
```

### 3. **Vérification des données**
```sql
-- Vérifier les tables
SHOW TABLES;

-- Vérifier les vues
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Vérifier les triggers
SHOW TRIGGERS;

-- Vérifier les procédures
SHOW PROCEDURE STATUS WHERE Db = 'garage_db';

-- Vérifier les fonctions
SHOW FUNCTION STATUS WHERE Db = 'garage_db';
```

### 4. **Test des vues**
```sql
-- Rendez-vous du jour
SELECT * FROM v_rdv_aujourdhui;

-- Stock critique
SELECT * FROM v_stock_critique;

-- Statistiques dashboard
SELECT * FROM v_dashboard_stats;

-- Détails réparations
SELECT * FROM v_reparations_details;
```

### 5. **Test des procédures**
```sql
-- Statistiques du dashboard
CALL GetDashboardStats();

-- Vérifier le stock critique
CALL VerifierStockCritique();

-- Calculer le total d'une réparation
CALL CalculerTotalReparation(1);
```

---

## 🔧 Maintenance

### Sauvegarde
```bash
mysqldump -u root -p garage_db > backup_garage_$(date +%Y%m%d).sql
```

### Restauration
```bash
mysql -u root -p garage_db < backup_garage_20250815.sql
```

### Optimisation
```sql
-- Analyser les tables
ANALYZE TABLE clients, employes, vehicules, services, pieces, reparations, factures, rendez_vous;

-- Optimiser les tables
OPTIMIZE TABLE clients, employes, vehicules, services, pieces, reparations, factures, rendez_vous;
```

---

## 📋 Checklist de Vérification

- [ ] Base de données `garage_db` créée
- [ ] 9 tables principales présentes
- [ ] 4 vues créées
- [ ] 3 triggers fonctionnels
- [ ] 3 procédures stockées créées
- [ ] 2 fonctions créées
- [ ] Données de test insérées
- [ ] Index de performance créés
- [ ] Contraintes de clés étrangères actives
- [ ] Tests de connexion réussis

---

## 🎯 Avantages de cette Structure

1. **Normalisation** : Évite la redondance des données
2. **Intégrité** : Contraintes de clés étrangères
3. **Performance** : Index optimisés
4. **Automatisation** : Triggers pour les tâches répétitives
5. **Flexibilité** : Vues pour les requêtes complexes
6. **Maintenabilité** : Procédures stockées pour la logique métier
7. **Évolutivité** : Structure extensible
8. **Sécurité** : Contrôle d'accès par rôles

---

*Documentation créée le 15 août 2025 - Garage Management System v2.0* 