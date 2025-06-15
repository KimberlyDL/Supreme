const express = require("express")
const router = express.Router()
const admin = require("firebase-admin")
const { authenticateToken } = require("../middleware/auth")

// Initialize Firestore
const db = admin.firestore()

// Save cart (works for both authenticated and anonymous users)
router.post("/save", async (req, res) => {
  try {
    const { sessionId, branchId, items, totalAmount, itemCount } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" })
    }

    const cartData = {
      sessionId,
      branchId,
      items: items || [],
      totalAmount: totalAmount || 0,
      itemCount: itemCount || 0,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    // Add user ID if authenticated
    if (req.user) {
      cartData.userId = req.user.uid
    }

    // Save to Firestore
    await db.collection("carts").doc(sessionId).set(cartData, { merge: true })

    res.json({
      success: true,
      message: "Cart saved successfully",
      sessionId,
    })
  } catch (error) {
    console.error("Error saving cart:", error)
    res.status(500).json({ error: "Failed to save cart" })
  }
})

// Get cart by session ID
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params

    const cartDoc = await db.collection("carts").doc(sessionId).get()

    if (!cartDoc.exists) {
      return res.json({ cart: null })
    }

    const cartData = cartDoc.data()

    res.json({
      cart: {
        ...cartData,
        createdAt: cartData.createdAt?.toDate(),
        updatedAt: cartData.updatedAt?.toDate(),
      },
    })
  } catch (error) {
    console.error("Error getting cart:", error)
    res.status(500).json({ error: "Failed to get cart" })
  }
})

// Clear cart
router.delete("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params

    await db.collection("carts").doc(sessionId).delete()

    res.json({
      success: true,
      message: "Cart cleared successfully",
    })
  } catch (error) {
    console.error("Error clearing cart:", error)
    res.status(500).json({ error: "Failed to clear cart" })
  }
})

// Get user's cart history (authenticated users only)
router.get("/user/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid

    const cartsSnapshot = await db
      .collection("carts")
      .where("userId", "==", userId)
      .orderBy("updatedAt", "desc")
      .limit(10)
      .get()

    const carts = []
    cartsSnapshot.forEach((doc) => {
      const data = doc.data()
      carts.push({
        sessionId: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      })
    })

    res.json({ carts })
  } catch (error) {
    console.error("Error getting cart history:", error)
    res.status(500).json({ error: "Failed to get cart history" })
  }
})

module.exports = router
