require('dotenv').config();
const db = require('./config/db');

async function checkService() {
    try {
        const [rows] = await db.promise().query("SELECT * FROM services WHERE status = 'open'");
        console.log('Open services found:', rows.length);
        if (rows.length > 0) {
            console.log('Service details:', rows[0]);
        } else {
            console.log('No open service found.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkService();
