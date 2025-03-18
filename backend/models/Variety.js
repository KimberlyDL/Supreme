// backend/models/Variety.js
// This is the Variety entity/model class

class Variety {
    constructor(data = {}) {
      this.id = data.id || null
      this.name = data.name || ""
      this.unit = data.unit || ""
      this.quantity = data.quantity || 1
      this.price = data.price || 0
      this.stockQuantity = data.stockQuantity || 0
      this.isDefault = data.isDefault || false
      this.onSale = data.onSale || false
      this.sale = data.sale || null
    }
  
    // Validate variety data
    validate() {
      if (!this.name) {
        throw new Error("Variety name is required")
      }
  
      if (!this.unit) {
        throw new Error("Variety unit is required")
      }
  
      if (this.quantity <= 0) {
        throw new Error("Variety quantity must be greater than 0")
      }
  
      if (this.price < 0) {
        throw new Error("Variety price cannot be negative")
      }
  
      if (this.stockQuantity < 0) {
        throw new Error("Variety stock quantity cannot be negative")
      }
  
      if (this.onSale && (!this.sale || this.sale.salePrice < 0)) {
        throw new Error("Sale price cannot be negative")
      }
  
      return true
    }
  
    // Convert to database format
    toDatabase() {
      return {
        name: this.name,
        unit: this.unit,
        quantity: this.quantity,
        price: this.price,
        stockQuantity: this.stockQuantity,
        isDefault: this.isDefault,
        onSale: this.onSale,
        sale: this.sale,
      }
    }
  
    // Create from database data
    static fromDatabase(data) {
      return new Variety(data)
    }
  }
  
  module.exports = Variety
  
  