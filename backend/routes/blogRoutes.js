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

const uploadsDir = path.join(__dirname, '..', 'uploads', 'blog');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'blog-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// =====================
// PUBLIC ROUTES
// =====================

// GET /api/blog - Public list (for client)
router.get('/', async (req, res) => {
    try {
        const [posts] = await db.promise().query(
            'SELECT id, title, content, image_url, created_at FROM blog_posts ORDER BY created_at DESC'
        );
        res.json(posts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =====================
// ADMIN ROUTES (protected) - Must be BEFORE /:id to avoid conflict
// =====================

// GET /api/blog/admin - Admin list
router.get('/admin', verifyAdminToken, async (req, res) => {
    try {
        const [posts] = await db.promise().query('SELECT * FROM blog_posts ORDER BY created_at DESC');
        res.json(posts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =====================
// PUBLIC DETAIL ROUTE - After /admin to avoid conflict
// =====================

// GET /api/blog/:id - Single article (for detail page)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [posts] = await db.promise().query(
            'SELECT id, title, content, image_url, created_at FROM blog_posts WHERE id = ?',
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }

        res.json(posts[0]);
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// =====================
// ADMIN WRITE ROUTES (protected)
// =====================

// POST /api/blog/admin - Create post with image upload
router.post('/admin', verifyAdminToken, upload.single('image'), async (req, res) => {
    try {
        const { title, content } = req.body;
        let image_url = req.body.image_url || '';

        if (!title || !content) {
            return res.status(400).json({ error: 'Titre et contenu requis' });
        }

        // If file was uploaded, construct URL
        if (req.file) {
            image_url = `${req.protocol}://${req.get('host')}/uploads/blog/${req.file.filename}`;
        }

        const [result] = await db.promise().query(
            'INSERT INTO blog_posts (title, content, image_url) VALUES (?, ?, ?)',
            [title, content, image_url]
        );

        const [newPost] = await db.promise().query(
            'SELECT * FROM blog_posts WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newPost[0]);
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/blog/admin/:id - Update post
router.put('/admin/:id', verifyAdminToken, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // Get current post to preserve image if no new one uploaded
        const [currentPost] = await db.promise().query(
            'SELECT image_url FROM blog_posts WHERE id = ?',
            [id]
        );

        if (currentPost.length === 0) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }

        // Use new file if uploaded, otherwise keep existing
        let image_url = currentPost[0].image_url;
        if (req.file) {
            image_url = `${req.protocol}://${req.get('host')}/uploads/blog/${req.file.filename}`;
        }

        await db.promise().query(
            'UPDATE blog_posts SET title = ?, content = ?, image_url = ? WHERE id = ?',
            [title, content, image_url, id]
        );

        const [updatedPost] = await db.promise().query(
            'SELECT * FROM blog_posts WHERE id = ?',
            [id]
        );

        res.json(updatedPost[0]);
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/blog/admin/:id - Delete post
router.delete('/admin/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.promise().query('DELETE FROM blog_posts WHERE id = ?', [id]);
        res.json({ message: 'Article supprimé avec succès' });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
