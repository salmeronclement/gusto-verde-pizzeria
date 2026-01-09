require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function verifyProducts() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM products');
        console.log(`Total products in DB: ${rows[0].count}`);

        if (rows[0].count > 0) {
            const [sample] = await connection.query('SELECT * FROM products LIMIT 3');
            console.log('Sample products:', sample);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

verifyProducts();
