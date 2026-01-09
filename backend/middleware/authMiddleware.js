const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Non autorisé. Token manquant.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_change_me');
        req.user = decoded; // Attach user info to request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide ou expiré.' });
    }
};

module.exports = authMiddleware;
