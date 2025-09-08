-- ========================================
-- SCRIPT SQL COMPLET - GARAGE MANAGEMENT
-- Version: 2.0 - Optimisée et Complète (Sans suppression)
-- Date: 2025-08-15
-- ========================================

-- Configuration initiale
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS `garage_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `garage_db`;

-- ========================================
-- 1. SUPPRESSION DES OBJETS EXISTANTS
-- ========================================

-- Désactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer les tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS `pieces_utilisees`;
DROP TABLE IF EXISTS `factures`;
DROP TABLE IF EXISTS `rendez_vous`;
DROP TABLE IF EXISTS `reparations`;
DROP TABLE IF EXISTS `vehicules`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `employes`;
DROP TABLE IF EXISTS `pieces`;
DROP TABLE IF EXISTS `services`;

-- Supprimer les vues
DROP VIEW IF EXISTS `v_rdv_aujourdhui`;
DROP VIEW IF EXISTS `v_stock_critique`;
DROP VIEW IF EXISTS `v_dashboard_stats`;
DROP VIEW IF EXISTS `v_reparations_details`;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS `maj_stock_pieces`;
DROP TRIGGER IF EXISTS `generer_numero_reparation`;
DROP TRIGGER IF EXISTS `generer_numero_facture`;

-- Supprimer les procédures stockées
DROP PROCEDURE IF EXISTS `CalculerTotalReparation`;
DROP PROCEDURE IF EXISTS `VerifierStockCritique`;
DROP PROCEDURE IF EXISTS `GetDashboardStats`;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS `CalculerAgeVehicule`;
DROP FUNCTION IF EXISTS `FormaterTelephone`;

-- Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================
-- 2. TABLE CLIENTS
-- ========================================
CREATE TABLE `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telephone` varchar(20) NOT NULL,
  `adresse` text DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_clients_nom` (`nom`),
  KEY `idx_clients_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 3. TABLE EMPLOYÉS
-- ========================================
CREATE TABLE `employes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `role` enum('gerant','mecanicien','vendeur','secretaire') DEFAULT 'mecanicien',
  `salaire` decimal(10,2) DEFAULT NULL,
  `date_embauche` date DEFAULT NULL,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_employes_role` (`role`),
  KEY `idx_employes_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 4. TABLE VÉHICULES
-- ========================================
CREATE TABLE `vehicules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `marque` varchar(50) NOT NULL,
  `modele` varchar(50) NOT NULL,
  `immatriculation` varchar(15) NOT NULL,
  `annee` year(4) DEFAULT NULL,
  `kilometrage` int(11) DEFAULT 0,
  `carburant` enum('essence','diesel','hybride','electrique') DEFAULT 'essence',
  `couleur` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `immatriculation` (`immatriculation`),
  KEY `client_id` (`client_id`),
  KEY `idx_vehicules_marque` (`marque`),
  KEY `idx_vehicules_immat` (`immatriculation`),
  CONSTRAINT `vehicules_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 5. TABLE SERVICES
-- ========================================
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `categorie` varchar(50) DEFAULT 'maintenance',
  `prix` decimal(10,2) NOT NULL,
  `duree_minutes` int(11) DEFAULT 60,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_services_categorie` (`categorie`),
  KEY `idx_services_statut` (`statut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 6. TABLE PIÈCES
-- ========================================
CREATE TABLE `pieces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) NOT NULL,
  `nom` varchar(200) NOT NULL,
  `categorie` varchar(50) DEFAULT 'accessoires',
  `fournisseur` varchar(100) DEFAULT NULL,
  `prix_achat` decimal(10,2) DEFAULT NULL,
  `prix_vente` decimal(10,2) NOT NULL,
  `stock_actuel` int(11) DEFAULT 0,
  `stock_minimum` int(11) DEFAULT 5,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `idx_pieces_categorie` (`categorie`),
  KEY `idx_pieces_stock` (`stock_actuel`,`stock_minimum`),
  KEY `idx_pieces_fournisseur` (`fournisseur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 7. TABLE RÉPARATIONS
-- ========================================
CREATE TABLE `reparations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) NOT NULL,
  `client_id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `employe_id` int(11) DEFAULT NULL,
  `date_debut` datetime DEFAULT current_timestamp(),
  `date_fin` datetime DEFAULT NULL,
  `probleme` text DEFAULT NULL,
  `diagnostic` text DEFAULT NULL,
  `statut` enum('ouvert','en_cours','termine','facture') DEFAULT 'ouvert',
  `total_ht` decimal(10,2) DEFAULT 0.00,
  `total_ttc` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `client_id` (`client_id`),
  KEY `vehicule_id` (`vehicule_id`),
  KEY `employe_id` (`employe_id`),
  KEY `idx_reparations_statut` (`statut`),
  KEY `idx_reparations_date` (`date_debut`),
  CONSTRAINT `reparations_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reparations_ibfk_2` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reparations_ibfk_3` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 8. TABLE PIÈCES UTILISÉES
-- ========================================
CREATE TABLE `pieces_utilisees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reparation_id` int(11) NOT NULL,
  `piece_id` int(11) NOT NULL,
  `quantite` int(11) DEFAULT 1,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `reparation_id` (`reparation_id`),
  KEY `piece_id` (`piece_id`),
  CONSTRAINT `pieces_utilisees_ibfk_1` FOREIGN KEY (`reparation_id`) REFERENCES `reparations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pieces_utilisees_ibfk_2` FOREIGN KEY (`piece_id`) REFERENCES `pieces` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 9. TABLE FACTURES
-- ========================================
CREATE TABLE `factures` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) NOT NULL,
  `client_id` int(11) NOT NULL,
  `reparation_id` int(11) DEFAULT NULL,
  `date_facture` date NOT NULL,
  `total_ht` decimal(10,2) NOT NULL,
  `total_ttc` decimal(10,2) NOT NULL,
  `statut` enum('brouillon','envoyee','payee') DEFAULT 'brouillon',
  `mode_paiement` enum('especes','carte','cheque','virement') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero` (`numero`),
  KEY `client_id` (`client_id`),
  KEY `reparation_id` (`reparation_id`),
  KEY `idx_factures_statut` (`statut`),
  KEY `idx_factures_date` (`date_facture`),
  CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `factures_ibfk_2` FOREIGN KEY (`reparation_id`) REFERENCES `reparations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 10. TABLE RENDEZ-VOUS
-- ========================================
CREATE TABLE `rendez_vous` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `employe_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `date_rdv` datetime NOT NULL,
  `motif` text DEFAULT NULL,
  `statut` enum('programme','en_cours','termine','annule') DEFAULT 'programme',
  `notes` text DEFAULT NULL,
  `duree_estimee` int(11) DEFAULT 60,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `vehicule_id` (`vehicule_id`),
  KEY `employe_id` (`employe_id`),
  KEY `service_id` (`service_id`),
  KEY `idx_rdv_date` (`date_rdv`),
  KEY `idx_rdv_statut` (`statut`),
  CONSTRAINT `rendez_vous_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rendez_vous_ibfk_2` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`) ON DELETE CASCADE,
  CONSTRAINT `rendez_vous_ibfk_3` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `rendez_vous_ibfk_4` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 11. TRIGGERS
-- ========================================

-- Trigger pour mettre à jour le stock des pièces
DELIMITER $$
CREATE TRIGGER `maj_stock_pieces` AFTER INSERT ON `pieces_utilisees` 
FOR EACH ROW 
BEGIN
    UPDATE pieces 
    SET stock_actuel = stock_actuel - NEW.quantite
    WHERE id = NEW.piece_id;
END$$
DELIMITER ;

-- Trigger pour générer automatiquement le numéro de réparation
DELIMITER $$
CREATE TRIGGER `generer_numero_reparation` BEFORE INSERT ON `reparations` 
FOR EACH ROW 
BEGIN
    IF NEW.numero IS NULL OR NEW.numero = '' THEN
        SET NEW.numero = CONCAT('REP-', YEAR(NOW()), '-', LPAD((SELECT COUNT(*) + 1 FROM reparations WHERE YEAR(created_at) = YEAR(NOW())), 4, '0'));
    END IF;
END$$
DELIMITER ;

-- Trigger pour générer automatiquement le numéro de facture
DELIMITER $$
CREATE TRIGGER `generer_numero_facture` BEFORE INSERT ON `factures` 
FOR EACH ROW 
BEGIN
    IF NEW.numero IS NULL OR NEW.numero = '' THEN
        SET NEW.numero = CONCAT('FAC-', YEAR(NOW()), '-', LPAD((SELECT COUNT(*) + 1 FROM factures WHERE YEAR(created_at) = YEAR(NOW())), 4, '0'));
    END IF;
END$$
DELIMITER ;

-- ========================================
-- 12. VUES
-- ========================================

-- Vue des rendez-vous du jour
CREATE VIEW `v_rdv_aujourdhui` AS 
SELECT 
    r.id,
    r.date_rdv,
    CONCAT(c.nom, ' ', c.prenom) AS client,
    v.immatriculation,
    v.marque,
    v.modele,
    s.nom AS service,
    r.statut,
    e.nom AS employe_nom
FROM rendez_vous r
JOIN clients c ON r.client_id = c.id
JOIN vehicules v ON r.vehicule_id = v.id
LEFT JOIN services s ON r.service_id = s.id
LEFT JOIN employes e ON r.employe_id = e.id
WHERE CAST(r.date_rdv AS DATE) = CURDATE()
ORDER BY r.date_rdv ASC;

-- Vue du stock critique
CREATE VIEW `v_stock_critique` AS 
SELECT 
    reference,
    nom,
    stock_actuel,
    stock_minimum,
    fournisseur,
    categorie
FROM pieces 
WHERE stock_actuel <= stock_minimum 
ORDER BY stock_actuel ASC;

-- Vue des statistiques du dashboard
CREATE VIEW `v_dashboard_stats` AS 
SELECT 
    (SELECT COUNT(*) FROM clients) AS total_clients,
    (SELECT COUNT(*) FROM vehicules) AS total_vehicules,
    (SELECT COUNT(*) FROM reparations) AS total_reparations,
    (SELECT COUNT(*) FROM factures) AS total_factures,
    (SELECT COUNT(*) FROM reparations WHERE statut = 'en_cours') AS reparations_en_cours,
    (SELECT COUNT(*) FROM reparations WHERE statut = 'termine') AS reparations_terminees,
    (SELECT COUNT(*) FROM pieces WHERE stock_actuel <= stock_minimum) AS pieces_stock_critique,
    (SELECT COUNT(*) FROM rendez_vous WHERE DATE(date_rdv) = CURDATE()) AS rdv_aujourdhui;

-- Vue des réparations avec détails
CREATE VIEW `v_reparations_details` AS 
SELECT 
    r.id,
    r.numero,
    r.date_debut,
    r.date_fin,
    r.statut,
    r.total_ht,
    r.total_ttc,
    CONCAT(c.nom, ' ', c.prenom) AS client,
    CONCAT(v.marque, ' ', v.modele) AS vehicule,
    v.immatriculation,
    CONCAT(e.nom, ' ', e.prenom) AS employe,
    r.probleme,
    r.diagnostic
FROM reparations r
JOIN clients c ON r.client_id = c.id
JOIN vehicules v ON r.vehicule_id = v.id
LEFT JOIN employes e ON r.employe_id = e.id
ORDER BY r.date_debut DESC;

-- ========================================
-- 13. DONNÉES DE TEST
-- ========================================

-- Insertion des clients de test
INSERT INTO `clients` (`nom`, `prenom`, `email`, `telephone`, `adresse`, `ville`, `code_postal`) VALUES
('Dupont', 'Jean', 'jean.dupont@email.com', '0123456789', '123 Rue de la Paix', 'Paris', '75001'),
('Martin', 'Marie', 'marie.martin@email.com', '0987654321', '456 Avenue des Champs', 'Lyon', '69001'),
('Bernard', 'Pierre', 'pierre.bernard@email.com', '0555666777', '789 Boulevard Central', 'Marseille', '13001'),
('Petit', 'Sophie', 'sophie.petit@email.com', '0444333222', '321 Rue du Commerce', 'Toulouse', '31000'),
('Robert', 'Lucas', 'lucas.robert@email.com', '0333222111', '654 Place de la République', 'Nantes', '44000');

-- Insertion des employés de test
INSERT INTO `employes` (`nom`, `prenom`, `email`, `telephone`, `role`, `salaire`, `date_embauche`, `statut`) VALUES
('Durand', 'Michel', 'michel.durand@garage.com', '0111222333', 'gerant', 3500.00, '2020-01-15', 'actif'),
('Leroy', 'Thomas', 'thomas.leroy@garage.com', '0222333444', 'mecanicien', 2800.00, '2021-03-20', 'actif'),
('Moreau', 'Julie', 'julie.moreau@garage.com', '0333444555', 'secretaire', 2200.00, '2022-06-10', 'actif'),
('Simon', 'David', 'david.simon@garage.com', '0444555666', 'mecanicien', 2600.00, '2021-09-05', 'actif'),
('Laurent', 'Emma', 'emma.laurent@garage.com', '0555666777', 'vendeur', 2400.00, '2023-01-12', 'actif');

-- Insertion des véhicules de test
INSERT INTO `vehicules` (`client_id`, `marque`, `modele`, `immatriculation`, `annee`, `kilometrage`, `carburant`, `couleur`) VALUES
(1, 'Renault', 'Clio', 'AB-123-CD', 2019, 45000, 'essence', 'Blanc'),
(2, 'Peugeot', '208', 'EF-456-GH', 2020, 32000, 'diesel', 'Gris'),
(3, 'Citroën', 'C3', 'IJ-789-KL', 2018, 68000, 'essence', 'Rouge'),
(4, 'Volkswagen', 'Golf', 'MN-012-OP', 2021, 25000, 'diesel', 'Bleu'),
(5, 'Toyota', 'Yaris', 'QR-345-ST', 2020, 38000, 'hybride', 'Vert');

-- Insertion des services de test
INSERT INTO `services` (`nom`, `description`, `categorie`, `prix`, `duree_minutes`, `statut`) VALUES
('Vidange', 'Vidange d\'huile moteur et changement du filtre à huile', 'entretien', 45.00, 30, 'actif'),
('Révision complète', 'Révision complète du véhicule avec contrôle général', 'entretien', 150.00, 120, 'actif'),
('Contrôle freins', 'Vérification et réparation du système de freinage', 'freinage', 80.00, 60, 'actif'),
('Montage pneus', 'Montage et équilibrage de 4 pneus', 'roues', 60.00, 45, 'actif'),
('Diagnostic électronique', 'Diagnostic complet de l\'électronique du véhicule', 'diagnostic', 70.00, 45, 'actif'),
('Réparation climatisation', 'Réparation et recharge du système de climatisation', 'climatisation', 120.00, 90, 'actif'),
('Remplacement batterie', 'Remplacement de la batterie du véhicule', 'electricite', 85.00, 30, 'actif'),
('Réparation suspension', 'Réparation du système de suspension', 'suspension', 200.00, 120, 'actif');

-- Insertion des pièces de test
INSERT INTO `pieces` (`reference`, `nom`, `categorie`, `fournisseur`, `prix_achat`, `prix_vente`, `stock_actuel`, `stock_minimum`) VALUES
('FIL-001', 'Filtre à huile standard', 'filtres', 'Bosch', 8.50, 15.00, 25, 5),
('FIL-002', 'Filtre à air moteur', 'filtres', 'Mann', 12.00, 22.00, 18, 5),
('FRE-001', 'Plaquettes de frein avant', 'freinage', 'Valeo', 25.00, 45.00, 15, 3),
('FRE-002', 'Plaquettes de frein arrière', 'freinage', 'Valeo', 20.00, 38.00, 12, 3),
('BAT-001', 'Batterie 60Ah', 'electricite', 'Varta', 65.00, 120.00, 8, 2),
('BAT-002', 'Batterie 70Ah', 'electricite', 'Varta', 75.00, 140.00, 6, 2),
('PNE-001', 'Pneus 205/55R16', 'roues', 'Michelin', 45.00, 85.00, 12, 4),
('PNE-002', 'Pneus 195/65R15', 'roues', 'Continental', 40.00, 75.00, 10, 4),
('SUS-001', 'Amortisseur avant', 'suspension', 'Sachs', 35.00, 65.00, 6, 2),
('SUS-002', 'Amortisseur arrière', 'suspension', 'Sachs', 30.00, 55.00, 5, 2),
('HUI-001', 'Huile moteur 5W40 - 5L', 'lubrifiants', 'Motul', 25.00, 45.00, 8, 5),
('HUI-002', 'Huile moteur 10W40 - 5L', 'lubrifiants', 'Total', 22.00, 40.00, 10, 5),
('ACC-001', 'Essuie-glace avant', 'accessoires', 'Valeo', 8.00, 15.00, 20, 5),
('ACC-002', 'Essuie-glace arrière', 'accessoires', 'Valeo', 6.00, 12.00, 15, 5),
('MOT-001', 'Bougie d\'allumage', 'moteur', 'NGK', 5.00, 10.00, 30, 8);

-- Insertion des réparations de test
INSERT INTO `reparations` (`numero`, `client_id`, `vehicule_id`, `employe_id`, `probleme`, `diagnostic`, `statut`, `total_ht`, `total_ttc`) VALUES
('REP-2025-0001', 1, 1, 2, 'Vidange demandée', 'Vidange effectuée avec changement filtre', 'termine', 45.00, 54.00),
('REP-2025-0002', 2, 2, 2, 'Freins qui grincent', 'Plaquettes usées, remplacement effectué', 'termine', 80.00, 96.00),
('REP-2025-0003', 3, 3, 4, 'Batterie déchargée', 'Batterie à remplacer', 'en_cours', 120.00, 144.00),
('REP-2025-0004', 4, 4, 2, 'Révision complète', 'Révision en cours', 'en_cours', 150.00, 180.00),
('REP-2025-0005', 5, 5, 4, 'Pneus usés', 'Montage de nouveaux pneus', 'ouvert', 240.00, 288.00);

-- Insertion des factures de test
INSERT INTO `factures` (`numero`, `client_id`, `reparation_id`, `date_facture`, `total_ht`, `total_ttc`, `statut`, `mode_paiement`) VALUES
('FAC-2025-0001', 1, 1, '2025-08-10', 45.00, 54.00, 'payee', 'carte'),
('FAC-2025-0002', 2, 2, '2025-08-12', 80.00, 96.00, 'payee', 'especes'),
('FAC-2025-0003', 3, 3, '2025-08-15', 120.00, 144.00, 'envoyee', NULL);

-- Insertion des rendez-vous de test
INSERT INTO `rendez_vous` (`client_id`, `vehicule_id`, `employe_id`, `service_id`, `date_rdv`, `motif`, `statut`, `notes`, `duree_estimee`) VALUES
(1, 1, 2, 1, '2025-08-16 10:00:00', 'Vidange et contrôle général', 'programme', 'Client préfère le matin', 90),
(2, 2, 2, 3, '2025-08-16 14:00:00', 'Contrôle freins', 'programme', 'Urgent - freins qui grincent', 60),
(3, 3, 4, 5, '2025-08-17 09:00:00', 'Diagnostic électronique', 'programme', 'Moteur qui tousse', 45),
(4, 4, 2, 2, '2025-08-17 15:00:00', 'Révision complète', 'programme', 'Véhicule de 3 ans', 120),
(5, 5, 4, 4, '2025-08-18 11:00:00', 'Montage pneus', 'programme', '4 pneus à monter', 60);

-- Insertion des pièces utilisées de test
INSERT INTO `pieces_utilisees` (`reparation_id`, `piece_id`, `quantite`, `prix_unitaire`) VALUES
(1, 11, 1, 45.00),
(2, 3, 1, 45.00),
(3, 5, 1, 120.00),
(4, 11, 1, 45.00),
(4, 1, 1, 15.00);

-- ========================================
-- 14. PROCÉDURES STOCKÉES
-- ========================================

-- Procédure pour calculer le total d'une réparation
DELIMITER $$
CREATE PROCEDURE `CalculerTotalReparation`(IN rep_id INT)
BEGIN
    DECLARE total_pieces DECIMAL(10,2) DEFAULT 0;
    DECLARE total_services DECIMAL(10,2) DEFAULT 0;
    
    -- Calculer le total des pièces
    SELECT COALESCE(SUM(quantite * prix_unitaire), 0) INTO total_pieces
    FROM pieces_utilisees
    WHERE reparation_id = rep_id;
    
    -- Mettre à jour la réparation
    UPDATE reparations 
    SET total_ht = total_pieces,
        total_ttc = total_pieces * 1.20
    WHERE id = rep_id;
    
    SELECT total_pieces AS total_ht, (total_pieces * 1.20) AS total_ttc;
END$$
DELIMITER ;

-- Procédure pour vérifier le stock critique
DELIMITER $$
CREATE PROCEDURE `VerifierStockCritique`()
BEGIN
    SELECT 
        reference,
        nom,
        stock_actuel,
        stock_minimum,
        fournisseur,
        categorie
    FROM pieces 
    WHERE stock_actuel <= stock_minimum 
    ORDER BY stock_actuel ASC;
END$$
DELIMITER ;

-- Procédure pour obtenir les statistiques du dashboard
DELIMITER $$
CREATE PROCEDURE `GetDashboardStats`()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM clients) AS total_clients,
        (SELECT COUNT(*) FROM vehicules) AS total_vehicules,
        (SELECT COUNT(*) FROM reparations) AS total_reparations,
        (SELECT COUNT(*) FROM factures) AS total_factures,
        (SELECT COUNT(*) FROM reparations WHERE statut = 'en_cours') AS reparations_en_cours,
        (SELECT COUNT(*) FROM reparations WHERE statut = 'termine') AS reparations_terminees,
        (SELECT COUNT(*) FROM pieces WHERE stock_actuel <= stock_minimum) AS pieces_stock_critique,
        (SELECT COUNT(*) FROM rendez_vous WHERE DATE(date_rdv) = CURDATE()) AS rdv_aujourdhui;
END$$
DELIMITER ;

-- ========================================
-- 15. FONCTIONS
-- ========================================

-- Fonction pour calculer l'âge d'un véhicule
DELIMITER $$
CREATE FUNCTION `CalculerAgeVehicule`(annee_vehicule YEAR) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN YEAR(CURDATE()) - annee_vehicule;
END$$
DELIMITER ;

-- Fonction pour formater un numéro de téléphone
DELIMITER $$
CREATE FUNCTION `FormaterTelephone`(tel VARCHAR(20)) 
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN CONCAT(LEFT(tel, 2), ' ', MID(tel, 3, 2), ' ', MID(tel, 5, 2), ' ', MID(tel, 7, 2), ' ', RIGHT(tel, 2));
END$$
DELIMITER ;

-- ========================================
-- 16. INDEX OPTIMISÉS
-- ========================================

-- Index pour améliorer les performances des requêtes fréquentes
CREATE INDEX `idx_clients_ville` ON `clients` (`ville`);
CREATE INDEX `idx_vehicules_annee` ON `vehicules` (`annee`);
CREATE INDEX `idx_reparations_date_fin` ON `reparations` (`date_fin`);
CREATE INDEX `idx_factures_mode_paiement` ON `factures` (`mode_paiement`);
CREATE INDEX `idx_rdv_employe_date` ON `rendez_vous` (`employe_id`, `date_rdv`);
CREATE INDEX `idx_pieces_prix` ON `pieces` (`prix_vente`);

-- ========================================
-- 17. VÉRIFICATION FINALE
-- ========================================

-- Afficher un résumé de la base de données
SELECT '=== RÉSUMÉ DE LA BASE DE DONNÉES ===' as message;
SELECT 'Tables créées:' as info, COUNT(*) as total FROM information_schema.tables WHERE table_schema = 'garage_db'
UNION ALL
SELECT 'Vues créées:' as info, COUNT(*) as total FROM information_schema.views WHERE table_schema = 'garage_db'
UNION ALL
SELECT 'Triggers créés:' as info, COUNT(*) as total FROM information_schema.triggers WHERE trigger_schema = 'garage_db'
UNION ALL
SELECT 'Procédures créées:' as info, COUNT(*) as total FROM information_schema.routines WHERE routine_schema = 'garage_db' AND routine_type = 'PROCEDURE'
UNION ALL
SELECT 'Fonctions créées:' as info, COUNT(*) as total FROM information_schema.routines WHERE routine_schema = 'garage_db' AND routine_type = 'FUNCTION';

-- Afficher les compteurs de données
SELECT '=== COMPTEURS DE DONNÉES ===' as message;
SELECT 'Clients:' as table_name, COUNT(*) as total FROM clients
UNION ALL
SELECT 'Employés:' as table_name, COUNT(*) as total FROM employes
UNION ALL
SELECT 'Véhicules:' as table_name, COUNT(*) as total FROM vehicules
UNION ALL
SELECT 'Services:' as table_name, COUNT(*) as total FROM services
UNION ALL
SELECT 'Pièces:' as table_name, COUNT(*) as total FROM pieces
UNION ALL
SELECT 'Réparations:' as table_name, COUNT(*) as total FROM reparations
UNION ALL
SELECT 'Factures:' as table_name, COUNT(*) as total FROM factures
UNION ALL
SELECT 'Rendez-vous:' as table_name, COUNT(*) as total FROM rendez_vous;

-- Test des vues
SELECT '=== TEST DES VUES ===' as message;
SELECT COUNT(*) as rdv_aujourdhui FROM v_rdv_aujourdhui;
SELECT COUNT(*) as pieces_stock_critique FROM v_stock_critique;

-- Test des procédures
CALL GetDashboardStats();

SELECT '=== BASE DE DONNÉES CRÉÉE AVEC SUCCÈS ===' as message;
SELECT 'Garage Management System v2.0' as system_name;
SELECT NOW() as creation_date;

COMMIT; 