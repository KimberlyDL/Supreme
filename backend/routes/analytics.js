const express = require("express")
const router = express.Router()
const admin = require("firebase-admin")

const db = admin.firestore()

// Track product view
router.post("/product-view", async (req, res) => {
  try {
    const { productId, branchId, timestamp } = req.body

    if (!productId || !branchId) {
      return res.status(400).json({ error: "Product ID and Branch ID are required" })
    }

    const analyticsData = {
      type: "product_view",
      productId,
      branchId,
      timestamp: timestamp ? new Date(timestamp) : admin.firestore.FieldValue.serverTimestamp(),
      sessionId: req.body.sessionId,
      userId: req.user?.uid || null,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    }

    await db.collection("analytics").add(analyticsData)

    // Update product view count
    const productAnalyticsRef = db.collection("product_analytics").doc(`${branchId}_${productId}`)
    await productAnalyticsRef.set(
      {
        productId,
        branchId,
        views: admin.firestore.FieldValue.increment(1),
        lastViewed: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    res.json({ success: true })
  } catch (error) {
    console.error("Error tracking product view:", error)
    res.status(500).json({ error: "Failed to track product view" })
  }
})

// Track add to cart
router.post("/add-to-cart", async (req, res) => {
  try {
    const { productId, varietyId, branchId, sessionId, timestamp } = req.body

    if (!productId || !branchId) {
      return res.status(400).json({ error: "Product ID and Branch ID are required" })
    }

    const analyticsData = {
      type: "add_to_cart",
      productId,
      varietyId,
      branchId,
      sessionId,
      timestamp: timestamp ? new Date(timestamp) : admin.firestore.FieldValue.serverTimestamp(),
      userId: req.user?.uid || null,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    }

    await db.collection("analytics").add(analyticsData)

    // Update product cart add count
    const productAnalyticsRef = db.collection("product_analytics").doc(`${branchId}_${productId}`)
    await productAnalyticsRef.set(
      {
        productId,
        branchId,
        cartAdds: admin.firestore.FieldValue.increment(1),
        lastAddedToCart: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    res.json({ success: true })
  } catch (error) {
    console.error("Error tracking add to cart:", error)
    res.status(500).json({ error: "Failed to track add to cart" })
  }
})

// Track purchase
router.post("/purchase", async (req, res) => {
  try {
    const { orderId, items, branchId, totalAmount, sessionId } = req.body

    if (!orderId || !items || !branchId) {
      return res.status(400).json({ error: "Order ID, items, and Branch ID are required" })
    }

    // Track overall purchase
    const purchaseData = {
      type: "purchase",
      orderId,
      branchId,
      totalAmount,
      itemCount: items.length,
      sessionId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      userId: req.user?.uid || null,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    }

    await db.collection("analytics").add(purchaseData)

    // Track individual product purchases
    const batch = db.batch()

    for (const item of items) {
      // Add individual item analytics
      const itemAnalyticsRef = db.collection("analytics").doc()
      batch.set(itemAnalyticsRef, {
        type: "item_purchase",
        orderId,
        productId: item.productId,
        varietyId: item.varietyId,
        quantity: item.quantity,
        price: item.price,
        branchId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userId: req.user?.uid || null,
      })

      // Update product purchase count
      const productAnalyticsRef = db.collection("product_analytics").doc(`${branchId}_${item.productId}`)
      batch.set(
        productAnalyticsRef,
        {
          productId: item.productId,
          branchId,
          purchases: admin.firestore.FieldValue.increment(item.quantity),
          revenue: admin.firestore.FieldValue.increment(item.price * item.quantity),
          lastPurchased: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )
    }

    await batch.commit()

    res.json({ success: true })
  } catch (error) {
    console.error("Error tracking purchase:", error)
    res.status(500).json({ error: "Failed to track purchase" })
  }
})

// Get product analytics for a branch
router.get("/products/:branchId", async (req, res) => {
  try {
    const { branchId } = req.params

    const analyticsSnapshot = await db.collection("product_analytics").where("branchId", "==", branchId).get()

    const analytics = {}
    analyticsSnapshot.forEach((doc) => {
      const data = doc.data()
      analytics[data.productId] = {
        views: data.views || 0,
        cartAdds: data.cartAdds || 0,
        purchases: data.purchases || 0,
        revenue: data.revenue || 0,
        lastViewed: data.lastViewed?.toDate(),
        lastAddedToCart: data.lastAddedToCart?.toDate(),
        lastPurchased: data.lastPurchased?.toDate(),
      }
    })

    res.json({ analytics })
  } catch (error) {
    console.error("Error getting product analytics:", error)
    res.status(500).json({ error: "Failed to get product analytics" })
  }
})

// Get popular products for a branch
router.get("/popular/:branchId", async (req, res) => {
  try {
    const { branchId } = req.params
    const limit = Number.parseInt(req.query.limit) || 10

    const analyticsSnapshot = await db
      .collection("product_analytics")
      .where("branchId", "==", branchId)
      .orderBy("purchases", "desc")
      .limit(limit)
      .get()

    const popularProducts = []
    analyticsSnapshot.forEach((doc) => {
      const data = doc.data()
      popularProducts.push({
        productId: data.productId,
        purchases: data.purchases || 0,
        views: data.views || 0,
        cartAdds: data.cartAdds || 0,
        revenue: data.revenue || 0,
      })
    })

    res.json({ popularProducts })
  } catch (error) {
    console.error("Error getting popular products:", error)
    res.status(500).json({ error: "Failed to get popular products" })
  }
})

// Get analytics dashboard data
router.get("/dashboard/:branchId", async (req, res) => {
  try {
    const { branchId } = req.params
    const { startDate, endDate } = req.query

    let query = db.collection("analytics").where("branchId", "==", branchId)

    if (startDate) {
      query = query.where("timestamp", ">=", new Date(startDate))
    }
    if (endDate) {
      query = query.where("timestamp", "<=", new Date(endDate))
    }

    const analyticsSnapshot = await query.get()

    const dashboard = {
      totalViews: 0,
      totalCartAdds: 0,
      totalPurchases: 0,
      totalRevenue: 0,
      conversionRate: 0,
      topProducts: [],
    }

    const productStats = {}

    analyticsSnapshot.forEach((doc) => {
      const data = doc.data()

      switch (data.type) {
        case "product_view":
          dashboard.totalViews++
          break
        case "add_to_cart":
          dashboard.totalCartAdds++
          break
        case "purchase":
          dashboard.totalPurchases++
          dashboard.totalRevenue += data.totalAmount || 0
          break
      }

      // Track per product
      if (data.productId) {
        if (!productStats[data.productId]) {
          productStats[data.productId] = { views: 0, cartAdds: 0, purchases: 0 }
        }

        if (data.type === "product_view") productStats[data.productId].views++
        if (data.type === "add_to_cart") productStats[data.productId].cartAdds++
        if (data.type === "item_purchase") productStats[data.productId].purchases += data.quantity || 1
      }
    })

    // Calculate conversion rate
    if (dashboard.totalViews > 0) {
      dashboard.conversionRate = ((dashboard.totalPurchases / dashboard.totalViews) * 100).toFixed(2)
    }

    // Get top products
    dashboard.topProducts = Object.entries(productStats)
      .sort(([, a], [, b]) => b.purchases - a.purchases)
      .slice(0, 10)
      .map(([productId, stats]) => ({ productId, ...stats }))

    res.json({ dashboard })
  } catch (error) {
    console.error("Error getting dashboard analytics:", error)
    res.status(500).json({ error: "Failed to get dashboard analytics" })
  }
})

module.exports = router
