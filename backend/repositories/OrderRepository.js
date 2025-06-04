// backend/repositories/OrderRepository.js
// This class handles all database operations for orders

const { db, Timestamp } = require("../config/firebase");
const Order = require("../models/Order");

class OrderRepository {
  constructor() {
    this.collection = "orders";
    this.orderLogsCollection = "order_logs";
    this.saleLogsCollection = "sales_logs";
  }

  // Create a new order
  async create(orderData) {
    try {
      // Add timestamps
      const now = Timestamp.now();
      const data = {
        ...orderData,
        createdAt: now,
        updatedAt: now,
      };

      // const docRef = await db.collection(this.collection).add(data)
      const docRef = await db
        .collection(this.collection)
        .doc(orderData.orderNumber)
        .set(data);

      return {
        id: docRef.id,
        data,
      };
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  // Get all orders with filtering
  async getAll(filters = {}) {
    try {
      let query = db.collection(this.collection);

      // Apply filters
      if (filters.status) {
        query = query.where("status", "==", filters.status);
      }

      if (filters.startDate) {
        query = query.where("createdAt", ">=", filters.startDate);
      }

      if (filters.endDate) {
        query = query.where("createdAt", "<=", filters.endDate);
      }

      if (filters.client) {
        query = query.where("client", "==", filters.client);
      }

      // Apply sorting
      query = query.orderBy("createdAt", "desc");

      // Apply pagination
      if (filters.startAfter) {
        const startAfterDoc = await db
          .collection(this.collection)
          .doc(filters.startAfter)
          .get();
        if (startAfterDoc.exists) {
          query = query.startAfter(startAfterDoc);
        }
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  // Get order by ID
  async getById(id) {
    try {
      const doc = await db.collection(this.collection).doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  // Update an order
  async update(id, orderData) {
    try {
      // Add updated timestamp
      const data = {
        ...orderData,
        updatedAt: Timestamp.now(),
      };

      await db.collection(this.collection).doc(id).update(data);
      return {
        id,
        ...data,
      };
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    }
  }

  // Update order status
  async updateStatus(id, status) {
    try {
      const statusUpdate = {
        status,
        updatedAt: Timestamp.now(),
      };

      // Add specific timestamp based on status
      if (status === "Completed") {
        statusUpdate.completedAt = Timestamp.now();
      } else if (status === "Voided") {
        statusUpdate.voidedAt = Timestamp.now();
      } else if (status === "Returned") {
        statusUpdate.returnedAt = Timestamp.now();
      }

      await db.collection(this.collection).doc(id).update(statusUpdate);

      // Get the updated order
      return await this.getById(id);
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  // Delete an order
  async delete(id) {
    try {
      await db.collection(this.collection).doc(id).delete();
      return { id };
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  }

  // Search orders by orderNumber
  async searchByOrderNumber(orderNumber) {
    try {
      const snapshot = await db
        .collection(this.collection)
        .where("orderNumber", "==", orderNumber)
        .get();

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error searching orders by number: ${error.message}`);
    }
  }

  async logOrderActivity(logId, logData) {
    await db.collection(this.orderLogsCollection).doc(logId).set(logData);
  }

  async logSaleActivity(logId, logData) {
    await db.collection(this.saleLogsCollection).doc(logId).set(logData);
  }
}

module.exports = OrderRepository;