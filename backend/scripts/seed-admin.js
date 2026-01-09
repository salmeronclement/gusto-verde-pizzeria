const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
};

const seedAdmin = async () => {
    const connection = mysql.createConnection(dbConfig);
    const promiseConn = connection.promise();

    try {
        console.log('🔌 Connexion à la base de données...');

        // 1. Create Table
        console.log('📦 Création de la table admins...');
        await promiseConn.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Hash Password
        console.log('🔒 Hachage du mot de passe...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        // 3. Insert Admin
        console.log('👤 Insertion de l\'admin par défaut...');
        // Use INSERT IGNORE or ON DUPLICATE KEY UPDATE to avoid duplicates
        await promiseConn.query(`
            INSERT INTO admins (username, password, role) 
            VALUES (?, ?, 'admin')
            ON DUPLICATE KEY UPDATE password = VALUES(password)
        `, ['admin', hashedPassword]);

        console.log('✅ Admin créé/mis à jour avec succès : admin / password123');

    } catch (error) {
        console.error('❌ Erreur lors du seeding :', error);
    } finally {
        connection.end();
    }
};

seedAdmin();
