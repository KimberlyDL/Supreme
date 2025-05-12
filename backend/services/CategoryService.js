// backend/services/CategoryService.js
// This class contains business logic for categories

const CategoryRepository = require("../repositories/CategoryRepository")
const Category = require("../models/Category")

class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository()
  }

  // // Create a new category
  // async createCategory(categoryData) {
  //   try {
  //     const category = new Category(categoryData)
  //     return await this.categoryRepository.create(category)
  //   } catch (error) {
  //     throw new Error(`Error creating category: ${error.message}`)
  //   }
  // }

  // // Get all categories
  // async getAllCategories() {
  //   return await this.categoryRepository.getAll()
  // }

  // // Get active categories
  // async getActiveCategories() {
  //   return await this.categoryRepository.getActive()
  // }

  // // Get category by ID
  // async getCategoryById(id) {
  //   return await this.categoryRepository.getById(id)
  // }

  // // Get category by name
  // async getCategoryByName(name) {
  //   return await this.categoryRepository.getByName(name)
  // }

  // // Update a category
  // async updateCategory(id, categoryData) {
  //   return await this.categoryRepository.update(id, categoryData)
  // }

  // // Delete a category
  // async deleteCategory(id) {
  //   return await this.categoryRepository.delete(id)
  // }



  // Get all categories
  async getAllCategories() {
    return this.categoryRepository.getAll()
  }

  // Get active categories
  async getActiveCategories() {
    return this.categoryRepository.getActive()
  }

  // Get category by ID
  async getCategoryById(id) {
    return this.categoryRepository.getById(id)
  }

  // Get category by name
  async getCategoryByName(name) {
    return await this.categoryRepository.getByName(name)
  }

  // Create a new category
  async createCategory(categoryData) {
    // Check if category with same name already exists
    const existingCategory = await this.categoryRepository.getByName(categoryData.name)
    if (existingCategory) {
      throw new Error("Category with this name already exists")
    }

    return this.categoryRepository.create(categoryData)
  }

  // Update a category
  async updateCategory(id, categoryData) {
    // Check if category exists
    const existingCategory = await this.categoryRepository.getById(id)
    if (!existingCategory) {
      throw new Error("Category not found")
    }

    // Check if new name conflicts with another category
    if (categoryData.name && categoryData.name !== existingCategory.name) {
      const categoryWithSameName = await this.categoryRepository.getByName(categoryData.name)
      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw new Error("Another category with this name already exists")
      }
    }

    return this.categoryRepository.update(id, categoryData)
  }

  // Delete a category
  async deleteCategory(id) {
    // Check if category exists
    const existingCategory = await this.categoryRepository.getById(id)
    if (!existingCategory) {
      throw new Error("Category not found")
    }

    return this.categoryRepository.delete(id)
  }
}

module.exports = CategoryService

