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

const updateDriversTable = async () => {
    const connection = mysql.createConnection(dbConfig);
    const promiseConn = connection.promise();

    try {
        console.log('🔌 Connexion à la base de données...');

        // 1. Check if columns exist
        const [columns] = await promiseConn.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'drivers' AND COLUMN_NAME IN ('username', 'password')
        `, [process.env.DB_NAME]);

        if (columns.length === 2) {
            console.log('✅ Les colonnes username et password existent déjà.');
        } else {
            console.log('🛠 Migration: Ajout des colonnes username et password...');

            // Note: We purge existing drivers to avoid NULL/Duplicate errors, as per User context "repartir proprement" implies cleaning is acceptable or handling defaults.
            // Since we need unique usernames, migration of existing nulls is tricky without generation logic.
            // Requirement says: "Si la table contient déjà des livreurs, le script devra gérer la migration (ou vider la table pour repartir proprement)."
            // I will choose to EMPTY the table to strictly enforce the new schema Cleanly.

            console.log('🧹 Nettoyage de la table drivers (Reset pour garantir intégrité)...');
            await promiseConn.query('DELETE FROM drivers');

            await promiseConn.query('ALTER TABLE drivers ADD COLUMN username VARCHAR(50) NOT NULL UNIQUE');
            await promiseConn.query('ALTER TABLE drivers ADD COLUMN password VARCHAR(255) NOT NULL');

            console.log('✅ Colonnes ajoutées avec succès.');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la migration :', error);
    } finally {
        connection.end();
    }
};

updateDriversTable();
