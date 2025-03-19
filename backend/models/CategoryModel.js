// backend/models/CategoryModel.js
const { db, Timestamp } = require('../config/firebase');

const CategoryModel = {
  async addCategory(categoryData) {
    try {
      const categoryRef = await db.collection('categories').add({
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: categoryRef.id, ...categoryData };
    } catch (error) {
      throw new Error('Error saving category data to Firestore: ' + error.message);
    }
  },

  async isCategoryExist(categoryName) {
    try {
      const categorySnapshot = await db.collection('categories')
        .where('name', '==', categoryName)
        .limit(1)
        .get();

      if (categorySnapshot.empty) {
        return null; // No category found
      }

      const categoryDoc = categorySnapshot.docs[0];
      return { id: categoryDoc.id, ...categoryDoc.data() };
    } catch (error) {
      throw new Error('Error retrieving category by name from Firestore: ' + error.message);
    }
  }

};

module.exports = CategoryModel;