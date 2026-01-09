const db = require('../config/db');

async function migrate() {
    try {
        console.log('Adding is_promo_eligible column to products...');
        await db.promise().query("ALTER TABLE products ADD COLUMN is_promo_eligible BOOLEAN DEFAULT 1;");
        console.log('Column added successfully.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Error adding column:', error);
        }
    }
    process.exit();
}

migrate();
