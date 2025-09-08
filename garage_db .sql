-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : sam. 16 août 2025 à 02:16
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

-- --------------------------------------------------------

--
-- Structure de la table `boutique_articles`
--

CREATE TABLE `boutique_articles` (
  `id_article` int(11) NOT NULL,
  `nom_article` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `id_categorie` int(11) DEFAULT NULL,
  `prix_vente` decimal(10,2) NOT NULL,
  `prix_achat` decimal(10,2) DEFAULT NULL,
  `stock_disponible` int(11) DEFAULT 0,
  `stock_minimum` int(11) DEFAULT 1,
  `photo_url` varchar(255) DEFAULT NULL,
  `photo_principale` longblob DEFAULT NULL,
  `photos_supplementaires` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos_supplementaires`)),
  `code_barre` varchar(50) DEFAULT NULL,
  `marque` varchar(50) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `poids` decimal(8,3) DEFAULT NULL,
  `couleur` varchar(30) DEFAULT NULL,
  `taille` varchar(20) DEFAULT NULL,
  `materiau` varchar(50) DEFAULT NULL,
  `garantie_mois` int(11) DEFAULT 0,
  `promotion_actuelle` decimal(5,2) DEFAULT 0.00,
  `date_ajout` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_modification` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `actif` tinyint(1) DEFAULT 1,
  `featured` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categories_boutique`
--

CREATE TABLE `categories_boutique` (
  `id_categorie` int(11) NOT NULL,
  `nom_categorie` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id_client` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `date_inscription` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `employes`
--

CREATE TABLE `employes` (
  `id_employe` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `poste` varchar(50) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `salaire` decimal(10,2) DEFAULT NULL,
  `date_embauche` date DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `fournisseurs`
--

CREATE TABLE `fournisseurs` (
  `id_fournisseur` int(11) NOT NULL,
  `nom_fournisseur` varchar(100) NOT NULL,
  `adresse` text DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contact_principal` varchar(100) DEFAULT NULL,
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `pieces`
--

CREATE TABLE `pieces` (
  `id_piece` int(11) NOT NULL,
  `nom_piece` varchar(100) NOT NULL,
  `reference` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `stock_actuel` int(11) DEFAULT 0,
  `stock_minimum` int(11) DEFAULT 5,
  `id_fournisseur` int(11) DEFAULT NULL,
  `date_ajout` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reparations`
--

CREATE TABLE `reparations` (
  `id_reparation` int(11) NOT NULL,
  `id_vehicule` int(11) NOT NULL,
  `id_employe` int(11) NOT NULL,
  `description_probleme` text NOT NULL,
  `description_travaux` text DEFAULT NULL,
  `date_entree` datetime NOT NULL,
  `date_sortie_prevue` date DEFAULT NULL,
  `date_sortie_reelle` datetime DEFAULT NULL,
  `cout_main_oeuvre` decimal(10,2) DEFAULT 0.00,
  `cout_total` decimal(10,2) DEFAULT 0.00,
  `statut` enum('En attente','En cours','Terminé','Livré','Annulé') DEFAULT 'En attente',
  `kilometrage_entree` int(11) DEFAULT NULL,
  `notes_technicien` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reparation_pieces`
--

CREATE TABLE `reparation_pieces` (
  `id_reparation` int(11) NOT NULL,
  `id_piece` int(11) NOT NULL,
  `quantite_utilisee` int(11) NOT NULL DEFAULT 1,
  `prix_unitaire_facture` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `vehicules`
--

CREATE TABLE `vehicules` (
  `id_vehicule` int(11) NOT NULL,
  `id_client` int(11) NOT NULL,
  `marque` varchar(50) NOT NULL,
  `modele` varchar(50) NOT NULL,
  `annee` year(4) DEFAULT NULL,
  `numero_immatriculation` varchar(20) DEFAULT NULL,
  `numero_chassis` varchar(50) DEFAULT NULL,
  `couleur` varchar(30) DEFAULT NULL,
  `kilometrage` int(11) DEFAULT 0,
  `carburant` enum('Essence','Diesel','Hybride','Electrique','GPL') DEFAULT 'Essence',
  `date_ajout` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `vente_boutique`
--

CREATE TABLE `vente_boutique` (
  `id_vente` int(11) NOT NULL,
  `id_client` int(11) DEFAULT NULL,
  `id_employe` int(11) DEFAULT NULL,
  `date_vente` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_ht` decimal(10,2) NOT NULL,
  `tva` decimal(10,2) DEFAULT 0.00,
  `total_ttc` decimal(10,2) NOT NULL,
  `mode_paiement` enum('Espèces','Carte','Chèque','Virement','Autre') DEFAULT 'Espèces',
  `statut` enum('En cours','Validée','Annulée','Remboursée') DEFAULT 'En cours',
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `vente_boutique_details`
--

CREATE TABLE `vente_boutique_details` (
  `id_detail` int(11) NOT NULL,
  `id_vente` int(11) NOT NULL,
  `id_article` int(11) NOT NULL,
  `quantite` int(11) NOT NULL DEFAULT 1,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `prix_total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `boutique_articles`
--
ALTER TABLE `boutique_articles`
  ADD PRIMARY KEY (`id_article`),
  ADD UNIQUE KEY `code_barre` (`code_barre`),
  ADD KEY `idx_nom_article` (`nom_article`),
  ADD KEY `idx_prix` (`prix_vente`),
  ADD KEY `idx_stock` (`stock_disponible`),
  ADD KEY `idx_categorie` (`id_categorie`),
  ADD KEY `idx_code_barre` (`code_barre`);

--
-- Index pour la table `categories_boutique`
--
ALTER TABLE `categories_boutique`
  ADD PRIMARY KEY (`id_categorie`),
  ADD UNIQUE KEY `nom_categorie` (`nom_categorie`);

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id_client`),
  ADD KEY `idx_nom_prenom` (`nom`,`prenom`),
  ADD KEY `idx_telephone` (`telephone`);

--
-- Index pour la table `employes`
--
ALTER TABLE `employes`
  ADD PRIMARY KEY (`id_employe`),
  ADD KEY `idx_poste` (`poste`);

--
-- Index pour la table `fournisseurs`
--
ALTER TABLE `fournisseurs`
  ADD PRIMARY KEY (`id_fournisseur`);

--
-- Index pour la table `pieces`
--
ALTER TABLE `pieces`
  ADD PRIMARY KEY (`id_piece`),
  ADD UNIQUE KEY `reference` (`reference`),
  ADD KEY `id_fournisseur` (`id_fournisseur`),
  ADD KEY `idx_reference` (`reference`),
  ADD KEY `idx_stock` (`stock_actuel`);

--
-- Index pour la table `reparations`
--
ALTER TABLE `reparations`
  ADD PRIMARY KEY (`id_reparation`),
  ADD KEY `id_vehicule` (`id_vehicule`),
  ADD KEY `id_employe` (`id_employe`),
  ADD KEY `idx_statut` (`statut`),
  ADD KEY `idx_date_entree` (`date_entree`);

--
-- Index pour la table `reparation_pieces`
--
ALTER TABLE `reparation_pieces`
  ADD PRIMARY KEY (`id_reparation`,`id_piece`),
  ADD KEY `id_piece` (`id_piece`);

--
-- Index pour la table `vehicules`
--
ALTER TABLE `vehicules`
  ADD PRIMARY KEY (`id_vehicule`),
  ADD UNIQUE KEY `numero_immatriculation` (`numero_immatriculation`),
  ADD UNIQUE KEY `numero_chassis` (`numero_chassis`),
  ADD KEY `idx_immatriculation` (`numero_immatriculation`),
  ADD KEY `idx_client` (`id_client`);

--
-- Index pour la table `vente_boutique`
--
ALTER TABLE `vente_boutique`
  ADD PRIMARY KEY (`id_vente`),
  ADD KEY `id_client` (`id_client`),
  ADD KEY `id_employe` (`id_employe`),
  ADD KEY `idx_date_vente` (`date_vente`),
  ADD KEY `idx_statut` (`statut`);

--
-- Index pour la table `vente_boutique_details`
--
ALTER TABLE `vente_boutique_details`
  ADD PRIMARY KEY (`id_detail`),
  ADD KEY `id_vente` (`id_vente`),
  ADD KEY `id_article` (`id_article`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `boutique_articles`
--
ALTER TABLE `boutique_articles`
  MODIFY `id_article` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categories_boutique`
--
ALTER TABLE `categories_boutique`
  MODIFY `id_categorie` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id_client` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `employes`
--
ALTER TABLE `employes`
  MODIFY `id_employe` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `fournisseurs`
--
ALTER TABLE `fournisseurs`
  MODIFY `id_fournisseur` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `pieces`
--
ALTER TABLE `pieces`
  MODIFY `id_piece` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reparations`
--
ALTER TABLE `reparations`
  MODIFY `id_reparation` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `vehicules`
--
ALTER TABLE `vehicules`
  MODIFY `id_vehicule` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `vente_boutique`
--
ALTER TABLE `vente_boutique`
  MODIFY `id_vente` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `vente_boutique_details`
--
ALTER TABLE `vente_boutique_details`
  MODIFY `id_detail` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `boutique_articles`
--
ALTER TABLE `boutique_articles`
  ADD CONSTRAINT `boutique_articles_ibfk_1` FOREIGN KEY (`id_categorie`) REFERENCES `categories_boutique` (`id_categorie`);

--
-- Contraintes pour la table `pieces`
--
ALTER TABLE `pieces`
  ADD CONSTRAINT `pieces_ibfk_1` FOREIGN KEY (`id_fournisseur`) REFERENCES `fournisseurs` (`id_fournisseur`);

--
-- Contraintes pour la table `reparations`
--
ALTER TABLE `reparations`
  ADD CONSTRAINT `reparations_ibfk_1` FOREIGN KEY (`id_vehicule`) REFERENCES `vehicules` (`id_vehicule`) ON DELETE CASCADE,
  ADD CONSTRAINT `reparations_ibfk_2` FOREIGN KEY (`id_employe`) REFERENCES `employes` (`id_employe`);

--
-- Contraintes pour la table `reparation_pieces`
--
ALTER TABLE `reparation_pieces`
  ADD CONSTRAINT `reparation_pieces_ibfk_1` FOREIGN KEY (`id_reparation`) REFERENCES `reparations` (`id_reparation`) ON DELETE CASCADE,
  ADD CONSTRAINT `reparation_pieces_ibfk_2` FOREIGN KEY (`id_piece`) REFERENCES `pieces` (`id_piece`);

--
-- Contraintes pour la table `vehicules`
--
ALTER TABLE `vehicules`
  ADD CONSTRAINT `vehicules_ibfk_1` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id_client`) ON DELETE CASCADE;

--
-- Contraintes pour la table `vente_boutique`
--
ALTER TABLE `vente_boutique`
  ADD CONSTRAINT `vente_boutique_ibfk_1` FOREIGN KEY (`id_client`) REFERENCES `clients` (`id_client`),
  ADD CONSTRAINT `vente_boutique_ibfk_2` FOREIGN KEY (`id_employe`) REFERENCES `employes` (`id_employe`);

--
-- Contraintes pour la table `vente_boutique_details`
--
ALTER TABLE `vente_boutique_details`
  ADD CONSTRAINT `vente_boutique_details_ibfk_1` FOREIGN KEY (`id_vente`) REFERENCES `vente_boutique` (`id_vente`) ON DELETE CASCADE,
  ADD CONSTRAINT `vente_boutique_details_ibfk_2` FOREIGN KEY (`id_article`) REFERENCES `boutique_articles` (`id_article`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
