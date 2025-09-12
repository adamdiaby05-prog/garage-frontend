-- Script pour créer la table garages et adapter le système
-- Exécutez ce script dans votre base de données MySQL

USE garage_db;

-- 1. Créer la table garages
CREATE TABLE IF NOT EXISTS garages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_garage VARCHAR(200) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    telephone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    siret VARCHAR(14),
    specialites TEXT COMMENT 'Services proposés par le garage',
    statut ENUM('actif', 'inactif', 'en_attente') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Créer la table demandes_prestations (remplace rendez-vous)
CREATE TABLE IF NOT EXISTS demandes_prestations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    vehicule_id INT NOT NULL,
    service_id INT NOT NULL,
    garage_id INT,
    date_demande DATETIME NOT NULL,
    date_souhaitee DATETIME,
    description_probleme TEXT,
    statut ENUM('en_attente', 'acceptee', 'en_cours', 'terminee', 'annulee') DEFAULT 'en_attente',
    prix_estime DECIMAL(10,2),
    duree_estimee INT COMMENT 'Durée estimée en minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (garage_id) REFERENCES garages(id) ON DELETE SET NULL
);

-- 3. Créer la table reparations_garages (liaison réparations <-> garages)
CREATE TABLE IF NOT EXISTS reparations_garages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reparation_id INT NOT NULL,
    garage_id INT NOT NULL,
    date_assignation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('assignee', 'en_cours', 'terminee') DEFAULT 'assignee',
    FOREIGN KEY (reparation_id) REFERENCES reparations(id) ON DELETE CASCADE,
    FOREIGN KEY (garage_id) REFERENCES garages(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reparation_garage (reparation_id, garage_id)
);

-- 4. Ajouter des colonnes à la table utilisateurs pour les garages
ALTER TABLE utilisateurs 
ADD COLUMN IF NOT EXISTS garage_id INT NULL,
ADD COLUMN IF NOT EXISTS role_garage ENUM('proprietaire', 'employe') NULL,
ADD FOREIGN KEY (garage_id) REFERENCES garages(id) ON DELETE SET NULL;

-- 5. Insérer des données de test pour les garages
INSERT INTO garages (nom_garage, adresse, ville, code_postal, telephone, email, specialites, statut) VALUES
('Garage Auto Pro', '123 Rue de la Mécanique', 'Paris', '75001', '01 23 45 67 89', 'contact@garageautopro.fr', 'Vidange, Révision, Diagnostic, Réparation moteur', 'actif'),
('Mécanique Express', '456 Avenue des Réparations', 'Lyon', '69001', '04 78 90 12 34', 'info@mecaniqueexpress.fr', 'Contrôle technique, Montage pneus, Climatisation', 'actif'),
('Auto Service Plus', '789 Boulevard Central', 'Marseille', '13001', '04 91 23 45 67', 'service@autoserviceplus.fr', 'Réparation carrosserie, Peinture, Électricité auto', 'en_attente');

-- 6. Mettre à jour les utilisateurs existants avec le rôle 'garage' au lieu de 'mecanicien'
UPDATE utilisateurs 
SET role = 'garage', garage_id = 1 
WHERE role = 'mecanicien' AND email LIKE '%@garage%';

-- 7. Créer des index pour optimiser les performances
CREATE INDEX idx_garages_ville ON garages(ville);
CREATE INDEX idx_garages_statut ON garages(statut);
CREATE INDEX idx_demandes_prestations_client ON demandes_prestations(client_id);
CREATE INDEX idx_demandes_prestations_garage ON demandes_prestations(garage_id);
CREATE INDEX idx_demandes_prestations_statut ON demandes_prestations(statut);
CREATE INDEX idx_demandes_prestations_date ON demandes_prestations(date_demande);
CREATE INDEX idx_reparations_garages_reparation ON reparations_garages(reparation_id);
CREATE INDEX idx_reparations_garages_garage ON reparations_garages(garage_id);








