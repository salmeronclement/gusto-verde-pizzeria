const express = require('express');
const router = express.Router();
const db = require('../config/db');
const driverMiddleware = require('../middleware/driverMiddleware');

// GET /history
router.get('/history', driverMiddleware, async (req, res) => {
    try {
        const driverId = req.user ? (req.user.id || req.user.userId) : null;
        if (!driverId) return res.status(400).json({ error: "ID manquant" });

        const promiseDb = db.promise();

        const [rows] = await promiseDb.query(`
            SELECT 
                s.id as service_id, s.start_time,
                o.total_amount, 
                c.first_name, c.last_name, 
                a.street, a.postal_code, a.city,
                d.delivered_at
            FROM deliveries d
            JOIN orders o ON d.order_id = o.id
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN addresses a ON o.address_id = a.id
            JOIN services s ON o.service_id = s.id
            WHERE d.driver_id = ? 
            AND (d.status = 'terminee' OR d.status = 'livree' OR o.status = 'livree')
            ORDER BY s.start_time DESC, d.delivered_at DESC
        `, [driverId]);

        res.json(rows);
    } catch (error) {
        console.error('Erreur historique driver:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /my-orders
router.get('/my-orders', driverMiddleware, async (req, res) => {
    try {
        console.log("---- APPEL ROUTE LIVREUR (GET /my-orders) ----");
        console.log("User du token:", req.user);

        // 1. Sécuriser l'ID
        const driverId = req.user ? (req.user.id || req.user.userId) : null;

        if (!driverId) {
            console.error("Pas d'ID trouvé dans le token");
            return res.status(400).json({ error: "Impossible d'identifier le livreur" });
        }

        console.log("Recherche commandes pour Driver ID:", driverId);

        const promiseDb = db.promise();

        // 2. Requête SQL (On cherche dans la table deliveries)
        // On récupère les commandes assignées à ce livreur
        // Note: On joint addresses car l'adresse n'est pas dans customers
        const [rows] = await promiseDb.query(`
            SELECT 
                o.id, o.status, o.total_amount, o.created_at, o.comment,
                c.first_name, c.last_name, c.phone,
                a.street, a.postal_code, a.city, a.additional_info,
                d.id as delivery_id, d.status as delivery_status, d.assigned_at
            FROM deliveries d
            JOIN orders o ON d.order_id = o.id
            JOIN customers c ON o.customer_id = c.id
            LEFT JOIN addresses a ON o.address_id = a.id
            JOIN services s ON o.service_id = s.id
            WHERE d.driver_id = ? 
            AND s.status = 'open'
            AND (o.status = 'assignee' OR o.status = 'en_livraison' OR d.status = 'assignée')
            ORDER BY o.created_at DESC
        `, [driverId]);

        console.log(`Trouvé ${rows.length} commandes.`);

        // Formatage pour le frontend
        const formattedOrders = await Promise.all(rows.map(async (order) => {
            // Récupération des items avec notes pour chaque commande
            const [items] = await promiseDb.query(
                'SELECT product_name, quantity, unit_price, notes FROM order_items WHERE order_id = ?',
                [order.id]
            );

            return {
                id: order.id,
                total_amount: order.total_amount,
                status: order.status,
                comment: order.comment || null,
                created_at: order.created_at,
                customer: {
                    name: `${order.first_name} ${order.last_name}`,
                    phone: order.phone,
                    address: order.street ? `${order.street}, ${order.postal_code} ${order.city}` : 'Adresse inconnue',
                    additional_info: order.additional_info
                },
                items: items,
                delivery_id: order.delivery_id,
                delivery_status: order.delivery_status
            };
        }));

        res.json(formattedOrders);

    } catch (error) {
        console.error('CRASH CRITIQUE DRIVER:', error);
        res.status(500).json({ error: error.message, sql: error.sqlMessage });
    }
});

// Route pour démarrer la livraison (Je pars)
router.patch('/:id/start', driverMiddleware, async (req, res) => {
    try {
        console.log("---- APPEL ROUTE LIVREUR (PATCH /start) ----");
        const orderId = req.params.id;
        const driverId = req.user ? (req.user.id || req.user.userId) : null;

        console.log(`Départ livraison Order ${orderId} par Driver ${driverId}`);

        // Vérification
        const [deliveries] = await db.promise().query(
            'SELECT id FROM deliveries WHERE order_id = ? AND driver_id = ?',
            [orderId, driverId]
        );

        if (deliveries.length === 0) {
            return res.status(403).json({ error: 'Cette livraison ne vous est pas assignée.' });
        }

        // Mise à jour : Status commande -> 'en_livraison', Delivery -> departed_at
        await db.promise().query("UPDATE orders SET status = 'en_livraison' WHERE id = ?", [orderId]);
        await db.promise().query("UPDATE deliveries SET departed_at = NOW() WHERE order_id = ?", [orderId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur start livraison:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour valider la livraison
router.patch('/:id/complete', driverMiddleware, async (req, res) => {
    try {
        console.log("---- APPEL ROUTE LIVREUR (PATCH /complete) ----");
        const orderId = req.params.id;
        const driverId = req.user ? (req.user.id || req.user.userId) : null;

        console.log(`Validation livraison Order ${orderId} par Driver ${driverId}`);

        // On passe la commande en 'livree' et la livraison en 'livree' (ou 'terminee')
        // Vérifions d'abord si la livraison appartient bien au driver (sécurité)
        const [deliveries] = await db.promise().query(
            'SELECT id FROM deliveries WHERE order_id = ? AND driver_id = ?',
            [orderId, driverId]
        );

        if (deliveries.length === 0) {
            return res.status(403).json({ error: 'Cette livraison ne vous est pas assignée.' });
        }

        // Note: Les tampons fidélité sont désormais attribués à la création de commande (ordersRoutes.js)

        await db.promise().query("UPDATE orders SET status = 'livree' WHERE id = ?", [orderId]);
        await db.promise().query("UPDATE deliveries SET status = 'livree', delivered_at = NOW() WHERE order_id = ?", [orderId]);

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur validation livraison:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /login (Connexion simple par téléphone) - On garde cette route car elle est nécessaire
router.post('/login', async (req, res) => {
    const { phone } = req.body;
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

    if (!phone) {
        return res.status(400).json({ error: 'Numéro de téléphone requis.' });
    }

    try {
        const cleanPhone = phone.replace(/\D/g, '');
        const [drivers] = await db.promise().query(
            'SELECT * FROM drivers WHERE phone = ? AND is_active = 1',
            [cleanPhone]
        );

        if (drivers.length === 0) {
            return res.status(401).json({ error: 'Livreur non trouvé ou inactif.' });
        }

        const driver = drivers[0];
        const token = jwt.sign(
            { id: driver.id, role: 'driver', name: `${driver.first_name} ${driver.last_name}` },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            driver: {
                id: driver.id,
                first_name: driver.first_name,
                last_name: driver.last_name,
                phone: driver.phone
            }
        });

    } catch (error) {
        console.error('Erreur login driver:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /me (Infos du livreur connecté)
router.get('/me', driverMiddleware, async (req, res) => {
    try {
        const driverId = req.user ? (req.user.id || req.user.userId) : null;
        if (!driverId) return res.status(400).json({ error: "ID manquant" });

        const [drivers] = await db.promise().query(
            'SELECT id, first_name, last_name, phone, current_status FROM drivers WHERE id = ?',
            [driverId]
        );

        if (drivers.length === 0) return res.status(404).json({ error: "Livreur introuvable" });

        res.json(drivers[0]);
    } catch (error) {
        console.error('Erreur GET /me:', error);
        res.status(500).json({ error: error.message });
    }
});

// PATCH /status (Changer le statut)
router.patch('/status', driverMiddleware, async (req, res) => {
    try {
        const driverId = req.user ? (req.user.id || req.user.userId) : null;
        const { status } = req.body;

        if (!['active', 'pause', 'inactive'].includes(status)) {
            return res.status(400).json({ error: "Statut invalide" });
        }

        await db.promise().query(
            'UPDATE drivers SET current_status = ? WHERE id = ?',
            [status, driverId]
        );

        res.json({ success: true, status });
    } catch (error) {
        console.error('Erreur PATCH /status:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
