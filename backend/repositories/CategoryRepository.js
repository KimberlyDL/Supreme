// backend\repositories\CategoryRepository.js
// This class handles all database operations for categories

const { db, Timestamp } = require("../config/firebase")
const Category = require("../models/Category")

class CategoryRepository {
  constructor() {
    this.collection = "categories"
  }

  // Create a new category
  async create(categoryData) {
    try {
      // Ensure we're working with a plain object, not a class instance
      let dataToSave = categoryData

      // If it's a Category instance, convert it to a plain object
      if (categoryData instanceof Category) {
        dataToSave = categoryData.toDatabase()
      }

      // Set timestamps
      dataToSave.createdAt = Timestamp.now()
      dataToSave.updatedAt = Timestamp.now()

      // Save to database
      const docRef = await db.collection(this.collection).add(dataToSave)

      // Return category with ID
      return { id: docRef.id, ...dataToSave }
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`)
    }
  }

  // Get all categories
  async getAll() {
    try {
      const snapshot = await db.collection(this.collection).get()

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`)
    }
  }

  // Get active categories
  async getActive() {
    try {
      const snapshot = await db.collection(this.collection).where("isActive", "==", true).get()

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      throw new Error(`Error fetching active categories: ${error.message}`)
    }
  }

  // Get category by ID
  async getById(id) {
    try {
      const doc = await db.collection(this.collection).doc(id).get()

      if (!doc.exists) {
        return null
      }

      return {
        id: doc.id,
        ...doc.data(),
      }
    } catch (error) {
      throw new Error(`Error fetching category: ${error.message}`)
    }
  }

  // Get category by name
  async getByName(name) {
    try {
      const snapshot = await db.collection(this.collection).where("name", "==", name).limit(1).get()

      if (snapshot.empty) {
        return null
      }

      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
      }
    } catch (error) {
      throw new Error(`Error fetching category by name: ${error.message}`)
    }
  }

  // Update category
  async update(id, categoryData) {
    try {
      // Ensure we're working with a plain object, not a class instance
      let dataToSave = categoryData

      // If it's a Category instance, convert it to a plain object
      if (categoryData instanceof Category) {
        dataToSave = categoryData.toDatabase()
      }

      // Set updated timestamp
      dataToSave.updatedAt = Timestamp.now()

      // Update in database
      await db.collection(this.collection).doc(id).update(dataToSave)

      // Return updated category
      return {
        id,
        ...dataToSave,
      }
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`)
    }
  }

  // Delete category
  async delete(id) {
    try {
      await db.collection(this.collection).doc(id).delete()
      return true
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`)
    }
  }


  async deleteCategories(categories) {
    try {
      let batch = db.batch();
      let opCount = 0;

      for (const name of categories) {
        const snapshot = await db.collection('categories').where('name', '==', name).get();

        snapshot.forEach(doc => {
          batch.delete(doc.ref);
          opCount++;
        });

        // If you hit 500, commit and reset
        if (opCount >= 500) {
          await batch.commit();
          batch = db.batch();
          opCount = 0;
        }
      }

      if (opCount > 0) {
        await batch.commit();
      }

      console.log(`Deleted documents from ${this.collection}`);
    } catch (error) {
      console.error("Error deleting documents:", error);
      throw error;
    }
  }
}

module.exports = CategoryRepository

// Compare this snippet from backend/repositories/CategoryRepository.js:

// // backend/repositories/CategoryRepository.js
// // This class handles all database operations for categories

// const { db, Timestamp } = require("../config/firebase")
// const Category = require("../models/Category")

// class CategoryRepository {
//   constructor() {
//     this.collection = "categories"
//   }

//   // Create a new category
//   async create(category) {
//     try {
//       // Ensure category is a Category instance
//       if (!(category instanceof Category)) {
//         category = new Category(category)
//       }

//       // Validate category data
//       category.validate()

//       // Set timestamps
//       category.createdAt = Timestamp.now()
//       category.updatedAt = Timestamp.now()

//       // Save to database
//       const docRef = await db.collection(this.collection).add(category.toDatabase())

//       // Return category with ID
//       category.id = docRef.id
//       return category
//     } catch (error) {
//       throw new Error(`Error creating category: ${error.message}`)
//     }
//   }

//   // Get all categories
//   async getAll() {
//     try {
//       const snapshot = await db.collection(this.collection).get()

//       return snapshot.docs.map((doc) => Category.fromDatabase(doc.id, doc.data()))
//     } catch (error) {
//       throw new Error(`Error fetching categories: ${error.message}`)
//     }
//   }

//   // Get active categories
//   async getActive() {
//     try {
//       const snapshot = await db.collection(this.collection).where("isActive", "==", true).get()

//       return snapshot.docs.map((doc) => Category.fromDatabase(doc.id, doc.data()))
//     } catch (error) {
//       throw new Error(`Error fetching active categories: ${error.message}`)
//     }
//   }

//   // Get category by ID
//   async getById(id) {
//     try {
//       const doc = await db.collection(this.collection).doc(id).get()

//       if (!doc.exists) {
//         return null
//       }

//       return Category.fromDatabase(doc.id, doc.data())
//     } catch (error) {
//       throw new Error(`Error fetching category: ${error.message}`)
//     }
//   }

//   // Get category by name
//   async getByName(name) {
//     try {
//       const snapshot = await db.collection(this.collection).where("name", "==", name).limit(1).get()

//       if (snapshot.empty) {
//         return null
//       }

//       const doc = snapshot.docs[0]
//       return Category.fromDatabase(doc.id, doc.data())
//     } catch (error) {
//       throw new Error(`Error fetching category by name: ${error.message}`)
//     }
//   }

//   // Update category
//   async update(id, categoryData) {
//     try {
//       // Get existing category
//       const existingCategory = await this.getById(id)

//       if (!existingCategory) {
//         throw new Error("Category not found")
//       }

//       // Create updated category
//       const updatedCategory = new Category({
//         ...existingCategory,
//         ...categoryData,
//         id: id,
//         updatedAt: Timestamp.now(),
//       })

//       // Validate updated category
//       updatedCategory.validate()

//       // Update in database
//       await db.collection(this.collection).doc(id).update(updatedCategory.toDatabase())

//       return updatedCategory
//     } catch (error) {
//       throw new Error(`Error updating category: ${error.message}`)
//     }
//   }

//   // Delete category
//   async delete(id) {
//     try {
//       await db.collection(this.collection).doc(id).delete()
//       return true
//     } catch (error) {
//       throw new Error(`Error deleting category: ${error.message}`)
//     }
//   }
// }

// module.exports = CategoryRepository

