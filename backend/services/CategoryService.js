// backend/services/CategoryService.js
// This class contains business logic for categories

const CategoryRepository = require("../repositories/CategoryRepository")
const Category = require("../models/Category")

class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository()
  }

  // Create a new category
  async createCategory(categoryData) {
    try {
      const category = new Category(categoryData)
      return await this.categoryRepository.create(category)
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`)
    }
  }

  // Get all categories
  async getAllCategories() {
    return await this.categoryRepository.getAll()
  }

  // Get active categories
  async getActiveCategories() {
    return await this.categoryRepository.getActive()
  }

  // Get category by ID
  async getCategoryById(id) {
    return await this.categoryRepository.getById(id)
  }

  // Get category by name
  async getCategoryByName(name) {
    return await this.categoryRepository.getByName(name)
  }

  // Update a category
  async updateCategory(id, categoryData) {
    return await this.categoryRepository.update(id, categoryData)
  }

  // Delete a category
  async deleteCategory(id) {
    return await this.categoryRepository.delete(id)
  }
}

module.exports = CategoryService

