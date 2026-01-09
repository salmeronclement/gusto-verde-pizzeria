const db = require('./config/db');

async function debugDb() {
    console.log('--- DEBUG DB TYPE ---');
    console.log('db constructor:', db.constructor.name);

    const promiseDb = db.promise();
    console.log('db.promise() constructor:', promiseDb.constructor.name);

    console.log('Has getConnection?', typeof promiseDb.getConnection);
    console.log('Has query?', typeof promiseDb.query);

    try {
        console.log('Testing query...');
        const [rows] = await promiseDb.query('SELECT 1 as val');
        console.log('Query success:', rows);
    } catch (e) {
        console.error('Query failed:', e);
    }

    process.exit(0);
}

debugDb();
