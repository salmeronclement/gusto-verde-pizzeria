const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyAdminToken = require('../middleware/adminMiddleware');

// GET /api/admin/settings/public (Public access)
router.get('/public', async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT setting_key, setting_value FROM site_settings');

        const settings = {};
        rows.forEach(row => {
            try {
                settings[row.setting_key] = JSON.parse(row.setting_value);
            } catch (e) {
                settings[row.setting_key] = row.setting_value;
            }
        });

        // Filter for public consumption
        const publicSettings = {
            min_order: parseFloat(settings.min_order) || 0,
            delivery_fees: parseFloat(settings.delivery_fees) || 0,
            free_delivery_threshold: settings.promo_offer?.enabled ? 50 : 999, // Example logic or fetch from DB if added
            delivery_zones: settings.delivery_zones || [],
            schedule: settings.schedule || [],
            emergency_close: settings.emergency_close === true || settings.emergency_close === 'true',
            announcement_message: settings.announcement_message || '',
            loyalty_program: settings.loyalty_program || { enabled: false, target_pizzas: 10, require_purchase_for_reward: true },
            promo_offer: settings.promo_offer || { enabled: false, buy_quantity: 3, get_quantity: 1, item_type: 'pizza' },
            contact_info: settings.contact_info || {
                phone: '04 91 555 444',
                address: '24 boulevard Notre Dame, 13006 Marseille',
                email: 'contact@gustoverde.fr',
                brand_name: 'Gusto Verde'
            }
        };

        console.log('📋 [Backend] Public Settings - loyalty_program:', publicSettings.loyalty_program);

        res.json(publicSettings);
    } catch (error) {
        console.error('Error fetching public settings:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/admin/settings
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT setting_key, setting_value FROM site_settings');

        const settings = {};
        rows.forEach(row => {
            try {
                // Try to parse JSON, if fails keep as string
                settings[row.setting_key] = JSON.parse(row.setting_value);
            } catch (e) {
                settings[row.setting_key] = row.setting_value;
            }
        });

        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/admin/settings
router.put('/', verifyAdminToken, async (req, res) => {
    const updates = req.body; // Expecting object like { key: value, key2: value2 }

    // Get a dedicated connection for the transaction
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        for (const [key, value] of Object.entries(updates)) {
            let stringValue = value;
            if (typeof value === 'object') {
                stringValue = JSON.stringify(value);
            } else {
                stringValue = String(value);
            }

            // Check if exists using the SAME connection
            const [existing] = await connection.query('SELECT setting_key FROM site_settings WHERE setting_key = ?', [key]);

            if (existing.length > 0) {
                await connection.query('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [stringValue, key]);
            } else {
                await connection.query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', [key, stringValue]);
            }
        }

        await connection.commit();
        res.json({ success: true, message: 'Paramètres mis à jour' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating settings:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
