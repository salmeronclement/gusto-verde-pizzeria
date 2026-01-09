require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function createAdmin() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const username = 'admin';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if admin exists
        const [rows] = await connection.execute('SELECT * FROM admins WHERE username = ?', [username]);

        if (rows.length > 0) {
            console.log('Admin user already exists.');
            return;
        }

        // Insert admin
        await connection.execute(
            'INSERT INTO admins (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, 'admin']
        );

        console.log('Super Admin created successfully.');
        console.log('Username: admin');
        console.log('Password: admin123');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        if (connection) await connection.end();
    }
}

createAdmin();
