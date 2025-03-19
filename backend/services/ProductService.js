// backend\services\ProductService.js
// backend/services/ProductService.js
// This class contains business logic for products

const ProductRepository = require("../repositories/ProductRepository")
const CategoryRepository = require("../repositories/CategoryRepository")
const Product = require("../models/Product")
const Variety = require("../models/Variety")
const Category = require("../models/Category")
const { Timestamp } = require("../config/firebase")
const ImageService = require("./ImageService")

class ProductService {
  constructor() {
    this.productRepository = new ProductRepository()
    this.categoryRepository = new CategoryRepository()
    this.imageService = new ImageService()
  }

  // Create a new product with varieties
  async createProduct(productData, imageFiles) {
    try {
      // Upload images
      const imageUrls = await this.imageService.uploadMultiple(imageFiles)

      // Process categories
      const categories = await this.processCategories(productData.categories)

      // Process varieties
      const varieties = this.processVarieties(productData)

      // Create product object as a plain JavaScript object, not a class instance
      const productObj = {
        name: productData.name,
        description: productData.description,
        imageUrls: imageUrls,
        category: categories,
        varieties: varieties,
      }

      // Save product
      return await this.productRepository.create(productObj)
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`)
    }
  }

  // Update an existing product
  async updateProduct(id, productData, newImageFiles, existingImagePaths, removedImagePaths) {
    try {
      // Get existing product
      const existingProduct = await this.productRepository.getById(id)

      if (!existingProduct) {
        throw new Error("Product not found")
      }

      // Handle image changes
      const imageUrls = await this.handleImageChanges(
        existingProduct.imageUrls,
        newImageFiles,
        existingImagePaths,
        removedImagePaths,
      )

      // Process categories
      const categories = await this.processCategories(productData.categories)

      // Process varieties
      const varieties = this.processVarieties(productData)

      // Update product as a plain JavaScript object
      const updatedProduct = {
        name: productData.name,
        description: productData.description,
        imageUrls: imageUrls,
        category: categories,
        varieties: varieties,
      }

      return await this.productRepository.update(id, updatedProduct)
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`)
    }
  }

  // Delete a product and its images
  async deleteProduct(id) {
    try {
      // Get product to delete
      const product = await this.productRepository.getById(id)

      if (!product) {
        throw new Error("Product not found")
      }

      // Delete images
      if (product.imageUrls && product.imageUrls.length > 0) {
        await this.imageService.deleteMultiple(product.imageUrls)
      }

      // Delete product
      return await this.productRepository.delete(id)
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`)
    }
  }

  // Process categories from request
  async processCategories(categoryNames) {
    if (!categoryNames) return []

    // Ensure categoryNames is an array
    const names = Array.isArray(categoryNames) ? categoryNames : [categoryNames]

    // Process each category
    for (const name of names) {
      // Check if category exists
      const existingCategory = await this.categoryRepository.getByName(name)

      // Create if it doesn't exist
      if (!existingCategory) {
        const categoryData = {
          name: name,
          isActive: true,
        }

        await this.categoryRepository.create(categoryData)
      }
    }

    return names
  }

  // Process varieties from request - return plain objects, not class instances
  processVarieties(productData) {
    const varieties = []
    let index = 0

    // Process varieties from form data
    while (productData[`varieties[${index}][name]`]) {
      // Create a plain JavaScript object instead of a Variety class instance
      const variety = {
        name: productData[`varieties[${index}][name]`],
        unit: productData[`varieties[${index}][unit]`],
        quantity: Number(productData[`varieties[${index}][quantity]`]),
        price: Number(productData[`varieties[${index}][price]`]),
        stockQuantity: Number(productData[`varieties[${index}][stockQuantity]`]),
        isDefault: productData[`varieties[${index}][isDefault]`] === "true",
        onSale: productData[`varieties[${index}][onSale]`] === "true",
      }

      // Add sale information if this variety is on sale
      if (variety.onSale) {
        variety.sale = {
          salePrice: Number(productData[`varieties[${index}][sale][salePrice]`]),
          startDate: Timestamp.fromDate(new Date(productData[`varieties[${index}][sale][startDate]`])),
          endDate: Timestamp.fromDate(new Date(productData[`varieties[${index}][sale][endDate]`])),
        }
      }

      varieties.push(variety)
      index++
    }

    // Ensure at least one variety
    if (varieties.length === 0) {
      throw new Error("At least one variety is required")
    }

    // Ensure exactly one default variety
    const defaultVarieties = varieties.filter((v) => v.isDefault)

    if (defaultVarieties.length === 0) {
      varieties[0].isDefault = true
    } else if (defaultVarieties.length > 1) {
      // Keep only the first default variety
      for (let i = 1; i < varieties.length; i++) {
        if (varieties[i].isDefault) {
          varieties[i].isDefault = false
        }
      }
    }

    return varieties
  }

  // Handle image changes during update
  async handleImageChanges(currentImageUrls, newImageFiles, existingImagePaths, removedImagePaths) {
    // Convert to arrays if not already
    existingImagePaths = Array.isArray(existingImagePaths)
      ? existingImagePaths
      : existingImagePaths
        ? [existingImagePaths]
        : []

    removedImagePaths = Array.isArray(removedImagePaths)
      ? removedImagePaths
      : removedImagePaths
        ? [removedImagePaths]
        : []

    // Delete removed images
    if (removedImagePaths.length > 0) {
      await this.imageService.deleteMultiple(removedImagePaths)
    }

    // Upload new images
    const newImageUrls = newImageFiles ? await this.imageService.uploadMultiple(newImageFiles) : []

    // Combine existing and new image URLs
    return [...existingImagePaths, ...newImageUrls]
  }

  // Get all products
  async getAllProducts() {
    return await this.productRepository.getAll()
  }

  // Get product by ID
  async getProductById(id) {
    return await this.productRepository.getById(id)
  }

  // Get products by category
  async getProductsByCategory(category) {
    return await this.productRepository.getByCategory(category)
  }

  // Get products on sale
  async getProductsOnSale() {
    return await this.productRepository.getOnSale()
  }
}

module.exports = ProductService

// Compare this snippet from backend/services/CategoryService.js:

// // backend/services/ProductService.js
// // This class contains business logic for products

// const ProductRepository = require("../repositories/ProductRepository")
// const CategoryRepository = require("../repositories/CategoryRepository")
// const Product = require("../models/Product")
// const Variety = require("../models/Variety")
// const Category = require("../models/Category")
// const { Timestamp } = require("../config/firebase")
// const ImageService = require("./ImageService")

// class ProductService {
//   constructor() {
//     this.productRepository = new ProductRepository()
//     this.categoryRepository = new CategoryRepository()
//     this.imageService = new ImageService()
//   }

//   // Create a new product with varieties
//   async createProduct(productData, imageFiles) {
//     try {
//       // Upload images
//       const imageUrls = await this.imageService.uploadMultiple(imageFiles)

//       // Process categories
//       const categories = await this.processCategories(productData.categories)

//       // Process varieties
//       const varieties = this.processVarieties(productData)

//       // Create product object
//       const product = new Product({
//         name: productData.name,
//         description: productData.description,
//         imageUrls: imageUrls,
//         category: categories,
//         varieties: varieties,
//       })

//       // Save product
//       return await this.productRepository.create(product)
//     } catch (error) {
//       throw new Error(`Error creating product: ${error.message}`)
//     }
//   }

//   // Update an existing product
//   async updateProduct(id, productData, newImageFiles, existingImagePaths, removedImagePaths) {
//     try {
//       // Get existing product
//       const existingProduct = await this.productRepository.getById(id)

//       if (!existingProduct) {
//         throw new Error("Product not found")
//       }

//       // Handle image changes
//       const imageUrls = await this.handleImageChanges(
//         existingProduct.imageUrls,
//         newImageFiles,
//         existingImagePaths,
//         removedImagePaths,
//       )

//       // Process categories
//       const categories = await this.processCategories(productData.categories)

//       // Process varieties
//       const varieties = this.processVarieties(productData)

//       // Update product
//       const updatedProduct = {
//         name: productData.name,
//         description: productData.description,
//         imageUrls: imageUrls,
//         category: categories,
//         varieties: varieties,
//       }

//       return await this.productRepository.update(id, updatedProduct)
//     } catch (error) {
//       throw new Error(`Error updating product: ${error.message}`)
//     }
//   }

//   // Delete a product and its images
//   async deleteProduct(id) {
//     try {
//       // Get product to delete
//       const product = await this.productRepository.getById(id)

//       if (!product) {
//         throw new Error("Product not found")
//       }

//       // Delete images
//       if (product.imageUrls && product.imageUrls.length > 0) {
//         await this.imageService.deleteMultiple(product.imageUrls)
//       }

//       // Delete product
//       return await this.productRepository.delete(id)
//     } catch (error) {
//       throw new Error(`Error deleting product: ${error.message}`)
//     }
//   }

//   // Process categories from request
//   async processCategories(categoryNames) {
//     if (!categoryNames) return []

//     // Ensure categoryNames is an array
//     const names = Array.isArray(categoryNames) ? categoryNames : [categoryNames]

//     // Process each category
//     for (const name of names) {
//       // Check if category exists
//       const existingCategory = await this.categoryRepository.getByName(name)

//       // Create if it doesn't exist
//       if (!existingCategory) {
//         const category = new Category({
//           name: name,
//           isActive: true,
//         })

//         await this.categoryRepository.create(category)
//       }
//     }

//     return names
//   }

//   // Process varieties from request
//   processVarieties(productData) {
//     const varieties = []
//     let index = 0

//     // Process varieties from form data
//     while (productData[`varieties[${index}][name]`]) {
//       const variety = new Variety({
//         name: productData[`varieties[${index}][name]`],
//         unit: productData[`varieties[${index}][unit]`],
//         quantity: Number(productData[`varieties[${index}][quantity]`]),
//         price: Number(productData[`varieties[${index}][price]`]),
//         stockQuantity: Number(productData[`varieties[${index}][stockQuantity]`]),
//         isDefault: productData[`varieties[${index}][isDefault]`] === "true",
//       })

//       // Add sale information if this variety is on sale
//       if (productData[`varieties[${index}][onSale]`] === "true") {
//         variety.onSale = true
//         variety.sale = {
//           salePrice: Number(productData[`varieties[${index}][sale][salePrice]`]),
//           startDate: Timestamp.fromDate(new Date(productData[`varieties[${index}][sale][startDate]`])),
//           endDate: Timestamp.fromDate(new Date(productData[`varieties[${index}][sale][endDate]`])),
//         }
//       }

//       varieties.push(variety)
//       index++
//     }

//     // Ensure at least one variety
//     if (varieties.length === 0) {
//       throw new Error("At least one variety is required")
//     }

//     // Ensure exactly one default variety
//     const defaultVarieties = varieties.filter((v) => v.isDefault)

//     if (defaultVarieties.length === 0) {
//       varieties[0].isDefault = true
//     } else if (defaultVarieties.length > 1) {
//       // Keep only the first default variety
//       for (let i = 1; i < varieties.length; i++) {
//         if (varieties[i].isDefault) {
//           varieties[i].isDefault = false
//         }
//       }
//     }

//     return varieties
//   }

//   // Handle image changes during update
//   async handleImageChanges(currentImageUrls, newImageFiles, existingImagePaths, removedImagePaths) {
//     // Convert to arrays if not already
//     existingImagePaths = Array.isArray(existingImagePaths)
//       ? existingImagePaths
//       : existingImagePaths
//         ? [existingImagePaths]
//         : []

//     removedImagePaths = Array.isArray(removedImagePaths)
//       ? removedImagePaths
//       : removedImagePaths
//         ? [removedImagePaths]
//         : []

//     // Delete removed images
//     if (removedImagePaths.length > 0) {
//       await this.imageService.deleteMultiple(removedImagePaths)
//     }

//     // Upload new images
//     const newImageUrls = newImageFiles ? await this.imageService.uploadMultiple(newImageFiles) : []

//     // Combine existing and new image URLs
//     return [...existingImagePaths, ...newImageUrls]
//   }

//   // Get all products
//   async getAllProducts() {
//     return await this.productRepository.getAll()
//   }

//   // Get product by ID
//   async getProductById(id) {
//     return await this.productRepository.getById(id)
//   }

//   // Get products by category
//   async getProductsByCategory(category) {
//     return await this.productRepository.getByCategory(category)
//   }

//   // Get products on sale
//   async getProductsOnSale() {
//     return await this.productRepository.getOnSale()
//   }
// }

// module.exports = ProductService

