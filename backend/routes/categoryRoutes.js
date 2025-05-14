// backend/routes/categoryRoutes.js
// This file defines the routes for category-related endpoints

const express = require("express")
const router = express.Router()
const CategoryController = require("../controllers/CategoryController")
const authMiddleware = require("../middlewares/authMiddleware")
const roleMiddleware = require('../middlewares/roleMiddleware');


const accessControl = roleMiddleware();

accessControl
    // for updating and deleting
    .forPattern(/^\/[^\/]+\/$/, {
        hasRole: ['owner', 'manager', 'assistant_manager', 'stock_manager' ],
    });

const checkAccess = accessControl.getMiddleware();

// Public routes
router.get("/", CategoryController.getCategories)
router.get("/active", CategoryController.getActiveCategories)
router.get("/names", CategoryController.getCategoryNames)


// Protected routes (require authentication)
router.delete("/deletecategories", CategoryController.deleteCategories)
router.get("/withproducts", CategoryController.getActiveCategoriesWithProducts)
//router.get("/withproducts", authMiddleware, checkAccess, CategoryController.getActiveCategoriesWithProducts)
router.post("/", CategoryController.addCategory)
router.put("/:id", 
    // authMiddleware, 
    // checkAccess, 
    CategoryController.updateCategory)
router.delete("/:id", 
    // authMiddleware, 
    // checkAccess, 
    CategoryController.deleteCategory)

module.exports = router

