const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Helper to use async/await with the existing connection
const promiseDb = db.promise();

// POST /api/orders
router.post('/', async (req, res) => {
    console.log("📥 POST /api/orders received");
    console.log("PAYLOAD:", JSON.stringify(req.body, null, 2));

    // On récupère items, customer, address, etc.
    // Note : on ignore le 'unitPrice' envoyé par le client pour le calcul final (sécurité)
    const { customer, address, mode, items, deliveryFee, rewardPizzaId, comment } = req.body;

    if (!customer || !items || items.length === 0) {
        console.log("❌ Missing data");
        return res.status(400).json({ error: 'Données manquantes (client ou articles)' });
    }

    try {
        console.log("1. Fetching service/settings...");
        // =================================================================
        // 0. CONFIG : Récupérer le service, les réglages fidélité et LIVRAISON
        // =================================================================
        let serviceId = null;
        let loyaltyEnabled = false;
        let costPerReward = 10;
        let deliverySettings = {
            fees: 0,
            freeThreshold: 1000,
            zones: [] // [{min_order: 15, zones: [{zip: '75001'}]}]
        };

        const [services] = await promiseDb.query("SELECT id FROM services WHERE status = 'open' LIMIT 1");
        if (services.length > 0) {
            serviceId = services[0].id;
        }

        const [settingsRows] = await promiseDb.query("SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('loyalty_program', 'delivery_zones', 'delivery_fees', 'free_delivery_threshold')");

        settingsRows.forEach(row => {
            try {
                if (row.setting_key === 'loyalty_program') {
                    const val = JSON.parse(row.setting_value);
                    loyaltyEnabled = val.enabled || false;
                    costPerReward = val.target_pizzas || 10;
                } else if (row.setting_key === 'delivery_zones') {
                    deliverySettings.zones = JSON.parse(row.setting_value) || [];
                } else if (row.setting_key === 'delivery_fees') {
                    deliverySettings.fees = Number(row.setting_value) || 0;
                } else if (row.setting_key === 'free_delivery_threshold') {
                    deliverySettings.freeThreshold = Number(row.setting_value) || 1000;
                }
            } catch (e) {
                console.error(`Error parsing setting ${row.setting_key}:`, e);
            }
        });

        console.log("2. Handling Customer...");
        // =================================================================
        // 1. CLIENT : Trouver ou Créer
        // =================================================================
        let customerId;

        const [existingCustomers] = await promiseDb.query(
            'SELECT id, loyalty_points FROM customers WHERE phone = ?',
            [customer.phone]
        );

        if (existingCustomers.length > 0) {
            // Client existant : Mise à jour des infos
            customerId = existingCustomers[0].id;
            console.log(`Customer exists: ${customerId}`);
            await promiseDb.query(
                'UPDATE customers SET email = ?, first_name = ?, last_name = ? WHERE id = ?',
                [
                    customer.email,
                    customer.first_name || customer.firstName,
                    customer.last_name || customer.lastName,
                    customerId
                ]
            );
        } else {
            // Nouveau client
            console.log("Creating new customer...");
            const [result] = await promiseDb.query(
                'INSERT INTO customers (email, phone, first_name, last_name, loyalty_points) VALUES (?, ?, ?, ?, 0)',
                [
                    customer.email,
                    customer.phone,
                    customer.first_name || customer.firstName,
                    customer.last_name || customer.lastName
                ]
            );
            customerId = result.insertId;
        }

        console.log(`3. Handling Address (Mode: ${mode})...`);
        // =================================================================
        // 2. ADRESSE : Gestion intelligente (Anti-Doublons)
        // =================================================================
        let addressId = null;
        if (mode === 'livraison') {
            if (!address) {
                return res.status(400).json({ error: 'Adresse requise pour la livraison' });
            }

            const street = address.street;
            const postalCode = address.postal_code || address.postalCode;
            const city = address.city;
            const additionalInfo = address.additional_info || address.additionalInfo;
            const label = address.label || 'Domicile';

            // Vérifier si l'adresse existe déjà à l'identique pour ce client
            const [existingAddresses] = await promiseDb.query(
                `SELECT id FROM addresses 
                 WHERE customer_id = ? 
                 AND street = ? 
                 AND postal_code = ? 
                 AND city = ?
                 LIMIT 1`,
                [customerId, street, postalCode, city]
            );

            if (existingAddresses.length > 0) {
                // Réutilisation
                addressId = existingAddresses[0].id;
                console.log(`Address reused: ${addressId}`);

                // Mise à jour optionnelle des infos complémentaires
                if (label || additionalInfo) {
                    await promiseDb.query(
                        'UPDATE addresses SET label = COALESCE(?, label), additional_info = COALESCE(?, additional_info) WHERE id = ?',
                        [label, additionalInfo, addressId]
                    );
                }
            } else {
                // Création
                const [addrResult] = await promiseDb.query(
                    'INSERT INTO addresses (customer_id, label, street, postal_code, city, additional_info) VALUES (?, ?, ?, ?, ?, ?)',
                    [customerId, label, street, postalCode, city, additionalInfo]
                );
                addressId = addrResult.insertId;

                console.log(`Address created: ${addressId}`);
            }

            // =================================================================
            // 2b. VALIDATION LIVRAISON (Code Postal & Min Command)
            // =================================================================
            // On le fait ICI car on a besoin du code postal
            // Note: On utilisera 'subtotal' plus tard pour valider le montant, 
            // mais on doit valider le code postal MAINTENANT.

            let validZone = false;
            let requiredMinOrder = 0;

            const postalCodeToCheck = String(postalCode).trim();
            const cityToCheck = String(city).trim().toLowerCase();

            // Check tiers
            for (const tier of deliverySettings.zones) {
                // tier = { min_order: 15, zones: [{zip: '75001', city: 'Paris'}] }
                const match = tier.zones.find(z => z.zip === postalCodeToCheck);
                if (match) {
                    validZone = true;
                    requiredMinOrder = Number(tier.min_order);
                    break;
                }
            }

            if (!validZone) {
                return res.status(400).json({ error: `Nous ne livrons pas au code postal ${postalCodeToCheck}.` });
            }

            // On stocke le min order requis pour le vérifier APRÈS le calcul du total
            req.requiredMinOrder = requiredMinOrder;
        }

        console.log("4. Fetching Products...");
        // =================================================================
        // 3. SECURITÉ PRIX & PRÉPARATION ITEMS
        // =================================================================

        // A. Récupérer les VRAIS prix en BDD
        const productIds = items.map(i => i.productId);
        let dbProducts = [];

        if (productIds.length > 0) {
            const [prods] = await promiseDb.query(
                'SELECT id, price, name, category, is_loyalty_eligible FROM products WHERE id IN (?)',
                [productIds]
            );
            dbProducts = prods;
        }

        console.log("5. Calculating Totals...");
        // B. Reconstruire la liste des items avec les prix certifiés
        let subtotal = 0;
        let totalRewardCostInPoints = 0;

        const secureItems = items.map(clientItem => {
            const dbProduct = dbProducts.find(p => p.id == clientItem.productId);

            if (!dbProduct) {
                throw new Error(`Produit ID ${clientItem.productId} introuvable ou retiré de la vente.`);
            }

            let finalPrice = Number(dbProduct.price);
            let finalName = dbProduct.name;

            // Gestion des Offres (Gratuité)
            if (clientItem.isReward) {
                // Vérifier si le produit est éligible aux récompenses
                if (!dbProduct.is_loyalty_eligible) {
                    throw new Error(`La pizza "${dbProduct.name}" n'est pas éligible en récompense.`);
                }

                // C'est une récompense valide -> Prix 0€
                finalPrice = 0;
                finalName += " (Offre Fidélité 🎁)";

                // On comptabilise le coût en points
                if (loyaltyEnabled) {
                    totalRewardCostInPoints += (clientItem.quantity * costPerReward);
                }
            } else if (clientItem.isFree) {
                // Offre du moment (ex: 3 achetées = 1 offerte)
                // Ici, on fait confiance à la logique frontend MAIS on pourrait durcir
                // Pour l'instant, on accepte la gratuité marquée "isFree" si ce n'est pas une reward
                finalPrice = 0;
                finalName += " (Offre du moment)";
            }

            // Calcul du sous-total ligne à ligne
            subtotal += finalPrice * clientItem.quantity;

            return {
                ...clientItem, // On garde notes, quantity...
                name: finalName,
                category: dbProduct.category,
                unitPrice: finalPrice // On FORCE le prix BDD
            };
        });

        console.log("6. Verifying Loyalty Points...");
        // =================================================================
        // 4. VÉRIFICATION SOLDE FIDÉLITÉ (Backend)
        // =================================================================
        if (totalRewardCostInPoints > 0) {
            const [customerCheck] = await promiseDb.query('SELECT loyalty_points FROM customers WHERE id = ?', [customerId]);
            const currentPoints = customerCheck[0] ? customerCheck[0].loyalty_points : 0;

            if (currentPoints < totalRewardCostInPoints) {
                return res.status(400).json({
                    error: `Solde insuffisant : ${currentPoints} points disponibles, ${totalRewardCostInPoints} requis.`
                });
            }
        }

        console.log("7. Creating Order...");
        // =================================================================
        // 5. CRÉATION DE LA COMMANDE
        // =================================================================

        // Validation Montant Min pour Livraison
        if (mode === 'livraison' && req.requiredMinOrder) {
            if (subtotal < req.requiredMinOrder) {
                return res.status(400).json({
                    error: `Le minimum de commande pour votre zone est de ${req.requiredMinOrder.toFixed(2)}€ (Total actuel: ${subtotal.toFixed(2)}€)`
                });
            }
        }

        let totalAmount = subtotal;
        let finalDeliveryFee = 0;

        // Frais de livraison (Calcul Serveur)
        if (mode === 'livraison') {
            finalDeliveryFee = Number(deliverySettings.fees);
            // Si Total > Seuil gratuité, frais offerts
            if (subtotal >= deliverySettings.freeThreshold) {
                finalDeliveryFee = 0;
            }
            totalAmount += finalDeliveryFee;
        }

        totalAmount = Math.max(0, totalAmount);

        // Insertion Commande
        const [orderResult] = await promiseDb.query(
            'INSERT INTO orders (customer_id, address_id, mode, status, total_amount, delivery_fee, service_id, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            [customerId, addressId, mode, 'en_attente', totalAmount, finalDeliveryFee, serviceId, comment || null]
        );
        const orderId = orderResult.insertId;

        console.log("8. Creating Items...");
        // Insertion Articles (Items)
        const itemValues = secureItems.map(item => [
            orderId,
            item.name,
            item.unitPrice,
            item.quantity,
            item.category || 'unknown',
            item.notes || null
        ]);

        await promiseDb.query(
            'INSERT INTO order_items (order_id, product_name, unit_price, quantity, category, notes) VALUES ?',
            [itemValues]
        );

        console.log("9. Updating Loyalty...");
        // =================================================================
        // 6. MISE À JOUR FIDÉLITÉ (Gain et Dépense)
        // =================================================================
        if (loyaltyEnabled) {
            // A. Dépense des points (Déjà validé avant insert, on applique maintenant)
            if (totalRewardCostInPoints > 0) {
                await promiseDb.query(
                    'UPDATE customers SET loyalty_points = loyalty_points - ? WHERE id = ?',
                    [totalRewardCostInPoints, customerId]
                );
            }

            // B. Gain de points (Sur pizzas payantes uniquement)
            const stampsEarned = secureItems
                .filter(item => {
                    // Pas de points sur les cadeaux (prix 0)
                    if (item.unitPrice <= 0) return false;

                    const cat = (item.category || '').toLowerCase();
                    const pizzaCategories = ['pizza', 'classique', 'signature', 'gourmande', 'base crème', 'base tomate'];
                    return pizzaCategories.some(pc => cat.includes(pc));
                })
                .reduce((sum, item) => sum + item.quantity, 0);

            if (stampsEarned > 0) {
                await promiseDb.query(
                    'UPDATE customers SET loyalty_points = loyalty_points + ? WHERE id = ?',
                    [stampsEarned, customerId]
                );
            }

            // On renvoie l'info pour le frontend
            res.status(201).json({
                orderId: orderId,
                status: 'en_attente',
                message: 'Commande créée avec succès',
                serviceId: serviceId,
                stampsEarned: stampsEarned,
                pointsDeducted: totalRewardCostInPoints
            });
        } else {
            res.status(201).json({
                orderId: orderId,
                status: 'en_attente',
                message: 'Commande créée avec succès'
            });
        }

        console.log(`✅ Commande #${orderId} créée avec succès`);

    } catch (error) {
        console.error('❌ CRASH ORDER:', error);
        // Gestion d'erreur spécifique si le produit n'existe plus
        if (error.message && error.message.includes('Produit ID')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erreur serveur lors de la commande', details: error.message });
    }
});

// GET /api/customers/:customerId/orders
router.get('/customers/:customerId/orders', async (req, res) => {
    const customerId = req.params.customerId;
    try {
        const [orders] = await promiseDb.query(
            `SELECT o.id, o.mode, o.status, o.total_amount, o.delivery_fee, o.created_at, COUNT(oi.id) as item_count 
             FROM orders o 
             LEFT JOIN order_items oi ON o.id = oi.order_id 
             WHERE o.customer_id = ? 
             GROUP BY o.id 
             ORDER BY o.created_at DESC`,
            [customerId]
        );
        res.json(orders);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des commandes :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /:id (Public tracking - Accès rapide par ID)
// Note de sécurité : Idéalement, utiliser un UUID unique pour éviter de deviner les numéros de commande.
router.get('/:id', async (req, res) => {
    const orderId = req.params.id;
    try {
        const [rows] = await promiseDb.query(
            `SELECT 
                o.id, o.mode, o.status, o.created_at,
                d.status AS delivery_status, d.departed_at, d.delivered_at
             FROM orders o
             LEFT JOIN deliveries d ON o.id = d.order_id
             WHERE o.id = ?`,
            [orderId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Commande non trouvée' });
        }

        const row = rows[0];
        let elapsed_delivery_minutes = null;
        if (row.delivery_status === 'en_livraison' && row.departed_at) {
            const diff = new Date() - new Date(row.departed_at);
            elapsed_delivery_minutes = Math.floor(diff / 60000);
        }

        res.json({
            id: row.id,
            mode: row.mode,
            status: row.status,
            created_at: row.created_at,
            delivery: row.delivery_status ? {
                status: row.delivery_status,
                elapsed_delivery_minutes
            } : null
        });
    } catch (error) {
        console.error('❌ Erreur tracking :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /:id/tracking (Tracking détaillé)
router.get('/:id/tracking', async (req, res) => {
    const orderId = req.params.id;
    try {
        const query = `
      SELECT 
        o.id, o.mode, o.status, o.total_amount, o.delivery_fee, o.comment, o.created_at,
        c.id as customer_id, c.first_name, c.last_name, c.phone, c.email,
        a.id as address_id, a.street, a.postal_code, a.city, a.additional_info,
        d.id as delivery_id, d.status as delivery_status, d.departed_at as delivery_started_at, d.delivered_at as delivery_delivered_at,
        dr.id as driver_id, dr.first_name as driver_first_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      LEFT JOIN addresses a ON o.address_id = a.id
      LEFT JOIN deliveries d ON d.order_id = o.id
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      WHERE o.id = ?
    `;

        const [rows] = await promiseDb.query(query, [orderId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Commande introuvable' });
        }

        const row = rows[0];
        const response = {
            id: row.id,
            mode: row.mode,
            status: row.status,
            total_amount: row.total_amount,
            delivery_fee: row.delivery_fee || 0,
            comment: row.comment || null,
            created_at: row.created_at,
            customer: {
                id: row.customer_id,
                first_name: row.first_name,
                last_name: row.last_name,
                phone: row.phone,
                email: row.email
            },
            address: row.address_id ? {
                id: row.address_id,
                street: row.street,
                postal_code: row.postal_code,
                city: row.city,
                additional_info: row.additional_info
            } : null,
            delivery: row.delivery_id ? {
                id: row.delivery_id,
                status: row.delivery_status,
                started_at: row.delivery_started_at,
                delivered_at: row.delivery_delivered_at,
                driver: row.driver_id ? {
                    first_name: row.driver_first_name // On évite d'envoyer le tel du livreur en public
                } : null
            } : null
        };

        const [items] = await promiseDb.query(
            'SELECT id, product_name as name, quantity, unit_price, notes FROM order_items WHERE order_id = ?',
            [orderId]
        );
        response.items = items;

        res.json(response);

    } catch (error) {
        console.error('❌ Erreur tracking détaillé :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;