const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyAdminToken = require('../middleware/adminMiddleware');

// GET /status
router.get('/status', async (req, res) => {
  try {
    const promiseDb = db.promise();

    const [rows] = await promiseDb.query(
      "SELECT * FROM services WHERE status = 'open' LIMIT 1"
    );

    const currentService = rows.length > 0 ? rows[0] : null;
    const isOpen = !!currentService;

    const [settingsRows] = await promiseDb.query("SELECT * FROM site_settings");
    const settings = {};
    settingsRows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    if (isOpen) {
      const [stats] = await promiseDb.query(`
            SELECT 
                COUNT(*) as order_count,
                COALESCE(SUM(total_amount), 0) as total_revenue
            FROM orders 
            WHERE service_id = ? AND status != 'annulee'
        `, [currentService.id]);

      currentService.current_revenue = parseFloat(stats[0].total_revenue);
      currentService.current_orders = stats[0].order_count;
    }

    res.json({
      isOpen: isOpen,
      service: currentService,
      settings: {
        delivery: parseInt(settings.wait_time_delivery || '45'),
        takeout: parseInt(settings.wait_time_takeout || '20')
      }
    });

  } catch (error) {
    console.error('Erreur GET /status:', error);
    res.status(500).json({
      isOpen: false,
      service: null,
      error: error.message
    });
  }
});

// POST /open
router.post('/open', verifyAdminToken, async (req, res) => {
  try {
    const promiseDb = db.promise();

    const [existing] = await promiseDb.query("SELECT id FROM services WHERE status = 'open'");
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Un service est déjà ouvert.' });
    }

    const [result] = await promiseDb.query(
      "INSERT INTO services (start_time, status) VALUES (NOW(), 'open')"
    );
    const newServiceId = result.insertId;

    await promiseDb.query(
      "UPDATE orders SET service_id = ? WHERE service_id IS NULL AND DATE(created_at) = CURDATE()",
      [newServiceId]
    );

    await promiseDb.query(
      "INSERT INTO site_settings (setting_key, setting_value) VALUES ('shop_open', 'true') ON DUPLICATE KEY UPDATE setting_value = 'true'"
    );

    res.json({ success: true, message: 'Service ouvert', serviceId: newServiceId });

  } catch (error) {
    console.error('Erreur POST /open:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'ouverture' });
  }
});

// POST /close
router.post('/close', verifyAdminToken, async (req, res) => {
  try {
    const promiseDb = db.promise();

    // 1. Trouver le service ouvert
    const [services] = await promiseDb.query("SELECT * FROM services WHERE status = 'open' LIMIT 1");
    if (services.length === 0) {
      return res.status(400).json({ error: 'Aucun service ouvert à fermer.' });
    }
    const currentService = services[0];
    const currentServiceId = currentService.id;

    // 2. NETTOYAGE STRICT : Passer toutes les commandes non terminées en 'non_livree'
    // Cela inclut : en_attente, en_preparation, prete, assignee, en_livraison
    await promiseDb.query(
      "UPDATE orders SET status = 'non_livree' WHERE service_id = ? AND status IN ('en_attente', 'en_preparation', 'prete', 'assignee', 'en_livraison')",
      [currentServiceId]
    );

    // 3. Calculer les stats (CA, nb commandes) - On exclut 'annulee' ET 'non_livree'
    const [basicStats] = await promiseDb.query(`
      SELECT 
        COUNT(*) as count, 
        COALESCE(SUM(total_amount), 0) as revenue 
      FROM orders 
      WHERE service_id = ? AND status NOT IN ('annulee', 'non_livree')
    `, [currentServiceId]);

    const count = parseInt(basicStats[0].count, 10) || 0;
    const revenue = parseFloat(basicStats[0].revenue) || 0;
    const avgTicket = count > 0 ? (revenue / count) : 0;

    // 4. Top Item (Calcul réel)
    let topItem = "Aucun";
    const [topItemRows] = await promiseDb.query(`
      SELECT oi.product_name, SUM(oi.quantity) as total_qty
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.service_id = ? AND o.status != 'annulee'
      GROUP BY oi.product_name
      ORDER BY total_qty DESC
      LIMIT 1
    `, [currentServiceId]);

    if (topItemRows.length > 0) {
      topItem = `${topItemRows[0].product_name} (${topItemRows[0].total_qty})`;
    }

    // 5. Fermer le service en base
    await promiseDb.query(`
      UPDATE services 
      SET end_time = NOW(), status = 'closed', total_revenue = ?, order_count = ?, average_ticket = ?, top_item = ?
      WHERE id = ?
    `, [revenue, count, avgTicket, topItem, currentServiceId]);

    // 6. Mettre à jour les settings (Fermer le site)
    await promiseDb.query(
      "UPDATE site_settings SET setting_value = 'false' WHERE setting_key = 'shop_open'"
    );

    // 7. Renvoi des stats avec les clés EXACTES attendues par le Frontend
    res.json({
      success: true,
      message: 'Service fermé',
      stats: {
        totalRevenue: revenue,
        orderCount: count,
        averageTicket: avgTicket,
        topItem: topItem
      }
    });

  } catch (error) {
    console.error('Erreur POST /close:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /history
router.get('/history', verifyAdminToken, async (req, res) => {
  try {
    const promiseDb = db.promise();
    const [services] = await promiseDb.query('SELECT * FROM services WHERE status = "closed" ORDER BY start_time DESC LIMIT 50');
    res.json(services);
  } catch (error) {
    console.error('Erreur historique:', error);
    res.status(500).json({ error: 'Erreur historique' });
  }
});

// GET /history/:id (Détails d'un service spécifique)
router.get('/history/:id', verifyAdminToken, async (req, res) => {
  try {
    const promiseDb = db.promise();
    const serviceId = req.params.id;

    // 1. Infos Service
    const [services] = await promiseDb.query("SELECT * FROM services WHERE id = ?", [serviceId]);
    if (services.length === 0) return res.status(404).json({ error: "Service non trouvé" });
    const service = services[0];

    // 2. Commandes du service
    const [orders] = await promiseDb.query(`
      SELECT 
        o.id, o.created_at, o.total_amount, o.status, o.mode,
        c.first_name, c.last_name, c.phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.service_id = ?
      ORDER BY o.created_at DESC
    `, [serviceId]);

    // 3. Stats Produits (Top Ventes)
    const [topItems] = await promiseDb.query(`
      SELECT 
        oi.product_name as name, 
        SUM(oi.quantity) as quantity, 
        SUM(oi.unit_price * oi.quantity) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.service_id = ? AND o.status != 'annulee'
      GROUP BY oi.product_name
      ORDER BY quantity DESC
    `, [serviceId]);

    // 4. Assemblage
    res.json({
      service: service,
      stats: {
        revenue: service.total_revenue,
        orderCount: service.order_count,
        averageTicket: service.average_ticket,
        topItems: topItems
      },
      orders: orders
    });

  } catch (error) {
    console.error('Erreur GET /history/:id:', error);
    res.status(500).json({ error: 'Erreur récupération détails service' });
  }
});

module.exports = router;