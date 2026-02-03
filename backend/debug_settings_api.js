// Script de debug pour vérifier l'API settings
// Usage: node debug_settings_api.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugSettings() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'dolce_pizza'
    });

    try {
        console.log('🔍 DEBUG: Vérification des settings...\n');

        // 1. Vérifier contact_info dans la DB
        const [contactRows] = await connection.execute(
            'SELECT setting_value FROM site_settings WHERE setting_key = ?',
            ['contact_info']
        );

        if (contactRows.length > 0) {
            console.log('✅ contact_info trouvé dans la DB:');
            const contactInfo = JSON.parse(contactRows[0].setting_value);
            console.log(JSON.stringify(contactInfo, null, 2));
        } else {
            console.log('❌ contact_info NOT FOUND dans la DB!');
        }

        console.log('\n---\n');

        // 2. Simuler ce que l'API /public retourne
        const [allRows] = await connection.execute('SELECT setting_key, setting_value FROM site_settings');

        const settings = {};
        allRows.forEach(row => {
            try {
                settings[row.setting_key] = JSON.parse(row.setting_value);
            } catch (e) {
                settings[row.setting_key] = row.setting_value;
            }
        });

        const publicSettings = {
            contact_info: settings.contact_info || {
                phone: '04 91 555 444',
                address: '24 boulevard Notre Dame, 13006 Marseille',
                email: 'contact@gustoverde.fr',
                brand_name: 'Gusto Verde'
            }
        };

        console.log('📡 Ce que devrait retourner /api/settings/public:');
        console.log(JSON.stringify(publicSettings, null, 2));

        console.log('\n---\n');
        console.log('💡 Testez aussi directement l\'API:');
        console.log('   curl https://dolce-pizza-marseille.com/api/settings/public');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await connection.end();
    }
}

debugSettings();
