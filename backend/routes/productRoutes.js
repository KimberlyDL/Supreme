// backend\routes\productRoutes.js
const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Create role middleware instance
const accessControl = roleMiddleware();

// Add custom rules if needed
accessControl.addRule("canManageInventory", (req) => {
  const userRole = req.user?.role?.toLowerCase();
  return ["owner", "manager", "inventory_manager", "stock_manager"].includes(
    userRole
  );
});

// Define URL patterns and their rules
accessControl
  // Default rule for all routes
  //   .forPattern("*", {
  //     hasRole: ["owner", "assistant_manager"],
  //   })

//   .forPatternWithMethods("/categories", {
//     GET: {
//       // Public access - no rules needed, or minimal role check
//     },
//     POST: {
//       hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
//     },
//     PUT: {
//       hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
//     },
//     DELETE: {
//       hasRole: ["owner", "manager"],
//     },
//   })

  // Product creation
  .forPattern(
    "/products",
    {
      hasRole: ["owner", "assistant_manager"],
      // logAccess: true
    },
    "POST"
  )

  // Product update
  .forPattern(
    /^\/products\/[^\/]+$/,
    {
      hasRole: ["owner", "assistant_manager"],
      // logAccess: true
    },
    "PUT"
  )

  // Product deletion
  .forPattern(
    /^\/products\/[^\/]+$/,
    {
      hasRole: ["owner", "assistant_manager"],
      // logAccess: true
    },
    "DELETE"
  );

// // Branch inventory update
// .forPattern(/^\/products\/[^\/]+\/branch\/[^\/]+\/inventory$/, {
//     hasRole: ['owner', 'assistant_manager'],
//     sameBranch: true,
//     // logAccess: true
// });

// Get the middleware function
const checkAccess = accessControl.getMiddleware();

// Public routes
router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.get("/category/:category", ProductController.getProductsByCategory);
router.get("/filter/on-sale", ProductController.getProductsOnSale);

// Protected routes (require authentication)
router.post("/", authMiddleware, checkAccess, ProductController.addProduct);
router.put("/:id", authMiddleware, checkAccess, ProductController.editProduct);
router.delete(
  "/:id",
  authMiddleware,
  checkAccess,
  ProductController.deleteProduct
);

// // Branch-specific inventory routes
// router.put("/:id/branch/:branchId/inventory", authMiddleware, checkAccess, ProductController.updateBranchInventory);

module.exports = router;

//#region Old Codes
// // backend/routes/productRoutes.js
// // This file defines the routes for product-related endpoints
// // backend\routes\router.js

// const express = require("express")
// const router = express.Router()
// const ProductController = require("../controllers/ProductController")
// const authMiddleware = require("../middlewares/authMiddleware")
// // const roleMiddleware = require("../middlewares/roleMiddleware")

// // Public routes
// router.get("/", ProductController.getAllProducts)
// router.get("/:id", ProductController.getProductById)
// router.get("/category/:category", ProductController.getProductsByCategory)
// router.get("/filter/on-sale", ProductController.getProductsOnSale)

// // // Protected routes (require authentication)
// // router.post("/", authMiddleware, roleMiddleware(["owner", "manager", "inventory_manager"]), ProductController.addProduct)
// // router.put("/:id", authMiddleware, roleMiddleware(["owner", "manager", "inventory_manager"]), ProductController.editProduct)
// // router.delete("/:id", authMiddleware, roleMiddleware(["owner", "manager"]), ProductController.deleteProduct)

// // // Branch-specific inventory routes
// // router.put("/:productId/branch/:branchId/inventory",
// //     authMiddleware,
// //     roleMiddleware(["owner", "manager", "inventory_manager", "stock_manager"]),
// //     ProductController.updateBranchInventory
// // )

// module.exports = router

//#endregion
//#region Much older codes
// require('dotenv').config();
// const express = require("express")
// const router = express.Router()
// const ProductController = require("../controllers/ProductController")
// const authMiddleware = require("../middlewares/authMiddleware")

// // Public routes
// router.get("/", ProductController.getAllProducts)
// router.get("/:id", ProductController.getProductById)
// router.get("/category/:category", ProductController.getProductsByCategory)
// router.get("/filter/on-sale", ProductController.getProductsOnSale)

// // Protected routes (require authentication)
// router.post("/", authMiddleware, ProductController.addProduct)
// router.put("/:id", authMiddleware, ProductController.editProduct)
// router.delete("/:id", authMiddleware, ProductController.deleteProduct)

// module.exports = router

//#endregion
