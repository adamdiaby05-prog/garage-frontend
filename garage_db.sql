-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 15 août 2025 à 02:38
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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `pieces`
--

CREATE TABLE `pieces` (
  `id` int(11) NOT NULL,
  `reference` varchar(50) NOT NULL,
  `nom` varchar(200) NOT NULL,
  `prix_achat` decimal(10,2) DEFAULT NULL,
  `prix_vente` decimal(10,2) NOT NULL,
  `stock_actuel` int(11) DEFAULT 0,
  `stock_minimum` int(11) DEFAULT 5,
  `fournisseur` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `pieces`
--

INSERT INTO `pieces` (`id`, `reference`, `nom`, `prix_achat`, `prix_vente`, `stock_actuel`, `stock_minimum`, `fournisseur`, `created_at`) VALUES
(1, 'FILT001', 'Filtre à huile standard', 8.50, 15.00, 20, 5, 'AutoParts', '2025-08-15 00:38:27'),
(2, 'FILT002', 'Filtre à air', 12.00, 22.00, 15, 5, 'AutoParts', '2025-08-15 00:38:27'),
(3, 'PLAQ001', 'Plaquettes de frein avant', 35.00, 65.00, 10, 5, 'Brembo', '2025-08-15 00:38:27'),
(4, 'HUILE01', 'Huile moteur 5W40 - 5L', 25.00, 45.00, 8, 5, 'Motul', '2025-08-15 00:38:27'),
(5, 'PNEU001', 'Pneu 205/55R16', 80.00, 150.00, 12, 5, 'Michelin', '2025-08-15 00:38:27');

-- --------------------------------------------------------

--
-- Structure de la table `pieces_utilisees`
--

CREATE TABLE `pieces_utilisees` (
  `id` int(11) NOT NULL,
  `reparation_id` int(11) NOT NULL,
  `piece_id` int(11) NOT NULL,
  `quantite` int(11) DEFAULT 1,
  `prix_unitaire` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `statut` enum('programme','en_cours','termine','annule') DEFAULT 'programme',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  `duree_minutes` int(11) DEFAULT 60,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `services`
--

INSERT INTO `services` (`id`, `nom`, `prix`, `duree_minutes`, `created_at`) VALUES
(1, 'Vidange', 45.00, 30, '2025-08-15 00:38:27'),
(2, 'Révision complète', 150.00, 120, '2025-08-15 00:38:27'),
(3, 'Contrôle freins', 80.00, 60, '2025-08-15 00:38:27'),
(4, 'Montage pneus', 60.00, 45, '2025-08-15 00:38:27'),
(5, 'Diagnostic électronique', 70.00, 45, '2025-08-15 00:38:27');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
);

-- --------------------------------------------------------

--
-- Structure de la vue `v_rdv_aujourdhui`
--
DROP TABLE IF EXISTS `v_rdv_aujourdhui`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_rdv_aujourdhui`  AS SELECT `r`.`id` AS `id`, `r`.`date_rdv` AS `date_rdv`, concat(`c`.`nom`,' ',`c`.`prenom`) AS `client`, `v`.`immatriculation` AS `immatriculation`, `v`.`marque` AS `marque`, `v`.`modele` AS `modele`, `s`.`nom` AS `service`, `r`.`statut` AS `statut` FROM (((`rendez_vous` `r` join `clients` `c` on(`r`.`client_id` = `c`.`id`)) join `vehicules` `v` on(`r`.`vehicule_id` = `v`.`id`)) left join `services` `s` on(`r`.`service_id` = `s`.`id`)) WHERE cast(`r`.`date_rdv` as date) = curdate() ORDER BY `r`.`date_rdv` ASC ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_stock_critique`
--
DROP TABLE IF EXISTS `v_stock_critique`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_stock_critique`  AS SELECT `pieces`.`reference` AS `reference`, `pieces`.`nom` AS `nom`, `pieces`.`stock_actuel` AS `stock_actuel`, `pieces`.`stock_minimum` AS `stock_minimum`, `pieces`.`fournisseur` AS `fournisseur` FROM `pieces` WHERE `pieces`.`stock_actuel` <= `pieces`.`stock_minimum` ORDER BY `pieces`.`stock_actuel` ASC ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `employes`
--
ALTER TABLE `employes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `factures`
--
ALTER TABLE `factures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `reparation_id` (`reparation_id`);

--
-- Index pour la table `pieces`
--
ALTER TABLE `pieces`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference` (`reference`),
  ADD KEY `idx_pieces_stock` (`stock_actuel`,`stock_minimum`);

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
  ADD KEY `idx_rdv_date` (`date_rdv`);

--
-- Index pour la table `reparations`
--
ALTER TABLE `reparations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `vehicule_id` (`vehicule_id`),
  ADD KEY `employe_id` (`employe_id`);

--
-- Index pour la table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `vehicules`
--
ALTER TABLE `vehicules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `immatriculation` (`immatriculation`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `idx_vehicules_immat` (`immatriculation`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `employes`
--
ALTER TABLE `employes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `factures`
--
ALTER TABLE `factures`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `pieces`
--
ALTER TABLE `pieces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `pieces_utilisees`
--
ALTER TABLE `pieces_utilisees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `rendez_vous`
--
ALTER TABLE `rendez_vous`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reparations`
--
ALTER TABLE `reparations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `vehicules`
--
ALTER TABLE `vehicules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
