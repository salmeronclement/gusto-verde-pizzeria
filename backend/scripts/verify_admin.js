require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function verifyAdmin() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT * FROM admins WHERE username = "admin"');
        console.log('Admin user found:', rows);
    } catch (error) {
        console.error('Error verifying admin:', error);
    } finally {
        if (connection) await connection.end();
    }
}

verifyAdmin();
