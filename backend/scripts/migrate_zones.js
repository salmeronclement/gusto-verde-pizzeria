require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pizzeria_db'
    });

    try {
        console.log('Starting migration...');

        // 1. Get current settings
        const [rows] = await connection.query("SELECT * FROM site_settings WHERE setting_key IN ('delivery_zones', 'min_order')");

        let deliveryZones = [];
        let minOrder = 0;

        rows.forEach(row => {
            if (row.setting_key === 'delivery_zones') {
                try {
                    deliveryZones = JSON.parse(row.setting_value);
                } catch (e) {
                    console.error('Error parsing delivery_zones:', e);
                    deliveryZones = [];
                }
            } else if (row.setting_key === 'min_order') {
                minOrder = Number(row.setting_value) || 0;
            }
        });

        console.log('Current Zones:', deliveryZones);
        console.log('Current Min Order:', minOrder);

        // 2. Check if already migrated (if deliveryZones is an array of objects with 'zones' property)
        if (deliveryZones.length > 0 && deliveryZones[0].zones) {
            console.log('Migration already applied. Skipping.');
            return;
        }

        // 3. Create new structure
        // If deliveryZones is flat array of {zip, city}, wrap it in a tier
        const newStructure = [
            {
                id: 1,
                min_order: minOrder,
                zones: deliveryZones
            }
        ];

        console.log('New Structure:', JSON.stringify(newStructure, null, 2));

        // 4. Update DB
        await connection.query(
            "INSERT INTO site_settings (setting_key, setting_value) VALUES ('delivery_zones', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
            [JSON.stringify(newStructure), JSON.stringify(newStructure)]
        );

        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
