// backend/models/Product.js
// This is the Product entity/model class

// class Product {
//     constructor(data = {}) {
//       this.id = data.id || null
//       this.name = data.name || ""
//       this.description = data.description || ""
//       this.imageUrls = data.imageUrls || []
//       this.category = data.category || []
//       this.varieties = data.varieties || []
//       this.createdAt = data.createdAt || null
//       this.updatedAt = data.updatedAt || null
//     }

//     // Validate product data
//     validate() {
//       if (!this.name) {
//         throw new Error("Product name is required")
//       }

//       if (!this.varieties || this.varieties.length === 0) {
//         throw new Error("At least one variety is required")
//       }

//       return true
//     }

//     // Convert to database format
//     toDatabase() {
//       return {
//         name: this.name,
//         description: this.description,
//         imageUrls: this.imageUrls,
//         category: this.category,
//         varieties: this.varieties,
//         createdAt: this.createdAt,
//         updatedAt: this.updatedAt,
//       }
//     }

//     // Create from database data
//     static fromDatabase(id, data) {
//       const product = new Product(data)
//       product.id = id
//       return product
//     }
//   }

//   module.exports = Product
// backend/models/Product.js
// This is the Product entity/model class

class Product {
  constructor(data = {}) {
    this.id = data.id || null
    this.name = data.name || ""
    this.description = data.description || ""
    this.imageUrls = data.imageUrls || []
    this.category = data.category || []
    this.varieties = data.varieties || []
    this.isActive = data.isActive !== undefined ? data.isActive : true
    this.createdAt = data.createdAt || null
    this.updatedAt = data.updatedAt || null
  }

  // Validate product data
  validate() {
    if (!this.name) {
      throw new Error("Product name is required")
    }

    if (!this.varieties || this.varieties.length === 0) {
      throw new Error("At least one variety is required")
    }

    return true
  }

  // Convert to database format
  toDatabase() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      imageUrls: this.imageUrls,
      category: this.category,
      varieties: this.varieties,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }

  // Create from database data
  static fromDatabase(id, data) {
    const product = new Product(data)
    product.id = id
    return product
  }
}

module.exports = Product