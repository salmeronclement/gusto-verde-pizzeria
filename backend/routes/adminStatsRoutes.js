const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyAdminToken = require('../middleware/adminMiddleware');

// GET /api/admin/stats
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // 1. Revenue Today (excluding cancelled)
        const [revenueToday] = await db.promise().query(`
            SELECT SUM(total) as total 
            FROM orders 
            WHERE DATE(created_at) = ? 
            AND status != 'annulée'
        `, [today]);

        // 2. Revenue Yesterday
        const [revenueYesterday] = await db.promise().query(`
            SELECT SUM(total) as total 
            FROM orders 
            WHERE DATE(created_at) = ? 
            AND status != 'annulée'
        `, [yesterday]);

        // 3. Pending Orders (en_attente, en_preparation)
        const [pendingOrders] = await db.promise().query(`
            SELECT COUNT(*) as count 
            FROM orders 
            WHERE status IN ('en_attente', 'en_preparation')
        `);

        res.json({
            revenue_today: revenueToday[0].total || 0,
            revenue_yesterday: revenueYesterday[0].total || 0,
            pending_orders: pendingOrders[0].count || 0
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des statistiques' });
    }
});

module.exports = router;
