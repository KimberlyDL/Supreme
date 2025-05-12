// backend/middleware/auth.middleware.js
const admin = require('firebase-admin');

/**
 * Middleware to verify Firebase ID token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify the token with Firebase Admin SDK
        // This also checks if the token is expired
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Add user data to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'client', // Default to client if no role
            emailVerified: decodedToken.email_verified
        };

        // Check if route requires specific roles
        if (req.requiredRoles && !req.requiredRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error);

        // Provide specific error for token expiration
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({ message: 'Unauthorized - Token expired', code: 'TOKEN_EXPIRED' });
        }

        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

/**
 * Middleware factory for role-based routes
 * @param {Array<string>|string} roles - Required roles
 * @returns {Function} Middleware function
 */
const requireRoles = (roles) => {
    return (req, res, next) => {
        req.requiredRoles = Array.isArray(roles) ? roles : [roles];
        verifyToken(req, res, next);
    };
};

module.exports = { verifyToken, requireRoles };