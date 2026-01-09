-- Script de nettoyage des adresses en double
-- Ce script supprime les doublons en gardant l'adresse avec l'ID le plus récent

-- Étape 1 : Afficher les doublons (pour vérification)
SELECT 
    customer_id, 
    street, 
    postal_code, 
    city, 
    COUNT(*) as nb_doublons,
    GROUP_CONCAT(id ORDER BY id DESC) as ids
FROM addresses
GROUP BY customer_id, street, postal_code, city
HAVING COUNT(*) > 1;

-- Étape 2 : Mettre à jour les commandes pour pointer vers l'adresse la plus récente
UPDATE orders o
JOIN addresses a ON o.address_id = a.id
SET o.address_id = (
    SELECT MAX(a2.id) 
    FROM addresses a2 
    WHERE a2.customer_id = a.customer_id 
    AND a2.street = a.street 
    AND a2.postal_code = a.postal_code 
    AND a2.city = a.city
)
WHERE o.address_id IN (
    SELECT id FROM addresses 
    WHERE (customer_id, street, postal_code, city) IN (
        SELECT customer_id, street, postal_code, city 
        FROM addresses 
        GROUP BY customer_id, street, postal_code, city 
        HAVING COUNT(*) > 1
    )
);

-- Étape 3 : Supprimer les doublons (garder seulement l'ID le plus élevé par groupe)
DELETE a1 FROM addresses a1
INNER JOIN addresses a2 
WHERE 
    a1.customer_id = a2.customer_id 
    AND a1.street = a2.street 
    AND a1.postal_code = a2.postal_code 
    AND a1.city = a2.city
    AND a1.id < a2.id;

-- Vérification finale
SELECT COUNT(*) as total_addresses FROM addresses;
