const db = require('../config/db');

async function checkSchema() {
    try {
        const [rows] = await db.promise().query("DESCRIBE site_settings");
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
