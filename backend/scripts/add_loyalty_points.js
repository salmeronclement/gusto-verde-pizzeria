const db = require('../config/db');

async function migrate() {
    try {
        const promiseDb = db.promise();
        console.log("Adding loyalty_points column to customers table...");

        // Check if column exists
        const [columns] = await promiseDb.query("SHOW COLUMNS FROM customers LIKE 'loyalty_points'");

        if (columns.length === 0) {
            await promiseDb.query("ALTER TABLE customers ADD COLUMN loyalty_points INT DEFAULT 0");
            console.log("Column 'loyalty_points' added successfully.");
        } else {
            console.log("Column 'loyalty_points' already exists.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
