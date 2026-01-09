const db = require('./config/db');
const promiseDb = db.promise();

async function checkSchema() {
    try {
        const [rows] = await promiseDb.query('DESCRIBE deliveries');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error describing table:', error);
        process.exit(1);
    }
}

checkSchema();
