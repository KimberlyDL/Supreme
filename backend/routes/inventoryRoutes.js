// Enhanced inventory routes with proper logs endpoint
const express = require("express");
const router = express.Router();
const InventoryController = require("../controllers/InventoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Create role middleware instance
const accessControl = roleMiddleware();

// Add custom rules for inventory management
accessControl.addRule("canManageInventory", (req) => {
  const userRole = req.user?.role?.toLowerCase();
  return ["owner", "manager", "assistant_manager", "stock_manager"].includes(
    userRole
  );
});

accessControl.addRule("canViewInventory", (req) => {
  const userRole = req.user?.role?.toLowerCase();
  return [
    "owner",
    "manager",
    "assistant_manager",
    "stock_manager",
    "helper",
  ].includes(userRole);
});

accessControl.addRule("canTransferStock", (req) => {
  const userRole = req.user?.role?.toLowerCase();
  return ["owner"].includes(userRole);
});

accessControl.addRule("canViewLogs", (req) => {
  const userRole = req.user?.role?.toLowerCase();
  return ["owner", "manager", "assistant_manager", "stock_manager"].includes(
    userRole
  );
});

// Define URL patterns and their rules
accessControl
  // Default rule for all routes
  .forPattern("*", {
    hasRole: [
      "owner",
      "manager",
      "assistant_manager",
      "stock_manager",
      "helper",
    ],
  })

  // Add stock
  .forPattern("/stock/add", {
    hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
    canManageInventory: true,
  }, "POST")

  // Reject stock
  .forPattern("/stock/reject", {
    hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
    canManageInventory: true,
  }, "POST")

  // Transfer stock
  .forPattern("/stock/transfer", {
    hasRole: ["owner"],
    canTransferStock: true,
  }, "POST")

  // Adjust stock
  .forPattern("/stock/adjust", {
    hasRole: ["owner", "manager"],
    canManageInventory: true,
  }, "POST")

  // Get branch stock
  .forPattern(/^\/branch\/[^/]+\/stock$/, {
    hasRole: [
      "owner",
      "manager",
      "assistant_manager",
      "stock_manager",
      "helper",
    ],
    canViewInventory: true,
  }, "GET")

  // Get inventory logs - NEW ENDPOINT
  .forPattern("/logs", {
    hasRole: ["owner", "manager", "assistant_manager", "stock_manager"],
    canViewLogs: true,
  }, "GET");

// Get the middleware function
const checkAccess = accessControl.getMiddleware();

// All routes require authentication
router.use(authMiddleware);

// GET routes
router.get(
  "/branch/:branchId/stock",
  checkAccess,
  InventoryController.getBranchStock
);
router.get("/logs", checkAccess, InventoryController.getInventoryLogs);

// POST routes
router.post("/stock/add", checkAccess, InventoryController.addStock);
router.post("/stock/reject", checkAccess, InventoryController.rejectStock);
router.post("/stock/transfer", checkAccess, InventoryController.transferStock);
router.post("/stock/adjust", checkAccess, InventoryController.adjustStock);

module.exports = router;
