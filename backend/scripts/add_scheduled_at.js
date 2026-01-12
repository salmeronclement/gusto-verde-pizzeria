const db = require('../config/db');

async function migrate() {
    try {
        const promiseDb = db.promise();
        console.log("Checking orders table for scheduled_at column...");

        const [columns] = await promiseDb.query("SHOW COLUMNS FROM orders LIKE 'scheduled_at'");

        if (columns.length === 0) {
            console.log("Adding scheduled_at column...");
            await promiseDb.query("ALTER TABLE orders ADD COLUMN scheduled_at DATETIME NULL AFTER created_at");
            console.log("Column scheduled_at added successfully.");
        } else {
            console.log("Column scheduled_at already exists.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
