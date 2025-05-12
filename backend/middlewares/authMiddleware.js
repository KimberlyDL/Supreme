// backend\middlewares\authMiddleware.js
// This middleware verifies Firebase authentication tokens

const admin = require("firebase-admin")

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" })
    }

    const token = authHeader.split("Bearer ")[1]

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token)

    // req.user = decodedToken
    // console.log("Decoded token:", req.user);

    // req.user: {
    //   iss:,
    //   aud:,
    //   auth_time:,
    //   user_id:,
    //   sub:,
    //   iat:,
    //   exp:,
    //   email:,
    //   email_verified: //true or false,
    //   firebase: { identities: identities: {email: [Array] }, sign_in_provider: 'password'},
    //   uid:,
    // }

    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      role: decodedToken.role || null,
      branch: decodedToken.branch || null,
    }
    next()
    
  } catch (error) {
    console.error("Authentication error:", error)
    return res.status(401).json({ error: "Unauthorized: Invalid token" })
  }
}

module.exports = authMiddleware
