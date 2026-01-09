const db = require('../config/db');

async function fixSchema() {
    const promiseDb = db.promise();
    console.log('🔄 Checking `orders` table schema...');

    try {
        // Helper to add column if missing
        const addColumnIfNeeded = async (colName, colDef) => {
            const [rows] = await promiseDb.query(`
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'orders' 
                AND COLUMN_NAME = ?
            `, [colName]);

            if (rows[0].count === 0) {
                console.log(`➕ Adding column ${colName}...`);
                await promiseDb.query(`ALTER TABLE orders ADD COLUMN ${colName} ${colDef}`);
                console.log(`✅ Column ${colName} added.`);
            } else {
                console.log(`ℹ️ Column ${colName} already exists.`);
            }
        };

        // Add service_id if missing
        await addColumnIfNeeded('service_id', 'INT NULL');

        console.log('🎉 Schema fix completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchema();
