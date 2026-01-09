const db = require('../config/db');

async function updateSchema() {
    const promiseDb = db.promise();
    console.log('🔄 Checking `services` table schema...');

    try {
        // 1. Ensure table exists
        await promiseDb.query(`
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                start_time DATETIME NOT NULL,
                end_time DATETIME NULL,
                status ENUM('open', 'closed') NOT NULL DEFAULT 'open'
            )
        `);
        console.log('✅ Table `services` checked/created.');

        // Helper to add column if missing
        const addColumnIfNeeded = async (colName, colDef) => {
            const [rows] = await promiseDb.query(`
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'services' 
                AND COLUMN_NAME = ?
            `, [colName]);

            if (rows[0].count === 0) {
                console.log(`➕ Adding column ${colName}...`);
                await promiseDb.query(`ALTER TABLE services ADD COLUMN ${colName} ${colDef}`);
                console.log(`✅ Column ${colName} added.`);
            } else {
                console.log(`ℹ️ Column ${colName} already exists.`);
            }
        };

        // 2. Add missing columns
        await addColumnIfNeeded('total_revenue', 'DECIMAL(10,2) DEFAULT 0.00');
        await addColumnIfNeeded('order_count', 'INT DEFAULT 0');
        await addColumnIfNeeded('average_ticket', 'DECIMAL(10,2) DEFAULT 0.00');
        await addColumnIfNeeded('top_item', 'VARCHAR(255) NULL'); // Also adding top_item as it was used in the previous code

        console.log('🎉 Schema update completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
