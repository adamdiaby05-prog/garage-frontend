-- Script pour lier les utilisateurs role='garage' aux garages existants
USE garage_db;

-- 1. Vérifier les utilisateurs avec role='garage' qui n'ont pas de garage_id
SELECT 'Utilisateurs garage sans garage_id:' as info;
SELECT id, nom, prenom, email, garage_id, role FROM utilisateurs WHERE role = 'garage' AND garage_id IS NULL;

-- 2. Vérifier les garages disponibles
SELECT 'Garages disponibles:' as info;
SELECT id, nom_garage, email, ville FROM garages ORDER BY id;

-- 3. Associer les utilisateurs garage aux garages par email (si correspondance)
UPDATE utilisateurs u 
JOIN garages g ON u.email = g.email 
SET u.garage_id = g.id 
WHERE u.role = 'garage' AND u.garage_id IS NULL;

-- 4. Pour les utilisateurs restants, les associer au premier garage disponible
UPDATE utilisateurs u 
CROSS JOIN (SELECT MIN(id) as first_garage_id FROM garages) g
SET u.garage_id = g.first_garage_id 
WHERE u.role = 'garage' AND u.garage_id IS NULL;

-- 5. Vérifier le résultat final
SELECT 'Resultat final - Utilisateurs garage lies:' as info;
SELECT u.id, u.nom, u.prenom, u.email, u.garage_id, g.nom_garage, g.ville
FROM utilisateurs u 
LEFT JOIN garages g ON u.garage_id = g.id 
WHERE u.role = 'garage';

-- 6. Compter les utilisateurs garage liés
SELECT 'Statistiques:' as info;
SELECT 
    COUNT(*) as total_utilisateurs_garage,
    COUNT(garage_id) as utilisateurs_lies,
    COUNT(*) - COUNT(garage_id) as utilisateurs_non_lies
FROM utilisateurs 
WHERE role = 'garage';


