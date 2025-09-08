-- Script de mise à jour du schéma de la base de données garage_db
-- Ajout des champs manquants pour les catégories

-- 1. Ajouter le champ categorie à la table pieces
ALTER TABLE pieces ADD COLUMN categorie VARCHAR(50) DEFAULT 'accessoires' AFTER nom;

-- 2. Ajouter le champ categorie à la table services
ALTER TABLE services ADD COLUMN categorie VARCHAR(50) DEFAULT 'maintenance' AFTER nom;

-- 3. Ajouter le champ description à la table services (si pas déjà présent)
ALTER TABLE services ADD COLUMN description TEXT AFTER nom;

-- 4. Ajouter le champ statut à la table services (si pas déjà présent)
ALTER TABLE services ADD COLUMN statut ENUM('actif', 'inactif') DEFAULT 'actif' AFTER duree_minutes;

-- 5. Mettre à jour les données existantes des pièces avec des catégories appropriées
UPDATE pieces SET categorie = 'filtres' WHERE nom LIKE '%filtre%';
UPDATE pieces SET categorie = 'lubrifiants' WHERE nom LIKE '%huile%';
UPDATE pieces SET categorie = 'freinage' WHERE nom LIKE '%frein%' OR nom LIKE '%plaquette%';
UPDATE pieces SET categorie = 'pneus' WHERE nom LIKE '%pneu%';

-- 6. Mettre à jour les données existantes des services avec des catégories appropriées
UPDATE services SET categorie = 'maintenance' WHERE nom IN ('Vidange', 'Révision complète');
UPDATE services SET categorie = 'diagnostic' WHERE nom = 'Diagnostic électronique';
UPDATE services SET categorie = 'freinage' WHERE nom = 'Contrôle freins';
UPDATE services SET categorie = 'pneus' WHERE nom = 'Montage pneus';

-- 7. Ajouter des descriptions aux services existants
UPDATE services SET description = 'Remplacement de l\'huile moteur et du filtre à huile' WHERE nom = 'Vidange';
UPDATE services SET description = 'Contrôle complet du véhicule et remplacement des éléments d\'usure' WHERE nom = 'Révision complète';
UPDATE services SET description = 'Vérification et réglage du système de freinage' WHERE nom = 'Contrôle freins';
UPDATE services SET description = 'Montage et équilibrage des pneus' WHERE nom = 'Montage pneus';
UPDATE services SET description = 'Diagnostic des systèmes électroniques du véhicule' WHERE nom = 'Diagnostic électronique';

-- 8. Vérifier que tous les services sont actifs
UPDATE services SET statut = 'actif' WHERE statut IS NULL;

-- 9. Ajouter des contraintes pour améliorer l'intégrité des données
ALTER TABLE pieces MODIFY COLUMN categorie VARCHAR(50) NOT NULL DEFAULT 'accessoires';
ALTER TABLE services MODIFY COLUMN categorie VARCHAR(50) NOT NULL DEFAULT 'maintenance';
ALTER TABLE services MODIFY COLUMN statut ENUM('actif', 'inactif') NOT NULL DEFAULT 'actif';
