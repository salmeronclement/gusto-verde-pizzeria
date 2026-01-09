const db = require('../config/db');

async function checkSettings() {
    try {
        const [rows] = await db.promise().query("SELECT setting_key, setting_value FROM site_settings WHERE setting_key = 'schedule'");
        console.log("Schedule in DB:", rows[0]);

        // Simulate backend logic
        const row = rows[0];
        let parsed;
        try {
            parsed = JSON.parse(row.setting_value);
            console.log("Parsed type:", typeof parsed);
            console.log("Is Array?", Array.isArray(parsed));
        } catch (e) {
            console.log("Parse error:", e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkSettings();
