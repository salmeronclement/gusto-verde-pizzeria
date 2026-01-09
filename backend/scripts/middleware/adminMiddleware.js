const jwt = require('jsonwebtoken');

const adminMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Non autorisé. Token admin manquant.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_me');

        if (decoded.role !== 'admin' && decoded.role !== 'staff') {
            return res.status(403).json({ error: 'Accès refusé. Rôle insuffisant.' });
        }

        req.admin = decoded; // Attach admin info to request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token admin invalide ou expiré.' });
    }
};

module.exports = adminMiddleware;
