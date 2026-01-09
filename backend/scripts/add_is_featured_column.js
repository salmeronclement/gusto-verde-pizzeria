
const db = require('../config/db');

async function migrate() {
    try {
        const promiseDb = db.promise();
        console.log('Checking if is_featured column exists...');

        const [columns] = await promiseDb.query("SHOW COLUMNS FROM products LIKE 'is_featured'");

        if (columns.length === 0) {
            console.log('Adding must_featured column...');
            await promiseDb.query("ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT 0");
            console.log('✅ Column is_featured added successfully.');
        } else {
            console.log('ℹ️ Column is_featured already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
