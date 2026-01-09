const jwt = require('jsonwebtoken');

const driverMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Non autorisé. Token manquant.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_me');

        if (decoded.role !== 'driver' && decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Accès refusé. Réservé aux livreurs.' });
        }

        req.user = decoded; // Attach user info to request (standardized)
        req.driver = decoded; // Keep this for backward compatibility if needed
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
};

module.exports = driverMiddleware;
