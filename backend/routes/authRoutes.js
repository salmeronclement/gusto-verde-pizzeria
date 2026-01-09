const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

const promiseDb = db.promise();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

// =================================================================
// 1. AUTH CLIENT (CLIENTS)
// =================================================================

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { firstName, lastName, phone, password } = req.body;
    let { email } = req.body; // Let pour pouvoir trim

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
    }

    // Nettoyage des entrées
    email = email.trim().toLowerCase();

    try {
        // Check if email exists
        const [existing] = await promiseDb.query('SELECT id FROM customers WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert customer
        const [result] = await promiseDb.query(
            'INSERT INTO customers (first_name, last_name, email, phone, password, loyalty_points) VALUES (?, ?, ?, ?, ?, 0)',
            [firstName, lastName, email, phone, hashedPassword]
        );

        // Generate Token (Avec Rôle Explicite)
        const token = jwt.sign(
            { id: result.insertId, email: email, name: `${firstName} ${lastName}`, role: 'client' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Inscription réussie',
            token,
            user: { id: result.insertId, name: `${firstName} ${lastName}`, email, role: 'client', loyalty_points: 0 }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    let { email } = req.body;
    const { password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    email = email.trim().toLowerCase();

    try {
        const [users] = await promiseDb.query('SELECT * FROM customers WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Identifiants incorrects.' });
        }

        const user = users[0];

        // Verify password
        if (!user.password) {
            return res.status(401).json({ error: 'Veuillez réinitialiser votre mot de passe (compte ancien).' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Identifiants incorrects.' });
        }

        // Fetch addresses
        const [addresses] = await promiseDb.query('SELECT * FROM addresses WHERE customer_id = ?', [user.id]);

        // Generate Token (Avec Rôle Explicite)
        const token = jwt.sign(
            { id: user.id, email: user.email, name: `${user.first_name} ${user.last_name}`, role: 'client' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                phone: user.phone,
                role: 'client',
                loyalty_points: user.loyalty_points || 0,
                addresses: addresses.map(addr => ({
                    id: addr.id,
                    name: addr.label || 'Mon adresse',
                    street: addr.street,
                    postalCode: addr.postal_code,
                    city: addr.city,
                    additionalInfo: addr.additional_info
                }))
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
});

// GET /api/auth/me (Get fresh current user data)
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const [users] = await promiseDb.query('SELECT * FROM customers WHERE id = ?', [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }

        const user = users[0];
        const [addresses] = await promiseDb.query('SELECT * FROM addresses WHERE customer_id = ?', [user.id]);

        res.json({
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Client',
            email: user.email,
            phone: user.phone,
            role: 'client',
            loyalty_points: user.loyalty_points || 0,
            addresses: addresses.map(addr => ({
                id: addr.id,
                name: addr.label || 'Mon adresse',
                street: addr.street,
                postalCode: addr.postal_code,
                city: addr.city,
                additionalInfo: addr.additional_info
            }))
        });
    } catch (error) {
        console.error('Error fetching me:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/auth/me (Update Profile)
router.put('/me', authMiddleware, async (req, res) => {
    const { firstName, lastName, email, phone } = req.body;
    try {
        await promiseDb.query(
            'UPDATE customers SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?',
            [firstName, lastName, email, phone, req.user.id]
        );
        res.json({ success: true, message: 'Profil mis à jour' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Erreur mise à jour profil' });
    }
});

// POST /api/auth/addresses (Add Address)
router.post('/addresses', authMiddleware, async (req, res) => {
    const { name, street, postalCode, city, additionalInfo } = req.body;
    try {
        const [result] = await promiseDb.query(
            'INSERT INTO addresses (customer_id, label, street, postal_code, city, additional_info) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, name || 'Mon adresse', street, postalCode, city, additionalInfo]
        );
        res.status(201).json({ id: result.insertId, message: 'Adresse ajoutée' });
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ error: 'Erreur ajout adresse' });
    }
});

// PUT /api/auth/addresses/:id (Update Address)
router.put('/addresses/:id', authMiddleware, async (req, res) => {
    const { name, street, postalCode, city, additionalInfo } = req.body;
    try {
        await promiseDb.query(
            'UPDATE addresses SET label = ?, street = ?, postal_code = ?, city = ?, additional_info = ? WHERE id = ? AND customer_id = ?',
            [name, street, postalCode, city, additionalInfo, req.params.id, req.user.id]
        );
        res.json({ success: true, message: 'Adresse mise à jour' });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ error: 'Erreur mise à jour adresse' });
    }
});

// DELETE /api/auth/addresses/:id (Delete Address)
router.delete('/addresses/:id', authMiddleware, async (req, res) => {
    try {
        await promiseDb.query('DELETE FROM addresses WHERE id = ? AND customer_id = ?', [req.params.id, req.user.id]);
        res.json({ success: true, message: 'Adresse supprimée' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ error: 'Erreur suppression adresse' });
    }
});

// =================================================================
// 1b. AUTH CLIENT PAR TÉLÉPHONE (OTP SIMULÉ)
// =================================================================

// POST /api/auth/client/send-code - Envoie un code OTP (simulé en console)
router.post('/client/send-code', async (req, res) => {
    let { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Numéro de téléphone requis.' });
    }

    // Nettoyage du numéro (supprimer espaces, tirets, etc.)
    phone = phone.replace(/[\s\-\.]/g, '');

    // Validation basique (format français : 10 chiffres commençant par 0)
    if (!/^0[1-9][0-9]{8}$/.test(phone)) {
        return res.status(400).json({ error: 'Format de numéro invalide. Utilisez le format 0612345678.' });
    }

    try {
        // Vérifier si le client existe
        const [existing] = await promiseDb.query('SELECT id, first_name, last_name FROM customers WHERE phone = ?', [phone]);
        const isNewUser = existing.length === 0;

        let customerId;

        if (isNewUser) {
            // Créer un nouveau client avec juste le téléphone
            const [result] = await promiseDb.query(
                'INSERT INTO customers (phone, loyalty_points, created_at) VALUES (?, 0, NOW())',
                [phone]
            );
            customerId = result.insertId;
            console.log(`✅ Nouveau client créé: #${customerId} (${phone})`);
        } else {
            customerId = existing[0].id;
        }

        // Générer un code à 6 chiffres
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // +10 minutes

        // Sauvegarder le code en BDD
        await promiseDb.query(
            'UPDATE customers SET otp_code = ?, otp_expires_at = ? WHERE id = ?',
            [code, expiresAt, customerId]
        );

        // ⚠️ SIMULATION SMS - Afficher en console
        console.log('');
        console.log('═══════════════════════════════════════════════════');
        console.log(`📱 SMS SIMULÉ POUR ${phone} : ${code}`);
        console.log('═══════════════════════════════════════════════════');
        console.log('');

        res.json({
            success: true,
            isNewUser,
            message: 'Code envoyé avec succès'
        });

    } catch (error) {
        console.error('Send code error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'envoi du code' });
    }
});

// POST /api/auth/client/verify-code - Vérifie le code OTP et connecte
router.post('/client/verify-code', async (req, res) => {
    let { phone, code, firstName, lastName } = req.body;

    if (!phone || !code) {
        return res.status(400).json({ error: 'Téléphone et code requis.' });
    }

    phone = phone.replace(/[\s\-\.]/g, '');

    try {
        // Récupérer le client
        const [customers] = await promiseDb.query(
            'SELECT * FROM customers WHERE phone = ?',
            [phone]
        );

        if (customers.length === 0) {
            return res.status(401).json({ error: 'Numéro inconnu.' });
        }

        const customer = customers[0];

        // Vérifier le code
        if (customer.otp_code !== code) {
            return res.status(401).json({ error: 'Code invalide.' });
        }

        // Vérifier l'expiration
        if (new Date() > new Date(customer.otp_expires_at)) {
            return res.status(401).json({ error: 'Code expiré. Demandez un nouveau code.' });
        }

        // Mettre à jour le profil si c'est un nouveau client
        const isNewUser = !customer.first_name && !customer.last_name;
        if (isNewUser && firstName && lastName) {
            await promiseDb.query(
                'UPDATE customers SET first_name = ?, last_name = ? WHERE id = ?',
                [firstName.trim(), lastName.trim(), customer.id]
            );
            customer.first_name = firstName.trim();
            customer.last_name = lastName.trim();
        }

        // Nettoyer le code OTP
        await promiseDb.query(
            'UPDATE customers SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?',
            [customer.id]
        );

        // Récupérer les adresses
        const [addresses] = await promiseDb.query(
            'SELECT * FROM addresses WHERE customer_id = ?',
            [customer.id]
        );

        // Générer le JWT
        const userName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Client';
        const token = jwt.sign(
            {
                id: customer.id,
                phone: customer.phone,
                name: userName,
                role: 'client'
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        console.log(`✅ Client connecté: #${customer.id} (${phone})`);

        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: customer.id,
                name: userName,
                email: customer.email,
                phone: customer.phone,
                role: 'client',
                loyalty_points: customer.loyalty_points || 0,
                addresses: addresses.map(addr => ({
                    id: addr.id,
                    name: addr.label || 'Mon adresse',
                    street: addr.street,
                    postalCode: addr.postal_code,
                    city: addr.city,
                    additionalInfo: addr.additional_info
                }))
            },
            needsProfile: !customer.first_name && !customer.last_name && !firstName
        });

    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la vérification' });
    }
});

// =================================================================
// 2. AUTH ADMIN (ADMINS)
// =================================================================

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
    let { username } = req.body;
    const { password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
    }

    username = username.trim();

    try {
        const [admins] = await promiseDb.query('SELECT * FROM admins WHERE username = ?', [username]);

        if (admins.length === 0) {
            return res.status(401).json({ error: 'Identifiants incorrects.' });
        }

        const admin = admins[0];
        const isValid = await bcrypt.compare(password, admin.password);

        if (!isValid) {
            return res.status(401).json({ error: 'Identifiants incorrects.' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role }, // role est souvent 'admin' ou 'superadmin'
            JWT_SECRET,
            { expiresIn: '12h' } // Session courte pour admin
        );

        res.json({
            message: 'Connexion admin réussie',
            token,
            admin: { id: admin.id, username: admin.username, role: admin.role }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion admin' });
    }
});

// =================================================================
// 3. AUTH LIVREUR (DRIVERS) - OTP
// =================================================================

// POST /api/auth/driver/send-code
router.post('/driver/send-code', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Numéro de téléphone requis.' });
    }

    try {
        // Find driver by phone
        const [drivers] = await promiseDb.query('SELECT * FROM drivers WHERE phone = ?', [phone]);

        if (drivers.length === 0) {
            // Sécurité : On peut renvoyer 404 ici car c'est une app interne
            return res.status(404).json({ error: 'Ce numéro ne correspond à aucun livreur.' });
        }

        const driver = drivers[0];

        if (!driver.is_active && driver.is_active !== 1) {
            return res.status(403).json({ error: 'Ce compte livreur est inactif. Contactez le manager.' });
        }

        // Generate 4 digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        // Expires in 15 minutes
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Update DB
        await promiseDb.query('UPDATE drivers SET otp_code = ?, otp_expires_at = ? WHERE id = ?', [code, expiresAt, driver.id]);

        // SIMULATION SMS (Pour le dev)
        console.log(`📨 SMS SIMULÉ pour ${phone} : ${code}`);

        res.json({ success: true, message: 'Code envoyé' });

    } catch (error) {
        console.error('Driver send-code error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'envoi du code' });
    }
});

// POST /api/auth/driver/verify-code
router.post('/driver/verify-code', async (req, res) => {
    const { phone, code } = req.body;

    if (!phone || !code) {
        return res.status(400).json({ error: 'Téléphone et code requis.' });
    }

    try {
        const [drivers] = await promiseDb.query('SELECT * FROM drivers WHERE phone = ?', [phone]);

        if (drivers.length === 0) {
            return res.status(401).json({ error: 'Numéro inconnu.' });
        }

        const driver = drivers[0];

        // Check code
        if (driver.otp_code !== code) {
            return res.status(401).json({ error: 'Code invalide.' });
        }

        // Check expiry
        if (new Date() > new Date(driver.otp_expires_at)) {
            return res.status(401).json({ error: 'Code expiré. Demandez-en un nouveau.' });
        }

        // NETTOYAGE (Crucial) : On efface le code pour qu'il ne serve qu'une fois
        await promiseDb.query('UPDATE drivers SET otp_code = NULL, otp_expires_at = NULL WHERE id = ?', [driver.id]);

        // Generate Long-Lived Token (365 days)
        const token = jwt.sign(
            { id: driver.id, role: 'driver', name: `${driver.first_name} ${driver.last_name}` },
            JWT_SECRET,
            { expiresIn: '365d' }
        );

        res.json({
            message: 'Connexion livreur réussie',
            token,
            driver: {
                id: driver.id,
                firstName: driver.first_name,
                lastName: driver.last_name,
                phone: driver.phone,
                role: 'driver',
                current_status: driver.current_status
            }
        });

    } catch (error) {
        console.error('Driver verify-code error:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la vérification du code' });
    }
});

module.exports = router;