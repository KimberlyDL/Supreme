// backend\repositories\ProductRepository.js
// This class handles all database operations for products
const { db, Timestamp } = require("../config/firebase")
const Product = require("../models/Product")

// #region Old Codes 
class ProductRepository {
  constructor() {
    this.collection = "products"
  }

  // Create a new product
  async create(productData, productId) {
    try {
      // Ensure we're working with a plain object, not a class instance
      let dataToSave = productData

      // If it's a Product instance, convert it to a plain object
      if (productData instanceof Product) {
        dataToSave = productData.toDatabase()
      }

      // Set timestamps
      dataToSave.createdAt = Timestamp.now()
      dataToSave.updatedAt = Timestamp.now()

      // // Save to database
      // const docRef = await db.collection(this.collection).add(dataToSave)

      // Save to database using custom productId
      // Use .doc(productId) to set custom ID
      const docRef = await db.collection(this.collection).doc(productId).set(dataToSave)
      
      // Return product with ID
      return { id: docRef.id, ...dataToSave }
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`)
    }
  }

  // Get all products
  async getAll() {
    try {
      const snapshot = await db.collection(this.collection).get()

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`)
    }
  }

  // Get product by ID
  async getById(id) {
    try {
      const doc = await db.collection(this.collection).doc(id).get()

      if (!doc.exists) {
        return null
      }

      return {
        id: doc.id,
        ...doc.data(),
      }
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`)
    }
  }

  // Update product
  async update(id, productData) {
    try {
      // Ensure we're working with a plain object, not a class instance
      let dataToSave = productData

      // If it's a Product instance, convert it to a plain object
      if (productData instanceof Product) {
        dataToSave = productData.toDatabase()
      }

      // Set updated timestamp
      dataToSave.updatedAt = Timestamp.now()

      // Update in database
      await db.collection(this.collection).doc(id).update(dataToSave)

      // Return updated product
      return {
        id,
        ...dataToSave,
      }
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`)
    }
  }

  // Delete product
  async delete(id) {
    try {
      await db.collection(this.collection).doc(id).delete()
      return true
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`)
    }
  }

  // Get products by category
  async getByCategory(category) {
    try {
      const snapshot = await db.collection(this.collection).where("category", "array-contains", category).get()

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      throw new Error(`Error fetching products by category: ${error.message}`)
    }
  }

  // Get products on sale
  async getOnSale() {
    try {
      const snapshot = await db.collection(this.collection).get()

      // Filter products with at least one variety on sale
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((product) => product.varieties && product.varieties.some((variety) => variety.onSale))
    } catch (error) {
      throw new Error(`Error fetching products on sale: ${error.message}`)
    }
  }
}

module.exports = ProductRepository

//#endregion Old Codes