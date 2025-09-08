-- Script de correction de la base de données garage_db
-- Exécutez ce script dans phpMyAdmin pour corriger les tables

USE garage_db;

-- 1. Corriger la table pieces
-- Supprimer la table existante si elle a une mauvaise structure
DROP TABLE IF EXISTS pieces;

-- Recréer la table pieces avec la bonne structure
CREATE TABLE pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    reference VARCHAR(50) UNIQUE,
    categorie VARCHAR(50),
    fournisseur VARCHAR(100),
    prix_achat DECIMAL(10,2),
    prix_vente DECIMAL(10,2),
    stock_actuel INT DEFAULT 0,
    stock_minimum INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Corriger la table factures
-- Supprimer la table existante si elle a une mauvaise structure
DROP TABLE IF EXISTS factures;

-- Recréer la table factures avec la bonne structure
CREATE TABLE factures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) UNIQUE,
    client_id INT,
    reparation_id INT,
    montant_ht DECIMAL(10,2),
    montant_ttc DECIMAL(10,2),
    statut ENUM('brouillon', 'envoyee', 'payee', 'annulee') DEFAULT 'brouillon',
    date_facture TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (reparation_id) REFERENCES reparations(id) ON DELETE SET NULL
);

-- 3. Insérer des données de test pour les pieces
INSERT INTO pieces (nom, reference, categorie, fournisseur, prix_achat, prix_vente, stock_actuel, stock_minimum) VALUES
('Filtre à huile', 'FIL-001', 'entretien', 'Bosch', 8.50, 15.00, 25, 5),
('Plaquettes de frein avant', 'FRE-001', 'freinage', 'Valeo', 25.00, 45.00, 15, 3),
('Batterie 60Ah', 'BAT-001', 'electricite', 'Varta', 65.00, 120.00, 8, 2),
('Pneus 205/55R16', 'PNE-001', 'roues', 'Michelin', 45.00, 85.00, 12, 4),
('Amortisseur avant', 'SUS-001', 'suspension', 'Sachs', 35.00, 65.00, 6, 2),
('Bougie d\'allumage', 'BOU-001', 'moteur', 'NGK', 3.50, 8.00, 50, 10),
('Liquide de refroidissement', 'REF-001', 'refroidissement', 'Total', 12.00, 22.00, 20, 5),
('Huile moteur 5W30', 'HUI-001', 'lubrifiant', 'Castrol', 15.00, 28.00, 30, 8);

-- 4. Insérer des données de test pour les factures
INSERT INTO factures (numero, client_id, reparation_id, montant_ht, montant_ttc, statut) VALUES
('FAC-2024-001', 1, 1, 120.00, 144.00, 'payee'),
('FAC-2024-002', 2, 2, 85.00, 102.00, 'envoyee'),
('FAC-2024-003', 3, 3, 200.00, 240.00, 'brouillon');

-- 5. Vérifier que les tables ont la bonne structure
SELECT 'Table pieces créée avec succès' as message;
SELECT COUNT(*) as nombre_pieces FROM pieces;

SELECT 'Table factures créée avec succès' as message;
SELECT COUNT(*) as nombre_factures FROM factures;




