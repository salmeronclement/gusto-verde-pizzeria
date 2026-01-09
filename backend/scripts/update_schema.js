require('dotenv').config({ path: '../.env' }); // Adjust path to .env if needed, assuming scripts/ is one level deep
const db = require('../config/db');

async function updateSchema() {
    console.log('🚀 Starting Schema Update...');
    const connection = db.promise();

    try {
        // 1. Create services table
        console.log('👉 Creating/Verifying services table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                start_time DATETIME NOT NULL,
                end_time DATETIME NULL,
                status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
                total_revenue DECIMAL(10,2) DEFAULT 0.00,
                order_count INT DEFAULT 0,
                average_ticket DECIMAL(10,2) DEFAULT 0.00,
                top_item VARCHAR(255) NULL
            );
        `);

        // 2. Create site_settings table
        console.log('👉 Creating/Verifying site_settings table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS site_settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value TEXT
            );
        `);

        // 3. Insert default settings
        console.log('👉 Inserting default settings...');
        await connection.query(`
            INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES 
            ('shop_open', 'false'),
            ('wait_time_delivery', '45'),
            ('wait_time_takeout', '20');
        `);

        console.log('✅ Schema update completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
