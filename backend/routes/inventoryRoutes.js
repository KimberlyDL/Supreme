// backend\routes\invetoryRoutes.js
const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Create role middleware instance
const accessControl = roleMiddleware();

// Add custom rules for inventory management
accessControl.addRule('canManageInventory', (req) => {
    const userRole = req.user?.role?.toLowerCase();
    return ['owner', 'manager', 'assistant_manager', 'stock_manager'].includes(userRole);
});

accessControl.addRule('canViewInventory', (req) => {
    const userRole = req.user?.role?.toLowerCase();
    return ['owner', 'manager', 'assistant_manager', 'stock_manager', 'helper'].includes(userRole);
});

accessControl.addRule('canTransferStock', (req) => {
    const userRole = req.user?.role?.toLowerCase();
    return ['owner'].includes(userRole);
});

// Define URL patterns and their rules
accessControl
    // Default rule for all routes
    .forPattern('*', {
        hasRole: ['owner', 'assistant_manager', 'helper'],
    })

    // Add stock
    .forPattern('/add', {
        hasRole: ['owner', 'assistant_manager'],
        canManageInventory: true
    })

    // Deduct stock
    .forPattern('/deduct', {
        hasRole: ['owner', 'assistant_manager'],
        canManageInventory: true
    })

    // Reject stock
    .forPattern('/reject', {
        hasRole: ['owner', 'assistant_manager'],
        canManageInventory: true
    })

    // Transfer stock
    .forPattern('/transfer', {
        hasRole: ['owner'],
        canTransferStock: true
    })

    // Adjust stock
    .forPattern('/adjust', {
        hasRole: ['owner', 'manager'],
        canManageInventory: true
    })

    // Get branch stock
    .forPattern(/^\/branch\/[^\/]\/stock+$/, {
        hasRole: ['owner', 'assistant_manager', 'helper'],
        canViewInventory: true
    })

    // Get inventory logs
    .forPattern(/^\/branch\/[^\/]\/logs+$/, {
        hasRole: ['owner', 'assistant_manager'],
        canViewInventory: true
    });

// Get the middleware function
const checkAccess = accessControl.getMiddleware();

// All routes require authentication
router.use(authMiddleware);

// GET routes
router.get('/branch/:branchId/stock', checkAccess, InventoryController.getBranchStock);
router.get('/branch/:branchId/logs', checkAccess, InventoryController.getInventoryLogs);

// POST routes
router.post('/stock/add', checkAccess, InventoryController.addStock);
router.post('/stock/deduct', checkAccess, InventoryController.deductStock);
router.post('/stock/reject', checkAccess, InventoryController.rejectStock);
router.post('/stock/transfer', checkAccess, InventoryController.transferStock);
router.post('/stock/adjust', checkAccess, InventoryController.adjustStock);

module.exports = router;


// // Inventory management routes
// router.post('/add', checkAccess, InventoryController.addStock);
// router.post('/deduct', checkAccess, InventoryController.deductStock);
// router.post('/reject', checkAccess, InventoryController.rejectStock);
// router.post('/transfer', checkAccess, InventoryController.transferStock);
// router.post('/adjust', checkAccess, InventoryController.adjustStock);

// // Inventory query routes
// router.get('/branch/:branchId', checkAccess, InventoryController.getBranchStock);
// router.get('/logs', checkAccess, InventoryController.getInventoryLogs);

// module.exports = router;




// // backend/routes/inventoryRoutes.js
// const express = require('express');
// const router = express.Router();
// const InventoryController = require('../controllers/InventoryController');
// const authMiddleware = require('../middleware/authMiddleware');

// // Apply auth middleware to all inventory routes
// router.use(authMiddleware);

