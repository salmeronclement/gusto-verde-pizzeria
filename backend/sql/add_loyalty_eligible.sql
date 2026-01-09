-- Migration: Ajouter support Pizza Offerte Fidélité
-- Date: 2025-12-17

-- Ajouter colonne pour marquer les pizzas éligibles à l'offre fidélité
ALTER TABLE products 
ADD COLUMN is_loyalty_eligible BOOLEAN DEFAULT 0 
COMMENT 'Pizza peut être choisie comme récompense fidélité (10 tampons)';

-- Marquer quelques pizzas classiques comme éligibles par défaut
UPDATE products 
SET is_loyalty_eligible = 1 
WHERE category IN ('classiques', 'signature')
AND price <= 12.00
LIMIT 5;

-- Vérification
SELECT name, category, price, is_loyalty_eligible 
FROM products 
WHERE is_loyalty_eligible = 1;
