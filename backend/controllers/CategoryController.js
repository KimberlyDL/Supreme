// backend/controllers/CategoryController.js
// This class handles HTTP requests for categories

const CategoryService = require("../services/CategoryService")

class CategoryController {
  constructor() {
    this.categoryService = new CategoryService()
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
}

// Create singleton instance
const categoryController = new CategoryController()

// Export request handler methods bound to the controller instance
module.exports = {
  getCategories: categoryController.getCategories.bind(categoryController),
  getActiveCategories: categoryController.getActiveCategories.bind(categoryController),
  addCategory: categoryController.addCategory.bind(categoryController),
  updateCategory: categoryController.updateCategory.bind(categoryController),
  deleteCategory: categoryController.deleteCategory.bind(categoryController),
}

