-- Création de la table commandes_boutique
CREATE TABLE IF NOT EXISTS commandes_boutique (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_produit INT,
  nom_produit VARCHAR(255) NOT NULL,
  reference_produit VARCHAR(100),
  prix_produit DECIMAL(10,2) NOT NULL,
  image_produit TEXT,
  quantite INT NOT NULL DEFAULT 1,
  nom_client VARCHAR(255) NOT NULL,
  email_client VARCHAR(255) NOT NULL,
  telephone_client VARCHAR(50),
  adresse_client TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  statut ENUM('Nouveau', 'En préparation', 'Expédié', 'Livré', 'Annulé') DEFAULT 'Nouveau',
  date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date_commande (date_commande),
  INDEX idx_statut (statut),
  INDEX idx_email_client (email_client)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
