// backend/models/Order.js
// This is the Order entity/model class

class Order {
    constructor(data = {}) {
      this.id = data.id || null
      this.orderNumber = data.orderNumber || null
      this.client = data.client || ""
      this.items = data.items || []
      this.totalPrice = data.totalPrice || 0
      this.status = data.status || "Pending" // Pending, Completed, Voided
      this.createdAt = data.createdAt || null
      this.updatedAt = data.updatedAt || null
    }
  
    // Validate order data
    validate() {
      if (!this.client) {
        throw new Error("Customer name is required")
      }
  
      if (!this.items || this.items.length === 0) {
        throw new Error("At least one item is required")
      }
  
      return true
    }
  
    // Convert to database format
    toDatabase() {
      return {
        orderNumber: this.orderNumber,
        client: this.client,
        items: this.items,
        totalPrice: this.totalPrice,
        status: this.status,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      }
    }
  
    // Create from database data
    static fromDatabase(id, data) {
      const order = new Order(data)
      order.id = id
      return order
    }
  }
  
  module.exports = Order