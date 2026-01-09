const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/settings/service - Public service status
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('shop_open', 'wait_time_delivery', 'wait_time_takeout')"
        );

        const settings = rows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});

        res.json({
            isOpen: settings.shop_open === 'true',
            deliveryTime: parseInt(settings.wait_time_delivery) || 45,
            takeoutTime: parseInt(settings.wait_time_takeout) || 20
        });
    } catch (error) {
        console.error('Error fetching service settings:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
