-- Script de correction COMPLET de toutes les tables garage_db
-- Exécutez ce script dans phpMyAdmin pour corriger TOUTES les tables

USE garage_db;

-- ========================================
-- 1. CORRECTION TABLE PIECES
-- ========================================

-- Ajouter la colonne categorie si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'pieces' 
     AND COLUMN_NAME = 'categorie') = 0,
    'ALTER TABLE pieces ADD COLUMN categorie VARCHAR(50) AFTER reference',
    'SELECT "Colonne categorie existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne fournisseur si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'pieces' 
     AND COLUMN_NAME = 'fournisseur') = 0,
    'ALTER TABLE pieces ADD COLUMN fournisseur VARCHAR(100) AFTER categorie',
    'SELECT "Colonne fournisseur existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne prix_achat si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'pieces' 
     AND COLUMN_NAME = 'prix_achat') = 0,
    'ALTER TABLE pieces ADD COLUMN prix_achat DECIMAL(10,2) AFTER fournisseur',
    'SELECT "Colonne prix_achat existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne prix_vente si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'pieces' 
     AND COLUMN_NAME = 'prix_vente') = 0,
    'ALTER TABLE pieces ADD COLUMN prix_vente DECIMAL(10,2) AFTER prix_achat',
    'SELECT "Colonne prix_vente existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne stock_actuel si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'pieces' 
     AND COLUMN_NAME = 'stock_actuel') = 0,
    'ALTER TABLE pieces ADD COLUMN stock_actuel INT DEFAULT 0 AFTER prix_vente',
    'SELECT "Colonne stock_actuel existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne stock_minimum si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'pieces' 
     AND COLUMN_NAME = 'stock_minimum') = 0,
    'ALTER TABLE pieces ADD COLUMN stock_minimum INT DEFAULT 5 AFTER stock_actuel',
    'SELECT "Colonne stock_minimum existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 2. CORRECTION TABLE FACTURES
-- ========================================

-- Ajouter la colonne montant_ht si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'factures' 
     AND COLUMN_NAME = 'montant_ht') = 0,
    'ALTER TABLE factures ADD COLUMN montant_ht DECIMAL(10,2) AFTER reparation_id',
    'SELECT "Colonne montant_ht existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne montant_ttc si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'factures' 
     AND COLUMN_NAME = 'montant_ttc') = 0,
    'ALTER TABLE factures ADD COLUMN montant_ttc DECIMAL(10,2) AFTER montant_ht',
    'SELECT "Colonne montant_ttc existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 3. CORRECTION TABLE RENDEZ_VOUS
-- ========================================

-- Ajouter la colonne motif si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'rendez_vous' 
     AND COLUMN_NAME = 'motif') = 0,
    'ALTER TABLE rendez_vous ADD COLUMN motif TEXT AFTER date_rdv',
    'SELECT "Colonne motif existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne notes si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'rendez_vous' 
     AND COLUMN_NAME = 'notes') = 0,
    'ALTER TABLE rendez_vous ADD COLUMN notes TEXT AFTER motif',
    'SELECT "Colonne notes existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne duree_estimee si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'rendez_vous' 
     AND COLUMN_NAME = 'duree_estimee') = 0,
    'ALTER TABLE rendez_vous ADD COLUMN duree_estimee INT DEFAULT 60 AFTER notes',
    'SELECT "Colonne duree_estimee existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 4. INSERTION DE DONNÉES DE TEST
-- ========================================

-- Insérer des données de test pour les pieces (seulement si la table est vide)
INSERT IGNORE INTO pieces (nom, reference, categorie, fournisseur, prix_achat, prix_vente, stock_actuel, stock_minimum) VALUES
('Filtre à huile', 'FIL-001', 'entretien', 'Bosch', 8.50, 15.00, 25, 5),
('Plaquettes de frein avant', 'FRE-001', 'freinage', 'Valeo', 25.00, 45.00, 15, 3),
('Batterie 60Ah', 'BAT-001', 'electricite', 'Varta', 65.00, 120.00, 8, 2),
('Pneus 205/55R16', 'PNE-001', 'roues', 'Michelin', 45.00, 85.00, 12, 4),
('Amortisseur avant', 'SUS-001', 'suspension', 'Sachs', 35.00, 65.00, 6, 2);

-- Insérer des données de test pour les factures (seulement si la table est vide)
INSERT IGNORE INTO factures (numero, client_id, reparation_id, montant_ht, montant_ttc, statut) VALUES
('FAC-2024-001', 1, 1, 120.00, 144.00, 'payee'),
('FAC-2024-002', 2, 2, 85.00, 102.00, 'envoyee'),
('FAC-2024-003', 3, 3, 200.00, 240.00, 'brouillon');

-- Insérer des données de test pour les rendez-vous (seulement si la table est vide)
INSERT IGNORE INTO rendez_vous (client_id, vehicule_id, employe_id, service_id, date_rdv, motif, statut, notes, duree_estimee) VALUES
(1, 1, 1, 1, '2024-12-20 10:00:00', 'Vidange et contrôle général', 'confirme', 'Client préfère le matin', 90),
(2, 2, 1, 2, '2024-12-21 14:00:00', 'Réparation freins', 'confirme', 'Urgent - freins qui grincent', 120),
(3, 3, 2, 3, '2024-12-22 09:00:00', 'Diagnostic moteur', 'en_attente', 'Moteur qui tousse', 60),
(1, 1, 2, 1, '2024-12-23 15:00:00', 'Changement pneus', 'annule', 'Client a reporté', 120),
(2, 2, 1, 3, '2024-12-24 11:00:00', 'Révision complète', 'termine', 'Travail terminé avec succès', 180);

-- ========================================
-- 5. VÉRIFICATION FINALE
-- ========================================

-- Afficher la structure de toutes les tables corrigées
SELECT '=== STRUCTURE TABLE PIECES ===' as message;
DESCRIBE pieces;

SELECT '=== STRUCTURE TABLE FACTURES ===' as message;
DESCRIBE factures;

SELECT '=== STRUCTURE TABLE RENDEZ_VOUS ===' as message;
DESCRIBE rendez_vous;

-- Compter les enregistrements
SELECT '=== COMPTEURS ===' as message;
SELECT 'Pieces:' as table_name, COUNT(*) as total FROM pieces
UNION ALL
SELECT 'Factures:' as table_name, COUNT(*) as total FROM factures
UNION ALL
SELECT 'Rendez-vous:' as table_name, COUNT(*) as total FROM rendez_vous;

-- Afficher les rendez-vous avec leurs statuts
SELECT '=== RENDEZ-VOUS AVEC STATUTS ===' as message;
SELECT 
    rv.id,
    c.nom as client_nom,
    v.immatriculation,
    e.nom as employe_nom,
    s.nom as service_nom,
    rv.date_rdv,
    rv.motif,
    rv.statut,
    rv.notes,
    rv.duree_estimee
FROM rendez_vous rv
LEFT JOIN clients c ON rv.client_id = c.id
LEFT JOIN vehicules v ON rv.vehicule_id = v.id
LEFT JOIN employes e ON rv.employe_id = e.id
LEFT JOIN services s ON rv.service_id = s.id
ORDER BY rv.date_rdv;

SELECT '=== CORRECTION TERMINÉE AVEC SUCCÈS ===' as message;
