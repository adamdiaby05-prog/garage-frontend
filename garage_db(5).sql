-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 27 oct. 2025 à 16:52
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `garage_db`
--

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS `garage_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sélectionner la base de données
USE `garage_db`;

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `CalculerTotalReparation` (IN `rep_id` INT)   BEGIN
    DECLARE total_pieces DECIMAL(10,2) DEFAULT 0;
    DECLARE total_services DECIMAL(10,2) DEFAULT 0;
    
    
    SELECT COALESCE(SUM(quantite * prix_unitaire), 0) INTO total_pieces
    FROM pieces_utilisees
    WHERE reparation_id = rep_id;
    
    
    UPDATE reparations 
    SET total_ht = total_pieces,
        total_ttc = total_pieces * 1.20
    WHERE id = rep_id;
    
    SELECT total_pieces AS total_ht, (total_pieces * 1.20) AS total_ttc;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `GetDashboardStats` ()   BEGIN
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

CREATE DEFINER=`root`@`localhost` PROCEDURE `VerifierStockCritique` ()   BEGIN
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

--
-- Fonctions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `CalculerAgeVehicule` (`annee_vehicule` YEAR) RETURNS INT(11) DETERMINISTIC READS SQL DATA BEGIN
    RETURN YEAR(CURDATE()) - annee_vehicule;
END$$

CREATE DEFINER=`root`@`localhost` FUNCTION `FormaterTelephone` (`tel` VARCHAR(20)) RETURNS VARCHAR(20) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci DETERMINISTIC READS SQL DATA BEGIN
    RETURN CONCAT(LEFT(tel, 2), ' ', MID(tel, 3, 2), ' ', MID(tel, 5, 2), ' ', MID(tel, 7, 2), ' ', RIGHT(tel, 2));
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telephone` varchar(20) NOT NULL,
  `adresse` text DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `nom`, `prenom`, `email`, `telephone`, `adresse`, `ville`, `code_postal`, `created_at`) VALUES
(1, 'Dupont', 'Jean', 'jean.dupont@email.com', '0123456789', '123 Rue de la Paix', 'Paris', '75001', '2025-10-25 23:35:58'),
(2, 'Martin', 'Marie', 'marie.martin@email.com', '0987654321', '456 Avenue des Champs', 'Lyon', '69001', '2025-10-25 23:35:58'),
(3, 'Bernard', 'Pierre', 'pierre.bernard@email.com', '0555666777', '789 Boulevard Central', 'Marseille', '13001', '2025-10-25 23:35:58'),
(4, 'Petit', 'Sophie', 'sophie.petit@email.com', '0444333222', '321 Rue du Commerce', 'Toulouse', '31000', '2025-10-25 23:35:58'),
(5, 'Robert', 'Lucas', 'lucas.robert@email.com', '0333222111', '654 Place de la R??publique', 'Nantes', '44000', '2025-10-25 23:35:58'),
(6, 'Test', 'User', 'test@example.com', '', NULL, NULL, NULL, '2025-10-27 15:27:07');

-- --------------------------------------------------------

--
-- Structure de la table `commandes_boutique`
--

CREATE TABLE `commandes_boutique` (
  `id` int(11) NOT NULL,
  `client_id` int(11) DEFAULT NULL,
  `produit_id` int(11) DEFAULT NULL,
  `quantite` int(11) DEFAULT NULL,
  `prix_unitaire` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  `date_commande` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commandes_vehicules`
--

CREATE TABLE `commandes_vehicules` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `type_commande` enum('achat','location') NOT NULL,
  `couleur_choisie` varchar(50) DEFAULT NULL,
  `prix_final` decimal(12,2) NOT NULL,
  `duree_location` int(11) DEFAULT NULL,
  `date_debut_location` date DEFAULT NULL,
  `statut` enum('en_attente','confirmee','livree','annulee') DEFAULT 'en_attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `couleurs_disponibles`
--

CREATE TABLE `couleurs_disponibles` (
  `id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `couleur` varchar(50) NOT NULL,
  `prix_supplement` decimal(8,2) DEFAULT 0.00,
  `disponible` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `couleurs_disponibles`
--

INSERT INTO `couleurs_disponibles` (`id`, `vehicule_id`, `couleur`, `prix_supplement`, `disponible`) VALUES
(5, 2, 'Noir', 0.00, 1),
(6, 2, 'Blanc', 800000.00, 1),
(7, 2, 'Argent', 600000.00, 1),
(8, 2, 'Bleu', 700000.00, 1),
(9, 3, 'Argent', 0.00, 1),
(10, 3, 'Blanc', 600000.00, 1),
(11, 3, 'Noir', 800000.00, 1),
(12, 3, 'Gris', 400000.00, 1),
(13, 4, 'Rouge', 0.00, 1),
(14, 4, 'Blanc', 200000.00, 1),
(15, 4, 'Noir', 300000.00, 1),
(16, 4, 'Bleu', 250000.00, 1),
(17, 5, 'Bleu', 0.00, 1),
(18, 5, 'Blanc', 700000.00, 1),
(19, 5, 'Noir', 900000.00, 1),
(20, 5, 'Argent', 500000.00, 1),
(25, 2, 'Noir', 0.00, 1),
(26, 2, 'Blanc', 800000.00, 1),
(27, 2, 'Argent', 600000.00, 1),
(28, 2, 'Bleu', 700000.00, 1),
(29, 3, 'Argent', 0.00, 1),
(30, 3, 'Blanc', 600000.00, 1),
(31, 3, 'Noir', 800000.00, 1),
(32, 3, 'Gris', 400000.00, 1);

-- --------------------------------------------------------

--
-- Structure de la table `demandes_achat`
--

CREATE TABLE `demandes_achat` (
  `id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `couleur` varchar(50) NOT NULL,
  `prix_final` decimal(15,2) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `localisation` varchar(255) NOT NULL,
  `adresse` text DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `codePostal` varchar(20) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `modePaiement` enum('comptant','credit','financement') DEFAULT 'comptant',
  `apport` decimal(15,2) DEFAULT NULL,
  `mensualites` varchar(50) DEFAULT NULL,
  `statut` enum('en_attente','traitee','acceptee','refusee') DEFAULT 'en_attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `demandes_emprunt`
--

CREATE TABLE `demandes_emprunt` (
  `id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `couleur` varchar(50) NOT NULL,
  `prix_final` decimal(15,2) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `localisation` varchar(255) NOT NULL,
  `adresse` text DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `codePostal` varchar(20) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `revenus` decimal(15,2) NOT NULL,
  `profession` varchar(255) NOT NULL,
  `garant` varchar(255) NOT NULL,
  `telephoneGarant` varchar(20) NOT NULL,
  `dateDebutEmprunt` date NOT NULL,
  `dateFinEmprunt` date NOT NULL,
  `statut` enum('en_attente','traitee','acceptee','refusee') DEFAULT 'en_attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `demandes_prestations`
--

CREATE TABLE `demandes_prestations` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `garage_id` int(11) DEFAULT NULL,
  `date_demande` datetime NOT NULL,
  `date_souhaitee` datetime DEFAULT NULL,
  `description_probleme` text DEFAULT NULL,
  `statut` enum('en_attente','acceptee','en_cours','terminee','annulee') DEFAULT 'en_attente',
  `prix_estime` decimal(10,2) DEFAULT NULL,
  `duree_estimee` int(11) DEFAULT NULL COMMENT 'Durée estimée en minutes',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `employes`
--

CREATE TABLE `employes` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `role` enum('gerant','mecanicien','vendeur','secretaire') DEFAULT 'mecanicien',
  `salaire` decimal(10,2) DEFAULT NULL,
  `date_embauche` date DEFAULT NULL,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `employes`
--

INSERT INTO `employes` (`id`, `nom`, `prenom`, `email`, `telephone`, `role`, `salaire`, `date_embauche`, `statut`, `created_at`) VALUES
(1, 'Durand', 'Michel', 'michel.durand@garage.com', '0111222333', 'gerant', 3500.00, '2020-01-15', 'actif', '2025-10-25 23:35:58'),
(2, 'Leroy', 'Thomas', 'thomas.leroy@garage.com', '0222333444', 'mecanicien', 2800.00, '2021-03-20', 'actif', '2025-10-25 23:35:58'),
(3, 'Moreau', 'Julie', 'julie.moreau@garage.com', '0333444555', 'secretaire', 2200.00, '2022-06-10', 'actif', '2025-10-25 23:35:58'),
(4, 'Simon', 'David', 'david.simon@garage.com', '0444555666', 'mecanicien', 2600.00, '2021-09-05', 'actif', '2025-10-25 23:35:58'),
(5, 'Laurent', 'Emma', 'emma.laurent@garage.com', '0555666777', 'vendeur', 2400.00, '2023-01-12', 'actif', '2025-10-25 23:35:58');

-- --------------------------------------------------------

--
-- Structure de la table `factures`
--

CREATE TABLE `factures` (
  `id` int(11) NOT NULL,
  `numero` varchar(20) NOT NULL,
  `client_id` int(11) NOT NULL,
  `reparation_id` int(11) DEFAULT NULL,
  `date_facture` date NOT NULL,
  `total_ht` decimal(10,2) NOT NULL,
  `total_ttc` decimal(10,2) NOT NULL,
  `statut` enum('brouillon','envoyee','payee') DEFAULT 'brouillon',
  `mode_paiement` enum('especes','carte','cheque','virement') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `factures`
--

INSERT INTO `factures` (`id`, `numero`, `client_id`, `reparation_id`, `date_facture`, `total_ht`, `total_ttc`, `statut`, `mode_paiement`, `notes`, `created_at`) VALUES
(1, 'FAC-2025-0001', 1, 1, '2025-08-10', 45.00, 54.00, 'payee', 'carte', NULL, '2025-10-25 23:35:58'),
(2, 'FAC-2025-0002', 2, 2, '2025-08-12', 80.00, 96.00, 'payee', 'especes', NULL, '2025-10-25 23:35:58'),
(3, 'FAC-2025-0003', 3, 3, '2025-08-15', 120.00, 144.00, 'envoyee', NULL, NULL, '2025-10-25 23:35:58');

--
-- Déclencheurs `factures`
--
DELIMITER $$
CREATE TRIGGER `generer_numero_facture` BEFORE INSERT ON `factures` FOR EACH ROW BEGIN
    IF NEW.numero IS NULL OR NEW.numero = '' THEN
        SET NEW.numero = CONCAT('FAC-', YEAR(NOW()), '-', LPAD((SELECT COUNT(*) + 1 FROM factures WHERE YEAR(created_at) = YEAR(NOW())), 4, '0'));
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `fournisseurs`
--

CREATE TABLE `fournisseurs` (
  `id` int(11) NOT NULL,
  `nom_fournisseur` varchar(255) NOT NULL,
  `adresse` text DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contact_principal` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `fournisseurs`
--

INSERT INTO `fournisseurs` (`id`, `nom_fournisseur`, `adresse`, `telephone`, `email`, `contact_principal`, `created_at`, `updated_at`) VALUES
(1, 'Auto Parts Plus', 'Abidjan, Cocody', '+225 20 30 40 50', 'contact@autoparts.ci', 'Jean Kouassi', '2025-10-27 08:04:53', '2025-10-27 08:04:53'),
(2, 'Pi├¿ces Auto Pro', 'Abidjan, Plateau', '+225 20 30 40 51', 'info@piecesauto.ci', 'Marie Traor├®', '2025-10-27 08:04:53', '2025-10-27 08:04:53'),
(3, 'Garage Equipment', 'Abidjan, Yopougon', '+225 20 30 40 52', 'ventes@garageeq.ci', 'Paul Konan', '2025-10-27 08:04:53', '2025-10-27 08:04:53');

-- --------------------------------------------------------

--
-- Structure de la table `garages`
--

CREATE TABLE `garages` (
  `id` int(11) NOT NULL,
  `nom_garage` varchar(200) NOT NULL,
  `adresse` text DEFAULT NULL,
  `ville` varchar(100) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `siret` varchar(14) DEFAULT NULL,
  `specialites` text DEFAULT NULL COMMENT 'Services proposés par le garage',
  `statut` enum('actif','inactif','en_attente') DEFAULT 'en_attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `garages`
--

INSERT INTO `garages` (`id`, `nom_garage`, `adresse`, `ville`, `code_postal`, `telephone`, `email`, `siret`, `specialites`, `statut`, `created_at`, `updated_at`) VALUES
(2, 'adam dama', '', 'Anyama', '1234', '0566428292', 'a@gmail.com', '1234567890', '', 'en_attente', '2025-10-26 00:45:57', '2025-10-26 00:45:57');

-- --------------------------------------------------------

--
-- Structure de la table `pieces`
--

CREATE TABLE `pieces` (
  `id` int(11) NOT NULL,
  `reference` varchar(50) NOT NULL,
  `nom` varchar(200) NOT NULL,
  `categorie` varchar(50) DEFAULT 'accessoires',
  `fournisseur` varchar(100) DEFAULT NULL,
  `prix_achat` decimal(10,2) DEFAULT NULL,
  `prix_vente` decimal(10,2) NOT NULL,
  `stock_actuel` int(11) DEFAULT 0,
  `stock_minimum` int(11) DEFAULT 5,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `pieces`
--

INSERT INTO `pieces` (`id`, `reference`, `nom`, `categorie`, `fournisseur`, `prix_achat`, `prix_vente`, `stock_actuel`, `stock_minimum`, `image_url`, `created_at`) VALUES
(1, 'FIL-001', 'Filtre ?? huile standard', 'filtres', 'Bosch', 8.50, 15.00, 24, 5, NULL, '2025-10-25 23:35:58'),
(2, 'FIL-002', 'Filtre ?? air moteur', 'filtres', 'Mann', 12.00, 22.00, 18, 5, NULL, '2025-10-25 23:35:58'),
(3, 'FRE-001', 'Plaquettes de frein avant', 'freinage', 'Valeo', 25.00, 45.00, 14, 3, NULL, '2025-10-25 23:35:58'),
(4, 'FRE-002', 'Plaquettes de frein arri??re', 'freinage', 'Valeo', 20.00, 38.00, 12, 3, NULL, '2025-10-25 23:35:58'),
(5, 'BAT-001', 'Batterie 60Ah', 'electricite', 'Varta', 65.00, 120.00, 7, 2, NULL, '2025-10-25 23:35:58'),
(6, 'BAT-002', 'Batterie 70Ah', 'electricite', 'Varta', 75.00, 140.00, 6, 2, NULL, '2025-10-25 23:35:58'),
(7, 'PNE-001', 'Pneus 205/55R16', 'roues', 'Michelin', 45.00, 85.00, 12, 4, NULL, '2025-10-25 23:35:58'),
(8, 'PNE-002', 'Pneus 195/65R15', 'roues', 'Continental', 40.00, 75.00, 10, 4, NULL, '2025-10-25 23:35:58'),
(9, 'SUS-001', 'Amortisseur avant', 'suspension', 'Sachs', 35.00, 65.00, 6, 2, NULL, '2025-10-25 23:35:58'),
(10, 'SUS-002', 'Amortisseur arri??re', 'suspension', 'Sachs', 30.00, 55.00, 5, 2, NULL, '2025-10-25 23:35:58'),
(11, 'HUI-001', 'Huile moteur 5W40 - 5L', 'lubrifiants', 'Motul', 25.00, 45.00, 6, 5, NULL, '2025-10-25 23:35:58'),
(12, 'HUI-002', 'Huile moteur 10W40 - 5L', 'lubrifiants', 'Total', 22.00, 40.00, 10, 5, NULL, '2025-10-25 23:35:58'),
(13, 'ACC-001', 'Essuie-glace avant', 'accessoires', 'Valeo', 8.00, 15.00, 20, 5, NULL, '2025-10-25 23:35:58'),
(14, 'ACC-002', 'Essuie-glace arri??re', 'accessoires', 'Valeo', 6.00, 12.00, 15, 5, NULL, '2025-10-25 23:35:58'),
(15, 'MOT-001', 'Bougie d\'allumage', 'moteur', 'NGK', 5.00, 10.00, 30, 8, NULL, '2025-10-25 23:35:58');

-- --------------------------------------------------------

--
-- Structure de la table `pieces_detachees`
--

CREATE TABLE `pieces_detachees` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `prix` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0,
  `categorie` varchar(100) DEFAULT NULL,
  `marque` varchar(100) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `image_principale` text DEFAULT NULL,
  `type_produit` enum('voiture','piece') DEFAULT 'piece',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `pieces_detachees`
--

INSERT INTO `pieces_detachees` (`id`, `nom`, `description`, `prix`, `stock`, `categorie`, `marque`, `reference`, `image_principale`, `type_produit`, `created_at`, `updated_at`) VALUES
(1, 'Filtre ?? huile Toyota', 'Filtre ?? huile haute performance pour moteurs Toyota', 24.99, 45, 'filtres', 'Toyota', 'TOY-FO-001', NULL, 'piece', '2025-10-27 09:57:51', '2025-10-27 09:57:51'),
(2, 'Plaquettes de frein BMW', 'Plaquettes de frein c??ramique pour BMW S??rie 3', 89.99, 23, 'freinage', 'BMW', 'BMW-PF-002', NULL, 'piece', '2025-10-27 09:57:51', '2025-10-27 09:57:51'),
(3, 'Batterie Mercedes 12V', 'Batterie 12V 70Ah pour v??hicules Mercedes', 149.99, 12, '??lectricit??', 'Mercedes', 'MER-BAT-003', NULL, 'piece', '2025-10-27 09:57:51', '2025-10-27 09:57:51'),
(4, 'Amortisseur Audi', 'Amortisseur avant sport pour Audi A4', 199.99, 8, 'suspension', 'Audi', 'AUD-AMO-004', NULL, 'piece', '2025-10-27 09:57:51', '2025-10-27 09:57:51');

-- --------------------------------------------------------

--
-- Structure de la table `pieces_utilisees`
--

CREATE TABLE `pieces_utilisees` (
  `id` int(11) NOT NULL,
  `reparation_id` int(11) NOT NULL,
  `piece_id` int(11) NOT NULL,
  `quantite` int(11) DEFAULT 1,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `pieces_utilisees`
--

INSERT INTO `pieces_utilisees` (`id`, `reparation_id`, `piece_id`, `quantite`, `prix_unitaire`, `created_at`) VALUES
(1, 1, 11, 1, 45.00, '2025-10-25 23:35:58'),
(2, 2, 3, 1, 45.00, '2025-10-25 23:35:58'),
(3, 3, 5, 1, 120.00, '2025-10-25 23:35:58'),
(4, 4, 11, 1, 45.00, '2025-10-25 23:35:58'),
(5, 4, 1, 1, 15.00, '2025-10-25 23:35:58');

--
-- Déclencheurs `pieces_utilisees`
--
DELIMITER $$
CREATE TRIGGER `maj_stock_pieces` AFTER INSERT ON `pieces_utilisees` FOR EACH ROW BEGIN
    UPDATE pieces 
    SET stock_actuel = stock_actuel - NEW.quantite
    WHERE id = NEW.piece_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `rendez_vous`
--

CREATE TABLE `rendez_vous` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `employe_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `date_rdv` datetime NOT NULL,
  `motif` text DEFAULT NULL,
  `statut` enum('programme','en_cours','termine','annule') DEFAULT 'programme',
  `notes` text DEFAULT NULL,
  `duree_estimee` int(11) DEFAULT 60,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `rendez_vous`
--

INSERT INTO `rendez_vous` (`id`, `client_id`, `vehicule_id`, `employe_id`, `service_id`, `date_rdv`, `motif`, `statut`, `notes`, `duree_estimee`, `created_at`) VALUES
(1, 1, 1, 2, 1, '2025-08-16 10:00:00', 'Vidange et contr??le g??n??ral', 'programme', 'Client pr??f??re le matin', 90, '2025-10-25 23:35:58'),
(2, 2, 2, 2, 3, '2025-08-16 14:00:00', 'Contr??le freins', 'programme', 'Urgent - freins qui grincent', 60, '2025-10-25 23:35:58'),
(3, 3, 3, 4, 5, '2025-08-17 09:00:00', 'Diagnostic ??lectronique', 'programme', 'Moteur qui tousse', 45, '2025-10-25 23:35:58'),
(4, 4, 4, 2, 2, '2025-08-17 15:00:00', 'R??vision compl??te', 'programme', 'V??hicule de 3 ans', 120, '2025-10-25 23:35:58'),
(5, 5, 5, 4, 4, '2025-08-18 11:00:00', 'Montage pneus', 'programme', '4 pneus ?? monter', 60, '2025-10-25 23:35:58');

-- --------------------------------------------------------

--
-- Structure de la table `reparations`
--

CREATE TABLE `reparations` (
  `id` int(11) NOT NULL,
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `reparations`
--

INSERT INTO `reparations` (`id`, `numero`, `client_id`, `vehicule_id`, `employe_id`, `date_debut`, `date_fin`, `probleme`, `diagnostic`, `statut`, `total_ht`, `total_ttc`, `notes`, `created_at`) VALUES
(1, 'REP-2025-0001', 1, 1, 2, '2025-10-25 23:35:58', NULL, 'Vidange demand??e', 'Vidange effectu??e avec changement filtre', 'termine', 45.00, 54.00, NULL, '2025-10-25 23:35:58'),
(2, 'REP-2025-0002', 2, 2, 2, '2025-10-25 23:35:58', NULL, 'Freins qui grincent', 'Plaquettes us??es, remplacement effectu??', 'termine', 80.00, 96.00, NULL, '2025-10-25 23:35:58'),
(3, 'REP-2025-0003', 3, 3, 4, '2025-10-25 23:35:58', NULL, 'Batterie d??charg??e', 'Batterie ?? remplacer', 'en_cours', 120.00, 144.00, NULL, '2025-10-25 23:35:58'),
(4, 'REP-2025-0004', 4, 4, 2, '2025-10-25 23:35:58', NULL, 'R??vision compl??te', 'R??vision en cours', 'en_cours', 150.00, 180.00, NULL, '2025-10-25 23:35:58'),
(5, 'REP-2025-0005', 5, 5, 4, '2025-10-25 23:35:58', NULL, 'Pneus us??s', 'Montage de nouveaux pneus', 'ouvert', 240.00, 288.00, NULL, '2025-10-25 23:35:58');

--
-- Déclencheurs `reparations`
--
DELIMITER $$
CREATE TRIGGER `generer_numero_reparation` BEFORE INSERT ON `reparations` FOR EACH ROW BEGIN
    IF NEW.numero IS NULL OR NEW.numero = '' THEN
        SET NEW.numero = CONCAT('REP-', YEAR(NOW()), '-', LPAD((SELECT COUNT(*) + 1 FROM reparations WHERE YEAR(created_at) = YEAR(NOW())), 4, '0'));
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `categorie` varchar(50) DEFAULT 'maintenance',
  `prix` decimal(10,2) NOT NULL,
  `duree_minutes` int(11) DEFAULT 60,
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `services`
--

INSERT INTO `services` (`id`, `nom`, `description`, `categorie`, `prix`, `duree_minutes`, `statut`, `created_at`) VALUES
(1, 'Vidange', 'Vidange d\'huile moteur et changement du filtre ?? huile', 'entretien', 45.00, 30, 'actif', '2025-10-25 23:35:58'),
(2, 'R??vision compl??te', 'R??vision compl??te du v??hicule avec contr??le g??n??ral', 'entretien', 150.00, 120, 'actif', '2025-10-25 23:35:58'),
(3, 'Contr??le freins', 'V??rification et r??paration du syst??me de freinage', 'freinage', 80.00, 60, 'actif', '2025-10-25 23:35:58'),
(4, 'Montage pneus', 'Montage et ??quilibrage de 4 pneus', 'roues', 60.00, 45, 'actif', '2025-10-25 23:35:58'),
(5, 'Diagnostic ??lectronique', 'Diagnostic complet de l\'??lectronique du v??hicule', 'diagnostic', 70.00, 45, 'actif', '2025-10-25 23:35:58'),
(6, 'R??paration climatisation', 'R??paration et recharge du syst??me de climatisation', 'climatisation', 120.00, 90, 'actif', '2025-10-25 23:35:58'),
(7, 'Remplacement batterie', 'Remplacement de la batterie du v??hicule', 'electricite', 85.00, 30, 'actif', '2025-10-25 23:35:58'),
(8, 'R??paration suspension', 'R??paration du syst??me de suspension', 'suspension', 200.00, 120, 'actif', '2025-10-25 23:35:58');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('admin','gerant','mecanicien','vendeur','secretaire','client','garage') DEFAULT 'client',
  `employe_id` int(11) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `telephone` varchar(30) DEFAULT NULL,
  `type_compte` varchar(20) DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `garage_id` int(11) DEFAULT NULL,
  `role_garage` enum('proprietaire','employe') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `mot_de_passe`, `role`, `employe_id`, `actif`, `created_at`, `nom`, `prenom`, `telephone`, `type_compte`, `client_id`, `garage_id`, `role_garage`) VALUES
(2, 'a@gmail.com', '$2b$10$RycAiE91z3qJo0zpQm674O8AsDLs1g/bqJicKk8YA9LS3JgWElYca', 'garage', NULL, 1, '2025-10-26 00:45:57', 'dama', 'adam', '', 'garage', NULL, 2, NULL),
(3, 'b@gmail.com', '$2b$10$/m4gunQE5vPrAq/pfSHvpOVeJL8wvIMT0vjA2Z6vIG75r0xxFzI06', 'admin', NULL, 1, '2025-10-27 00:56:34', 'dama', 'ada', '', 'admin', NULL, NULL, NULL),
(4, 'test@example.com', '$2b$10$cJKWDDpMTHbq1SPfaq5ehuNqZRPD/peIiap5mlydkgGMaTWIuTFSq', 'client', NULL, 1, '2025-10-27 11:34:52', 'Test', 'User', '', 'client', 6, NULL, NULL),
(5, 'adamdiaby05@gmail.com', '$2b$10$gx3bln4DaNsEdG8mmL68wO/vEaAwQKpRgawMMr.1mwIb8f9p4Dgpi', 'client', NULL, 1, '2025-10-27 11:40:26', 'dama', 'adam', '', 'client', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `vehicules`
--

CREATE TABLE `vehicules` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `marque` varchar(50) NOT NULL,
  `modele` varchar(50) NOT NULL,
  `immatriculation` varchar(15) NOT NULL,
  `annee` year(4) DEFAULT NULL,
  `kilometrage` int(11) DEFAULT 0,
  `carburant` enum('essence','diesel','hybride','electrique') DEFAULT 'essence',
  `couleur` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `vehicules`
--

INSERT INTO `vehicules` (`id`, `client_id`, `marque`, `modele`, `immatriculation`, `annee`, `kilometrage`, `carburant`, `couleur`, `created_at`) VALUES
(1, 1, 'Renault', 'Clio', 'AB-123-CD', '2019', 45000, 'essence', 'Blanc', '2025-10-25 23:35:58'),
(2, 2, 'Peugeot', '208', 'EF-456-GH', '2020', 32000, 'diesel', 'Gris', '2025-10-25 23:35:58'),
(3, 3, 'Citro??n', 'C3', 'IJ-789-KL', '2018', 68000, 'essence', 'Rouge', '2025-10-25 23:35:58'),
(4, 4, 'Volkswagen', 'Golf', 'MN-012-OP', '2021', 25000, 'diesel', 'Bleu', '2025-10-25 23:35:58'),
(5, 5, 'Toyota', 'Yaris', 'QR-345-ST', '2020', 38000, 'hybride', 'Vert', '2025-10-25 23:35:58');

-- --------------------------------------------------------

--
-- Structure de la table `vehicules_boutique`
--

CREATE TABLE `vehicules_boutique` (
  `id` int(11) NOT NULL,
  `marque` varchar(100) NOT NULL,
  `modele` varchar(100) NOT NULL,
  `annee` int(11) NOT NULL,
  `couleur` varchar(50) NOT NULL,
  `prix_vente` decimal(12,2) NOT NULL,
  `prix_location_jour` decimal(8,2) NOT NULL,
  `kilometrage` int(11) DEFAULT 0,
  `carburant` varchar(30) DEFAULT 'Essence',
  `transmission` varchar(30) DEFAULT 'Manuelle',
  `puissance` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_principale` varchar(255) DEFAULT NULL,
  `images` text DEFAULT NULL,
  `statut` enum('disponible','vendu','loue','maintenance') DEFAULT 'disponible',
  `type_vente` enum('vente','location','vente_et_location') DEFAULT 'vente_et_location',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `vehicules_boutique`
--

INSERT INTO `vehicules_boutique` (`id`, `marque`, `modele`, `annee`, `couleur`, `prix_vente`, `prix_location_jour`, `kilometrage`, `carburant`, `transmission`, `puissance`, `description`, `image_principale`, `images`, `statut`, `type_vente`, `created_at`, `updated_at`) VALUES
(2, 'BMW', 'X3', 2022, 'Noir', 1000.00, 1222.00, 25000, 'Essence', 'Automatique', '250 CV', 'SUV de luxe avec toutes les options', 'https://tse2.mm.bing.net/th/id/OIP.wDuGZIoj9pyUm3IHCqL1ywHaEs?rs=1&pid=ImgDetMain&o=7&rm=3', NULL, 'disponible', 'vente_et_location', '2025-10-26 01:08:44', '2025-10-27 08:24:14'),
(3, 'Mercedes', 'Classe A', 2023, 'Argent', 35000000.00, 250000.00, 8000, 'Essence', 'Automatique', '180 CV', 'Berline compacte haut de gamme', NULL, NULL, 'disponible', 'vente_et_location', '2025-10-26 01:08:44', '2025-10-26 01:08:44'),
(4, 'Peugeot', '208', 2022, 'Rouge', 18000000.00, 120000.00, 20000, 'Essence', 'Manuelle', '100 CV', 'Citadine moderne et pratique', NULL, NULL, 'disponible', 'vente_et_location', '2025-10-26 01:08:44', '2025-10-26 01:08:44'),
(5, 'Audi', 'A4', 2023, 'Bleu', 12355.00, 122.00, 12000, 'Essence', 'Automatique', '200 CV', 'Berline sportive allemande', 'https://vd.vertigodigital.fr/wp-content/uploads/2023/09/voiture.jpg', NULL, 'disponible', 'vente_et_location', '2025-10-26 01:08:44', '2025-10-27 08:37:40'),
(6, 'BMW', 'add', 2025, 'Noir', 1200.00, 96.00, 0, 'Essence', 'Manuelle', '', '', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNj', NULL, 'disponible', 'vente_et_location', '2025-10-27 08:47:49', '2025-10-27 08:47:49'),
(8, 'Mercedes', 'ADAD', 2025, 'Gris', 122.00, 122.00, 0, 'Essence', 'Manuelle', '', '', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNj', NULL, 'disponible', 'vente_et_location', '2025-10-27 09:07:32', '2025-10-27 10:41:32'),
(9, 'ASA', 'ASAS', 2000, '', 10.00, 10.00, 0, 'essence', 'manuelle', '', 'ASASA', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNj', NULL, 'disponible', 'vente', '2025-10-27 10:12:33', '2025-10-27 10:12:33'),
(10, 'ASA', 'ASAS', 2000, '', 10.00, 10.00, 0, 'essence', 'manuelle', '', '', NULL, NULL, 'disponible', 'vente', '2025-10-27 10:57:24', '2025-10-27 10:57:24');

-- --------------------------------------------------------

--
-- Structure de la table `vehicules_vente`
--

CREATE TABLE `vehicules_vente` (
  `id` int(11) NOT NULL,
  `vehicule_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `prix_vente` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `image_principale` text DEFAULT NULL,
  `statut` enum('en_vente','vendu','retire') DEFAULT 'en_vente',
  `date_mise_vente` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_vente` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_dashboard_stats`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_dashboard_stats` (
`total_clients` bigint(21)
,`total_vehicules` bigint(21)
,`total_reparations` bigint(21)
,`total_factures` bigint(21)
,`reparations_en_cours` bigint(21)
,`reparations_terminees` bigint(21)
,`pieces_stock_critique` bigint(21)
,`rdv_aujourdhui` bigint(21)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_rdv_aujourdhui`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_rdv_aujourdhui` (
`id` int(11)
,`date_rdv` datetime
,`client` varchar(201)
,`immatriculation` varchar(15)
,`marque` varchar(50)
,`modele` varchar(50)
,`service` varchar(100)
,`statut` enum('programme','en_cours','termine','annule')
,`employe_nom` varchar(100)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_reparations_details`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_reparations_details` (
`id` int(11)
,`numero` varchar(20)
,`date_debut` datetime
,`date_fin` datetime
,`statut` enum('ouvert','en_cours','termine','facture')
,`total_ht` decimal(10,2)
,`total_ttc` decimal(10,2)
,`client` varchar(201)
,`vehicule` varchar(101)
,`immatriculation` varchar(15)
,`employe` varchar(201)
,`probleme` text
,`diagnostic` text
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_stock_critique`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_stock_critique` (
`reference` varchar(50)
,`nom` varchar(200)
,`stock_actuel` int(11)
,`stock_minimum` int(11)
,`fournisseur` varchar(100)
,`categorie` varchar(50)
);

-- --------------------------------------------------------

--
-- Structure de la vue `v_dashboard_stats`
--
DROP TABLE IF EXISTS `v_dashboard_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_dashboard_stats`  AS SELECT (select count(0) from `clients`) AS `total_clients`, (select count(0) from `vehicules`) AS `total_vehicules`, (select count(0) from `reparations`) AS `total_reparations`, (select count(0) from `factures`) AS `total_factures`, (select count(0) from `reparations` where `reparations`.`statut` = 'en_cours') AS `reparations_en_cours`, (select count(0) from `reparations` where `reparations`.`statut` = 'termine') AS `reparations_terminees`, (select count(0) from `pieces` where `pieces`.`stock_actuel` <= `pieces`.`stock_minimum`) AS `pieces_stock_critique`, (select count(0) from `rendez_vous` where cast(`rendez_vous`.`date_rdv` as date) = curdate()) AS `rdv_aujourdhui` ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_rdv_aujourdhui`
--
DROP TABLE IF EXISTS `v_rdv_aujourdhui`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_rdv_aujourdhui`  AS SELECT `r`.`id` AS `id`, `r`.`date_rdv` AS `date_rdv`, concat(`c`.`nom`,' ',`c`.`prenom`) AS `client`, `v`.`immatriculation` AS `immatriculation`, `v`.`marque` AS `marque`, `v`.`modele` AS `modele`, `s`.`nom` AS `service`, `r`.`statut` AS `statut`, `e`.`nom` AS `employe_nom` FROM ((((`rendez_vous` `r` join `clients` `c` on(`r`.`client_id` = `c`.`id`)) join `vehicules` `v` on(`r`.`vehicule_id` = `v`.`id`)) left join `services` `s` on(`r`.`service_id` = `s`.`id`)) left join `employes` `e` on(`r`.`employe_id` = `e`.`id`)) WHERE cast(`r`.`date_rdv` as date) = curdate() ORDER BY `r`.`date_rdv` ASC ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_reparations_details`
--
DROP TABLE IF EXISTS `v_reparations_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_reparations_details`  AS SELECT `r`.`id` AS `id`, `r`.`numero` AS `numero`, `r`.`date_debut` AS `date_debut`, `r`.`date_fin` AS `date_fin`, `r`.`statut` AS `statut`, `r`.`total_ht` AS `total_ht`, `r`.`total_ttc` AS `total_ttc`, concat(`c`.`nom`,' ',`c`.`prenom`) AS `client`, concat(`v`.`marque`,' ',`v`.`modele`) AS `vehicule`, `v`.`immatriculation` AS `immatriculation`, concat(`e`.`nom`,' ',`e`.`prenom`) AS `employe`, `r`.`probleme` AS `probleme`, `r`.`diagnostic` AS `diagnostic` FROM (((`reparations` `r` join `clients` `c` on(`r`.`client_id` = `c`.`id`)) join `vehicules` `v` on(`r`.`vehicule_id` = `v`.`id`)) left join `employes` `e` on(`r`.`employe_id` = `e`.`id`)) ORDER BY `r`.`date_debut` DESC ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_stock_critique`
--
DROP TABLE IF EXISTS `v_stock_critique`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_stock_critique`  AS SELECT `pieces`.`reference` AS `reference`, `pieces`.`nom` AS `nom`, `pieces`.`stock_actuel` AS `stock_actuel`, `pieces`.`stock_minimum` AS `stock_minimum`, `pieces`.`fournisseur` AS `fournisseur`, `pieces`.`categorie` AS `categorie` FROM `pieces` WHERE `pieces`.`stock_actuel` <= `pieces`.`stock_minimum` ORDER BY `pieces`.`stock_actuel` ASC ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_clients_nom` (`nom`),
  ADD KEY `idx_clients_email` (`email`),
  ADD KEY `idx_clients_ville` (`ville`);

--
-- Index pour la table `commandes_boutique`
--
ALTER TABLE `commandes_boutique`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `produit_id` (`produit_id`);

--
-- Index pour la table `commandes_vehicules`
--
ALTER TABLE `commandes_vehicules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `vehicule_id` (`vehicule_id`);

--
-- Index pour la table `couleurs_disponibles`
--
ALTER TABLE `couleurs_disponibles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicule_id` (`vehicule_id`);

--
-- Index pour la table `demandes_achat`
--
ALTER TABLE `demandes_achat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vehicule_id` (`vehicule_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Index pour la table `demandes_emprunt`
--
ALTER TABLE `demandes_emprunt`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vehicule_id` (`vehicule_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_dates` (`dateDebutEmprunt`,`dateFinEmprunt`);

--
-- Index pour la table `demandes_prestations`
--
ALTER TABLE `demandes_prestations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `vehicule_id` (`vehicule_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `garage_id` (`garage_id`);

--
-- Index pour la table `employes`
--
ALTER TABLE `employes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_employes_role` (`role`),
  ADD KEY `idx_employes_statut` (`statut`);

--
-- Index pour la table `factures`
--
ALTER TABLE `factures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `reparation_id` (`reparation_id`),
  ADD KEY `idx_factures_statut` (`statut`),
  ADD KEY `idx_factures_date` (`date_facture`),
  ADD KEY `idx_factures_mode_paiement` (`mode_paiement`);

--
-- Index pour la table `fournisseurs`
--
ALTER TABLE `fournisseurs`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `garages`
--
ALTER TABLE `garages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `pieces`
--
ALTER TABLE `pieces`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference` (`reference`),
  ADD KEY `idx_pieces_categorie` (`categorie`),
  ADD KEY `idx_pieces_stock` (`stock_actuel`,`stock_minimum`),
  ADD KEY `idx_pieces_fournisseur` (`fournisseur`),
  ADD KEY `idx_pieces_prix` (`prix_vente`);

--
-- Index pour la table `pieces_detachees`
--
ALTER TABLE `pieces_detachees`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `pieces_utilisees`
--
ALTER TABLE `pieces_utilisees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reparation_id` (`reparation_id`),
  ADD KEY `piece_id` (`piece_id`);

--
-- Index pour la table `rendez_vous`
--
ALTER TABLE `rendez_vous`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `vehicule_id` (`vehicule_id`),
  ADD KEY `employe_id` (`employe_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `idx_rdv_date` (`date_rdv`),
  ADD KEY `idx_rdv_statut` (`statut`),
  ADD KEY `idx_rdv_employe_date` (`employe_id`,`date_rdv`);

--
-- Index pour la table `reparations`
--
ALTER TABLE `reparations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `vehicule_id` (`vehicule_id`),
  ADD KEY `employe_id` (`employe_id`),
  ADD KEY `idx_reparations_statut` (`statut`),
  ADD KEY `idx_reparations_date` (`date_debut`),
  ADD KEY `idx_reparations_date_fin` (`date_fin`);

--
-- Index pour la table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_services_categorie` (`categorie`),
  ADD KEY `idx_services_statut` (`statut`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `vehicules`
--
ALTER TABLE `vehicules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `immatriculation` (`immatriculation`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `idx_vehicules_marque` (`marque`),
  ADD KEY `idx_vehicules_immat` (`immatriculation`),
  ADD KEY `idx_vehicules_annee` (`annee`);

--
-- Index pour la table `vehicules_boutique`
--
ALTER TABLE `vehicules_boutique`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `vehicules_vente`
--
ALTER TABLE `vehicules_vente`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicule_id` (`vehicule_id`),
  ADD KEY `idx_client_id` (`client_id`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `idx_date_mise_vente` (`date_mise_vente`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `commandes_boutique`
--
ALTER TABLE `commandes_boutique`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `commandes_vehicules`
--
ALTER TABLE `commandes_vehicules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `couleurs_disponibles`
--
ALTER TABLE `couleurs_disponibles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT pour la table `demandes_achat`
--
ALTER TABLE `demandes_achat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `demandes_emprunt`
--
ALTER TABLE `demandes_emprunt`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `demandes_prestations`
--
ALTER TABLE `demandes_prestations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `employes`
--
ALTER TABLE `employes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `factures`
--
ALTER TABLE `factures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `fournisseurs`
--
ALTER TABLE `fournisseurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `garages`
--
ALTER TABLE `garages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `pieces`
--
ALTER TABLE `pieces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `pieces_detachees`
--
ALTER TABLE `pieces_detachees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `pieces_utilisees`
--
ALTER TABLE `pieces_utilisees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `rendez_vous`
--
ALTER TABLE `rendez_vous`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `reparations`
--
ALTER TABLE `reparations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `vehicules`
--
ALTER TABLE `vehicules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `vehicules_boutique`
--
ALTER TABLE `vehicules_boutique`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `vehicules_vente`
--
ALTER TABLE `vehicules_vente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commandes_boutique`
--
ALTER TABLE `commandes_boutique`
  ADD CONSTRAINT `commandes_boutique_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `commandes_boutique_ibfk_2` FOREIGN KEY (`produit_id`) REFERENCES `pieces` (`id`);

--
-- Contraintes pour la table `commandes_vehicules`
--
ALTER TABLE `commandes_vehicules`
  ADD CONSTRAINT `commandes_vehicules_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `commandes_vehicules_ibfk_2` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules_boutique` (`id`);

--
-- Contraintes pour la table `couleurs_disponibles`
--
ALTER TABLE `couleurs_disponibles`
  ADD CONSTRAINT `couleurs_disponibles_ibfk_1` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules_boutique` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `demandes_prestations`
--
ALTER TABLE `demandes_prestations`
  ADD CONSTRAINT `demandes_prestations_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `demandes_prestations_ibfk_2` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `demandes_prestations_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `demandes_prestations_ibfk_4` FOREIGN KEY (`garage_id`) REFERENCES `garages` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `factures`
--
ALTER TABLE `factures`
  ADD CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `factures_ibfk_2` FOREIGN KEY (`reparation_id`) REFERENCES `reparations` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `pieces_utilisees`
--
ALTER TABLE `pieces_utilisees`
  ADD CONSTRAINT `pieces_utilisees_ibfk_1` FOREIGN KEY (`reparation_id`) REFERENCES `reparations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pieces_utilisees_ibfk_2` FOREIGN KEY (`piece_id`) REFERENCES `pieces` (`id`);

--
-- Contraintes pour la table `rendez_vous`
--
ALTER TABLE `rendez_vous`
  ADD CONSTRAINT `rendez_vous_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rendez_vous_ibfk_2` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rendez_vous_ibfk_3` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `rendez_vous_ibfk_4` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `reparations`
--
ALTER TABLE `reparations`
  ADD CONSTRAINT `reparations_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reparations_ibfk_2` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reparations_ibfk_3` FOREIGN KEY (`employe_id`) REFERENCES `employes` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `vehicules`
--
ALTER TABLE `vehicules`
  ADD CONSTRAINT `vehicules_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `vehicules_vente`
--
ALTER TABLE `vehicules_vente`
  ADD CONSTRAINT `vehicules_vente_ibfk_1` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `vehicules_vente_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
