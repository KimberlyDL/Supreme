// backend/routes/orderRoutes.js
// This file defines the routes for order-related endpoints

const express = require("express")
const router = express.Router()
const OrderController = require("../controllers/OrderController")
const authMiddleware = require("../middlewares/authMiddleware")

// Public routes
router.get("/", OrderController.getAllOrders)
router.get("/:id", OrderController.getOrderById)

// Protected routes (require authentication)
router.post("/create", authMiddleware, OrderController.createOrder)
router.put("/:id", authMiddleware, OrderController.updateOrder)
router.patch("/:id/void", authMiddleware, OrderController.voidOrder)
router.patch("/:id/complete", authMiddleware, OrderController.completeOrder)
router.delete("/:id", authMiddleware, OrderController.deleteOrder)

module.exports = router
