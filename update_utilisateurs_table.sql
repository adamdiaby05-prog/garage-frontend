-- Script pour ajouter le champ type_compte à la table utilisateurs
USE garage_db;

-- Ajouter la colonne type_compte si elle n'existe pas
ALTER TABLE utilisateurs 
ADD COLUMN IF NOT EXISTS type_compte ENUM('admin', 'mecanicien', 'client') NOT NULL DEFAULT 'client';

-- Mettre à jour les utilisateurs existants
UPDATE utilisateurs SET type_compte = 'admin' WHERE email = 'admin@garage.com';

-- Ajouter un index sur type_compte pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_utilisateurs_type_compte ON utilisateurs(type_compte);

-- Afficher la structure de la table
DESCRIBE utilisateurs;
