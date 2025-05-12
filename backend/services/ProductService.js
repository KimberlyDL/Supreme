// backend\services\ProductService.js
// This class contains business logic for products

const ProductRepository = require("../repositories/ProductRepository")
const CategoryRepository = require("../repositories/CategoryRepository")
const { Timestamp } = require("../config/firebase")
const ImageService = require("./ImageService")
const { v4: uuidv4 } = require("uuid")

// Helper function to generate shorter IDs
const generateShortId = () => {
  // Generate a shorter ID (first 8 chars of UUID)
  return uuidv4().split('-')[0];
};

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

      // Generate a unique ID for the product
      const productId = generateShortId()

      // Process varieties with product ID
      const varieties = this.processVarieties(productData, productId)

      // Create product object as a plain JavaScript object, not a class instance
      const productObj = {
        id: productId, // Add unique ID
        name: productData.name,
        description: productData.description,
        isActive: productData.isActive === 'true' || productData.isActive === true,
        imageUrls: imageUrls,
        category: categories,
        varieties: varieties,
        // createdAt: Timestamp.now(),
        // updatedAt: Timestamp.now()
      }

      // Save product
      return await this.productRepository.create(productObj, productId)
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

      // Extract categories from productData
      const categoryArray = []
      for (let i = 0; i < 100; i++) {
        // Arbitrary limit to prevent infinite loop
        const categoryKey = `categories[${i}]`
        if (productData[categoryKey] !== undefined) {
          categoryArray.push(productData[categoryKey])
        } else {
          break
        }
      }

      // Extract existing image paths from productData
      const existingImagePathsArray = []
      for (let i = 0; i < 100; i++) {
        // Arbitrary limit
        const pathKey = `existingImagePaths[${i}]`
        if (productData[pathKey] !== undefined) {
          existingImagePathsArray.push(productData[pathKey])
        } else {
          break
        }
      }

      // Extract removed image paths from productData
      const removedImagePathsArray = []
      for (let i = 0; i < 100; i++) {
        // Arbitrary limit
        const pathKey = `removedImagePaths[${i}]`
        if (productData[pathKey] !== undefined) {
          removedImagePathsArray.push(productData[pathKey])
        } else {
          break
        }
      }

      // Handle image changes
      const imageUrls = await this.handleImageChanges(
        existingProduct.imageUrls,
        newImageFiles,
        existingImagePathsArray,
        removedImagePathsArray,
      )

      const categories = await this.processCategories(categoryArray);

      // Get the product ID (use existing or create new if not present)
      const productId = existingProduct.id || generateShortId()

      // Process varieties with product ID
      const varieties = this.processVarieties(productData, productId, existingProduct.varieties)

      // Update product as a plain JavaScript object
      const updatedProduct = {
        id: productId, // Ensure ID is preserved
        name: productData.name,
        description: productData.description,
        isActive: productData.isActive === 'true' || productData.isActive === true,
        imageUrls: imageUrls,
        category: categories,
        varieties: varieties,
        // updatedAt: Timestamp.now()
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
          // id: generateShortId(), // Add unique ID for category
          name: name,
          isActive: true,
        }

        await this.categoryRepository.create(categoryData)
      }
    }

    return names
  }

  // async removeCategories(categories) {

  // }

  // Process varieties from request - return plain objects, not class instances
  processVarieties(productData, productId, existingVarieties = []) {
    const varieties = []
    let index = 0

    // Create a map of existing varieties by name for quick lookup
    const existingVarietiesMap = {}
    if (existingVarieties && existingVarieties.length > 0) {
      existingVarieties.forEach(v => {
        if (v.name) {
          existingVarietiesMap[v.name] = v
        }
      })
    }

    // Process varieties from form data
    while (productData[`varieties[${index}][name]`]) {
      const varietyName = productData[`varieties[${index}][name]`]

      // Check if this variety already exists (by name)
      const existingVariety = existingVarietiesMap[varietyName]

      // Create a plain JavaScript object instead of a Variety class instance
      const variety = {
        id: existingVariety?.id || `${productId}_var_${generateShortId()}`, // Use existing ID or create new one
        productId: productId, // Link to parent product
        name: varietyName,
        unit: productData[`varieties[${index}][unit]`],
        quantity: Number(productData[`varieties[${index}][quantity]`]),
        price: Number(productData[`varieties[${index}][price]`]),
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

    removedImagePaths = Array.isArray(removedImagePaths) ? removedImagePaths : removedImagePaths ? [removedImagePaths] : []

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
    try {
      return await this.productRepository.getAll()
    } catch (error) {
      console.log(error);
    }
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