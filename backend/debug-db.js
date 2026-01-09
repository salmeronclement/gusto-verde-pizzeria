require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('✅ Connected to DB');

        // Check tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables:', tables.map(t => Object.values(t)[0]));

        // Check services table structure
        try {
            const [servicesCols] = await connection.query('DESCRIBE services');
            console.log('✅ services table exists');
        } catch (e) {
            console.error('❌ services table MISSING or Error:', e.message);
        }

        // Check site_settings table structure
        try {
            const [settingsCols] = await connection.query('DESCRIBE site_settings');
            console.log('✅ site_settings table exists');
        } catch (e) {
            console.error('❌ site_settings table MISSING or Error:', e.message);
        }

        // Try the INSERT query from /open route
        try {
            await connection.query(
                "INSERT INTO site_settings (setting_key, setting_value) VALUES ('shop_open', 'true') ON DUPLICATE KEY UPDATE setting_value = 'true'"
            );
            console.log('✅ site_settings INSERT worked');
        } catch (e) {
            console.error('❌ site_settings INSERT Failed:', e.message);
        }

    } catch (error) {
        console.error('Global Error:', error);
    } finally {
        await connection.end();
    }
}

testDB();
