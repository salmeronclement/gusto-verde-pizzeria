// Script d'initialisation des coordonnées
// Usage: node init_contact_info.js

require('dotenv').config();
const mysql = require('mysql2/promise');

async function initContactInfo() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'dolce_pizza'
    });

    try {
        console.log('✅ Connexion MySQL établie');

        // Vérifier si contact_info existe
        const [existing] = await connection.execute(
            'SELECT * FROM site_settings WHERE setting_key = ?',
            ['contact_info']
        );

        if (existing.length > 0) {
            console.log('ℹ️  contact_info existe déjà:', existing[0].setting_value);
            console.log('💡 Vous pouvez le modifier depuis Admin → Paramètres → Coordonnées');
        } else {
            // Créer contact_info avec valeurs par défaut
            const contactInfo = {
                phone: '04 91 555 444',
                address: '24 boulevard Notre Dame, 13006 Marseille',
                email: 'contact@gustoverde.fr',
                brand_name: 'Gusto Verde'
            };

            await connection.execute(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
                ['contact_info', JSON.stringify(contactInfo)]
            );

            console.log('✅ contact_info créé avec succès!');
            console.log('📋 Valeurs par défaut:', contactInfo);
            console.log('💡 Modifiez-les depuis Admin → Paramètres → Coordonnées');
        }

        // Afficher toutes les settings pour vérification
        const [allSettings] = await connection.execute('SELECT setting_key FROM site_settings');
        console.log('\n📊 Settings disponibles:', allSettings.map(s => s.setting_key).join(', '));

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
        console.log('\n✅ Terminé!');
    }
}

initContactInfo();
