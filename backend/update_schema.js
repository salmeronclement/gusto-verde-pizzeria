const db = require('./config/db');
require('dotenv').config();

const updateSchema = async () => {
    try {
        console.log('Updating orders table schema...');
        // Update ENUM to include 'prete'
        await db.promise().query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('en_attente', 'en_preparation', 'prete', 'en_livraison', 'livree', 'annulee') DEFAULT 'en_attente'
    `);
        console.log('✅ Schema updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating schema:', error);
        process.exit(1);
    }
};

updateSchema();
