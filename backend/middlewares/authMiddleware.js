// backend/middleware/authMiddleware.js
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

    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || "user",
      branch: decodedToken.branch,
    }

    next()
  } catch (error) {
    console.error("Authentication error:", error)
    return res.status(401).json({ error: "Unauthorized: Invalid token" })
  }
}

module.exports = authMiddleware
