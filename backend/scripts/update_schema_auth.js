require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
};

async function updateSchema() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Update customers table
        console.log('Updating customers table...');

        // Check if password column exists
        const [columns] = await connection.query("SHOW COLUMNS FROM customers LIKE 'password'");
        if (columns.length === 0) {
            console.log('Adding password column...');
            await connection.query(`
                ALTER TABLE customers 
                ADD COLUMN password VARCHAR(255) AFTER email;
            `);
        } else {
            console.log('Password column already exists.');
        }

        // Ensure email is unique (might fail if duplicates exist)
        try {
            await connection.query(`
                ALTER TABLE customers 
                ADD UNIQUE (email);
            `);
            console.log('Email column is now UNIQUE.');
        } catch (error) {
            if (error.code === 'ER_DUP_KEY' || error.code === 'ER_DUP_ENTRY') {
                console.log('Could not make email UNIQUE (duplicates exist or already unique). Ignoring.');
            } else {
                console.log('Error making email unique (ignoring):', error.message);
            }
        }

        // 2. Create admins table
        console.log('Creating admins table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'staff', 'livreur') DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Admins table created successfully.');

    } catch (error) {
        console.error('Error updating schema:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateSchema();
