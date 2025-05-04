// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
// router.get('/', OrderController.getAllOrders);
// router.get('/:id', OrderController.getOrderById);

// Protected routes
router.post('/', authMiddleware, CartController.addToCart);
// router.put('/:id', authMiddleware, OrderController.updateOrder);
// router.post('/:id/approve', authMiddleware, OrderController.approveOrder);
// router.post('/:id/void', authMiddleware, OrderController.voidOrder);
// router.delete('/:id', authMiddleware, OrderController.deleteOrder);
// router.post('/validate', authMiddleware, OrderController.validateOrderItems);

module.exports = router;