-- Script d'initialisation des coordonnées dynamiques
-- À exécuter sur le serveur de production

-- Vérifier si contact_info existe déjà
SELECT * FROM site_settings WHERE setting_key = 'contact_info';

-- Si la requête ci-dessus ne retourne rien, exécuter cette ligne :
INSERT INTO site_settings (setting_key, setting_value) 
VALUES ('contact_info', '{"phone":"04 91 555 444","address":"24 boulevard Notre Dame, 13006 Marseille","email":"contact@gustoverde.fr","brand_name":"Gusto Verde"}')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Vérifier que tout est bien en place
SELECT * FROM site_settings;
