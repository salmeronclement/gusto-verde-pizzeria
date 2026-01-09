const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();
const ordersRoutes = require('./routes/ordersRoutes');
const adminOrdersRoutes = require('./routes/adminOrdersRoutes');
const adminDriversRoutes = require('./routes/adminDriversRoutes');
const adminDeliveriesRoutes = require('./routes/adminDeliveriesRoutes');
const adminStatsRoutes = require('./routes/adminStatsRoutes');
const adminProductsRoutes = require('./routes/adminProductsRoutes');
const adminBlogRoutes = require('./routes/adminBlogRoutes');
const adminSettingsRoutes = require('./routes/settingsRoutes');
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// LOGGING DEBUG
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Hero slides uploads

// Servir les fichiers statiques du frontend (React build)
app.use(express.static(path.join(__dirname, '../frontend/dist')));



const verifyAdminToken = require('./middleware/adminMiddleware');

// Routes
app.use('/api/orders', ordersRoutes);
app.use('/api/admin/orders', verifyAdminToken, adminOrdersRoutes);
app.use('/api/admin/drivers', verifyAdminToken, adminDriversRoutes);
app.use('/api/admin/deliveries', verifyAdminToken, adminDeliveriesRoutes);
app.use('/api/admin/stats', verifyAdminToken, adminStatsRoutes);
app.use('/api/admin/products', verifyAdminToken, adminProductsRoutes);
app.use('/api/blog', require('./routes/blogRoutes')); // Blog routes (public GET, admin protected)
app.use('/api/admin/settings', adminSettingsRoutes); // Handling auth internally for /public exception
app.use('/api/admin/customers', verifyAdminToken, require('./routes/adminCustomersRoutes'));
app.use('/api/admin/service', require('./routes/adminServiceRoutes')); // Handling auth internally (status is public)
app.use('/api/settings/service', require('./routes/serviceRoutes'));

app.use('/api/products', require('./routes/productsRoutes')); // Public products routes
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/driver', require('./routes/driverRoutes')); // Driver routes
app.use('/api/content', contentRoutes); // Public content routes (hero slides, etc.)

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend Gusto Verde opérationnel ✅' });
});

app.get('/api/db-test', (req, res) => {
    db.query('SELECT NOW() AS now', (err, results) => {
        if (err) {
            console.error('❌ Erreur lors du test DB :', err);
            return res.status(500).json({ error: 'Erreur base de données' });
        }
        res.json({ now: results[0].now });
    });
});

// Route "Wildcard" pour renvoyer l'application React sur n'importe quelle autre URL
// Fallback pour SPA (React) : renvoyer index.html pour les routes non-API
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    } else {
        next();
    }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT} (VERSION 3 - ${new Date().toISOString()})`);
    console.log('👉 SI VOUS VOYEZ CE MESSAGE, LE CODE EST A JOUR.');
});
