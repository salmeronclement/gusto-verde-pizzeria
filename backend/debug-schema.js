require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('✅ Connected to DB');

        const [columns] = await connection.query("SHOW COLUMNS FROM orders LIKE 'service_id'");
        if (columns.length > 0) {
            console.log('✅ Column service_id EXISTS in orders table');
        } else {
            console.error('❌ Column service_id MISSING in orders table');
        }

    } catch (error) {
        console.error('Schema Check Error:', error);
    } finally {
        await connection.end();
    }
}

checkSchema();
