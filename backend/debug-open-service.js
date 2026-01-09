require('dotenv').config();
const db = require('./config/db');

async function testOpenService() {
    console.log('🚀 Starting Open Service Simulation...');
    let connection;
    try {
        console.log('👉 Getting connection...');
        connection = await db.promise().getConnection();
        console.log('✅ Connection acquired');

        await connection.beginTransaction();
        console.log('✅ Transaction started');

        // 1. Check if already open
        console.log('👉 Checking for existing open service...');
        const [existing] = await connection.query(
            "SELECT id FROM services WHERE status = 'open' LIMIT 1"
        );
        console.log(`✅ Existing check done. Found: ${existing.length}`);

        if (existing.length > 0) {
            console.log('⚠️ A service is already open. Rolling back...');
            await connection.rollback();
            return;
        }

        // 2. Create new service
        console.log('👉 Inserting new service...');
        const [result] = await connection.query(
            "INSERT INTO services (start_time, status) VALUES (NOW(), 'open')"
        );
        const newServiceId = result.insertId;
        console.log(`✅ Service inserted. ID: ${newServiceId}`);

        // 3. Catch-up orders
        console.log('👉 Updating orphan orders...');
        const [updateResult] = await connection.query(`
            UPDATE orders 
            SET service_id = ? 
            WHERE service_id IS NULL 
            AND status != 'cancelled'
            AND DATE(created_at) = CURDATE()
        `, [newServiceId]);
        console.log(`✅ Orders updated. Affected: ${updateResult.affectedRows}`);

        // 4. Update site settings
        console.log('👉 Updating site_settings...');
        await connection.query(
            "INSERT INTO site_settings (setting_key, setting_value) VALUES ('shop_open', 'true') ON DUPLICATE KEY UPDATE setting_value = 'true'"
        );
        console.log('✅ Site settings updated');

        await connection.commit();
        console.log('🎉 Transaction COMMITTED successfully!');

    } catch (error) {
        console.error('❌ ERROR:', error);
        if (connection) {
            await connection.rollback();
            console.log('⚠️ Transaction rolled back due to error.');
        }
    } finally {
        if (connection) connection.release();
        console.log('👋 Connection released.');
        // Wait a bit for logs to flush
        setTimeout(() => process.exit(0), 1000);
    }
}

testOpenService();
