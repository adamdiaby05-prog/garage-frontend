-- Script pour créer les tables manquantes
-- Exécutez ce script dans phpMyAdmin

USE garage_db;

-- Table clients (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20),
    adresse TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table vehicules (si elle n'existe pas)
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

-- Table employes (si elle n'existe pas)
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

-- Table pieces (si elle n'existe pas)
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

-- Table reparations (si elle n'existe pas)
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

-- Table factures (si elle n'existe pas)
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

-- Table rendez_vous (si elle n'existe pas)
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

-- Vérification
SELECT '=== TABLES CRÉÉES ===' as message;
SHOW TABLES;





















































