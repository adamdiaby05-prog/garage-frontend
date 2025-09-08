-- Création de la table factures
CREATE TABLE IF NOT EXISTS `factures` (
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
  CONSTRAINT `factures_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id_client`) ON DELETE CASCADE,
  CONSTRAINT `factures_ibfk_2` FOREIGN KEY (`reparation_id`) REFERENCES `reparations` (`id_reparation`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
