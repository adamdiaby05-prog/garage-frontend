-- Script de correction de la table rendez_vous
-- Exécutez ce script dans phpMyAdmin pour corriger la table

USE garage_db;

-- 1. Vérifier la structure actuelle de la table rendez_vous
DESCRIBE rendez_vous;

-- 2. Ajouter la colonne motif si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'rendez_vous' 
     AND COLUMN_NAME = 'motif') = 0,
    'ALTER TABLE rendez_vous ADD COLUMN motif TEXT AFTER date_rdv',
    'SELECT "Colonne motif existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Vérifier si d'autres colonnes importantes existent
-- Ajouter la colonne notes si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'rendez_vous' 
     AND COLUMN_NAME = 'notes') = 0,
    'ALTER TABLE rendez_vous ADD COLUMN notes TEXT AFTER motif',
    'SELECT "Colonne notes existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne duree_estimee si elle n'existe pas
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'garage_db' 
     AND TABLE_NAME = 'rendez_vous' 
     AND COLUMN_NAME = 'duree_estimee') = 0,
    'ALTER TABLE rendez_vous ADD COLUMN duree_estimee INT DEFAULT 60 AFTER notes',
    'SELECT "Colonne duree_estimee existe déjà" as message'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Insérer des données de test pour les rendez-vous (seulement si la table est vide)
INSERT IGNORE INTO rendez_vous (client_id, vehicule_id, employe_id, service_id, date_rdv, motif, statut, notes, duree_estimee) VALUES
(1, 1, 1, 1, '2024-12-20 10:00:00', 'Vidange et contrôle général', 'confirme', 'Client préfère le matin', 90),
(2, 2, 1, 2, '2024-12-21 14:00:00', 'Réparation freins', 'confirme', 'Urgent - freins qui grincent', 120),
(3, 3, 2, 3, '2024-12-22 09:00:00', 'Diagnostic moteur', 'en_attente', 'Moteur qui tousse', 60);

-- 5. Vérifier la structure finale de la table
SELECT 'Structure de la table rendez_vous:' as message;
DESCRIBE rendez_vous;

-- 6. Compter les enregistrements
SELECT 'Nombre de rendez-vous:' as message, COUNT(*) as total FROM rendez_vous;

-- 7. Afficher les données de test
SELECT 
    rv.id,
    c.nom as client_nom,
    v.immatriculation,
    e.nom as employe_nom,
    s.nom as service_nom,
    rv.date_rdv,
    rv.motif,
    rv.statut,
    rv.notes,
    rv.duree_estimee
FROM rendez_vous rv
LEFT JOIN clients c ON rv.client_id = c.id
LEFT JOIN vehicules v ON rv.vehicule_id = v.id
LEFT JOIN employes e ON rv.employe_id = e.id
LEFT JOIN services s ON rv.service_id = s.id
ORDER BY rv.date_rdv;




