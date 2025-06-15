// backend/services/OrderService.js
const OrderRepository = require("../repositories/OrderRepository");
const ProductRepository = require("../repositories/ProductRepository");
const { InventoryService } = require("./InventoryService");
const { LogService } = require("./LogService");
const { db, Timestamp } = require("../config/firebase");
const {
  _generateOrderId,
  _generateOrdSaleLogId,
} = require("../utilities/utils");

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
    this.inventoryService = new InventoryService();
    this.logService = new LogService();
    this.orderLogsCollection = "order_logs";
    this.saleLogsCollection = "sales_logs";
  }

  // Create a new order
  async createOrder(orderData, user) {
    try {
      // Validate customer name
      if (!orderData.customerName && !orderData.client) {
        throw new Error("Customer name is required");
      }

      // Validate items
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error("At least one item is required");
      }

      // Validate stock availability and sale prices
      await this.validateOrderItems(orderData.items, orderData.branchId);
      await this.validateSalePrices(orderData.items);

      // Generate a custom order number
      //   const orderNumber = this.generateOrderNumber();

      const orderNumber = _generateOrderId(orderData.branchId);

      console.log("order");
      console.log(orderData);

      // Create order object
      const order = {
        orderNumber,
        branchId: orderData.branchId,
        paymentType: orderData.paymentType || "cash",
        notes: orderData.notes || "",
        discounts: orderData.discounts || 0,
        client: orderData.customerName || orderData.client,

        items: orderData.items.map((item) => ({
          productId: item.productId,
          product: item.productName || item.product,
          varietyId: item.varietyId,
          varietyName: item.varietyName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          onSale: item.onSale || false,
          sale: item.onSale
            ? {
                startDate: item.sale?.startDate
                  ? Timestamp.fromMillis(item.sale.startDate)
                  : null,
                endDate: item.sale?.endDate
                  ? Timestamp.fromMillis(item.sale.endDate)
                  : null,
                salePrice: item.sale?.salePrice,
              }
            : null,
        })),
        totalPrice:
          orderData.totalPrice ||
          orderData.items.reduce((total, item) => total + item.totalPrice, 0) -
            discounts,
        status: "Pending", // All orders start as pending
        createdAt: Timestamp.now(),
      };

      console.log("order");
      console.log(order);

      // Save order
      const { id, data } = await this.orderRepository.create(order);

      // Log the activity
      await this.logOrderActivity({
        data: order,
        user: user,
        action: "Created",
      });
    } catch (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  // Validate sale prices are still valid
  async validateSalePrices(items) {
    const now = new Date();
    const productIds = [...new Set(items.map((item) => item.productId))];
    const productReads = [];

    // Read all products first
    for (const productId of productIds) {
      productReads.push(this.productRepository.getById(productId));
    }

    const products = await Promise.all(productReads);
    const productMap = new Map();

    products.forEach((product) => {
      if (product) productMap.set(product.id, product);
    });

    // Check each item for sale price validity
    const invalidItems = [];
    for (const item of items) {
      if (item.onSale) {
        const product = productMap.get(item.productId);
        if (!product) continue;

        const variety = product.varieties.find((v) => v.id === item.varietyId);
        if (!variety) continue;

        // Check if variety is still on sale
        const isOnSale = variety.onSale && variety.sale;
        if (!isOnSale) {
          invalidItems.push({
            product: item.product || item.productName,
            variety: item.varietyName,
            reason: "Sale has ended",
          });
          continue;
        }

        // Check if sale price matches
        if (Math.abs(variety.sale.salePrice - item.unitPrice) > 0.01) {
          invalidItems.push({
            product: item.product || item.productName,
            variety: item.varietyName,
            reason: "Sale price has changed",
            oldPrice: item.unitPrice,
            newPrice: variety.sale.salePrice,
          });
          continue;
        }

        // Check if sale dates are valid
        const startDate = variety.sale.startDate?.toDate() || new Date(0);
        const endDate = variety.sale.endDate?.toDate() || new Date(0);

        if (now < startDate || now > endDate) {
          invalidItems.push({
            product: item.product || item.productName,
            variety: item.varietyName,
            reason: "Sale period has ended",
          });
        }
      }
    }

    if (invalidItems.length > 0) {
      throw new Error(
        `Some items have invalid sale prices: ${JSON.stringify(invalidItems)}`
      );
    }

    return true;
  }

  // Validate order items for stock availability from branch_stocks
  async validateOrderItems(items, branchId) {
    if (!branchId) {
      throw new Error("Branch ID is required for stock validation");
    }

    // Get all branch stock items for this branch
    const branchStockItems = await this._getBranchStockItems(branchId);
    const stockMap = new Map();

    // Create a map of stock items for quick lookup
    branchStockItems.forEach((item) => {
      const key = `${item.productId}-${item.varietyId}`;
      stockMap.set(key, item);
    });

    // Validate each item
    const stockIssues = [];
    for (const item of items) {
      const stockKey = `${item.productId}-${item.varietyId}`;
      const stockItem = stockMap.get(stockKey);

      if (!stockItem) {
        stockIssues.push({
          product: item.product || item.productName,
          variety: item.varietyName,
          reason: "Product not found in branch inventory",
        });
        continue;
      }

      // Check total stock quantity
      if (stockItem.quantity < item.quantity) {
        stockIssues.push({
          product: item.product || item.productName,
          variety: item.varietyName,
          reason: "Insufficient stock",
          requested: item.quantity,
          available: stockItem.quantity,
        });
      }
    }

    if (stockIssues.length > 0) {
      throw new Error(
        `Stock validation failed: ${JSON.stringify(stockIssues)}`
      );
    }

    return true;
  }

  // Get all orders with filtering and pagination
  async getAllOrders(filters = {}) {
    try {
      // Transform filters for repository
      const repoFilters = {};

      if (filters.status) {
        repoFilters.status = filters.status;
      }

      if (filters.startDate) {
        repoFilters.startDate = Timestamp.fromDate(new Date(filters.startDate));
      }

      if (filters.endDate) {
        repoFilters.endDate = Timestamp.fromDate(new Date(filters.endDate));
      }

      if (filters.search) {
        repoFilters.client = filters.search;
      }

      if (filters.limit) {
        repoFilters.limit = Number.parseInt(filters.limit);
      }

      if (filters.startAfter) {
        repoFilters.startAfter = filters.startAfter;
      }

      return await this.orderRepository.getAll(repoFilters);
    } catch (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }
  }

  // Get order by ID
  async getOrderById(id) {
    try {
      return await this.orderRepository.getById(id);
    } catch (error) {
      throw new Error(`Error fetching order: ${error.message}`);
    }
  }

  // Update an order
  async updateOrder(orderData, user) {
    try {
      // Validate order ID
      if (!orderData.id) {
        throw new Error("Order ID is required");
      }

      // Get existing order
      const existingOrder = await this.orderRepository.getById(orderData.id);
      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Check if order is already completed or voided
      if (
        existingOrder.status === "Completed" ||
        existingOrder.status === "Voided" ||
        existingOrder.status === "Returned"
      ) {
        throw new Error(
          `Cannot update order with status: ${existingOrder.status}`
        );
      }

      // Validate stock availability and sale prices
      await this.validateOrderItems(
        orderData.items,
        orderData.branchId || existingOrder.branchId
      );
      await this.validateSalePrices(orderData.items);

      // Update order data
      const updatedOrder = {
        orderNumber: existingOrder.orderNumber, // Preserve the original order number
        client: orderData.customerName || orderData.client,
        branchId: orderData.branchId || existingOrder.branchId,
        paymentType: orderData.paymentType || existingOrder.paymentType,
        notes: orderData.notes || existingOrder.notes,
        discounts: orderData.discounts || existingOrder.discounts,
        items: orderData.items.map((item) => ({
          productId: item.productId,
          product: item.productName || item.product,
          varietyId: item.varietyId,
          varietyName: item.varietyName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          onSale: item.onSale || false,
          sale: item.onSale
            ? {
                startDate: item.sale?.startDate
                  ? Timestamp.fromMillis(item.sale.startDate)
                  : null,
                endDate: item.sale?.endDate
                  ? Timestamp.fromMillis(item.sale.endDate)
                  : null,
                salePrice: item.sale?.salePrice,
              }
            : null,
        })),
        totalPrice:
          orderData.totalPrice ||
          orderData.items.reduce((total, item) => total + item.totalPrice, 0),
        status: existingOrder.status,
        updatedAt: Timestamp.now(),
      };

      await this.orderRepository.update(orderData.id, updatedOrder);

      // Log the activity
      await this.logOrderActivity({
        data: updatedOrder,
        user: user,
        action: "Updated",
      });
    } catch (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }
  }

  // Approve an order - this is where inventory is updated
  async approveOrder(orderId, user) {
    try {
      // Get existing order
      const existingOrder = await this.orderRepository.getById(orderId);
      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Check if order is already completed, voided, or returned
      if (
        existingOrder.status === "Completed" ||
        existingOrder.status === "Voided" ||
        existingOrder.status === "Returned"
      ) {
        throw new Error(
          `Cannot approve order with status: ${existingOrder.status}`
        );
      }

      // Get all branch stock items for this branch to check expiration dates
      const branchStockItems = await this._getBranchStockItems(
        existingOrder.branchId
      );
      const stockMap = new Map();

      // Create a map of stock items for quick lookup
      branchStockItems.forEach((item) => {
        const key = `${item.productId}-${item.varietyId}`;
        stockMap.set(key, item);
      });

      // Track expiration dates used for each item
      const itemExpirationDates = {};

      // Process all items and update inventory
      for (const item of existingOrder.items) {
        const stockKey = `${item.productId}-${item.varietyId}`;
        const stockItem = stockMap.get(stockKey);

        if (!stockItem) {
          throw new Error(
            `Stock not found for product ${item.product} (${item.productId})`
          );
        }

        // Get expiration dates from stock item
        const expirationDates = stockItem.expirationDates || [];

        if (expirationDates.length === 0) {
          // If no expiration dates, use standard deduct method
          await this.inventoryService.deductStock(
            {
              branchId: existingOrder.branchId,
              productId: item.productId,
              varietyId: item.varietyId,
              quantity: item.quantity,
              reason: `Order ${existingOrder.orderNumber}`,
            },
            user
          );

          // Store empty expiration dates array for this item
          itemExpirationDates[`${item.productId}-${item.varietyId}`] = [];
        } else {
          // Use FIFO to deduct from expiration dates
          // Sort expiration dates by date (earliest first)
          const sortedDates = [...expirationDates].sort(
            (a, b) => a.date - b.date
          );

          // Create a copy of the dates to track what we'll deduct
          const datesToDeduct = [];
          let remainingToDeduct = item.quantity;

          for (const expDate of sortedDates) {
            if (remainingToDeduct <= 0) break;

            const qtyToDeduct = Math.min(expDate.qty, remainingToDeduct);
            datesToDeduct.push({
              date: expDate.date,
              qty: qtyToDeduct,
            });

            remainingToDeduct -= qtyToDeduct;
          }

          if (remainingToDeduct > 0) {
            throw new Error(
              `Not enough stock with expiration dates for ${item.product}`
            );
          }

          // Deduct stock with specific expiration dates
          await this.inventoryService.deductStock(
            {
              branchId: existingOrder.branchId,
              productId: item.productId,
              varietyId: item.varietyId,
              quantity: item.quantity,
              expirationDates: datesToDeduct,
              reason: `Order ${existingOrder.orderNumber}`,
            },
            user
          );

          // Store the expiration dates used for this item
          itemExpirationDates[`${item.productId}-${item.varietyId}`] =
            datesToDeduct;
        }
      }

      // Update order status and add expiration dates used
      const updatedOrder = {
        ...existingOrder,
        status: "Completed",
        completedAt: Timestamp.now(),
        itemExpirationDates: itemExpirationDates, // Store expiration dates used for each item
      };

      await this.orderRepository.update(orderId, updatedOrder);

      // Log the activity
      await this.logOrderActivity({
        data: updatedOrder,
        user: user,
        action: "Approved",
      });

      await this.logSaleActivity({
        data: updatedOrder,
        user: user,
      });
    } catch (error) {
      throw new Error(`Error approving order: ${error.message}`);
    }
  }

  // Void an order (for pending orders only)
  async voidOrder(id, user) {
    try {
      // Get existing order
      const existingOrder = await this.orderRepository.getById(id);
      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Check if order is already voided or returned
      if (
        existingOrder.status === "Voided" ||
        existingOrder.status === "Returned"
      ) {
        throw new Error(
          `Order is already ${existingOrder.status.toLowerCase()}`
        );
      }

      // If order is completed, use returnOrder instead
      if (existingOrder.status === "Completed") {
        throw new Error(
          "Cannot void a completed order. Use returnOrder instead."
        );
      }

      // Update order status
      const updatedOrder = {
        ...existingOrder,
        status: "Voided",
        voidedAt: Timestamp.now(),
      };

      await this.orderRepository.update(id, updatedOrder);

      // Log the activity
      await this.logOrderActivity({
        data: updatedOrder,
        user: user,
        action: "Voided",
      });
    } catch (error) {
      throw new Error(`Error voiding order: ${error.message}`);
    }
  }

  // Return an order (for completed orders only)
  async returnOrder(id, returnReason, user) {
    try {
      // Get existing order
      const existingOrder = await this.orderRepository.getById(id);
      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Check if order is already voided or returned
      if (
        existingOrder.status === "Voided" ||
        existingOrder.status === "Returned"
      ) {
        throw new Error(
          `Order is already ${existingOrder.status.toLowerCase()}`
        );
      }

      // Check if order is completed
      if (existingOrder.status !== "Completed") {
        throw new Error("Only completed orders can be returned");
      }

      // // Create a mock user for inventory service
      // const user = { uid: "system" }

      // If order was completed, return items to inventory using the stored expiration dates
      for (const item of existingOrder.items) {
        const itemKey = `${item.productId}-${item.varietyId}`;
        const expirationDates =
          existingOrder.itemExpirationDates?.[itemKey] || [];

        // If we have stored expiration dates, use them
        if (expirationDates.length > 0) {
          await this.inventoryService.addStock(
            {
              branchId: existingOrder.branchId,
              productId: item.productId,
              varietyId: item.varietyId,
              quantity: item.quantity,
              expirationDates: expirationDates,
              reason: `Returned Order ${existingOrder.orderNumber}`,
            },
            user
          );
        } else {
          // If no expiration dates were stored, add stock with a default expiration date
          const today = new Date();
          const expirationDate = new Date(today.setDate(today.getDate() + 30));
          const expirationTimestamp = Math.floor(
            expirationDate.getTime() / 1000
          ); // Convert to seconds

          await this.inventoryService.addStock(
            {
              branchId: existingOrder.branchId,
              productId: item.productId,
              varietyId: item.varietyId,
              quantity: item.quantity,
              expirationDates: [
                {
                  date: expirationTimestamp,
                  qty: item.quantity,
                },
              ],
              reason: `Returned Order ${existingOrder.orderNumber}`,
            },
            user
          );
        }
      }

      // Update order status
      const updatedOrder = {
        ...existingOrder,
        status: "Returned",
        returnedAt: Timestamp.now(),
        returnReason: returnReason || "No reason provided",
      };

      await this.orderRepository.update(id, updatedOrder);

      // Log the activity
      await this.logOrderActivity({
        data: updatedOrder,
        user: user,
        action: "Returned",
      });
    } catch (error) {
      throw new Error(`Error returning order: ${error.message}`);
    }
  }

  // Delete an order (admin only, for pending orders only)
  async deleteOrder(id, user) {
    try {
      // Get existing order
      const existingOrder = await this.orderRepository.getById(id);
      if (!existingOrder) {
        throw new Error("Order not found");
      }

      // Only allow deletion of pending orders
      if (existingOrder.status !== "Pending") {
        throw new Error(
          `Cannot delete order with status: ${existingOrder.status}. Only pending orders can be deleted.`
        );
      }

      await this.orderRepository.delete(id);

      // Log the activity
      await this.logOrderActivity({
        data: updatedOrder,
        user: user,
        action: "Deleted",
      });
    } catch (error) {
      throw new Error(`Error deleting order: ${error.message}`);
    }
  }

  // Helper method to get branch stock items
  async _getBranchStockItems(branchId) {
    try {
      // This is a simplified implementation - you might need to adjust based on your actual repository structure
      const db = require("../config/firebase").db;
      const snapshot = await db
        .collection("branch_stocks")
        .where("branchId", "==", branchId)
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching branch stock items:", error);
      throw error;
    }
  }

  /**
   * Log an order activity
   * @param {Object} data - Log data
   * @param {Object} user - User who performed the action
   * @returns {Promise<Object>} Created log
   */
  async logOrderActivity({ data, user, action }) {
    try {
      const logId = _generateOrdSaleLogId("ORD");

      const logData = {
        timestamp: Timestamp.now(),
        createdBy: this.logService._sanitizeUser(user),
        order: { ...data },
        orderNumber: data.orderNumber,
        action: action || "",
        details: `Order ${data.orderNumber} ${action}` || "",
      };

      await this.orderRepository.logOrderActivity(logId, logData);

      return { id: logId, ...logData };
    } catch (error) {
      console.error("Error logging order activity:", error);
      return null;
    }
  }

  /**
   * Log a sale activity
   * @param {Object} data - Log data
   * @param {Object} user - User who performed the action
   * @returns {Promise<Object>} Created log
   */
  async logSaleActivity({ data, user }) {
    try {
      const logId = _generateOrdSaleLogId("SLS");

      const logData = {
        timestamp: Timestamp.now(),
        createdBy: this.logService._sanitizeUser(user),
        client: data.client,
        orderNumber: data.orderNumber,
        branchId: data.branchId,
        paymentType: data.paymentType,
        notes: data.notes,
        discounts: data.discounts,
        items: data.items,
        totalPrice: data.totalPrice,
      };

      await this.orderRepository.logSaleActivity(logId, logData);

      return { id: logId, ...logData };
    } catch (error) {
      console.error("Error logging sale activity:", error);
      return null;
    }
  }

  /**
   * Get order logs with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Logs and pagination info
   */
  async getOrderLogs(options = {}) {
    try {
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;

      // Build query
      let query = db.collection(this.orderLogsCollection);

      // Apply filters
      if (options.orderId) {
        query = query.where("order.id", "==", options.orderId);
      }

      if (options.orderNumber) {
        query = query.where("orderNumber", "==", options.orderNumber);
      }

      if (options.status) {
        query = query.where("order.status", "==", options.status);
      }

      // Date range filtering
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        query = query.where("timestamp", ">=", Timestamp.fromDate(startDate));
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1);
        query = query.where("timestamp", "<", Timestamp.fromDate(endDate));
      }

      // Apply sorting
      query = query.orderBy("timestamp", "desc");

      // Apply pagination
      query = query.limit(limit);

      // If not the first page, use startAfter for pagination
      if (page > 1 && options.lastVisible) {
        const lastDoc = await db
          .collection(this.orderLogsCollection)
          .doc(options.lastVisible)
          .get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      // Execute query
      const snapshot = await query.get();

      // Format results
      const logs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
          createdBy: data.createdBy || null,
          order: data.order || {},
        };
      });

      // // Get total count (optional - might be expensive for large collections)
      // let total = 0;
      // if (options.getTotal) {
      //   // This is a simplified count - for large collections, consider a more efficient approach
      //   const countQuery = db.collection(this.orderLogsCollection);
      //   const countSnapshot = await countQuery.get();
      //   total = countSnapshot.size;
      // }

      return {
        logs,
        pagination: {
          page,
          limit,
          hasMore: logs.length === limit,
          // total,
          lastVisible: logs.length > 0 ? logs[logs.length - 1].id : null,
        },
      };
    } catch (error) {
      console.error("Error getting order logs:", error);
      throw error;
    }
  }

  /**
   * Get sale logs with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Logs and pagination info
   */
  async getSaleLogs(options = {}) {
    try {
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;

      // Build query
      let query = db.collection(this.saleLogsCollection);

      // Apply filters
      if (options.orderId) {
        query = query.where("orderId", "==", options.orderId);
      }

      if (options.orderNumber) {
        query = query.where("orderNumber", "==", options.orderNumber);
      }

      if (options.productId) {
        query = query.where("items", "array-contains", {
          productId: options.productId,
        });
      }

      if (options.branchId) {
        query = query.where("branchID", "==", options.branchId);
      }

      // Date range filtering
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        query = query.where("timestamp", ">=", Timestamp.fromDate(startDate));
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1);
        query = query.where("timestamp", "<", Timestamp.fromDate(endDate));
      }

      // Apply sorting
      query = query.orderBy("timestamp", "desc");

      // Apply pagination
      query = query.limit(limit);

      // If not the first page, use startAfter for pagination
      if (page > 1 && options.lastVisible) {
        const lastDoc = await db
          .collection(this.saleLogsCollection)
          .doc(options.lastVisible)
          .get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      // Execute query
      const snapshot = await query.get();

      // Format results
      const logs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
          createdBy: data.createdBy || null,
        };
      });

      // Get total count (optional - might be expensive for large collections)
      let total = 0;
      if (options.getTotal) {
        // This is a simplified count - for large collections, consider a more efficient approach
        const countQuery = db.collection(this.saleLogsCollection);
        const countSnapshot = await countQuery.get();
        total = countSnapshot.size;
      }

      return {
        logs,
        pagination: {
          page,
          limit,
          hasMore: logs.length === limit,
          total,
          lastVisible: logs.length > 0 ? logs[logs.length - 1].id : null,
        },
      };
    } catch (error) {
      console.error("Error getting sale logs:", error);
      throw error;
    }
  }
}

module.exports = OrderService;
