// backend/routes/orderRoutes.js
// This file defines the routes for order-related endpoints

// const express = require("express")
// const router = express.Router()
// const OrderController = require("../controllers/OrderController")
// const authMiddleware = require("../middlewares/authMiddleware")

// // Public routes
// router.get("/", OrderController.getAllOrders)
// router.get("/:id", OrderController.getOrderById)

// // Protected routes (require authentication)
// router.post("/create", authMiddleware, OrderController.createOrder)
// router.put("/:id", authMiddleware, OrderController.updateOrder)
// router.patch("/:id/void", authMiddleware, OrderController.voidOrder)
// router.patch("/:id/complete", authMiddleware, OrderController.completeOrder)
// router.delete("/:id", authMiddleware, OrderController.deleteOrder)

// module.exports = router

// // backend/routes/orderRoutes.js
// const express = require("express")
// const router = express.Router()
// const OrderController = require("../controllers/OrderController")
// // const { body } = require("express-validator")
// const { verifyToken, isAdmin } = require("../middleware/authMiddleware")

// const orderController = new OrderController()

// // // Create order validation
// // const createOrderValidation = [
// //     body("branchId").notEmpty().withMessage("Branch ID is required"),
// //     body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
// //     body("items.*.productId").notEmpty().withMessage("Product ID is required for each item"),
// //     body("items.*.varietyId").notEmpty().withMessage("Variety ID is required for each item"),
// //     body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1 for each item"),
// // ]

// // // Create a new order
// // router.post("/", verifyToken, createOrderValidation, (req, res) => {
// //     orderController.createOrder(req, res)
// // })

// // Create a new order
// router.post("/", verifyToken, (req, res) => {
//     orderController.createOrder(req, res)
// })

// // Get all orders with filtering
// router.get("/", verifyToken, (req, res) => {
//     orderController.getAllOrders(req, res)
// })

// // Get order by ID
// router.get("/:id", verifyToken, (req, res) => {
//     orderController.getOrderById(req, res)
// })

// // // Update an order
// // router.put("/:id", verifyToken, createOrderValidation, (req, res) => {
// //     orderController.updateOrder(req, res)
// // })

// // Update an order
// router.put("/:id", verifyToken, (req, res) => {
//     orderController.updateOrder(req, res)
// })

// // Approve an order
// router.post("/:id/approve", verifyToken, isAdmin, (req, res) => {
//     orderController.approveOrder(req, res)
// })

// // Void an order (for pending orders only)
// router.post("/:id/void", verifyToken, isAdmin, (req, res) => {
//     orderController.voidOrder(req, res)
// })

// // Return an order (for completed orders only)
// router.post("/:id/return", verifyToken, isAdmin, (req, res) => {
//     orderController.returnOrder(req, res)
// })

// // Delete an order (admin only, for pending orders only)
// router.delete("/:id", verifyToken, isAdmin, (req, res) => {
//     orderController.deleteOrder(req, res)
// })

// module.exports = router

// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Create role middleware instance
const accessControl = roleMiddleware();

// === Define Access Control Rules ===
accessControl
  // ✅ Default: allow all authenticated roles to view branches
  .forPattern("*", {
    hasRole: [
      "owner",
      "assistant_manager",
      "manager",
      "inventory_manager",
      "stock_manager",
      "driver",
    ],
  })

  .forPattern(
    "/",
    {
      hasRole: ["owner", "assistant_manager", "manager"],
      sameBranch: true,
    },
    "POST"
  )

  .forPatternWithMethods(/^\/[^\/]+$/, {
    PUT: {
      hasRole: ["owner", "assistant_manager", "manager"],
      sameBranch: true,
    },
    DELETE: { hasRole: ["owner"] },
  })

  .forPattern(
    /^\/[^\/]+\/approve$/,
    {
      hasRole: ["owner", "assistant_manager", "manager"],
      sameBranch: true,
    },
    "PUT"
  )

  .forPattern(
    /^\/[^\/]+\/void$/,
    {
      hasRole: ["owner", "assistant_manager", "manager"],
      sameBranch: true,
    },
    "PUT"
  )

  .forPattern(
    /^\/[^\/]+\/return$/,
    {
      hasRole: ["owner", "assistant_manager", "manager"],
      sameBranch: true,
    },
    "PUT"
  )
  
  .forPattern(
    /^\/[^/]+\/pickup\/complete$/,
    {
      hasRole: ["owner", "assistant_manager", "manager", "stock_manager"],
      sameBranch: true,
    },
    "POST"
  );

// Get the middleware function
const checkAccess = accessControl.getMiddleware();

// Public routes
router.get("/", OrderController.getAllOrders);
router.get("/fulfillment", OrderController.getOrdersByFulfillment);
router.get("/:id", OrderController.getOrderById);

// Protected routes
router.post("/", authMiddleware, OrderController.createOrder);
router.put("/:id", authMiddleware, OrderController.updateOrder);
router.post("/:id/approve", authMiddleware, OrderController.approveOrder);
router.post(
  "/:id/pickup/complete",
  authMiddleware,
  OrderController.completePickup
);
router.post("/:id/void", authMiddleware, OrderController.voidOrder);

// Return an order (for completed orders only)
router.post("/:id/return", authMiddleware, OrderController.returnOrder);
router.delete("/:id", authMiddleware, OrderController.deleteOrder);

// router.post('/validate', authMiddleware, OrderController.validateOrderItems);

module.exports = router;
