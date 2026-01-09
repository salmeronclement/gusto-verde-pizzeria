const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyAdminToken = require('../middleware/adminMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =====================
// MULTER CONFIGURATION
// =====================

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'hero');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'hero-' + uniqueSuffix + ext);
    }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées (jpg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// =====================
// PUBLIC ROUTES
// =====================

// GET all hero slides (public - for frontend display)
router.get('/hero-slides', async (req, res) => {
    try {
        const [slides] = await db.promise().query(
            'SELECT id, image_url, title, subtitle, display_order FROM content_hero_slides ORDER BY display_order ASC, id ASC'
        );
        res.json(slides);
    } catch (error) {
        console.error('Error fetching hero slides:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =====================
// ADMIN ROUTES (protected)
// =====================

// GET all hero slides for admin
router.get('/admin/hero-slides', verifyAdminToken, async (req, res) => {
    try {
        const [slides] = await db.promise().query(
            'SELECT * FROM content_hero_slides ORDER BY display_order ASC, id ASC'
        );
        res.json(slides);
    } catch (error) {
        console.error('Error fetching hero slides:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST - Add new slide (supports both URL and file upload)
router.post('/admin/hero-slides', verifyAdminToken, upload.single('image'), async (req, res) => {
    try {
        let image_url = req.body.image_url;

        // If file was uploaded, construct URL from uploaded file
        if (req.file) {
            image_url = `${req.protocol}://${req.get('host')}/uploads/hero/${req.file.filename}`;
        }

        if (!image_url) {
            return res.status(400).json({ error: 'Image requise (fichier ou URL)' });
        }

        const { title, subtitle, display_order } = req.body;

        const [result] = await db.promise().query(
            'INSERT INTO content_hero_slides (image_url, title, subtitle, display_order) VALUES (?, ?, ?, ?)',
            [image_url, title || '', subtitle || '', display_order || 0]
        );

        const [newSlide] = await db.promise().query(
            'SELECT * FROM content_hero_slides WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newSlide[0]);
    } catch (error) {
        console.error('Error creating hero slide:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT - Update slide
router.put('/admin/hero-slides/:id', verifyAdminToken, upload.single('image'), async (req, res) => {
    const { id } = req.params;

    try {
        let image_url = req.body.image_url;

        // If new file was uploaded, construct URL from uploaded file
        if (req.file) {
            image_url = `${req.protocol}://${req.get('host')}/uploads/hero/${req.file.filename}`;
        }

        const { title, subtitle, display_order } = req.body;

        await db.promise().query(
            'UPDATE content_hero_slides SET image_url = ?, title = ?, subtitle = ?, display_order = ? WHERE id = ?',
            [image_url, title || '', subtitle || '', display_order || 0, id]
        );

        const [updatedSlide] = await db.promise().query(
            'SELECT * FROM content_hero_slides WHERE id = ?',
            [id]
        );

        if (updatedSlide.length === 0) {
            return res.status(404).json({ error: 'Slide non trouvé' });
        }

        res.json(updatedSlide[0]);
    } catch (error) {
        console.error('Error updating hero slide:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE - Remove slide
router.delete('/admin/hero-slides/:id', verifyAdminToken, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.promise().query(
            'DELETE FROM content_hero_slides WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Slide non trouvé' });
        }

        res.json({ message: 'Slide supprimé avec succès' });
    } catch (error) {
        console.error('Error deleting hero slide:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
