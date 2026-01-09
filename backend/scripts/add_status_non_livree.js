const db = require('../config/db');

async function migrate() {
    try {
        const promiseDb = db.promise();
        console.log("Adding 'non_livree' status to orders table...");

        await promiseDb.query(`
            ALTER TABLE orders 
            MODIFY COLUMN status ENUM('en_attente', 'en_preparation', 'prete', 'assignee', 'en_livraison', 'livree', 'annulee', 'non_livree') 
            NOT NULL DEFAULT 'en_attente'
        `);

        console.log("✅ Migration successful: 'non_livree' status added.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

migrate();
