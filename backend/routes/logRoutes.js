// backend/routes/logRoutes.js
const express = require('express');
const router = express.Router();
const LogController = require('../controllers/LogController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Create role middleware instance
const accessControl = roleMiddleware();

// Define URL patterns and their rules
accessControl
    // Default rule for all routes
    .forPattern('*', {
        hasRole: ['owner', 'manager', 'stock_manager', 'admin']
    })

    // Order logs access
    .forPattern('/orders', {
        hasRole: ['owner', 'manager', 'stock_manager', 'admin'],
        logAccess: true
    })

    // Sale logs access
    .forPattern('/sales', {
        hasRole: ['owner', 'manager', 'stock_manager', 'admin'],
        logAccess: true
    });

// Get the middleware function
const checkAccess = accessControl.getMiddleware();

// Order logs routes
router.get('/orders', authMiddleware, checkAccess, LogController.getOrderLogs);

// Sale logs routes
router.get('/sales', authMiddleware, checkAccess, LogController.getSaleLogs);

// Activity logs routes (if needed)
router.get('/activity', authMiddleware, checkAccess, LogController.getActivityLogs);

// Security logs routes (if needed)
router.get('/security', authMiddleware, checkAccess, LogController.getSecurityLogs);

// Inventory logs routes (if needed)
router.get('/inventory', authMiddleware, checkAccess, LogController.getInventoryLogs);

module.exports = router;