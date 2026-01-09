const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkCustomers() {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await c.query('SELECT id, first_name, last_name, phone, email, loyalty_points FROM customers');

    console.log('');
    console.log('=== CLIENTS DANS LA BDD ===');
    console.log('Nombre total:', rows.length);
    console.log('');

    rows.forEach(r => {
        console.log(`#${r.id} - ${r.first_name || '?'} ${r.last_name || '?'} - Tel: ${r.phone || 'N/A'} - Email: ${r.email || 'N/A'} - Points: ${r.loyalty_points}`);
    });

    await c.end();
}

checkCustomers();
