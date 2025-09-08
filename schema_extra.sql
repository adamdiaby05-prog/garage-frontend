-- Tables additionnelles pour les fonctionnalités Boutique/Fournisseurs
USE garage_db;

CREATE TABLE IF NOT EXISTS fournisseurs (
  id_fournisseur INT AUTO_INCREMENT PRIMARY KEY,
  nom_fournisseur VARCHAR(255) NOT NULL,
  adresse VARCHAR(255) NULL,
  telephone VARCHAR(50) NULL,
  email VARCHAR(150) NULL,
  contact_principal VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS produits (
  id_produit INT AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(100),
  nom_produit VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  categorie VARCHAR(100),
  image VARCHAR(255),
  note DECIMAL(3,2) DEFAULT 4.00,
  nombre_avis INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories_boutique (
  id_categorie INT AUTO_INCREMENT PRIMARY KEY,
  nom_categorie VARCHAR(150) NOT NULL,
  actif TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS photos_produits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  produit_id INT NOT NULL,
  nom_fichier VARCHAR(255),
  chemin_fichier VARCHAR(255),
  type_mime VARCHAR(100),
  taille_fichier INT,
  image_data LONGBLOB,
  est_principale TINYINT(1) DEFAULT 0,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (produit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS commandes_boutique (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_produit INT,
  nom_produit VARCHAR(255),
  reference_produit VARCHAR(100),
  prix_produit DECIMAL(10,2),
  image_produit VARCHAR(255),
  quantite INT,
  nom_client VARCHAR(150),
  email_client VARCHAR(150),
  telephone_client VARCHAR(50),
  adresse_client VARCHAR(255),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  statut VARCHAR(50) DEFAULT 'Nouveau',
  date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


