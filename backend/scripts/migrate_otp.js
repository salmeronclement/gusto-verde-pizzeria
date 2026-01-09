// Script pour exécuter la migration OTP
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    console.log('🔄 Connexion à la base de données...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'pizzeria_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log('✅ Connecté à', process.env.DB_NAME);

        // 1. Ajouter otp_code si n'existe pas
        console.log('📝 Ajout colonne otp_code...');
        try {
            await connection.query('ALTER TABLE customers ADD COLUMN otp_code VARCHAR(6) NULL');
            console.log('   ✓ otp_code ajoutée');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   ⏭ otp_code existe déjà');
            } else {
                throw e;
            }
        }

        // 2. Ajouter otp_expires_at si n'existe pas
        console.log('📝 Ajout colonne otp_expires_at...');
        try {
            await connection.query('ALTER TABLE customers ADD COLUMN otp_expires_at DATETIME NULL');
            console.log('   ✓ otp_expires_at ajoutée');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   ⏭ otp_expires_at existe déjà');
            } else {
                throw e;
            }
        }

        // 3. Rendre password nullable
        console.log('📝 Modification colonne password (nullable)...');
        await connection.query('ALTER TABLE customers MODIFY COLUMN password VARCHAR(255) NULL');
        console.log('   ✓ password modifiée');

        // 4. Rendre email nullable
        console.log('📝 Modification colonne email (nullable)...');
        await connection.query('ALTER TABLE customers MODIFY COLUMN email VARCHAR(255) NULL');
        console.log('   ✓ email modifiée');

        // 5. S'assurer que loyalty_points existe
        console.log('📝 Vérification colonne loyalty_points...');
        try {
            await connection.query('ALTER TABLE customers ADD COLUMN loyalty_points INT DEFAULT 0');
            console.log('   ✓ loyalty_points ajoutée');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   ⏭ loyalty_points existe déjà');
            } else {
                throw e;
            }
        }

        console.log('');
        console.log('═══════════════════════════════════════');
        console.log('✅ MIGRATION OTP TERMINÉE AVEC SUCCÈS !');
        console.log('═══════════════════════════════════════');
        console.log('');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

runMigration();
