// Script de debug pour tester le flux complet des settings
// Run: node debug_settings_flow.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function debugSettingsFlow() {
    console.log('🔍 DEBUG: Flux complet des settings\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // 1. Vérifier ce qui est en base de données
        console.log('📋 Étape 1: Données en base MySQL');
        console.log('================================');
        const [rows] = await connection.query('SELECT setting_key, setting_value FROM site_settings WHERE setting_key = "contact_info"');

        if (rows.length === 0) {
            console.log('❌ PROBLÈME: contact_info n\'existe pas en base !');
            console.log('   → Solution: Exécutez `node init_contact_info.js`\n');
        } else {
            const dbValue = rows[0].setting_value;
            console.log('✅ contact_info trouvé:');
            console.log(dbValue);

            // 2. Parser le JSON
            console.log('\n📋 Étape 2: Parsing JSON');
            console.log('================================');
            try {
                const parsed = JSON.parse(dbValue);
                console.log('✅ JSON valide:');
                console.log(JSON.stringify(parsed, null, 2));
            } catch (e) {
                console.log('❌ PROBLÈME: JSON invalide!');
                console.log('   Erreur:', e.message);
            }
        }

        // 3. Simuler la requête API
        console.log('\n📋 Étape 3: Simulation API /api/settings/public');
        console.log('================================');
        const [allRows] = await connection.query('SELECT setting_key, setting_value FROM site_settings');

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

        console.log('✅ Réponse API simulée:');
        console.log(JSON.stringify(publicSettings.contact_info, null, 2));

        // 4. Recommandations
        console.log('\n📋 Étape 4: Recommandations');
        console.log('================================');
        console.log('1. Vérifiez que l\'admin sauvegarde correctement:');
        console.log('   → Ouvrez la console navigateur (F12) dans l\'admin');
        console.log('   → Modifiez une coordonnée et sauvegardez');
        console.log('   → Vérifiez qu\'il n\'y a pas d\'erreur réseau\n');

        console.log('2. Vérifiez que le client récupère les bonnes données:');
        console.log('   → Ouvrez le site client');
        console.log('   → Console (F12): localStorage.clear()');
        console.log('   → Console (F12): location.reload()');
        console.log('   → Vérifiez le footer/header\n');

        console.log('3. Testez l\'API directement:');
        console.log('   → curl http://yourserver.com/api/settings/public');
        console.log('   → Vérifiez le champ contact_info\n');

    } finally {
        await connection.end();
    }
}

debugSettingsFlow().catch(console.error);
