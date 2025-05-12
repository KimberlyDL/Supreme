// backend/controllers/CategoryController.js
// This class handles HTTP requests for categories

const CategoryService = require("../services/CategoryService");
const CategoryRepository = require("../repositories/CategoryRepository")
const ProductService = require("../services/ProductService");
const ProductRepository = require("../repositories/ProductRepository");

class CategoryController {
  constructor() {
    this.categoryService = new CategoryService()
    this.categoryRepository = new CategoryRepository()
    this.productService = new ProductService()
    this.productRepository = new ProductRepository()
  }

  async getActiveCategoriesWithProducts(req, res) {
    // try {
    //   const categories = await this.categoryService.getActiveCategories();

    //   const products = await this.productService.getAllProducts();

    // } catch (error) {
    //   console.error("Error fetching categories:", error)
    //   return res.status(500).json({ error: "Failed to fetch categories" })
    // }


    // const { getStorage } = require('firebase-admin/storage');
    // const { getDocs, collection } = require('firebase-admin/firestore');
    // const db = require('./firebase-config'); // or however you setup Firestore


    try {
      const categories = await this.categoryService.getActiveCategories();
      const products = await this.productService.getAllProducts();

      const categorizedProducts = categories.map(category => {
        const relatedProducts = products
          .filter(p => p.category?.includes(category.name) && p.isActive) // or name, depends on your structure
          .map(product => ({
            id: product.id,
            name: product.name,
            imagePaths: product.imageUrls || [],
            // other product data
          }
          ));

        return {
          id: category.id,
          name: category.name,
          isActive: category.isActive,
          products: relatedProducts
        };
      });

      return res.status(200).json({ categories: categorizedProducts });
    } catch (error) {
      console.error("Error fetching categories and products:", error);
      return res.status(500).json({ error: "Failed to fetch data" });
    }

  }
  // Get all categories
  async getCategories(req, res) {
    try {
      const categories = await this.categoryService.getAllCategories()
      return res.json(categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      return res.status(500).json({ error: "Failed to fetch categories" })
    }
  }

  // Get active categories
  async getActiveCategories(req, res) {
    try {
      const categories = await this.categoryService.getActiveCategories()
      return res.status(200).json(categories)
    } catch (error) {
      console.error("Error retrieving categories:", error)
      return res.status(500).json({ error: "Failed to retrieve categories" })
    }
  }

  // Add a new category
  async addCategory(req, res) {
    try {
      const categoryData = req.body

      if (!categoryData.name) {
        return res.status(400).json({ error: "Category name is required" })
      }

      const newCategory = await this.categoryService.createCategory({
        ...categoryData,
        isActive: true,
      })

      return res.status(201).json({
        message: "Category created successfully",
        categoryData: newCategory,
      })
    } catch (error) {
      console.error("Failed to add category:", error)
      return res.status(500).json({ error: "Failed to add category" })
    }
  }

  // Update a category
  async updateCategory(req, res) {
    try {
      const { id } = req.params
      const categoryData = req.body

      const updatedCategory = await this.categoryService.updateCategory(id, categoryData)

      return res.json({
        message: "Category updated successfully",
        categoryData: updatedCategory,
      })
    } catch (error) {
      console.error("Failed to update category:", error)
      return res.status(500).json({ error: "Failed to update category" })
    }
  }

  // Delete a category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params

      await this.categoryService.deleteCategory(id)

      return res.json({
        message: "Category deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete category:", error)
      return res.status(500).json({ error: "Failed to delete category" })
    }
  }

  async deleteCategories(req, res) {
    try {
      const { categories } = req.body

      await this.categoryRepository.deleteCategories(categories)

      await this.productRepository.removeCategoriesFromProducts(categories)

      return res.status(200).json({ message: "Categories deleted" })
    }
    catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Categories failed to delete" })
    }
  }




  
  // async getActiveCategoriesWithProducts(req, res) {
  //   try {
  //     const categories = await this.categoryService.getActiveCategories()
  //     const products = await this.productService.getAllProducts()

  //     const categorizedProducts = categories.map((category) => {
  //       const relatedProducts = products
  //         .filter((p) => p.category?.includes(category.name) && p.isActive) // or name, depends on your structure
  //         .map((product) => ({
  //           id: product.id,
  //           name: product.name,
  //           imagePaths: product.imageUrls || [], // Keep the original paths for Firebase Storage
  //           // other product data
  //         }))

  //       return {
  //         id: category.id,
  //         name: category.name,
  //         isActive: category.isActive,
  //         products: relatedProducts,
  //       }
  //     })

  //     return res.status(200).json({ categories: categorizedProducts })
  //   } catch (error) {
  //     console.error("Error fetching categories and products:", error)
  //     return res.status(500).json({ error: "Failed to fetch data" })
  //   }
  // }

  // // Get all categories
  // async getCategories(req, res) {
  //   try {
  //     const categories = await this.categoryService.getAllCategories()
  //     return res.json(categories)
  //   } catch (error) {
  //     console.error("Error fetching categories:", error)
  //     return res.status(500).json({ error: "Failed to fetch categories" })
  //   }
  // }

  // // Get active categories
  // async getActiveCategories(req, res) {
  //   try {
  //     const categories = await this.categoryService.getActiveCategories()
  //     return res.status(200).json(categories)
  //   } catch (error) {
  //     console.error("Error retrieving categories:", error)
  //     return res.status(500).json({ error: "Failed to retrieve categories" })
  //   }
  // }

  // // Add a new category
  // async addCategory(req, res) {
  //   try {
  //     const categoryData = req.body

  //     if (!categoryData.name) {
  //       return res.status(400).json({ error: "Category name is required" })
  //     }

  //     const newCategory = await this.categoryService.createCategory({
  //       ...categoryData,
  //       isActive: true,
  //     })

  //     return res.status(201).json({
  //       message: "Category created successfully",
  //       categoryData: newCategory,
  //     })
  //   } catch (error) {
  //     console.error("Failed to add category:", error)
  //     return res.status(500).json({ error: "Failed to add category" })
  //   }
  // }

  // // Update a category
  // async updateCategory(req, res) {
  //   try {
  //     const { id } = req.params
  //     const categoryData = req.body

  //     const updatedCategory = await this.categoryService.updateCategory(id, categoryData)

  //     return res.json({
  //       message: "Category updated successfully",
  //       categoryData: updatedCategory,
  //     })
  //   } catch (error) {
  //     console.error("Failed to update category:", error)
  //     return res.status(500).json({ error: "Failed to update category" })
  //   }
  // }

  // // Delete a category
  // async deleteCategory(req, res) {
  //   try {
  //     const { id } = req.params

  //     await this.categoryService.deleteCategory(id)

  //     return res.json({
  //       message: "Category deleted successfully",
  //     })
  //   } catch (error) {
  //     console.error("Failed to delete category:", error)
  //     return res.status(500).json({ error: "Failed to delete category" })
  //   }
  // }

  // async deleteCategories(req, res) {
  //   try {
  //     const { categories } = req.body

  //     await this.categoryRepository.deleteCategories(categories)

  //     await this.productRepository.removeCategoriesFromProducts(categories)

  //     return res.status(200).json({ message: "Categories deleted" })
  //   } catch (error) {
  //     console.log(error)
  //     return res.status(500).json({ error: "Categories failed to delete" })
  //   }
  // }
}

// Create singleton instance
const categoryController = new CategoryController()

// Export request handler methods bound to the controller instance
module.exports = {
  deleteCategories: categoryController.deleteCategories.bind(categoryController),
  getActiveCategoriesWithProducts: categoryController.getActiveCategoriesWithProducts.bind(categoryController),
  getCategories: categoryController.getCategories.bind(categoryController),
  getActiveCategories: categoryController.getActiveCategories.bind(categoryController),
  addCategory: categoryController.addCategory.bind(categoryController),
  updateCategory: categoryController.updateCategory.bind(categoryController),
  deleteCategory: categoryController.deleteCategory.bind(categoryController),
}

