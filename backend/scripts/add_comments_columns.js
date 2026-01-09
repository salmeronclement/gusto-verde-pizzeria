const mysql = require('mysql2/promise');
require('dotenv').config();

async function addCommentsColumns() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('📝 Checking and adding comment column to orders table...');

        // Check if comment column exists
        const [ordersColumns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'comment'
        `, [process.env.DB_NAME]);

        if (ordersColumns.length === 0) {
            await connection.query(`ALTER TABLE orders ADD COLUMN comment TEXT NULL`);
            console.log('✅ orders.comment added');
        } else {
            console.log('ℹ️  orders.comment already exists');
        }

        console.log('📝 Checking and adding notes column to order_items table...');

        // Check if notes column exists
        const [itemsColumns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'notes'
        `, [process.env.DB_NAME]);

        if (itemsColumns.length === 0) {
            await connection.query(`ALTER TABLE order_items ADD COLUMN notes TEXT NULL`);
            console.log('✅ order_items.notes added');
        } else {
            console.log('ℹ️  order_items.notes already exists');
        }

        console.log('✅ Migration complete!');
    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

addCommentsColumns();
