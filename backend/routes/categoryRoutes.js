// backend/routes/categoryRoutes.js
// This file defines the routes for category-related endpoints

const express = require("express")
const router = express.Router()
const CategoryController = require("../controllers/CategoryController")
const authMiddleware = require("../middlewares/authMiddleware")

// Public routes
router.get("/", CategoryController.getCategories)
router.get("/active", CategoryController.getActiveCategories)

// Protected routes (require authentication)
router.post("/", authMiddleware, CategoryController.addCategory)
router.put("/:id", authMiddleware, CategoryController.updateCategory)
router.delete("/:id", authMiddleware, CategoryController.deleteCategory)

module.exports = router

