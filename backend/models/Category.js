// backend/models/Category.js
// This is the Category entity/model class

class Category {
    constructor(data = {}) {
      this.id = data.id || null
      this.name = data.name || ""
      this.isActive = data.isActive !== undefined ? data.isActive : true
      this.createdAt = data.createdAt || null
      this.updatedAt = data.updatedAt || null
    }
  
    // Validate category data
    validate() {
      if (!this.name) {
        throw new Error("Category name is required")
      }
      return true
    }
  
    // Convert to database format
    toDatabase() {
      return {
        name: this.name,
        isActive: this.isActive,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      }
    }
  
    // Create from database data
    static fromDatabase(id, data) {
      const category = new Category(data)
      category.id = id
      return category
    }
  }
  
  module.exports = Category
  
  