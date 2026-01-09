const express = require('express');
const router = express.Router();
const db = require('../config/db');

const promiseDb = db.promise();

// POST /api/admin/deliveries/assign
// Assign or reassign a driver to an order
router.post('/assign', async (req, res) => {
    const { orderId, driverId } = req.body;

    if (!orderId || !driverId) {
        return res.status(400).json({ error: 'orderId et driverId requis' });
    }

    try {
        // Check if delivery exists
        const [existing] = await promiseDb.query(
            'SELECT id FROM deliveries WHERE order_id = ?',
            [orderId]
        );

        if (existing.length > 0) {
            // Update existing delivery
            await promiseDb.query(
                `UPDATE deliveries 
                 SET driver_id = ?, status = 'assignée', assigned_at = NOW(), departed_at = NULL, delivered_at = NULL 
                 WHERE order_id = ?`,
                [driverId, orderId]
            );
        } else {
            // Create new delivery
            await promiseDb.query(
                `INSERT INTO deliveries (order_id, driver_id, status, assigned_at) 
                 VALUES (?, ?, 'assignée', NOW())`,
                [orderId, driverId]
            );
        }

        // Also update order status to 'en_preparation' if it was 'en_attente' (optional business logic, but good for flow)
        // For now we just return success

        // Fetch full delivery info to return
        const [delivery] = await promiseDb.query(
            `SELECT d.*, dr.first_name, dr.last_name, dr.phone 
             FROM deliveries d 
             JOIN drivers dr ON d.driver_id = dr.id 
             WHERE d.order_id = ?`,
            [orderId]
        );

        res.json(delivery[0]);

    } catch (error) {
        console.error('❌ Erreur assignation livraison :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PATCH /api/admin/deliveries/:id/status
// Update delivery status
router.patch('/:id/status', async (req, res) => {
    const deliveryId = req.params.id;
    const { status } = req.body;
    const validStatuses = ['assignée', 'en_livraison', 'livrée', 'annulée'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
    }

    try {
        let updateQuery = 'UPDATE deliveries SET status = ?';
        const params = [status];

        if (status === 'assignée') {
            updateQuery += ', assigned_at = COALESCE(assigned_at, NOW())';
        } else if (status === 'en_livraison') {
            updateQuery += ', departed_at = COALESCE(departed_at, NOW())';
        } else if (status === 'livrée') {
            updateQuery += ', delivered_at = COALESCE(delivered_at, NOW())';
        }

        updateQuery += ' WHERE id = ?';
        params.push(deliveryId);

        await promiseDb.query(updateQuery, params);

        // Also update the main order status if needed to keep them in sync
        // e.g. if delivery is 'livrée', order should be 'livree'
        if (status === 'livrée') {
            // Get order_id
            const [d] = await promiseDb.query('SELECT order_id FROM deliveries WHERE id = ?', [deliveryId]);
            if (d.length > 0) {
                await promiseDb.query('UPDATE orders SET status = ? WHERE id = ?', ['livree', d[0].order_id]);
            }
        } else if (status === 'en_livraison') {
            const [d] = await promiseDb.query('SELECT order_id FROM deliveries WHERE id = ?', [deliveryId]);
            if (d.length > 0) {
                await promiseDb.query('UPDATE orders SET status = ? WHERE id = ?', ['en_livraison', d[0].order_id]);
            }
        }

        res.json({ success: true, status });

    } catch (error) {
        console.error('❌ Erreur mise à jour livraison :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/admin/deliveries/:orderId
router.get('/:orderId', async (req, res) => {
    try {
        const [delivery] = await promiseDb.query(
            `SELECT d.*, dr.first_name, dr.last_name, dr.phone 
             FROM deliveries d 
             JOIN drivers dr ON d.driver_id = dr.id 
             WHERE d.order_id = ?`,
            [req.params.orderId]
        );

        if (delivery.length === 0) {
            return res.status(404).json({ error: 'Pas de livraison pour cette commande' });
        }

        res.json({
            id: delivery[0].id,
            order_id: delivery[0].order_id,
            status: delivery[0].status,
            assigned_at: delivery[0].assigned_at,
            departed_at: delivery[0].departed_at,
            delivered_at: delivery[0].delivered_at,
            driver: {
                id: delivery[0].driver_id,
                first_name: delivery[0].first_name,
                last_name: delivery[0].last_name,
                phone: delivery[0].phone
            }
        });

    } catch (error) {
        console.error('❌ Erreur récupération livraison :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
