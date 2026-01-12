const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/admin/drivers
// Récupérer la liste des livreurs
router.get('/', async (req, res) => {
    try {
        const promiseDb = db.promise();
        const [rows] = await promiseDb.query("SELECT * FROM drivers ORDER BY created_at DESC");
        res.json(rows);
    } catch (error) {
        console.error('Erreur GET Drivers:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/admin/drivers
router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, phone } = req.body;

        // Validation simple
        if (!first_name || !last_name || !phone) {
            return res.status(400).json({ error: "Le nom, le prénom et le téléphone sont requis." });
        }

        const promiseDb = db.promise();

        // Check uniqueness of phone
        const [existing] = await promiseDb.query("SELECT id FROM drivers WHERE phone = ?", [phone]);
        if (existing.length > 0) {
            return res.status(400).json({ error: "Ce numéro de téléphone est déjà utilisé." });
        }

        // Insertion
        const [result] = await promiseDb.query(
            "INSERT INTO drivers (first_name, last_name, phone, created_at, is_active) VALUES (?, ?, ?, NOW(), 1)",
            [first_name, last_name, phone]
        );

        // On renvoie le livreur créé
        res.json({
            success: true,
            id: result.insertId,
            message: "Livreur ajouté avec succès"
        });

    } catch (error) {
        console.error('Erreur POST Driver:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/admin/drivers/:id
// Supprimer un livreur (et son historique)
router.delete('/:id', async (req, res) => {
    try {
        const driverId = req.params.id;
        const promiseDb = db.promise();

        // 1. Supprimer l'historique des livraisons (Cascade manuelle)
        await promiseDb.query("DELETE FROM deliveries WHERE driver_id = ?", [driverId]);

        // 2. Supprimer le livreur
        await promiseDb.query("DELETE FROM drivers WHERE id = ?", [driverId]);

        res.json({ success: true, message: "Livreur et son historique supprimés" });
    } catch (error) {
        console.error('Erreur DELETE Driver:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;