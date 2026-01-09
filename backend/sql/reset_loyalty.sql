-- ================================================
-- Migration: Système de Fidélité Points → Tampons
-- Date: 2025-12-17
-- ================================================

-- 1. Remettre à zéro les points de fidélité de tous les clients
UPDATE customers SET loyalty_points = 0;

-- 2. Vérifier la mise à jour
SELECT COUNT(*) AS clients_reset FROM customers WHERE loyalty_points = 0;

-- Note: La structure de site_settings reste la même (JSON),
-- seul le contenu de loyalty_program change via l'admin.
