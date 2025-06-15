// backend/routes/logRoutes.js
const express = require('express');
const router = express.Router();
const LogController = require('../controllers/LogController');
const OrderController = require('../controllers/OrderController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Create role middleware instance
const accessControl = roleMiddleware();

// Define URL patterns and their rules
accessControl
    // Default rule for all routes
    .forPattern('*', {
        hasRole: ['owner', 'manager', 'stock_manager', 'admin']
    }, "GET")

    // Order logs access
    .forPattern('/orders', {
        hasRole: ['owner', 'manager', 'stock_manager', 'admin'],
        logAccess: true
    }, "GET")

    // Sale logs access
    .forPattern('/sales', {
        hasRole: ['owner', 'manager', 'stock_manager', 'admin'],
        logAccess: true
    }, "GET")

    // Activity logs access
    .forPattern('/activity', {
        hasRole: ['owner', 'manager', 'admin'],
        logAccess: true
    }, "GET")

    // Security logs access (restricted to admin and owner)
    .forPattern('/security', {
        hasRole: ['owner', 'admin'],
        logAccess: true
    }, "GET")

    // Inventory logs access
    .forPattern('/inventory', {
        hasRole: ['owner', 'manager', 'stock_manager', 'admin'],
        logAccess: true
    }, "GET");

// Get the middleware function
const checkAccess = accessControl.getMiddleware();

// Order logs routes
router.get('/orders', authMiddleware, checkAccess, OrderController.getOrderLogs);

// Sale logs routes
router.get('/sales', authMiddleware, checkAccess, OrderController.getSaleLogs);

// Activity logs routes (if needed)
router.get('/activity', authMiddleware, checkAccess, LogController.getActivityLogs);

// Security logs routes (if needed)
router.get('/security', authMiddleware, checkAccess, LogController.getSecurityLogs);

// Inventory logs routes (if needed)
router.get('/inventory', authMiddleware, checkAccess, LogController.getInventoryLogs);

module.exports = router;