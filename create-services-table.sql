-- Création de la table services
CREATE TABLE `services` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `categorie` varchar(50) DEFAULT NULL,
  `prix` decimal(10,2) NOT NULL DEFAULT 0.00,
  `duree_estimee` int(11) DEFAULT NULL COMMENT 'Durée estimée en minutes',
  `statut` enum('actif','inactif') DEFAULT 'actif',
  `date_creation` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de quelques services d'exemple
INSERT INTO `services` (`nom`, `description`, `categorie`, `prix`, `duree_estimee`, `statut`) VALUES
('Vidange moteur', 'Vidange complète du moteur avec filtre à huile', 'Entretien', 45.00, 60, 'actif'),
('Révision complète', 'Révision complète du véhicule', 'Entretien', 120.00, 180, 'actif'),
('Remplacement plaquettes', 'Remplacement des plaquettes de frein avant', 'Freinage', 80.00, 90, 'actif'),
('Diagnostic électronique', 'Diagnostic complet du système électronique', 'Diagnostic', 35.00, 45, 'actif'),
('Réparation climatisation', 'Réparation et recharge du système de climatisation', 'Climatisation', 150.00, 120, 'actif'); 