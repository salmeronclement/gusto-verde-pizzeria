const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyAdminToken = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp)'));
    }
});

// GET /api/admin/products - List all products
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const [products] = await db.promise().query('SELECT * FROM products ORDER BY category, name');
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/admin/products - Create product
router.post('/', verifyAdminToken, upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, is_loyalty_eligible, is_promo_eligible } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Nom, prix et catégorie sont requis' });
        }

        const [result] = await db.promise().query(
            'INSERT INTO products (name, description, price, category, image_url, is_loyalty_eligible, is_promo_eligible, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, category, imageUrl, is_loyalty_eligible || 0, is_promo_eligible !== undefined ? is_promo_eligible : 1, 0]
        );

        res.status(201).json({
            id: result.insertId,
            name, description, price, category, image_url: imageUrl,
            message: 'Produit créé avec succès'
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/admin/products/:id - Update product
router.put('/:id', verifyAdminToken, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, is_loyalty_eligible, is_promo_eligible } = req.body;
        let imageUrl = req.body.image_url; // Keep existing if not changed

        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        }

        let isFeaturedValue = req.body.is_featured;

        // Ensure only one product is featured if setting to true (optional but good UX)
        if (isFeaturedValue === true || isFeaturedValue === 'true' || isFeaturedValue === 1) {
            await db.promise().query('UPDATE products SET is_featured = 0');
            isFeaturedValue = 1;
        } else {
            isFeaturedValue = 0;
        }

        await db.promise().query(
            'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_loyalty_eligible = ?, is_promo_eligible = ?, is_featured = ? WHERE id = ?',
            [name, description, price, category, imageUrl, is_loyalty_eligible || 0, is_promo_eligible !== undefined ? is_promo_eligible : 1, isFeaturedValue, id]
        );

        res.json({
            id, name, description, price, category, image_url: imageUrl,
            message: 'Produit mis à jour avec succès'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PATCH /api/admin/products/bulk - Bulk update products
router.patch('/bulk', verifyAdminToken, async (req, res) => {
    try {
        const { productIds, updates } = req.body;
        console.log('Bulk Update Request:', { productIds, updates });

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ error: 'Aucun produit sélectionné' });
        }

        // Validate allowed updates
        const allowedFields = ['is_loyalty_eligible', 'is_promo_eligible'];
        const keys = Object.keys(updates);
        const isValid = keys.every(key => allowedFields.includes(key));

        if (!isValid) {
            return res.status(400).json({ error: 'Champs de mise à jour non autorisés' });
        }

        const promiseDb = db.promise();

        // Construct SET clause
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(key => updates[key]), productIds];

        console.log('Executing Query:', `UPDATE products SET ${setClause} WHERE id IN (?)`, values);

        await promiseDb.query(
            `UPDATE products SET ${setClause} WHERE id IN (?)`,
            values
        );

        res.json({ message: 'Produits mis à jour avec succès' });

    } catch (error) {
        console.error('Error bulk updating products:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.promise().query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
