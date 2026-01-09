require('dotenv').config();
const db = require('./config/db');

async function testStatus() {
    console.log('🚀 Starting Status Route Simulation...');
    try {
        console.log('👉 Querying services...');
        // This mimics the code in adminServiceRoutes.js
        const [services] = await db.promise().query(
            'SELECT * FROM services ORDER BY start_time DESC LIMIT 1'
        );
        console.log(`✅ Query successful. Found ${services.length} services.`);
        if (services.length > 0) {
            console.log('Latest service:', services[0]);
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    }
}

testStatus();
