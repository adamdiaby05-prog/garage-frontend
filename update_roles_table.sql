-- Script pour ajouter le rôle 'client' à la table utilisateurs
USE garage_db;

-- Modifier la colonne role pour inclure 'client'
ALTER TABLE utilisateurs 
MODIFY COLUMN role ENUM('admin','gerant','mecanicien','vendeur','secretaire','client') DEFAULT 'client';

-- Mettre à jour les utilisateurs existants avec type_compte = 'client' pour avoir role = 'client'
UPDATE utilisateurs 
SET role = 'client' 
WHERE type_compte = 'client' AND role = 'mecanicien';

-- Afficher la structure de la table
DESCRIBE utilisateurs;

-- Afficher les utilisateurs existants
SELECT id, email, role, type_compte FROM utilisateurs;
