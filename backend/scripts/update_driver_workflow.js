const db = require('../config/db');

async function migrate() {
    console.log("🚀 Starting Driver Workflow Migration...");
    const promiseDb = db.promise();

    try {
        // 1. Update 'orders' table ENUM to include 'assignee'
        console.log("1️⃣ Updating 'orders' table ENUM...");
        // Note: We need to redefine the entire ENUM list. 
        // Current assumed: 'en_attente', 'en_preparation', 'en_livraison', 'livree', 'annulee'
        // New: 'en_attente', 'en_preparation', 'assignee', 'en_livraison', 'livree', 'annulee'
        await promiseDb.query(`
            ALTER TABLE orders 
            MODIFY COLUMN status ENUM('en_attente', 'en_preparation', 'assignee', 'en_livraison', 'livree', 'annulee') 
            DEFAULT 'en_attente'
        `);
        console.log("✅ 'orders' table updated.");

        // 2. Add 'departed_at' to 'deliveries' table
        console.log("2️⃣ Checking 'deliveries' table for 'departed_at' column...");
        const [columns] = await promiseDb.query(`
            SHOW COLUMNS FROM deliveries LIKE 'departed_at'
        `);

        if (columns.length === 0) {
            await promiseDb.query(`
                ALTER TABLE deliveries 
                ADD COLUMN departed_at DATETIME NULL AFTER assigned_at
            `);
            console.log("✅ 'departed_at' column added to 'deliveries'.");
        } else {
            console.log("ℹ️ 'departed_at' column already exists.");
        }

        console.log("🎉 Migration completed successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();
