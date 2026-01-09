
const db = require('../config/db');

async function addDeliveryFeeColumn() {
    try {
        console.log('Adding delivery_fee column to orders table...');
        await db.promise().query(
            "ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0 AFTER total_amount"
        );
        console.log('✅ Column delivery_fee added successfully.');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️ Column delivery_fee already exists.');
            process.exit(0);
        }
        console.error('❌ Error adding column:', error);
        process.exit(1);
    }
}

addDeliveryFeeColumn();
