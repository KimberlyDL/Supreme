// backend/routes/categoryRoutes.js
// This file defines the routes for category-related endpoints

const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const accessControl = roleMiddleware();

// accessControl
//   // for updating and deleting
//   .forPattern(/^\/[^\/]+\/$/, {
//     hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
//   });

// Configure method-specific access control
accessControl
  // POST /categories - Create category (protected)
  .forPattern(
    "/",
    {
      hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
    },
    "POST"
  )

  // PUT /categories/:id - Update category (protected)
  .forPattern(
    /^\/[^\/]+$/,
    {
      hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
    },
    "PUT"
  )

  // DELETE /categories/:id - Delete category (protected)
  .forPattern(
    /^\/[^\/]+$/,
    {
      hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
    },
    "DELETE"
  )

  // DELETE /categories/deletecategories - Bulk delete (protected)
  .forPattern(
    "/deletecategories",
    {
      hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
    },
    "DELETE"
  )

  // GET /categories/withproducts - View with products (protected)
  .forPattern(
    "/withproducts",
    {
      hasRole: [
        "owner",
        "manager",
        "assistant_manager",
        "stock_manager",
        "cashier",
      ],
    },
    "GET"
  );

const checkAccess = accessControl.getMiddleware();

// Public routes
router.get("/", CategoryController.getCategories);
router.get("/active", CategoryController.getActiveCategories);
router.get("/names", CategoryController.getCategoryNames);

// Protected routes (require authentication)
router.delete("/deletecategories", authMiddleware, checkAccess, CategoryController.deleteCategories);
router.get("/withproducts", authMiddleware, checkAccess, CategoryController.getActiveCategoriesWithProducts)
router.post("/", authMiddleware, checkAccess, CategoryController.addCategory);

router.put(
  "/:id",
  authMiddleware,
  checkAccess,
  CategoryController.updateCategory
);
router.delete(
  "/:id",
  authMiddleware,
  checkAccess,
  CategoryController.deleteCategory
);

module.exports = router;
