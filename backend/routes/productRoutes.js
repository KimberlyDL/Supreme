// backend/routes/productRoutes.js
// This file defines the routes for product-related endpoints
// backend\routes\router.js
require('dotenv').config();
const express = require("express")
const router = express.Router()
const ProductController = require("../controllers/ProductController")
const authMiddleware = require("../middlewares/authMiddleware")

// Public routes
router.get("/", ProductController.getAllProducts)
router.get("/:id", ProductController.getProductById)
router.get("/category/:category", ProductController.getProductsByCategory)
router.get("/filter/on-sale", ProductController.getProductsOnSale)

// Protected routes (require authentication)
router.post("/", authMiddleware, ProductController.addProduct)
router.put("/:id", authMiddleware, ProductController.editProduct)
router.delete("/:id", authMiddleware, ProductController.deleteProduct)

module.exports = router

