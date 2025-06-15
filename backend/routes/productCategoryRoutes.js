// backend/routes/productCategoryRoutes.js
// This file defines the routes for product-category relationship endpoints

const express = require("express")
const router = express.Router()
const ProductCategoryController = require("../controllers/ProductCategoryController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require("../middlewares/roleMiddleware")

const accessControl = roleMiddleware()

accessControl.forPattern(/.*/, {
    hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
})

const checkAccess = accessControl.getMiddleware()

// All routes require authentication and proper role
router.post(
    "/move-between-categories",
    authMiddleware,
    checkAccess,
    ProductCategoryController.moveProductsBetweenCategories,
)
router.post("/remove-from-category", 
    authMiddleware, 
    checkAccess, 
    ProductCategoryController.removeProductFromCategory)
router.post(
    "/remove-from-category-bulk",
    authMiddleware,
    checkAccess,
    ProductCategoryController.removeProductsFromCategoryBulk,
)

module.exports = router
