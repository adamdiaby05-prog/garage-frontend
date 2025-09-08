-- ========================================
-- SCRIPT SIMPLE POUR RÉSOUDRE L'ERREUR TABLESPACE
-- Version simplifiée sans options avancées
-- ========================================

-- 1. Désactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

-- 2. Supprimer toutes les tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS `pieces_utilisees`;
DROP TABLE IF EXISTS `factures`;
DROP TABLE IF EXISTS `rendez_vous`;
DROP TABLE IF EXISTS `reparations`;
DROP TABLE IF EXISTS `vehicules`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `employes`;
DROP TABLE IF EXISTS `pieces`;
DROP TABLE IF EXISTS `services`;

-- 3. Supprimer les vues
DROP VIEW IF EXISTS `v_rdv_aujourdhui`;
DROP VIEW IF EXISTS `v_stock_critique`;
DROP VIEW IF EXISTS `v_dashboard_stats`;
DROP VIEW IF EXISTS `v_reparations_details`;

-- 4. Supprimer les triggers
DROP TRIGGER IF EXISTS `maj_stock_pieces`;
DROP TRIGGER IF EXISTS `generer_numero_reparation`;
DROP TRIGGER IF EXISTS `generer_numero_facture`;

-- 5. Supprimer les procédures stockées
DROP PROCEDURE IF EXISTS `CalculerTotalReparation`;
DROP PROCEDURE IF EXISTS `VerifierStockCritique`;
DROP PROCEDURE IF EXISTS `GetDashboardStats`;

-- 6. Supprimer les fonctions
DROP FUNCTION IF EXISTS `CalculerAgeVehicule`;
DROP FUNCTION IF EXISTS `FormaterTelephone`;

-- 7. Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- 8. Supprimer et recréer la base de données
DROP DATABASE IF EXISTS `garage_db`;
CREATE DATABASE `garage_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SELECT 'Base de données garage_db nettoyée avec succès!' as message; 