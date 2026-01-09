require('dotenv').config();
const db = require('./config/db');

async function resetServiceLogic() {
    console.log('🚀 Starting Service Logic Reset...');
    const connection = db.promise();

    try {
        // 1. Verify/Create services table
        console.log('👉 Verifying services table...');
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

        // 2. Verify/Create service_id in orders
        console.log('👉 Verifying orders table schema...');
        try {
            await connection.query(`
                ALTER TABLE orders ADD COLUMN service_id INT NULL;
            `);
            console.log('   -> Added service_id column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   -> service_id column already exists.');
            } else {
                throw e;
            }
        }

        // 3. Close ALL open services (Safety Reset)
        console.log('👉 Closing all currently open services...');
        const [result] = await connection.query(`
            UPDATE services 
            SET status = 'closed', end_time = NOW() 
            WHERE status = 'open'
        `);
        console.log(`   -> Closed ${result.affectedRows} services.`);

        // 4. Reset Site Settings
        console.log('👉 Resetting site_settings...');
        await connection.query(`
            INSERT INTO site_settings (setting_key, setting_value) VALUES 
            ('shop_open', 'false')
            ON DUPLICATE KEY UPDATE setting_value = 'false'
        `);

        console.log('✅ Service Logic Reset Completed Successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    }
}

resetServiceLogic();
