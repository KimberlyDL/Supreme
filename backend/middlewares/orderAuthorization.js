// backend/middlewares/verifyToken.js
const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        console.error('No token provided');
        return res.status(401).json({ message: 'User unauthorized to perform the operation' });
    }

    const idToken = authorizationHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;

        // {
        //     role: 'owner',
        //     branch: 'all',
        //     iss: 'https://securetoken.google.com/test-2e37e',
        //     aud: 'test-2e37e',
        //     auth_time: 1741668462,
        //     user_id: 'EqQih80ucUX3yxNa0dob8ZPAVKj1',
        //     sub: 'EqQih80ucUX3yxNa0dob8ZPAVKj1',
        //     iat: 1741779050,
        //     exp: 1741782650,
        //     email: 'suppremeagrivet@gmail.com',
        //     email_verified: true,
        //     firebase: { identities: { email: [Array] }, sign_in_provider: 'password' },
        //     uid: 'EqQih80ucUX3yxNa0dob8ZPAVKj1'
        // }

        const allowedRoles = ['owner', 'assistant manager'];

        if (!allowedRoles.includes(req.user.role)) {
            console.error('Unauthorized to manage products:', error);
            res.status(403).json({ message: 'User unauthorized to perform the operation' });
        }

        next();

    } catch (error) {
        console.error('Invalid token: Error verifying Firebase ID token:', error);
        return res.status(403).json({ message: 'User unauthorized to perform the operation' });
    }
};

module.exports = verifyToken;