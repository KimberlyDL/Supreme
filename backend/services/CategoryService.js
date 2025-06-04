// backend/services/CategoryService.js
// This class contains business logic for categories

const CategoryRepository = require("../repositories/CategoryRepository");
// const Category = require("../models/Category")
const { _generateShortId } = require("../utilities/utils");

class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
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
    return this.categoryRepository.getAll();
  }

  // Get active categories
  async getActiveCategories() {
    return this.categoryRepository.getActive();
  }

  // Get category by ID
  async getCategoryById(id) {
    return this.categoryRepository.getById(id);
  }

  // Get category by name
  async getCategoryByName(name) {
    return await this.categoryRepository.getByName(name);
  }

  // Get category by name
  async getCategoryNames() {
    return await this.categoryRepository.getNames();
  }

  // Create a new category
  async createCategory(categoryData) {
    try {
      // Check if category with same name already exists
      const existingCategory = await this.categoryRepository.getByName(
        categoryData.name
      );

      if (existingCategory) {
        const error = new Error(
          "Category with this name already exists"
        );
        error.displayToUser = true;
        throw error;
      }

      const id = _generateShortId("CAT");
      const data = {
        isActive: categoryData.isActive,
        name: categoryData.name,
      };

      return this.categoryRepository.create(id, data);
      
    } catch (error) {
      if (error.displayToUser) throw error;
    }
  }

  // Update a category
  async updateCategory(id, categoryData) {
    try {
      const existingCategory = await this.categoryRepository.getById(id);
      if (!existingCategory) {
        const error = new Error("Category not found");
        error.displayToUser = true;
        throw error;
      }

      if (categoryData.name && categoryData.name !== existingCategory.name) {
        const categoryWithSameName = await this.categoryRepository.getByName(
          categoryData.name
        );
        if (categoryWithSameName && categoryWithSameName.id !== id) {
          const error = new Error(
            "Another category with this name already exists"
          );
          error.displayToUser = true;
          throw error;
        }
      }

      return this.categoryRepository.update(id, categoryData);
      
    } catch (error) {
      if (error.displayToUser) throw error;
    }
  }

  // Delete a category
  async deleteCategory(id) {
    // Check if category exists
    const existingCategory = await this.categoryRepository.getById(id);
    if (!existingCategory) {
      throw new Error("Category not found");
    }

    return this.categoryRepository.delete(id);
  }
}

module.exports = CategoryService;
