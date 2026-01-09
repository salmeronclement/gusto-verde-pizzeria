const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
};

const updateDriversForOTP = async () => {
    const connection = mysql.createConnection(dbConfig);
    const promiseConn = connection.promise();

    try {
        console.log('🔌 Connexion à la base de données...');

        // 1. Check if username/password columns exist
        const [existingCols] = await promiseConn.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'drivers' AND COLUMN_NAME IN ('username', 'password')
        `, [process.env.DB_NAME]);

        if (existingCols.length > 0) {
            console.log('🗑 Suppression des colonnes username et password...');
            await promiseConn.query('ALTER TABLE drivers DROP COLUMN username, DROP COLUMN password');
        } else {
            console.log('ℹ️ Colonnes username/password déjà absentes.');
        }

        // 2. Add OTP columns
        const [otpCols] = await promiseConn.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'drivers' AND COLUMN_NAME = 'otp_code'
        `, [process.env.DB_NAME]);

        if (otpCols.length === 0) {
            console.log('✨ Ajout des colonnes OTP...');
            await promiseConn.query('ALTER TABLE drivers ADD COLUMN otp_code VARCHAR(10) NULL');
            await promiseConn.query('ALTER TABLE drivers ADD COLUMN otp_expires_at DATETIME NULL');
        } else {
            console.log('✅ Colonnes OTP déjà présentes.');
        }

        console.log('✅ Migration terminée avec succès.');

    } catch (error) {
        console.error('❌ Erreur lors de la migration :', error);
    } finally {
        connection.end();
    }
};

updateDriversForOTP();
