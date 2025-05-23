// backend/middlewares/verifyToken.js
const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const idToken = authorizationHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;

    // token data will be available in the req.user
    console.log(req.user);
    
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(403).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = verifyToken;
