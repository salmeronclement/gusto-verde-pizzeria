require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

async function resetPassword() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const email = 'salmeronclement@gmail.com';
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const [result] = await connection.query(
            'UPDATE customers SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        if (result.affectedRows > 0) {
            console.log(`Password for ${email} updated successfully.`);
            console.log(`New password: ${newPassword}`);
        } else {
            console.log(`User with email ${email} not found.`);
        }

    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        if (connection) await connection.end();
    }
}

resetPassword();
