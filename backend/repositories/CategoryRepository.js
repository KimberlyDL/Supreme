// backend\repositories\CategoryRepository.js
// This class handles all database operations for categories

const { db, Timestamp } = require("../config/firebase");
const Category = require("../models/Category");

class CategoryRepository {
  constructor() {
    this.collection = "categories";
  }

  // #region Create
  async create(id, data) {
    try {
      data.createdAt = Timestamp.now();
      data.updatedAt = Timestamp.now();

      const docRef = await db.collection(this.collection).doc(id).set(data);
      return { id: docRef.id, ...data };
    } catch (error) {
      const err = new Error("Failed to add category");
      err.displayToUser = true;
      throw err;
    }
  }

  // Get all categories
  async getAll() {
    try {
      const snapshot = await db.collection(this.collection).get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }

  // Get all categories names
  async getNames() {
    try {
      const snapshot = await db.collection(this.collection).get();

      return snapshot.docs.map((doc) => doc.data().name);
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }

  // Get active categories
  async getActive() {
    try {
      const snapshot = await db
        .collection(this.collection)
        .where("isActive", "==", true)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error fetching active categories: ${error.message}`);
    }
  }

  // Get category by ID
  async getById(id) {
    try {
      const doc = await db.collection(this.collection).doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      throw new Error(`Error fetching category: ${error.message}`);
    }
  }

  // Get category by name
  async getByName(name) {
    try {
      const snapshot = await db
        .collection(this.collection)
        .where("name", "==", name)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      throw new Error(`Error fetching category by name: ${error.message}`);
    }
  }

  // #region Update
  async update(id, categoryData) {
    try {
      categoryData.updatedAt = Timestamp.now();

      await db.collection(this.collection).doc(id).update(categoryData);

      return {
        id,
        ...categoryData,
      };
    } catch (error) {
      const err = new Error("Failed to update category");
      err.displayToUser = true;
      throw err;
    }
  }

  // #region Delete
  async delete(id) {
    try {
      await db.collection(this.collection).doc(id).delete();
      return true;
    } catch (error) {
      const err = new Error("Failed to delete category");
      err.displayToUser = true;
      throw err;
    }
  }

  //#region delete many
  async deleteCategories(categories) {
    try {
      let batch = db.batch();
      let opCount = 0;

      for (const name of categories) {
        const snapshot = await db
          .collection("categories")
          .where("name", "==", name)
          .get();

        snapshot.forEach((doc) => {
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
      const err = new Error("Failed to delete categories");
      err.displayToUser = true;
      throw err;
    }
  }
}

module.exports = CategoryRepository;
