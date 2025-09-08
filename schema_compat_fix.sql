-- Correctifs de compatibilité (MariaDB) pour les noms legacy
USE garage_db;

-- Clients: id_client -> id
ALTER TABLE clients 
  ADD COLUMN IF NOT EXISTS id_client INT GENERATED ALWAYS AS (id) VIRTUAL;

-- Vehicules: id_vehicule -> id, id_client -> client_id, numero_immatriculation -> immatriculation
ALTER TABLE vehicules 
  ADD COLUMN IF NOT EXISTS id_vehicule INT GENERATED ALWAYS AS (id) VIRTUAL,
  ADD COLUMN IF NOT EXISTS id_client INT GENERATED ALWAYS AS (client_id) VIRTUAL,
  ADD COLUMN IF NOT EXISTS numero_immatriculation VARCHAR(20) GENERATED ALWAYS AS (immatriculation) VIRTUAL;

-- Reparations: id_reparation -> id, id_vehicule -> vehicule_id, id_employe -> employe_id, date_entree -> date_debut
ALTER TABLE reparations 
  ADD COLUMN IF NOT EXISTS id_reparation INT GENERATED ALWAYS AS (id) VIRTUAL,
  ADD COLUMN IF NOT EXISTS id_vehicule INT GENERATED ALWAYS AS (vehicule_id) VIRTUAL,
  ADD COLUMN IF NOT EXISTS id_employe INT GENERATED ALWAYS AS (employe_id) VIRTUAL,
  ADD COLUMN IF NOT EXISTS date_entree DATETIME GENERATED ALWAYS AS (date_debut) VIRTUAL;


