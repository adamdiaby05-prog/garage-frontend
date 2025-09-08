-- Script de création de la base de données Garage pour MySQL XAMPP
-- Exécutez ce script dans phpMyAdmin ou dans MySQL

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS garage_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE garage_db;

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20),
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des employés
CREATE TABLE IF NOT EXISTS employes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20),
    role ENUM('admin', 'mecanicien', 'secretaire', 'vendeur') DEFAULT 'mecanicien',
    salaire DECIMAL(10,2),
    date_embauche DATE,
    statut ENUM('actif', 'inactif') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des véhicules
CREATE TABLE IF NOT EXISTS vehicules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    marque VARCHAR(100) NOT NULL,
    modele VARCHAR(100) NOT NULL,
    immatriculation VARCHAR(20) UNIQUE,
    annee INT,
    kilometrage INT,
    carburant ENUM('Essence', 'Diesel', 'Électrique', 'Hybride'),
    client_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Table des réparations
CREATE TABLE IF NOT EXISTS reparations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) UNIQUE,
    client_id INT,
    vehicule_id INT,
    employe_id INT,
    probleme TEXT,
    diagnostic TEXT,
    statut ENUM('en_cours', 'termine', 'en_attente', 'annule') DEFAULT 'en_cours',
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE SET NULL
);

-- Table des factures
CREATE TABLE IF NOT EXISTS factures (
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

-- Table des pièces
CREATE TABLE IF NOT EXISTS pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    reference VARCHAR(100) UNIQUE,
    categorie VARCHAR(100),
    fournisseur VARCHAR(255),
    prix_achat DECIMAL(10,2),
    prix_vente DECIMAL(10,2),
    stock_actuel INT DEFAULT 0,
    stock_minimum INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des services
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    categorie VARCHAR(100),
    prix DECIMAL(10,2),
    duree_estimee INT COMMENT 'Durée estimée en minutes',
    statut ENUM('actif', 'inactif') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS rendez_vous (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    vehicule_id INT,
    employe_id INT,
    service_id INT,
    date_rdv DATETIME,
    motif TEXT,
    statut ENUM('en_attente', 'confirme', 'annule', 'termine') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- Insertion de données de test
INSERT INTO clients (nom, prenom, email, telephone, adresse, ville, code_postal) VALUES
('Dupont', 'Jean', 'jean.dupont@email.com', '0123456789', '123 Rue de la Paix', 'Paris', '75001'),
('Martin', 'Marie', 'marie.martin@email.com', '0987654321', '456 Avenue des Champs', 'Lyon', '69001'),
('Bernard', 'Pierre', 'pierre.bernard@email.com', '0555666777', '789 Boulevard Central', 'Marseille', '13001');

INSERT INTO employes (nom, prenom, email, telephone, role, salaire) VALUES
('Dubois', 'Michel', 'michel.dubois@garage.com', '0111222333', 'mecanicien', 2500.00),
('Leroy', 'Sophie', 'sophie.leroy@garage.com', '0444555666', 'secretaire', 2200.00),
('Moreau', 'Thomas', 'thomas.moreau@garage.com', '0777888999', 'mecanicien', 2400.00);

INSERT INTO vehicules (marque, modele, immatriculation, annee, kilometrage, carburant, client_id) VALUES
('Peugeot', '308', 'AB-123-CD', 2020, 45000, 'Essence', 1),
('Renault', 'Clio', 'EF-456-GH', 2019, 32000, 'Diesel', 2),
('Citroën', 'C3', 'IJ-789-KL', 2021, 18000, 'Essence', 3);

INSERT INTO reparations (numero, client_id, vehicule_id, employe_id, probleme, diagnostic, statut) VALUES
('REP-2024-001', 1, 1, 1, 'Problème de démarrage', 'Batterie déchargée', 'termine'),
('REP-2024-002', 2, 2, 3, 'Bruit moteur', 'Vidange nécessaire', 'en_cours'),
('REP-2024-003', 3, 3, 1, 'Freins qui grincent', 'Plaquettes usées', 'en_cours');

INSERT INTO factures (numero, client_id, reparation_id, montant_ht, montant_ttc, statut) VALUES
('FAC-2024-001', 1, 1, 120.00, 144.00, 'payee'),
('FAC-2024-002', 2, 2, 85.00, 102.00, 'brouillon'),
('FAC-2024-003', 3, 3, 95.00, 114.00, 'brouillon');

INSERT INTO pieces (nom, reference, categorie, fournisseur, prix_achat, prix_vente, stock_actuel) VALUES
('Filtre à huile', 'FIL-001', 'Filtres', 'Bosch', 8.50, 15.00, 25),
('Plaquettes de frein', 'PLA-001', 'Freinage', 'Valeo', 25.00, 45.00, 15),
('Batterie', 'BAT-001', 'Électricité', 'Varta', 65.00, 120.00, 8);

INSERT INTO services (nom, description, categorie, prix, duree_estimee) VALUES
('Vidange', 'Vidange d''huile et changement de filtre', 'Entretien', 45.00, 60),
('Diagnostic', 'Diagnostic électronique véhicule', 'Diagnostic', 35.00, 30),
('Révision complète', 'Révision complète du véhicule', 'Entretien', 120.00, 120);

INSERT INTO rendez_vous (client_id, vehicule_id, employe_id, service_id, date_rdv, motif, statut) VALUES
(1, 1, 1, 1, '2024-01-15 10:00:00', 'Vidange annuelle', 'confirme'),
(2, 2, 3, 2, '2024-01-16 14:00:00', 'Bruit moteur', 'en_attente'),
(3, 3, 1, 3, '2024-01-17 09:00:00', 'Révision complète', 'confirme');

-- Afficher les données insérées
SELECT 'Clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'Employés', COUNT(*) FROM employes
UNION ALL
SELECT 'Véhicules', COUNT(*) FROM vehicules
UNION ALL
SELECT 'Réparations', COUNT(*) FROM reparations
UNION ALL
SELECT 'Factures', COUNT(*) FROM factures
UNION ALL
SELECT 'Pièces', COUNT(*) FROM pieces
UNION ALL
SELECT 'Services', COUNT(*) FROM services
UNION ALL
SELECT 'Rendez-vous', COUNT(*) FROM rendez_vous;
