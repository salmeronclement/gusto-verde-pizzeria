const db = require('../config/db');

const defaultSettings = [
    {
        key: 'delivery_zones',
        value: JSON.stringify([
            { zip: "13008", city: "Marseille 8" },
            { zip: "13009", city: "Marseille 9" }
        ])
    },
    {
        key: 'loyalty_program',
        value: JSON.stringify({
            enabled: true,
            earn_rate: 1,
            redeem_threshold: 100,
            reward_name: "Pizza Offerte"
        })
    },
    {
        key: 'promo_offer',
        value: JSON.stringify({
            enabled: true,
            buy_quantity: 3,
            get_quantity: 1,
            item_type: "pizza"
        })
    },
    {
        key: 'announcement_message',
        value: "🎉 Livraison offerte ce soir !"
    },
    {
        key: 'delivery_fees',
        value: "2.50"
    },
    {
        key: 'min_order',
        value: "15.00"
    },
    {
        key: 'emergency_close',
        value: "false"
    },
    {
        key: 'schedule',
        value: JSON.stringify([
            { day: 'Lundi', open: '18:00', close: '22:30', closed: false },
            { day: 'Mardi', open: '18:00', close: '22:30', closed: false },
            { day: 'Mercredi', open: '18:00', close: '22:30', closed: false },
            { day: 'Jeudi', open: '18:00', close: '22:30', closed: false },
            { day: 'Vendredi', open: '18:00', close: '23:00', closed: false },
            { day: 'Samedi', open: '18:00', close: '23:00', closed: false },
            { day: 'Dimanche', open: '18:00', close: '22:30', closed: false }
        ])
    }
];

async function updateSettings() {
    const promiseDb = db.promise();
    console.log("Initializing/Updating Site Settings...");

    try {
        for (const setting of defaultSettings) {
            // Check if exists
            const [rows] = await promiseDb.query("SELECT setting_key FROM site_settings WHERE setting_key = ?", [setting.key]);

            if (rows.length === 0) {
                console.log(`Inserting default for ${setting.key}`);
                await promiseDb.query(
                    "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)",
                    [setting.key, setting.value]
                );
            } else {
                console.log(`Setting ${setting.key} already exists. Skipping overwrite to preserve data.`);
            }
        }
        console.log("Settings initialization complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error updating settings:", error);
        process.exit(1);
    }
}

updateSettings();
