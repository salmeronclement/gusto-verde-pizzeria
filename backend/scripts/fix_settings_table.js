const db = require('../config/db');

async function fixTable() {
    try {
        const promiseDb = db.promise();
        console.log("Modifying site_settings table...");

        // Change setting_value to TEXT to hold larger JSON strings
        await promiseDb.query("ALTER TABLE site_settings MODIFY COLUMN setting_value TEXT");

        console.log("Table modified successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error modifying table:", error);
        process.exit(1);
    }
}

fixTable();
