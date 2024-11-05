const { admin } = require('../config/firebase');

const isOwner = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const idToken = authorizationHeader.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Decoded token in isOwner middleware:', decodedToken);

        // Check if role and user details are present
        if (!decodedToken.role || !decodedToken.email) {
            console.error("Token is missing role or email");
            return res.status(403).json({ message: 'Unauthorized: Role or user details missing in token' });
        }

        // Set req.user based on decoded token data
        req.user = {
            uid: decodedToken.uid,
            role: decodedToken.role,
            firstName: decodedToken.firstName || 'Unknown',
            lastName: decodedToken.lastName || 'Unknown',
            email: decodedToken.email
        };
        next();
    } catch (error) {
        console.error('Error in isOwner middleware:', error.message || error);
        return res.status(500).json({ message: 'Error in authorization middleware', error: error.message || error });
    }
};

module.exports = isOwner;
