const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Authorization token is missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using the secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the userId from the token to the request object
        req.userId = decoded.userId;

        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token verification failed' });
    }
};

module.exports = verifyToken;
