const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifyAdminToken = require('../middleware/adminMiddleware');

// GET /api/admin/blog - List all posts
router.get('/', verifyAdminToken, async (req, res) => {
    try {
        const [posts] = await db.promise().query('SELECT * FROM blog_posts ORDER BY created_at DESC');
        res.json(posts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/admin/blog - Create post
router.post('/', verifyAdminToken, async (req, res) => {
    try {
        const { title, content, image_url } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Titre et contenu requis' });
        }

        const [result] = await db.promise().query(
            'INSERT INTO blog_posts (title, content, image_url) VALUES (?, ?, ?)',
            [title, content, image_url]
        );

        res.status(201).json({
            id: result.insertId,
            title, content, image_url,
            message: 'Article créé avec succès'
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/admin/blog/:id - Update post
router.put('/:id', verifyAdminToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, image_url } = req.body;

        await db.promise().query(
            'UPDATE blog_posts SET title = ?, content = ?, image_url = ? WHERE id = ?',
            [title, content, image_url, id]
        );

        res.json({ message: 'Article mis à jour avec succès' });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/admin/blog/:id - Delete post
router.delete('/:id', verifyAdminToken, async (req, res) => {
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
