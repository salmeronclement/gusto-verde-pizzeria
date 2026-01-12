const express = require('express');
const cors = require('cors');
require('dotenv').config();

// VÉRIFICATION CRITIQUE CONFIG DB
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnv = requiredEnv.filter(key => !process.env.hasOwnProperty(key) || !process.env[key]);
if (missingEnv.length > 0) {
    console.error('❌ FATAL: Variables d\'environnement manquantes :', missingEnv.join(', '));
    process.exit(1);
}

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

// Middleware (API only)
app.use(cors());
app.use(express.json());

// Assets publics (Uploads uniquement)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const verifyAdminToken = require('./middleware/adminMiddleware');

// Routes
app.use('/api/orders', ordersRoutes);
app.use('/api/admin/orders', verifyAdminToken, adminOrdersRoutes);
app.use('/api/admin/drivers', verifyAdminToken, adminDriversRoutes);
app.use('/api/admin/deliveries', verifyAdminToken, adminDeliveriesRoutes);
app.use('/api/admin/stats', verifyAdminToken, adminStatsRoutes);
app.use('/api/admin/products', verifyAdminToken, adminProductsRoutes);
app.use('/api/blog', require('./routes/blogRoutes'));
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/customers', verifyAdminToken, require('./routes/adminCustomersRoutes'));
app.use('/api/admin/service', require('./routes/adminServiceRoutes'));
app.use('/api/settings/service', require('./routes/serviceRoutes'));

app.use('/api/products', require('./routes/productsRoutes'));
app.use('/api/auth', authRoutes);
app.use('/api/driver', require('./routes/driverRoutes'));
app.use('/api/content', contentRoutes);

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

// 404 Global - Empêche toute requête hors API
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found (API Only)' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log('✅ Connecté à MySQL (via Pool)');
});
