const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/admin/orders
// Récupère les commandes + détail pizzas (Méthode sécurisée 2 étapes)
router.get('/', async (req, res) => {
  try {
    const promiseDb = db.promise();

    // 1. Service ouvert ?
    const [services] = await promiseDb.query("SELECT id FROM services WHERE status = 'open' LIMIT 1");
    if (services.length === 0) return res.json([]);
    const serviceId = services[0].id;

    // 2. Commandes
    const [orders] = await promiseDb.query(`
            SELECT 
                o.id, o.mode, o.status, o.total_amount, o.created_at, o.comment,
                c.first_name, c.last_name, c.phone,
                a.street, a.postal_code, a.city,
                d.driver_id, dr.first_name as driver_name
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN addresses a ON o.address_id = a.id
            LEFT JOIN deliveries d ON d.order_id = o.id
            LEFT JOIN drivers dr ON d.driver_id = dr.id
            WHERE o.service_id = ? OR o.service_id IS NULL
            ORDER BY o.created_at DESC
        `, [serviceId]);

    if (orders.length === 0) return res.json([]);

    // 3. Items (Pizzas)
    const orderIds = orders.map(o => o.id);
    const [allItems] = await promiseDb.query(
      `SELECT * FROM order_items WHERE order_id IN (?)`,
      [orderIds]
    );

    // 4. Assemblage
    const results = orders.map(order => {
      const items = allItems.filter(item => item.order_id === order.id);
      return {
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        mode: order.mode,
        comment: order.comment,
        created_at: order.created_at,
        customer: {
          first_name: order.first_name,
          last_name: order.last_name,
          phone: order.phone,
          address: order.street ? `${order.street}, ${order.postal_code} ${order.city}` : null
        },
        delivery: {
          driver: order.driver_id ? { id: order.driver_id, first_name: order.driver_name } : null
        },
        items: items
      };
    });

    res.json(results);
  } catch (error) {
    console.error("CRASH GET ORDERS:", error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/orders/:id/assign-driver
// Assigne un livreur ET passe la commande en 'en_livraison'
router.patch('/:id/assign-driver', async (req, res) => {
  try {
    const { driverId } = req.body;
    const orderId = req.params.id;
    const promiseDb = db.promise();

    console.log(`Assignation: Commande #${orderId} -> Driver #${driverId}`);

    // 1. Mise à jour de la table deliveries
    const [existing] = await promiseDb.query('SELECT id FROM deliveries WHERE order_id = ?', [orderId]);

    if (existing.length > 0) {
      await promiseDb.query(
        'UPDATE deliveries SET driver_id = ?, status = "assignée", assigned_at = NOW() WHERE id = ?',
        [driverId, existing[0].id]
      );
    } else {
      await promiseDb.query(
        'INSERT INTO deliveries (order_id, driver_id, status, assigned_at) VALUES (?, ?, "assignée", NOW())',
        [orderId, driverId]
      );
    }

    // 2. CRUCIAL : Mettre à jour le statut de la commande pour que le livreur la voie
    // NOUVEAU FLUX : On passe en 'assignee' (le livreur devra cliquer sur "Je pars")
    await promiseDb.query("UPDATE orders SET status = 'assignee' WHERE id = ?", [orderId]);

    // 3. Récupérer les infos du livreur pour le front
    const [driverInfos] = await promiseDb.query('SELECT id, first_name, last_name FROM drivers WHERE id = ?', [driverId]);

    res.json({
      success: true,
      status: 'assignee',
      driver: driverInfos[0]
    });

  } catch (error) {
    console.error('Erreur Assign Driver:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'assignation' });
  }
});

// PATCH /api/admin/orders/:id/status
// Changer manuellement le statut
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const promiseDb = db.promise();

    // 1. Mise à jour du statut
    await promiseDb.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

    // Note: Les tampons fidélité sont attribués à la création de commande (ordersRoutes.js)

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur Update Status:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;