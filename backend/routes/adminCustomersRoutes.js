const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/admin/customers - Liste tous les clients avec stats
router.get('/', async (req, res) => {
    try {
        const promiseDb = db.promise();

        const [customers] = await promiseDb.query(`
            SELECT 
                c.id,
                c.email,
                c.first_name,
                c.last_name,
                c.phone,
                c.loyalty_points,
                c.created_at,
                COALESCE(SUM(o.total_amount), 0) as total_spent,
                COUNT(o.id) as order_count
            FROM customers c
            LEFT JOIN orders o ON o.customer_id = c.id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);

        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des clients' });
    }
});

// PATCH /api/admin/customers/:id/loyalty - Modifier les points de fidélité
// IMPORTANT: Cette route doit venir AVANT /:id pour éviter que "loyalty" soit interprété comme un ID
router.patch('/:id/loyalty', async (req, res) => {
    const customerId = req.params.id;
    const { loyalty_points } = req.body;

    if (loyalty_points === undefined || loyalty_points === null) {
        return res.status(400).json({ error: 'Le nombre de tampons est requis' });
    }

    if (loyalty_points < 0) {
        return res.status(400).json({ error: 'Le nombre de tampons ne peut pas être négatif' });
    }

    try {
        const promiseDb = db.promise();

        // Vérifier que le client existe
        const [customers] = await promiseDb.query('SELECT id FROM customers WHERE id = ?', [customerId]);

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Client non trouvé' });
        }

        // Mettre à jour les points
        await promiseDb.query(
            'UPDATE customers SET loyalty_points = ? WHERE id = ?',
            [loyalty_points, customerId]
        );

        console.log(`✅ Admin: Points de fidélité mis à jour pour client #${customerId}: ${loyalty_points} tampons`);

        res.json({
            success: true,
            message: 'Points de fidélité mis à jour',
            loyalty_points: loyalty_points
        });
    } catch (error) {
        console.error('Error updating customer loyalty:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
    }
});

// GET /api/admin/customers/:id - Détails complets d'un client (historique par téléphone)
router.get('/:id', async (req, res) => {
    const customerId = req.params.id;

    try {
        const promiseDb = db.promise();

        // 1. Récupérer les infos du client
        const [customers] = await promiseDb.query(`
            SELECT 
                id,
                email,
                phone,
                first_name,
                last_name,
                loyalty_points,
                created_at
            FROM customers
            WHERE id = ?
        `, [customerId]);

        if (customers.length === 0) {
            return res.status(404).json({ error: 'Client non trouvé' });
        }

        const customer = customers[0];

        // 2. Récupérer l'historique des commandes PAR TÉLÉPHONE (regroupe tous les comptes liés)
        const [orders] = await promiseDb.query(`
            SELECT 
                o.id,
                o.total_amount,
                o.status,
                o.created_at,
                o.mode
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            WHERE c.phone = ?
            ORDER BY o.created_at DESC
        `, [customer.phone]);

        // 3. Pour chaque commande, récupérer les items
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const [items] = await promiseDb.query(
                'SELECT product_name, quantity, unit_price, category FROM order_items WHERE order_id = ?',
                [order.id]
            );
            return { ...order, items };
        }));

        res.json({
            customer: customer,
            orders: ordersWithItems
        });
    } catch (error) {
        console.error('Error fetching customer details:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération du détail client' });
    }
});

module.exports = router;
