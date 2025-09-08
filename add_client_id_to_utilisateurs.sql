-- Script pour ajouter client_id à la table utilisateurs
USE garage_db;

-- Ajouter la colonne client_id si elle n'existe pas
ALTER TABLE utilisateurs 
ADD COLUMN IF NOT EXISTS client_id INT NULL,
ADD FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Afficher la structure de la table
DESCRIBE utilisateurs;
