const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyAdminToken = require('../middleware/adminMiddleware');

// GET /api/admin/settings - Get all settings
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const [settings] = await db.promise().query('SELECT * FROM site_settings');
        // Convert array to object { key: value }
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.setting_key] = curr.setting_value;
            return acc;
        }, {});
        res.json(settingsObj);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/admin/settings - Update settings
router.put('/', verifyAdminToken, async (req, res) => {
    try {
        const settings = req.body; // { key: value, key2: value2 }

        const promises = Object.keys(settings).map(key => {
            return db.promise().query(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, settings[key], settings[key]]
            );
        });

        await Promise.all(promises);

        res.json({ message: 'Paramètres mis à jour avec succès' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/admin/settings/service - Update service settings
router.post('/service', verifyAdminToken, async (req, res) => {
    const { isOpen, deliveryTime, takeoutTime } = req.body;

    try {
        const updates = [
            { key: 'shop_open', value: String(isOpen) },
            { key: 'wait_time_delivery', value: String(deliveryTime) },
            { key: 'wait_time_takeout', value: String(takeoutTime) }
        ];

        for (const update of updates) {
            await db.promise().query(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [update.key, update.value, update.value]
            );
        }

        res.json({ message: 'Paramètres de service mis à jour' });
    } catch (error) {
        console.error('Error updating service settings:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
