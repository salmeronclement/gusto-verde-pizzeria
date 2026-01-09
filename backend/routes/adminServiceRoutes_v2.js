const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyAdminToken = require('../middleware/adminMiddleware');

// GET /status - Get current service status
router.get('/status', async (req, res) => {
    try {
        // 1. Find latest service
        const [services] = await db.promise().query('SELECT * FROM services ORDER BY start_time DESC LIMIT 1');

        if (!services || services.length === 0) {
            return res.json({ status: 'closed', service: null });
        }

        const latestService = services[0];

        // 2. If closed, return closed
        if (latestService.status === 'closed') {
            return res.json({ status: 'closed', service: latestService });
        }

        // 3. If open, fetch real-time stats
        const [stats] = await db.promise().query(`
            SELECT 
                COUNT(*) as order_count,
                COALESCE(SUM(total), 0) as total_revenue
            FROM orders 
            WHERE service_id = ? AND status != 'cancelled'
        `, [latestService.id]);

        return res.json({
            status: 'open',
            service: {
                ...latestService,
                current_revenue: parseFloat(stats[0].total_revenue),
                current_orders: stats[0].order_count
            }
        });

    } catch (error) {
        console.error('Error in /status:', error);
        // Fallback to closed to prevent crash
        res.json({ status: 'closed', service: null, error: 'Backend Error' });
    }
});

// POST /open - Open new service
router.post('/open', verifyAdminToken, async (req, res) => {
    console.log('🔍 DEBUG: /api/admin/service/open HIT');
    try {
        // 1. Check if already open
        const [existing] = await db.promise().query("SELECT id FROM services WHERE status = 'open' LIMIT 1");
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Un service est déjà ouvert.' });
        }

        // 2. Create Service
        const [result] = await db.promise().query("INSERT INTO services (start_time, status) VALUES (NOW(), 'open')");
        const newServiceId = result.insertId;

        // 3. CATCH-UP: Assign orphan orders to this service
        // (Orders created today, with no service_id, not cancelled)
        const [updateResult] = await db.promise().query(`
            UPDATE orders 
            SET service_id = ? 
            WHERE service_id IS NULL 
            AND status != 'cancelled'
            AND DATE(created_at) = CURDATE()
        `, [newServiceId]);

        // 4. Update Settings
        await db.promise().query("INSERT INTO site_settings (setting_key, setting_value) VALUES ('shop_open', 'true') ON DUPLICATE KEY UPDATE setting_value = 'true'");

        res.json({
            message: 'Service ouvert',
            serviceId: newServiceId,
            caughtUpOrders: updateResult.affectedRows
        });

    } catch (error) {
        console.error('Error opening service:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ouverture du service' });
    }
});

// POST /close - Close service
router.post('/close', verifyAdminToken, async (req, res) => {
    try {
        // 1. Get Open Service
        const [services] = await db.promise().query("SELECT id FROM services WHERE status = 'open' LIMIT 1");
        if (services.length === 0) {
            return res.status(400).json({ error: 'Aucun service ouvert.' });
        }
        const serviceId = services[0].id;

        // 2. Calculate Final Stats
        const [stats] = await db.promise().query(`
            SELECT 
                COUNT(*) as order_count,
                COALESCE(SUM(total), 0) as total_revenue
            FROM orders 
            WHERE service_id = ? AND status != 'cancelled'
        `, [serviceId]);

        const totalRevenue = parseFloat(stats[0].total_revenue);
        const orderCount = stats[0].order_count;
        const averageTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

        // 3. Find Top Item
        const [topItems] = await db.promise().query(`
            SELECT p.name, SUM(oi.quantity) as qty
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.service_id = ? AND o.status != 'cancelled'
            GROUP BY p.id
            ORDER BY qty DESC
            LIMIT 1
        `, [serviceId]);
        const topItem = topItems.length > 0 ? `${topItems[0].name} (${topItems[0].qty})` : 'Aucun';

        // 4. Close Service
        await db.promise().query(`
            UPDATE services 
            SET end_time = NOW(), status = 'closed',
                total_revenue = ?, order_count = ?, average_ticket = ?, top_item = ?
            WHERE id = ?
        `, [totalRevenue, orderCount, averageTicket, topItem, serviceId]);

        // 5. Update Settings
        await db.promise().query("INSERT INTO site_settings (setting_key, setting_value) VALUES ('shop_open', 'false') ON DUPLICATE KEY UPDATE setting_value = 'false'");

        res.json({
            message: 'Service clôturé',
            summary: { totalRevenue, orderCount, averageTicket, topItem }
        });

    } catch (error) {
        console.error('Error closing service:', error);
        res.status(500).json({ error: 'Erreur lors de la clôture' });
    }
});

// GET /history
router.get('/history', verifyAdminToken, async (req, res) => {
    try {
        const [services] = await db.promise().query('SELECT * FROM services WHERE status = "closed" ORDER BY start_time DESC LIMIT 50');
        res.json(services);
    } catch (error) {
        console.error('Error history:', error);
        res.status(500).json({ error: 'Erreur historique' });
    }
});

module.exports = router;
