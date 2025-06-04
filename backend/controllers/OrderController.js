// backend/controllers/OrderController.js
const OrderService = require("../services/OrderService");
const { validationResult } = require("express-validator");
const orderService = new OrderService();
const OrderController = {
  // constructor() {
  //   this.orderService = new OrderService();
  // }

  // Create a new order
  async createOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const orderData = req.body;
      const user = req.user;

      const result = await orderService.createOrder(orderData, user);

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: result,
      });
    } catch (error) {
      console.error("Error in createOrder controller:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get all orders with filtering

  async getAllOrders(req, res) {
    try {
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
        limit: req.query.limit ? Number.parseInt(req.query.limit) : 10,
        startAfter: req.query.startAfter,
      };

      const orders = await orderService.getAllOrders(filters);

      return res.status(200).json(orders);
    } catch (error) {
      console.error("Error in getAllOrders controller:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get order by ID

  async getOrderById(req, res) {
    try {
      const orderId = req.params.id;
      const order = await orderService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(200).json(order);
    } catch (error) {
      console.error("Error in getOrderById controller:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Update an order

  async updateOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const orderId = req.params.id;
      const orderData = {
        id: orderId,
        ...req.body,
      };

      const result = await orderService.updateOrder(orderData, req.user);

      return res.status(200).json({
        success: true,
        message: "Order updated successfully",
        order: result,
      });
    } catch (error) {
      console.error("Error in updateOrder controller:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Approve an order

  async approveOrder(req, res) {
    try {
      const orderId = req.params.id;
      const result = await orderService.approveOrder(orderId, req.user);

      return res.status(200).json({
        success: true,
        message: "Order approved successfully",
        order: result,
      });
    } catch (error) {
      console.error("Error in approveOrder controller:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Void an order (for pending orders only)

  async voidOrder(req, res) {
    try {
      const orderId = req.params.id;
      const result = await orderService.voidOrder(orderId, req.user);

      return res.status(200).json({
        success: true,
        message: "Order voided successfully",
        order: result,
      });
    } catch (error) {
      console.error("Error in voidOrder controller:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Return an order (for completed orders only)

  async returnOrder(req, res) {
    try {
      const orderId = req.params.id;
      const { returnReason } = req.body;
      const result = await orderService.returnOrder(
        orderId,
        returnReason,
        req.user
      );

      return res.status(200).json({
        success: true,
        message: "Order returned successfully",
        order: result,
      });
    } catch (error) {
      console.error("Error in returnOrder controller:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete an order (admin only, for pending orders only)

  async deleteOrder(req, res) {
    try {
      const orderId = req.params.id;
      const result = await orderService.deleteOrder(orderId, req.user);

      return res.status(200).json({
        success: true,
        message: "Order deleted successfully",
        order: result,
      });
    } catch (error) {
      console.error("Error in deleteOrder controller:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getOrderLogs(req, res) {
    try {
      // Extract query parameters
      const {
        page = 1,
        limit = 20,
        status,
        startDate,
        endDate,
        search,
        orderId,
        orderNumber,
      } = req.query;

      // Build options object
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        startDate,
        endDate,
        search,
        orderId,
        orderNumber,
      };

      // Get logs
      const orderLogs = await orderService.getOrderLogs(options);

      return res.status(200).json({
        success: true,
        logs: orderLogs.logs || [],
        pagination: orderLogs.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: false,
          total: 0,
        },
      });
    } catch (error) {
      console.error("Error fetching order logs:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching order logs",
        error: error.message,
      });
    }
  },

  async getSaleLogs(req, res) {
    try {
      // Extract query parameters
      const {
        page = 1,
        limit = 20,
        startDate,
        endDate,
        productId,
        branchId,
        orderId,
        orderNumber,
      } = req.query;

      // Build options object
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        startDate,
        endDate,
        productId,
        branchId,
        orderId,
        orderNumber,
      };

      // Get logs
      const saleLogs = await orderService.getSaleLogs(options);

      return res.status(200).json({
        success: true,
        logs: saleLogs.logs || [],
        pagination: saleLogs.pagination || {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: false,
          total: 0,
        },
      });
    } catch (error) {
      console.error("Error fetching sale logs:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching sale logs",
        error: error.message,
      });
    }
  },
};
module.exports = OrderController;
