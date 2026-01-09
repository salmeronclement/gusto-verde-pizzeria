-- Migration: Ajout des colonnes OTP pour l'authentification par téléphone
-- Exécuter ce script dans MySQL Workbench ou phpMyAdmin

-- 1. Ajouter les colonnes OTP
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS otp_code VARCHAR(6) NULL,
ADD COLUMN IF NOT EXISTS otp_expires_at DATETIME NULL;

-- 2. Rendre password et email nullable (pour les comptes créés par téléphone uniquement)
ALTER TABLE customers 
MODIFY COLUMN password VARCHAR(255) NULL,
MODIFY COLUMN email VARCHAR(255) NULL;

-- 3. S'assurer que loyalty_points existe
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0;

-- 4. Ajouter un index unique sur phone (ignorer si existe déjà)
-- Note: Si cette commande échoue car l'index existe, c'est OK
-- ALTER TABLE customers ADD UNIQUE INDEX idx_phone_unique (phone);

SELECT 'Migration OTP terminée avec succès!' as status;
