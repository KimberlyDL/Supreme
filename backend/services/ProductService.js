// backend\services\ProductService.js
// This class contains business logic for products

const ProductRepository = require("../repositories/ProductRepository");
const CategoryRepository = require("../repositories/CategoryRepository");
const { Timestamp } = require("../config/firebase");
const {
  _generateShortId,
  _generateLogId,
  _generateActivityLogId,
} = require("../utilities/utils");
const ImageService = require("./ImageService");
const { LogService } = require("./LogService");
const { v4: uuidv4 } = require("uuid");

class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
    this.categoryRepository = new CategoryRepository();
    this.imageService = new ImageService();
    this.logService = new LogService();
  }

  generateVarietyId() {
    return uuidv4().split("-")[0];
  }

  async createProduct(productData, imageFiles, imageOrder, user) {
    try {
      const imageUrlsMap = await this.imageService.uploadMultipleProductImages(
        imageFiles
      );

      let finalImagePaths = [];

      if (imageOrder && imageOrder.length > 0) {
        for (const path of imageOrder) {
          const uploadedPath = imageUrlsMap.get(path);
          if (!uploadedPath) {
            throw new Error(`No uploaded path found for new image: ${path}`);
          }
          finalImagePaths.push(uploadedPath);
        }
      } else {
        // If no image order provided, just combine existing and new paths
        finalImagePaths = [...Array.from(imageUrlsMap.values())];
      }

      const [categories, productId] = await Promise.all([
        this.processCategories(productData.categories),
        _generateShortId("PRD"),
      ]);
      // Process varieties with product ID
      const varieties = this.processVarieties(productData, productId);

      const productObj = {
        id: productId, // Add unique ID
        name: productData.name,
        description: productData.description,
        isActive:
          productData.isActive === "true" || productData.isActive === true,
        imageUrls: finalImagePaths,
        category: categories,
        varieties: varieties,
      };

      // Save product
      await this.productRepository.create(productObj, productId);

      // Prepare log IDs in parallel
      const [productLogId, activityLogId] = await Promise.all([
        _generateLogId(productId),
        _generateActivityLogId(user.uid),
      ]);

      // Log product changes and activity in parallel
      await Promise.all([
        this.logProductActivity({
          productLogId: productLogId,
          data: productObj,
          action: "Create",
          logIds: [activityLogId],
        }),
        this.logService.logAdminActivity(
          {
            activityType: "PRODUCT_ADD",
            user: user,
            action: "ADD_PRODUCT",
            targetResource: "products",
            resourceId: productId,
            details: `Created new product: ${productObj.name} (${productId})`,
          },
          [productLogId], activityLogId
        ),
      ]);
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  async updateProduct(
    id,
    productData,
    newImageFiles,
    existingImagePaths,
    removedImagePaths,
    imageOrder,
    user
  ) {
    try {
      // Get existing product
      const existingProduct = await this.productRepository.getById(id);
      if (!existingProduct) {
        throw new Error("Product not found");
      }

      // Extract categories from productData
      const categoryArray = [];
      for (let i = 0; i < 100; i++) {
        const categoryKey = `categories[${i}]`;
        if (productData[categoryKey] !== undefined) {
          categoryArray.push(productData[categoryKey]);
        } else {
          break;
        }
      }

      const newImagePathMap = new Map();
      // Upload new images and get storage paths
      // const newImagePaths = [];
      if (newImageFiles) {
        const filesArray = Array.isArray(newImageFiles)
          ? newImageFiles
          : [newImageFiles];

        for (const file of filesArray) {
          const uploadedPath = await this.imageService.upload(file);
          newImagePathMap.set(file.name, uploadedPath); // Save original name -> new path
        }

        // if (Array.isArray(newImageFiles)) {
        //   for (const file of newImageFiles) {
        //     const path = await this.imageService.upload(file);
        //     newImagePathMap.set(file.name, uploadedPath);
        //     // newImagePaths.push(path);
        //   }
        // } else {
        //   const path = await this.imageService.upload(newImageFiles);
        //   newImagePathMap.set(file.name, uploadedPath);
        //   // newImagePaths.push(path);
        // }
      }

      // Delete removed images
      if (removedImagePaths && removedImagePaths.length > 0) {
        await this.imageService.deleteMultiple(removedImagePaths);
      }

      // Process categories
      const categories = await this.processCategories(categoryArray);

      // Process varieties
      const varieties = this.processVarieties(
        productData,
        existingProduct.id,
        existingProduct.varieties
      );

      // Build the final ordered image paths array
      let finalImagePaths = [];

      if (imageOrder && imageOrder.length > 0) {
        // Process each order entry
        for (const orderInfo of imageOrder) {
          const [type, identifier] = orderInfo.split(":");

          if (type === "existing") {
            // For existing images, the identifier is the path
            finalImagePaths.push(identifier);
          } else if (type === "new") {
            // For new images, the identifier is the original file name
            const uploadedPath = newImagePathMap.get(identifier);
            if (!uploadedPath) {
              throw new Error(
                `No uploaded path found for new image: ${identifier}`
              );
            }
            finalImagePaths.push(uploadedPath);
          } else {
            throw new Error(`Invalid imageOrder entry: ${orderInfo}`);
          }
        }
      } else {
        // If no image order provided, just combine existing and new paths
        finalImagePaths = [
          ...existingImagePaths,
          ...Array.from(newImagePathMap.values()),
        ];
      }

      // Create updated product object
      const updatedProduct = {
        id: existingProduct.id,
        name: productData.name,
        description: productData.description,
        isActive:
          productData.isActive === "true" || productData.isActive === true,
        imageUrls: finalImagePaths,
        category: categories,
        varieties: varieties,
      };

      await this.productRepository.update(existingProduct.id, updatedProduct);

      // Prepare log IDs in parallel
      const [productLogId, activityLogId] = await Promise.all([
        _generateLogId(id),
        _generateActivityLogId(user.uid),
      ]);

      // Log product changes and activity in parallel
      await Promise.all([
        this.logProductActivity({
          productLogId: productLogId,
          data: updatedProduct,
          action: "Update",
          logIds: [activityLogId],
        }),
        this.logService.logAdminActivity(
          {
            activityType: "PRODUCT_UPDATE",
            user: user,
            action: "UPDATE_PRODUCT",
            targetResource: "products",
            resourceId: id,
            details: `UPDATED product: ${productObj.name} (${id})`,
          },
          [productLogId]
        ),
      ]);
    } catch (error) {
      console.log(error);
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Delete a product and its images
  async deleteProduct(id, user) {
    try {
      // Get product to delete
      const product = await this.productRepository.getById(id);

      if (!product) {
        throw new Error("Product not found");
      }

      // Delete images
      if (product.imageUrls && product.imageUrls.length > 0) {
        await this.imageService.deleteMultiple(product.imageUrls);
      }

      // Delete product
      await this.productRepository.delete(id);

      // Prepare log IDs in parallel
      const [productLogId, activityLogId] = await Promise.all([
        _generateLogId(id),
        _generateActivityLogId(user.uid),
      ]);

      // Log product changes and activity in parallel
      await Promise.all([
        this.logProductActivity({
          productLogId: productLogId,
          data: product,
          action: "Delete",
          logIds: [activityLogId],
        }),
        this.logService.logAdminActivity(
          {
            activityType: "PRODUCT_DELETE",
            user: user,
            action: "DELETE_PRODUCT",
            targetResource: "products",
            resourceId: id,
            details: `DELETED product: ${productObj.name} (${id})`,
          },
          [productLogId]
        ),
      ]);
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Process categories from request
  async processCategories(categoryNames) {
    if (!categoryNames) return [];

    // Ensure categoryNames is an array
    const names = Array.isArray(categoryNames)
      ? categoryNames
      : [categoryNames];

    // Process each category
    for (const name of names) {
      // Check if category exists
      const existingCategory = await this.categoryRepository.getByName(name);

      // Create if it doesn't exist
      if (!existingCategory) {
        const categoryData = {
          // id: generateShortId(), // Add unique ID for category
          name: name,
          isActive: true,
        };

        await this.categoryRepository.create(categoryData);
      }
    }

    return names;
  }

  // async removeCategories(categories) {

  // }

  // Process varieties from request - return plain objects, not class instances
  processVarieties(productData, productId, existingVarieties = []) {
    const varieties = [];
    let index = 0;

    // Create a map of existing varieties by name for quick lookup
    const existingVarietiesMap = {};
    if (existingVarieties && existingVarieties.length > 0) {
      existingVarieties.forEach((v) => {
        if (v.name) {
          existingVarietiesMap[v.name] = v;
        }
      });
    }

    // Process varieties from form data
    while (productData[`varieties[${index}][name]`]) {
      const varietyName = productData[`varieties[${index}][name]`];

      // Check if this variety already exists (by name)
      const existingVariety = existingVarietiesMap[varietyName];

      // Create a plain JavaScript object instead of a Variety class instance
      const variety = {
        id: existingVariety?.id || `${productId}_var_${this.generateVarietyId()}`, // Use existing ID or create new one
        productId: productId, // Link to parent product
        name: varietyName,
        unit: productData[`varieties[${index}][unit]`],
        quantity: Number(productData[`varieties[${index}][quantity]`]),
        price: Number(productData[`varieties[${index}][price]`]),
        isDefault: productData[`varieties[${index}][isDefault]`] === "true",
        onSale: productData[`varieties[${index}][onSale]`] === "true",
      };

      // Add sale information if this variety is on sale
      if (variety.onSale) {
        variety.sale = {
          salePrice: Number(
            productData[`varieties[${index}][sale][salePrice]`]
          ),
          startDate: Timestamp.fromDate(
            new Date(productData[`varieties[${index}][sale][startDate]`])
          ),
          endDate: Timestamp.fromDate(
            new Date(productData[`varieties[${index}][sale][endDate]`])
          ),
        };
      }

      varieties.push(variety);
      index++;
    }

    // Ensure at least one variety
    if (varieties.length === 0) {
      throw new Error("At least one variety is required");
    }

    // Ensure exactly one default variety
    const defaultVarieties = varieties.filter((v) => v.isDefault);

    if (defaultVarieties.length === 0) {
      varieties[0].isDefault = true;
    } else if (defaultVarieties.length > 1) {
      // Keep only the first default variety
      for (let i = 1; i < varieties.length; i++) {
        if (varieties[i].isDefault) {
          varieties[i].isDefault = false;
        }
      }
    }

    return varieties;
  }

  // Handle image changes during update
  async handleImageChanges(
    currentImageUrls,
    newImageFiles,
    existingImagePaths,
    removedImagePaths
  ) {
    // Convert to arrays if not already
    existingImagePaths = Array.isArray(existingImagePaths)
      ? existingImagePaths
      : existingImagePaths
      ? [existingImagePaths]
      : [];

    removedImagePaths = Array.isArray(removedImagePaths)
      ? removedImagePaths
      : removedImagePaths
      ? [removedImagePaths]
      : [];

    // Delete removed images
    if (removedImagePaths.length > 0) {
      await this.imageService.deleteMultiple(removedImagePaths);
    }

    // Upload new images
    const newImageUrls = newImageFiles
      ? await this.imageService.uploadMultiple(newImageFiles)
      : [];

    // Combine existing and new image URLs
    return [...existingImagePaths, ...newImageUrls];
  }

  // Get all products
  async getAllProducts() {
    try {
      return await this.productRepository.getAll();
    } catch (error) {
      console.log(error);
    }
  }

  // Get product by ID
  async getProductById(id) {
    return await this.productRepository.getById(id);
  }

  // Get products by category
  async getProductsByCategory(category) {
    return await this.productRepository.getByCategory(category);
  }

  // Get products on sale
  async getProductsOnSale() {
    return await this.productRepository.getOnSale();
  }

  /**
   * Log a product activity
   * @param {Object} productLogId - Product log id
   * @param {Object} data - Product data
   * @param {Array} logIds - Ids of connected logs
   * @param {String} action - Action performed (Created, Updated, Deleted, etc.)
   * @returns {Promise<Object>} Created log
   */
  async logProductActivity({ productLogId, data, action, logIds }) {
    try {
      // const logId = this._generateLogId(data.id);

      const logData = {
        timestamp: Timestamp.now(),
        product: {
          id: data.id,
          name: data.name,
          description: data.description || "",
          isActive: data.isActive || false,
          category: data.category || [],
          imageUrls: data.imageUrls || [],
          varieties: data.varieties || [],
        },
        action: action || "",
        linkedLogId: logIds || [],
        details: `Product ${data.name} (${data.id}) ${action}`,
      };

      // await db.collection(this.productLogsCollection).doc(productLogId).set(logData);
      await this.productRepository.logProductActivity(productLogId, logData);

      return { id: productLogId, ...logData };
    } catch (error) {
      console.error("Error logging product activity:", error);
      return null;
    }
  }
}

module.exports = ProductService;
