// backend/controllers/ProductController.js
// This class handles HTTP requests for products

const ProductService = require("../services/ProductService")
// Import necessary modules
const sharp = require("sharp")
const { v4: uuidv4 } = require("uuid")
const { bucket } = require("../config/firebase") // Assuming firebase config is in this path
const CategoryModel = require("../models/CategoryModel") // Assuming CategoryModel is in this path
const { Timestamp } = require("firebase-admin/firestore")
const ProductModel = require("../models/ProductModel")

class ProductController {
  constructor() {
    this.productService = new ProductService()
  }

  // Get all products
  async getAllProducts(req, res) {
    try {
      const products = await this.productService.getAllProducts()
      return res.json(products)
    } catch (error) {
      console.error("Error fetching products:", error)
      return res.status(500).json({ error: "Failed to fetch products" })
    }
  }

  // Get product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params
      const product = await this.productService.getProductById(id)

      if (!product) {
        return res.status(404).json({ error: "Product not found" })
      }

      return res.json(product)
    } catch (error) {
      console.error("Error fetching product:", error)
      return res.status(500).json({ error: "Failed to fetch product" })
    }
  }

  // Add a new product
  async addProduct(req, res) {
    try {
      const productData = req.body
      const productFiles = req.files?.["images[]"]

      console.log(productData, productFiles);

      if (!req.files || (!req.files.image && !req.files.images && !productFiles)) {
        return res.status(400).json({ error: "Product image is required" })
      }

      const newProduct = await this.productService.createProduct(productData, productFiles)

      return res.status(201).json({
        message: "Product created successfully",
        productData: newProduct,
      })
    } catch (error) {
      console.error("Failed to add product:", error)
      return res.status(500).json({ error: "Failed to add product: " + error.message })
    }
  }

  // Update a product
  async editProduct(req, res) {
    try {
      const { id } = req.params
      const productData = req.body
      const productFiles = req.files?.["images[]"]


      console.log("productData", productData)

      console.log("productFiles",productFiles)

      const updatedProduct = await this.productService.updateProduct(
        id,
        productData,
        productFiles,
        productData.existingImagePaths,
        productData.removedImagePaths,
      )

      return res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      })
    } catch (error) {
      console.error("Failed to update product:", error)
      return res.status(500).json({ error: "Failed to update product: " + error.message })
    }
  }

  // Delete a product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params

      await this.productService.deleteProduct(id)

      return res.status(200).json({
        message: "Product and associated images deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete product:", error)
      return res.status(500).json({ error: "Failed to delete product: " + error.message })
    }
  }

  // Get products by category
  async getProductsByCategory(req, res) {
    try {
      const { category } = req.params
      const products = await this.productService.getProductsByCategory(category)

      return res.json(products)
    } catch (error) {
      console.error("Error fetching products by category:", error)
      return res.status(500).json({ error: "Failed to fetch products by category" })
    }
  }

  // Get products on sale
  async getProductsOnSale(req, res) {
    try {
      const products = await this.productService.getProductsOnSale()

      return res.json(products)
    } catch (error) {
      console.error("Error fetching products on sale:", error)
      return res.status(500).json({ error: "Failed to fetch products on sale" })
    }
  }
}

// Create singleton instance
const productController = new ProductController()

// Export request handler methods bound to the controller instance
module.exports = {
  getAllProducts: productController.getAllProducts.bind(productController),
  getProductById: productController.getProductById.bind(productController),
  addProduct: productController.addProduct.bind(productController),
  editProduct: productController.editProduct.bind(productController),
  deleteProduct: productController.deleteProduct.bind(productController),
  getProductsByCategory: productController.getProductsByCategory.bind(productController),
  getProductsOnSale: productController.getProductsOnSale.bind(productController),
}

