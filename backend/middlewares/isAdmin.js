// roleMiddleware.js
const { admin } = require('..config/firebase'); // Import Firebase Admin configuration

const checkOwnerRole = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const idToken = authorizationHeader.split(' ')[1];

    // Verify and decode the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if the user has the `owner` role
    if (decodedToken.role !== 'owner') {
      return res.status(403).json({ message: 'Unauthorized: Access restricted to owners only' });
    }

    // Attach user data to request (optional, if you need it in the next steps)
    req.user = decodedToken;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error verifying token or checking role:', error);
    return res.status(403).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = checkOwnerRole;
