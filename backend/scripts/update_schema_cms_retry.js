require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function updateSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Create blog_posts table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table blog_posts created/verified.');

        // 2. Create site_settings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS site_settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Table site_settings created/verified.');

        // 3. Check and add image_url to products if missing
        try {
            const [columns] = await connection.query(`SHOW COLUMNS FROM products LIKE 'image_url'`);
            if (columns.length === 0) {
                await connection.query(`ALTER TABLE products ADD COLUMN image_url VARCHAR(255)`);
                console.log('Column image_url added to products table.');
            } else {
                console.log('Column image_url already exists in products table.');
            }
        } catch (e) {
            console.error("Error checking/adding image_url column: ", e.message);
        }


        // Seed initial settings if empty
        try {
            const [settings] = await connection.query('SELECT * FROM site_settings');
            if (settings.length === 0) {
                await connection.query(`
                    INSERT INTO site_settings (setting_key, setting_value) VALUES 
                    ('opening_hours', 'Lundi - Dimanche : 18h00 - 23h00'),
                    ('about_us', 'Bienvenue chez Dolce Pizza, la meilleure pizzeria de Marseille !'),
                    ('contact_phone', '04 91 00 00 00'),
                    ('contact_email', 'contact@dolcepizza.fr')
                `);
                console.log('Initial site settings seeded.');
            }
        } catch (e) {
            console.error("Error seeding settings: ", e.message);
        }


    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
