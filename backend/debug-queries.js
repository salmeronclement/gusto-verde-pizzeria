require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugQueries() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('✅ Connected to DB');
        await connection.beginTransaction();
        console.log('✅ Transaction started');

        // 1. Check existing
        const [existing] = await connection.query("SELECT id FROM services WHERE status = 'open' LIMIT 1");
        console.log('✅ Check existing done');

        // 2. Insert Service
        const [result] = await connection.query("INSERT INTO services (start_time, status) VALUES (NOW(), 'open')");
        console.log('✅ Insert Service done, ID:', result.insertId);
        const newServiceId = result.insertId;

        // 3. Update Orders
        // Check if created_at exists first
        const [cols] = await connection.query("SHOW COLUMNS FROM orders LIKE 'created_at'");
        if (cols.length === 0) console.error('❌ created_at column MISSING in orders');

        const [updateResult] = await connection.query(`
            UPDATE orders 
            SET service_id = ? 
            WHERE service_id IS NULL 
            AND status != 'cancelled'
            AND DATE(created_at) = CURDATE()
        `, [newServiceId]);
        console.log('✅ Update Orders done');

        // 4. Update Settings
        await connection.query(
            "INSERT INTO site_settings (setting_key, setting_value) VALUES ('shop_open', 'true') ON DUPLICATE KEY UPDATE setting_value = 'true'"
        );
        console.log('✅ Update Settings done');

        await connection.rollback();
        console.log('✅ Transaction Rolled Back (Test Successful)');

    } catch (error) {
        console.error('❌ QUERY FAILED:', error.message);
        console.error('Full Error:', error);
    } finally {
        await connection.end();
    }
}

debugQueries();
