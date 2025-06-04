// backend\controllers\ProductController.js
// This class handles HTTP requests for products

// Import necessary modules
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { bucket } = require("../config/firebase"); // Assuming firebase config is in this path
const CategoryModel = require("../models/CategoryModel"); // Assuming CategoryModel is in this path
const { Timestamp } = require("firebase-admin/firestore");
const ProductModel = require("../models/ProductModel");
const ProductService = require("../services/ProductService");

const productService = new ProductService();

const ProductController = {
  // constructor() {
  // t productService = new ProductService();
  // }

  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const products = await productService.getAllProducts();
      return res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      return res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ error: "Failed to fetch product" });
    }
  },

  // Add a new product
  addProduct: async (req, res) => {
    try {
      const productData = req.body;
      const user = req.user;
      const productFiles = req.files?.["images[]"];

      console.log(productData, productFiles);

      // return;

      if (
        !req.files ||
        (!req.files.image && !req.files.images && !productFiles)
      ) {
        return res.status(400).json({ error: "Product image is required" });
      }
      // Extract image order information
      const imageOrder = [];
      for (let i = 0; i < 100; i++) {
        const orderKey = `imageOrder[${i}]`;
        if (productData[orderKey]) {
          imageOrder.push(productData[orderKey]);
        } else {
          break;
        }
      }

      const newProduct = await productService.createProduct(
        productData,
        productFiles,
        imageOrder,
        user
      );

      return res.status(201).json({
        message: "Product created successfully",
        productData: newProduct,
      });
    } catch (error) {
      console.error("Failed to add product:", error);
      return res
        .status(500)
        .json({ error: "Failed to add product: " + error.message });
    }
  },

  // // Update a product
  // editProduct: async (req, res) =>  {
  //   try {
  //     const { id } = req.params
  //     const productData = req.body
  //     const productFiles = req.files?.["images[]"]

  //     console.log("productData", productData)

  //     console.log("productFiles", productFiles)

  //     const updatedProduct = await productService.updateProduct(
  //       id,
  //       productData,
  //       productFiles,
  //       productData.existingImagePaths,
  //       productData.removedImagePaths,
  //     )

  //     return res.status(200).json({
  //       message: "Product updated successfully",
  //       product: updatedProduct,
  //     })
  //   } catch (error) {
  //     console.error("Failed to update product:", error)
  //     return res.status(500).json({ error: "Failed to update product: " + error.message })
  //   }
  // }

  // edit product with image order feature
  // editProduct: async (req, res) =>  {
  //   try {
  //     const { id } = req.params;
  //     const productData = req.body;

  //     // Extract new image files
  //     let newImageFiles = [];
  //     if (req.files) {
  //       // Check for indexed image files
  //       const imageFiles = {};
  //       let hasIndexedFiles = false;

  //       Object.keys(req.files).forEach((key) => {
  //         const match = key.match(/^images\[(\d+)\]$/);
  //         if (match) {
  //           const index = parseInt(match[1]);
  //           imageFiles[index] = req.files[key];
  //           hasIndexedFiles = true;
  //         }
  //       });

  //       if (hasIndexedFiles) {
  //         // Convert to array in correct order
  //         const indices = Object.keys(imageFiles)
  //           .map(Number)
  //           .sort((a, b) => a - b);

  //         newImageFiles = indices.map((index) => imageFiles[index]);
  //       } else if (req.files["images[]"]) {
  //         // Fall back to the original method
  //         newImageFiles = Array.isArray(req.files["images[]"])
  //           ? req.files["images[]"]
  //           : [req.files["images[]"]];
  //       }
  //     }

  //     // Extract existing image paths
  //     const existingImagePaths = [];
  //     const existingPathsMap = {};

  //     Object.keys(productData).forEach((key) => {
  //       const match = key.match(/^existingImagePaths\[(\d+)\]$/);
  //       if (match) {
  //         const index = parseInt(match[1]);
  //         existingPathsMap[index] = productData[key];
  //       }
  //     });

  //     // Convert to array in correct order
  //     const existingIndices = Object.keys(existingPathsMap)
  //       .map(Number)
  //       .sort((a, b) => a - b);

  //     existingImagePaths.push(
  //       ...existingIndices.map((index) => existingPathsMap[index])
  //     );

  //     // Extract removed image paths
  //     const removedImagePaths = [];

  //     Object.keys(productData).forEach((key) => {
  //       const match = key.match(/^removedImagePaths\[(\d+)\]$/);
  //       if (match) {
  //         removedImagePaths.push(productData[key]);
  //       }
  //     });

  //     // Extract image order information
  //     const imageOrder = [];
  //     const imageOrderMap = {};

  //     Object.keys(productData).forEach((key) => {
  //       const match = key.match(/^imageOrder\[(\d+)\]$/);
  //       if (match) {
  //         const index = parseInt(match[1]);
  //         imageOrderMap[index] = productData[key];
  //       }
  //     });

  //     // Convert to array in correct order
  //     const orderIndices = Object.keys(imageOrderMap)
  //       .map(Number)
  //       .sort((a, b) => a - b);

  //     imageOrder.push(...orderIndices.map((index) => imageOrderMap[index]));

  //     // Update the product
  //     const updatedProduct = await productService.updateProduct(
  //       id,
  //       productData,
  //       newImageFiles,
  //       existingImagePaths,
  //       removedImagePaths,
  //       imageOrder // Pass the image order to the service
  //     );

  //     return res.status(200).json({
  //       message: "Product updated successfully",
  //       product: updatedProduct,
  //     });
  //   } catch (error) {
  //     console.error("Failed to update product:", error);
  //     return res
  //       .status(500)
  //       .json({ error: "Failed to update product: " + error.message });
  //   }
  // }
  editProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;
      const user = req.user;

      // Extract new image files
      const newImageFiles = req.files?.["images[]"] || [];

      console.log("productData", productData);
      console.log("newImageFiles", newImageFiles);

      // return;

      // Extract existing image paths
      const existingImagePaths = [];
      if (productData.existingImagePaths) {
        if (Array.isArray(productData.existingImagePaths)) {
          existingImagePaths.push(...productData.existingImagePaths);
        } else {
          existingImagePaths.push(productData.existingImagePaths);
        }
      }

      // Extract removed image paths
      const removedImagePaths = [];
      if (productData.removedImagePaths) {
        if (Array.isArray(productData.removedImagePaths)) {
          removedImagePaths.push(...productData.removedImagePaths);
        } else {
          removedImagePaths.push(productData.removedImagePaths);
        }
      }

      // Extract image order information
      const imageOrder = [];
      for (let i = 0; i < 100; i++) {
        const orderKey = `imageOrder[${i}]`;
        if (productData[orderKey]) {
          imageOrder.push(productData[orderKey]);
        } else {
          break;
        }
      }

      const updatedProduct = await productService.updateProduct(
        id,
        productData,
        newImageFiles,
        existingImagePaths,
        removedImagePaths,
        imageOrder,
        user
      );

      return res.status(200).json({
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Failed to update product:", error);
      return res
        .status(500)
        .json({ error: "Failed to update product: " + error.message });
    }
  },

  // Delete a product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const user = req.user;

      await productService.deleteProduct(id, user);

      return res.status(200).json({
        message: "Product and associated images deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete product:", error);
      return res
        .status(500)
        .json({ error: "Failed to delete product: " + error.message });
    }
  },

  // Get products by category
  getProductsByCategory: async (req, res) => {
    try {
      const { category } = req.params;
      const products = await productService.getProductsByCategory(category);

      return res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch products by category" });
    }
  },

  removeCategories: async (req, res) => {
    try {
      const { categories } = req.body;
      const user = req.user;

      await this.productRepository.removeCategoriesFromProducts(categories, user);
      return res.status(200).json({
        message: `Removed categories ${categories.join(", ")} from products.`,
      });
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch products by category" });
    }
  },

  // Get products on sale
  getProductsOnSale: async (req, res) => {
    try {
      const products = await productService.getProductsOnSale();

      return res.json(products);
    } catch (error) {
      console.error("Error fetching products on sale:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch products on sale" });
    }
  },
};

// // Create singleton instance
// const productController = new ProductController();

// // Export request handler methods bound to the controller instance
// module.exports = {
//   getAllProducts: productController.getAllProducts.bind(productController),
//   getProductById: productController.getProductById.bind(productController),
//   addProduct: productController.addProduct.bind(productController),
//   editProduct: productController.editProduct.bind(productController),
//   deleteProduct: productController.deleteProduct.bind(productController),
//   getProductsByCategory:
//     productController.getProductsByCategory.bind(productController),
//   getProductsOnSale:
//     productController.getProductsOnSale.bind(productController),
// };

module.exports = ProductController;
