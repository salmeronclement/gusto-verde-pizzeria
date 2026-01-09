const db = require('../config/db');

async function addDriverStatusColumn() {
    try {
        const promiseDb = db.promise();
        console.log("Checking 'drivers' table for 'current_status' column...");

        const [columns] = await promiseDb.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'drivers' AND COLUMN_NAME = 'current_status'
        `, [process.env.DB_NAME || 'pizzeria_db']);

        if (columns.length === 0) {
            console.log("Column 'current_status' not found. Adding it...");
            await promiseDb.query(`
                ALTER TABLE drivers 
                ADD COLUMN current_status ENUM('active', 'pause', 'inactive') NOT NULL DEFAULT 'inactive'
            `);
            console.log("Column 'current_status' added successfully.");
        } else {
            console.log("Column 'current_status' already exists.");
        }
        process.exit(0);
    } catch (error) {
        console.error("Error adding column:", error);
        process.exit(1);
    }
}

addDriverStatusColumn();
