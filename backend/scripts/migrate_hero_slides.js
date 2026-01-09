require('dotenv').config();
const mysql = require('mysql2/promise');

async function createHeroSlidesTable() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        // Create table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS content_hero_slides (
                id INT AUTO_INCREMENT PRIMARY KEY,
                image_url TEXT NOT NULL,
                title VARCHAR(255) DEFAULT '',
                subtitle VARCHAR(255) DEFAULT '',
                display_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Table content_hero_slides créée avec succès');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

createHeroSlidesTable();
