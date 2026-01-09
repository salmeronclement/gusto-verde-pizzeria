require('dotenv').config({ path: '../.env' });
const db = require('../config/db');

const initSettings = async () => {
    try {
        const settings = [
            { key: 'shop_open', value: 'true' },
            { key: 'wait_time_delivery', value: '45' },
            { key: 'wait_time_takeout', value: '20' }
        ];

        console.log('🔌 Connexion à la base de données...');

        for (const setting of settings) {
            await db.promise().query(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [setting.key, setting.value, setting.value]
            );
            console.log(`✅ Paramètre défini : ${setting.key} = ${setting.value}`);
        }

        console.log('🎉 Initialisation des paramètres de service terminée !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation :', error);
        process.exit(1);
    }
};

initSettings();
