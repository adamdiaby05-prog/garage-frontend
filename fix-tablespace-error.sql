-- ========================================
-- SCRIPT POUR RÉSOUDRE L'ERREUR TABLESPACE
-- "Tablespace for table exists. Please DISCARD the tablespace before IMPORT"
-- ========================================

-- 1. Désactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Supprimer toutes les tables (sans FORCE qui n'existe pas en MySQL)
DROP TABLE IF EXISTS `garage_db`.`pieces_utilisees`;
DROP TABLE IF EXISTS `garage_db`.`factures`;
DROP TABLE IF EXISTS `garage_db`.`rendez_vous`;
DROP TABLE IF EXISTS `garage_db`.`reparations`;
DROP TABLE IF EXISTS `garage_db`.`vehicules`;
DROP TABLE IF EXISTS `garage_db`.`clients`;
DROP TABLE IF EXISTS `garage_db`.`employes`;
DROP TABLE IF EXISTS `garage_db`.`pieces`;
DROP TABLE IF EXISTS `garage_db`.`services`;

-- 3. Supprimer les vues
DROP VIEW IF EXISTS `garage_db`.`v_rdv_aujourdhui`;
DROP VIEW IF EXISTS `garage_db`.`v_stock_critique`;
DROP VIEW IF EXISTS `garage_db`.`v_dashboard_stats`;
DROP VIEW IF EXISTS `garage_db`.`v_reparations_details`;

-- 4. Supprimer les triggers
DROP TRIGGER IF EXISTS `garage_db`.`maj_stock_pieces`;
DROP TRIGGER IF EXISTS `garage_db`.`generer_numero_reparation`;
DROP TRIGGER IF EXISTS `garage_db`.`generer_numero_facture`;

-- 5. Supprimer les procédures stockées
DROP PROCEDURE IF EXISTS `garage_db`.`CalculerTotalReparation`;
DROP PROCEDURE IF EXISTS `garage_db`.`VerifierStockCritique`;
DROP PROCEDURE IF EXISTS `garage_db`.`GetDashboardStats`;

-- 6. Supprimer les fonctions
DROP FUNCTION IF EXISTS `garage_db`.`CalculerAgeVehicule`;
DROP FUNCTION IF EXISTS `garage_db`.`FormaterTelephone`;

-- 7. Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- 8. Forcer la suppression de la base de données
DROP DATABASE IF EXISTS `garage_db`;

-- 9. Créer une nouvelle base de données propre
CREATE DATABASE `garage_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SELECT 'Base de données garage_db supprimée et recréée avec succès!' as message; 