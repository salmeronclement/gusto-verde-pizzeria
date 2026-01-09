const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/products - List all products
router.get('/', async (req, res) => {
    console.log('GET /api/products called');
    try {
        const [products] = await db.promise().query('SELECT * FROM products ORDER BY category, name');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
