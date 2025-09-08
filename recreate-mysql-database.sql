-- Script de recréation complète de la base de données garage_db
-- Exécutez ce script dans phpMyAdmin après avoir réparé MySQL

-- 1. Créer la base de données
CREATE DATABASE IF NOT EXISTS garage_db;
USE garage_db;

-- 2. Table clients
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20),
    adresse TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table vehicules
CREATE TABLE IF NOT EXISTS vehicules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    marque VARCHAR(50) NOT NULL,
    modele VARCHAR(50) NOT NULL,
    annee INT,
    immatriculation VARCHAR(20) UNIQUE,
    couleur VARCHAR(30),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 4. Table employes
CREATE TABLE IF NOT EXISTS employes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    poste VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20),
    date_embauche DATE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table pieces (produits)
CREATE TABLE IF NOT EXISTS pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    reference VARCHAR(100) UNIQUE,
    categorie VARCHAR(50),
    fournisseur VARCHAR(100),
    prix_achat DECIMAL(10,2) DEFAULT 0.00,
    prix_vente DECIMAL(10,2) DEFAULT 0.00,
    stock_actuel INT DEFAULT 0,
    stock_minimum INT DEFAULT 5,
    image_url VARCHAR(255),
    description TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table reparations
CREATE TABLE IF NOT EXISTS reparations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicule_id INT,
    client_id INT,
    employe_id INT,
    description TEXT NOT NULL,
    statut ENUM('en_cours', 'termine', 'annule') DEFAULT 'en_cours',
    date_debut DATE,
    date_fin DATE,
    cout_materiaux DECIMAL(10,2) DEFAULT 0.00,
    cout_main_oeuvre DECIMAL(10,2) DEFAULT 0.00,
    total_ht DECIMAL(10,2) DEFAULT 0.00,
    total_ttc DECIMAL(10,2) DEFAULT 0.00,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE SET NULL
);

-- 7. Table factures
CREATE TABLE IF NOT EXISTS factures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reparation_id INT,
    client_id INT,
    numero_facture VARCHAR(50) UNIQUE,
    date_facture DATE,
    montant_ht DECIMAL(10,2) DEFAULT 0.00,
    montant_ttc DECIMAL(10,2) DEFAULT 0.00,
    statut ENUM('brouillon', 'envoyee', 'payee', 'annulee') DEFAULT 'brouillon',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reparation_id) REFERENCES reparations(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 8. Table rendez_vous
CREATE TABLE IF NOT EXISTS rendez_vous (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    vehicule_id INT,
    employe_id INT,
    date_rdv DATETIME NOT NULL,
    motif VARCHAR(255),
    notes TEXT,
    duree_estimee INT DEFAULT 60,
    statut ENUM('planifie', 'confirme', 'en_cours', 'termine', 'annule') DEFAULT 'planifie',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE SET NULL
);

-- 9. Insertion de données de test

-- Clients de test
INSERT INTO clients (nom, prenom, email, telephone, adresse) VALUES
('Dupont', 'Jean', 'jean.dupont@email.com', '0123456789', '123 Rue de la Paix, Paris'),
('Martin', 'Marie', 'marie.martin@email.com', '0987654321', '456 Avenue des Champs, Lyon'),
('Bernard', 'Pierre', 'pierre.bernard@email.com', '0555666777', '789 Boulevard Central, Marseille');

-- Employés de test
INSERT INTO employes (nom, prenom, poste, email, telephone, date_embauche) VALUES
('Dubois', 'Michel', 'Mécanicien', 'michel.dubois@garage.com', '0111222333', '2020-01-15'),
('Leroy', 'Sophie', 'Réceptionniste', 'sophie.leroy@garage.com', '0444555666', '2021-03-20'),
('Moreau', 'Thomas', 'Mécanicien', 'thomas.moreau@garage.com', '0777888999', '2019-11-10');

-- Véhicules de test
INSERT INTO vehicules (client_id, marque, modele, annee, immatriculation, couleur) VALUES
(1, 'Renault', 'Clio', 2018, 'AB-123-CD', 'Blanc'),
(2, 'Peugeot', '208', 2020, 'EF-456-GH', 'Bleu'),
(3, 'Citroën', 'C3', 2019, 'IJ-789-KL', 'Rouge');

-- Pièces de test
INSERT INTO pieces (nom, reference, categorie, fournisseur, prix_achat, prix_vente, stock_actuel, stock_minimum) VALUES
('Filtre à air moteur', 'FIL-001', 'filtres', 'Mann Filter', 8.50, 15.00, 25, 5),
('Plaquettes de frein avant', 'FRE-001', 'freinage', 'Brembo', 25.00, 45.00, 15, 3),
('Batterie 12V 60Ah', 'BAT-001', 'électricité', 'Bosch', 45.00, 75.00, 8, 2),
('Huile moteur 5W30', 'HUI-001', 'lubrifiants', 'Total', 12.00, 22.00, 30, 10),
('Bougies d''allumage', 'BOU-001', 'moteur', 'NGK', 3.50, 8.00, 50, 15);

-- Réparations de test
INSERT INTO reparations (vehicule_id, client_id, employe_id, description, statut, date_debut, cout_materiaux, cout_main_oeuvre, total_ht, total_ttc) VALUES
(1, 1, 1, 'Vidange et changement filtre à air', 'termine', '2024-01-15', 25.00, 50.00, 75.00, 90.00),
(2, 2, 3, 'Remplacement plaquettes de frein', 'en_cours', '2024-01-20', 45.00, 80.00, 125.00, 150.00),
(3, 3, 1, 'Diagnostic moteur', 'en_cours', '2024-01-18', 0.00, 30.00, 30.00, 36.00);

-- Rendez-vous de test
INSERT INTO rendez_vous (client_id, vehicule_id, employe_id, date_rdv, motif, statut) VALUES
(1, 1, 1, '2024-01-25 09:00:00', 'Révision générale', 'planifie'),
(2, 2, 3, '2024-01-26 14:00:00', 'Réparation freins', 'confirme'),
(3, 3, 1, '2024-01-27 10:30:00', 'Diagnostic', 'planifie');

-- Vérification finale
SELECT '=== BASE DE DONNÉES CRÉÉE AVEC SUCCÈS ===' as message;
SELECT 'Tables créées:' as info;
SHOW TABLES;

SELECT '=== DONNÉES DE TEST ===' as message;
SELECT COUNT(*) as nb_clients FROM clients;
SELECT COUNT(*) as nb_pieces FROM pieces;
SELECT COUNT(*) as nb_reparations FROM reparations; 