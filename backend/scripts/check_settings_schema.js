const db = require('../config/db');

async function checkSchema() {
    try {
        const promiseDb = db.promise();
        const [rows] = await promiseDb.query("DESCRIBE site_settings");
        console.log(rows);

        // Also check current content
        const [content] = await promiseDb.query("SELECT * FROM site_settings");
        console.log("Current Content:", content);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
