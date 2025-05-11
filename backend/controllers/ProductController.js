// backend\controllers\ProductController.js
// This class handles HTTP requests for products


// Import necessary modules
const sharp = require("sharp")
const { v4: uuidv4 } = require("uuid")
const { bucket } = require("../config/firebase") // Assuming firebase config is in this path
const CategoryModel = require("../models/CategoryModel") // Assuming CategoryModel is in this path
const { Timestamp } = require("firebase-admin/firestore")
const ProductModel = require("../models/ProductModel")
const ProductService = require("../services/ProductService")


// const ProductService = require("../services/ProductService")
// // const UserService = require("../services/UserService")
// const sharp = require("sharp")
// const { v4: uuidv4 } = require("uuid")
// const { bucket } = require("../config/firebase")

// class ProductController {
//   constructor() {
//     this.productService = new ProductService()
//     // // this.userService = new UserService()
//   }

//   // Get all products with branch filtering
//   async getAllProducts(req, res) {
//     try {
//       const branchId = req.query.branchId || null

//       let products
//       if (branchId) {
//         // Get products for specific branch
//         products = await this.productService.getProductsByBranch(branchId)
//       } else {
//         // Get all products (admin view)
//         products = await this.productService.getAllProducts()
//       }

//       return res.json(products)
//     } catch (error) {
//       console.error("Error fetching products:", error)
//       return res.status(500).json({ error: "Failed to fetch products" })
//     }
//   }

//   // Get product by ID with branch-specific inventory
//   async getProductById(req, res) {
//     try {
//       const { id } = req.params
//       const branchId = req.query.branchId || null

//       let product
//       if (branchId) {
//         // Get product with branch-specific inventory
//         product = await this.productService.getProductByIdForBranch(id, branchId)
//       } else {
//         // Get product without branch-specific inventory (admin view)
//         product = await this.productService.getProductById(id)
//       }

//       if (!product) {
//         return res.status(404).json({ error: "Product not found" })
//       }

//       return res.json(product)
//     } catch (error) {
//       console.error("Error fetching product:", error)
//       return res.status(500).json({ error: "Failed to fetch product" })
//     }
//   }

//   // Add a new product with role-based access control
//   async addProduct(req, res) {
//     try {
//       // Check user role
//       const userId = req.user.id
//       // const user = await this.userService.getUserById(userId)

//       // if (!user) {
//       //   return res.status(401).json({ error: "Unauthorized" })
//       // }

//       // // Only owner, manager, and inventory_manager can add products
//       // const allowedRoles = ["owner", "manager"]
//       // if (!allowedRoles.includes(user.role)) {
//       //   return res.status(403).json({ error: "Forbidden: Insufficient permissions" })
//       // }

//       const productData = req.body
//       const productFiles = req.files?.["images[]"]

//       if (!req.files || (!req.files.image && !req.files.images && !productFiles)) {
//         return res.status(400).json({ error: "Product image is required" })
//       }

//       // If user is not owner or manager, restrict to their branch
//       if (user.role === "inventory_manager") {
//         // Force product to be associated with user's branch
//         productData.isGlobalProduct = "false"
//         productData.branches = [user.branchId]
//       }

//       const newProduct = await this.productService.createProduct(productData, productFiles, userId)

//       return res.status(201).json({
//         message: "Product created successfully",
//         productData: newProduct,
//       })
//     } catch (error) {
//       console.error("Failed to add product:", error)
//       return res.status(500).json({ error: "Failed to add product: " + error.message })
//     }
//   }

//   // Update a product with role-based access control
//   async editProduct(req, res) {
//     try {
//       // Check user role
//       const userId = req.userId
//       // const user = await this.userService.getUserById(userId)

//       if (!user) {
//         return res.status(401).json({ error: "Unauthorized" })
//       }

//       // Only owner, manager, and inventory_manager can update products
//       const allowedRoles = ["owner", "manager", "inventory_manager"]
//       if (!allowedRoles.includes(user.role)) {
//         return res.status(403).json({ error: "Forbidden: Insufficient permissions" })
//       }

//       const { id } = req.params
//       const productData = req.body
//       const productFiles = req.files?.["images[]"]

//       // Get existing product to check permissions
//       const existingProduct = await this.productService.getProductById(id)

//       if (!existingProduct) {
//         return res.status(404).json({ error: "Product not found" })
//       }

//       // If user is inventory_manager, they can only update products in their branch
//       if (user.role === "inventory_manager") {
//         // Check if product is in user's branch
//         const isInBranch = existingProduct.isGlobalProduct ||
//           (existingProduct.branchInventory && existingProduct.branchInventory[user.branchId])

//         if (!isInBranch) {
//           return res.status(403).json({ error: "Forbidden: You can only update products in your branch" })
//         }

//         // Restrict changes to inventory only
//         if (productData.name !== existingProduct.name ||
//           productData.description !== existingProduct.description ||
//           productData.isGlobalProduct !== existingProduct.isGlobalProduct) {
//           return res.status(403).json({ error: "Forbidden: You can only update inventory information" })
//         }
//       }

//       const updatedProduct = await this.productService.updateProduct(
//         id,
//         productData,
//         productFiles,
//         productData.existingImagePaths,
//         productData.removedImagePaths,
//         userId
//       )

//       return res.status(200).json({
//         message: "Product updated successfully",
//         product: updatedProduct,
//       })
//     } catch (error) {
//       console.error("Failed to update product:", error)
//       return res.status(500).json({ error: "Failed to update product: " + error.message })
//     }
//   }

//   // Update branch-specific inventory
//   async updateBranchInventory(req, res) {
//     try {
//       // Check user role
//       const userId = req.userId
//       // const user = await this.userService.getUserById(userId)

//       if (!user) {
//         return res.status(401).json({ error: "Unauthorized" })
//       }

//       // Only owner, manager, inventory_manager, and stock_manager can update inventory
//       const allowedRoles = ["owner", "manager", "inventory_manager", "stock_manager"]
//       if (!allowedRoles.includes(user.role)) {
//         return res.status(403).json({ error: "Forbidden: Insufficient permissions" })
//       }

//       const { productId, branchId } = req.params
//       const varietiesData = req.body

//       // If user is not owner or manager, they can only update their branch
//       if (user.role === "inventory_manager" || user.role === "stock_manager") {
//         if (user.branchId !== branchId) {
//           return res.status(403).json({ error: "Forbidden: You can only update inventory in your branch" })
//         }
//       }

//       await this.productService.updateBranchInventory(productId, branchId, varietiesData, userId)

//       return res.status(200).json({
//         message: "Branch inventory updated successfully"
//       })
//     } catch (error) {
//       console.error("Failed to update branch inventory:", error)
//       return res.status(500).json({ error: "Failed to update branch inventory: " + error.message })
//     }
//   }

//   // Delete a product with role-based access control
//   async deleteProduct(req, res) {
//     try {
//       // Check user role
//       const userId = req.userId
//       // const user = await this.userService.getUserById(userId)

//       if (!user) {
//         return res.status(401).json({ error: "Unauthorized" })
//       }

//       // Only owner and manager can delete products
//       const allowedRoles = ["owner", "manager"]
//       if (!allowedRoles.includes(user.role)) {
//         return res.status(403).json({ error: "Forbidden: Insufficient permissions" })
//       }

//       const { id } = req.params

//       await this.productService.deleteProduct(id)

//       return res.status(200).json({
//         message: "Product and associated images deleted successfully",
//       })
//     } catch (error) {
//       console.error("Failed to delete product:", error)
//       return res.status(500).json({ error: "Failed to delete product: " + error.message })
//     }
//   }

//   // Get products by category
//   async getProductsByCategory(req, res) {
//     try {
//       const { category } = req.params
//       const branchId = req.query.branchId || null

//       let products
//       if (branchId) {
//         // Get branch-specific products by category
//         const branchProducts = await this.productService.getProductsByBranch(branchId)
//         products = branchProducts.filter(product =>
//           product.category && product.category.includes(category)
//         )
//       } else {
//         // Get all products by category
//         products = await this.productService.getProductsByCategory(category)
//       }

//       return res.json(products)
//     } catch (error) {
//       console.error("Error fetching products by category:", error)
//       return res.status(500).json({ error: "Failed to fetch products by category" })
//     }
//   }

//   // Get products on sale
//   async getProductsOnSale(req, res) {
//     try {
//       const branchId = req.query.branchId || null

//       let products
//       if (branchId) {
//         // Get branch-specific products on sale
//         const branchProducts = await this.productService.getProductsByBranch(branchId)
//         products = branchProducts.filter(product =>
//           product.varieties && product.varieties.some(variety => variety.onSale)
//         )
//       } else {
//         // Get all products on sale
//         products = await this.productService.getProductsOnSale()
//       }

//       return res.json(products)
//     } catch (error) {
//       console.error("Error fetching products on sale:", error)
//       return res.status(500).json({ error: "Failed to fetch products on sale" })
//     }
//   }
// }

// // Create singleton instance
// const productController = new ProductController()

// // Export request handler methods bound to the controller instance
// module.exports = {
//   getAllProducts: productController.getAllProducts.bind(productController),
//   getProductById: productController.getProductById.bind(productController),
//   addProduct: productController.addProduct.bind(productController),
//   editProduct: productController.editProduct.bind(productController),
//   deleteProduct: productController.deleteProduct.bind(productController),
//   getProductsByCategory: productController.getProductsByCategory.bind(productController),
//   getProductsOnSale: productController.getProductsOnSale.bind(productController),
//   updateBranchInventory: productController.updateBranchInventory.bind(productController)
// }

// #region Old Codes
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

      // return;

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

//#endregion Old Codes
