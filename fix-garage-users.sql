-- Script pour fusionner et régler les utilisateurs role='garage'
USE garage_db;

-- 1. Vérifier l'état actuel
SELECT '=== ÉTAT ACTUEL ===' as info;
SELECT 'Utilisateurs role=garage:' as type;
SELECT id, nom, prenom, email, garage_id, role FROM utilisateurs WHERE role = 'garage';

SELECT 'Garages disponibles:' as type;
SELECT id, nom_garage, email, ville FROM garages ORDER BY id;

-- 2. Créer des garages pour les utilisateurs role='garage' qui n'en ont pas
INSERT INTO garages (nom_garage, adresse, ville, code_postal, telephone, email, specialites, statut)
SELECT 
    CONCAT(COALESCE(nom, ''), ' ', COALESCE(prenom, '')).trim() as nom_garage,
    COALESCE(adresse, 'Adresse non spécifiée') as adresse,
    COALESCE(ville, 'Ville non spécifiée') as ville,
    COALESCE(code_postal, '00000') as code_postal,
    COALESCE(telephone, 'Non spécifié') as telephone,
    email,
    'Services de réparation automobile' as specialites,
    'actif' as statut
FROM utilisateurs 
WHERE role = 'garage' 
AND garage_id IS NULL
AND email IS NOT NULL;

-- 3. Associer les utilisateurs garage aux garages créés
UPDATE utilisateurs u
JOIN garages g ON u.email = g.email
SET u.garage_id = g.id
WHERE u.role = 'garage' 
AND u.garage_id IS NULL;

-- 4. Pour les utilisateurs restants sans garage_id, les associer au premier garage
UPDATE utilisateurs u
CROSS JOIN (SELECT MIN(id) as first_garage_id FROM garages) g
SET u.garage_id = g.first_garage_id
WHERE u.role = 'garage' 
AND u.garage_id IS NULL;

-- 5. Vérifier le résultat final
SELECT '=== RÉSULTAT FINAL ===' as info;
SELECT 'Utilisateurs garage liés:' as type;
SELECT u.id, u.nom, u.prenom, u.email, u.garage_id, g.nom_garage, g.ville
FROM utilisateurs u 
LEFT JOIN garages g ON u.garage_id = g.id 
WHERE u.role = 'garage';

SELECT 'Statistiques:' as type;
SELECT 
    COUNT(*) as total_utilisateurs_garage,
    COUNT(garage_id) as utilisateurs_lies,
    COUNT(*) - COUNT(garage_id) as utilisateurs_non_lies
FROM utilisateurs 
WHERE role = 'garage';


