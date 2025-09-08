-- Script de correction sécurisé de la base de données garage_db
-- Ce script ajoute les colonnes manquantes SANS supprimer les tables existantes
-- Exécutez ce script dans phpMyAdmin pour corriger les tables

USE garage_db;

-- 1. Corriger la table pieces en ajoutant les colonnes manquantes
-- Vérifier si la colonne categorie existe
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

-- Vérifier si la colonne fournisseur existe
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

-- Vérifier si la colonne prix_achat existe
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

-- Vérifier si la colonne prix_vente existe
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

-- Vérifier si la colonne stock_actuel existe
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

-- Vérifier si la colonne stock_minimum existe
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

-- 2. Corriger la table factures en ajoutant les colonnes manquantes
-- Vérifier si la colonne montant_ht existe
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

-- Vérifier si la colonne montant_ttc existe
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

-- 3. Insérer des données de test pour les pieces (seulement si la table est vide)
INSERT IGNORE INTO pieces (nom, reference, categorie, fournisseur, prix_achat, prix_vente, stock_actuel, stock_minimum) VALUES
('Filtre à huile', 'FIL-001', 'entretien', 'Bosch', 8.50, 15.00, 25, 5),
('Plaquettes de frein avant', 'FRE-001', 'freinage', 'Valeo', 25.00, 45.00, 15, 3),
('Batterie 60Ah', 'BAT-001', 'electricite', 'Varta', 65.00, 120.00, 8, 2),
('Pneus 205/55R16', 'PNE-001', 'roues', 'Michelin', 45.00, 85.00, 12, 4),
('Amortisseur avant', 'SUS-001', 'suspension', 'Sachs', 35.00, 65.00, 6, 2),
('Bougie d\'allumage', 'BOU-001', 'moteur', 'NGK', 3.50, 8.00, 50, 10),
('Liquide de refroidissement', 'REF-001', 'refroidissement', 'Total', 12.00, 22.00, 20, 5),
('Huile moteur 5W30', 'HUI-001', 'lubrifiant', 'Castrol', 15.00, 28.00, 30, 8);

-- 4. Insérer des données de test pour les factures (seulement si la table est vide)
INSERT IGNORE INTO factures (numero, client_id, reparation_id, montant_ht, montant_ttc, statut) VALUES
('FAC-2024-001', 1, 1, 120.00, 144.00, 'payee'),
('FAC-2024-002', 2, 2, 85.00, 102.00, 'envoyee'),
('FAC-2024-003', 3, 3, 200.00, 240.00, 'brouillon');

-- 5. Vérifier la structure finale des tables
SELECT 'Structure de la table pieces:' as message;
DESCRIBE pieces;

SELECT 'Structure de la table factures:' as message;
DESCRIBE factures;

-- 6. Compter les enregistrements
SELECT 'Nombre de pieces:' as message, COUNT(*) as total FROM pieces;
SELECT 'Nombre de factures:' as message, COUNT(*) as total FROM factures;
