const db = require('../config/db');

async function checkSchema() {
    try {
        const promiseDb = db.promise();
        const [rows] = await promiseDb.query("DESCRIBE customers");
        console.log(rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSchema();
