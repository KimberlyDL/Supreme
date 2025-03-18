// backend/models/ProductModel.js
const { db, Timestamp } = require('../config/firebase');

const ProductModel = {
  async createProduct(productData) {
    try {
      const productRef = await db.collection('products').add({
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: productRef.id, ...productData };
    } catch (error) {
      throw new Error('Error saving product data to Firestore: ' + error.message);
    }
  },

  async getAllProducts() {
    try {
      const productsSnapshot = await db.collection('products').get();
      return productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Error fetching products from Firestore: ' + error.message);
    }
  },

  async getProductById(productId) {
    try {
      const productDoc = await db.collection('products').doc(productId).get();
      if (!productDoc.exists) {
        return null;
      }
      return { id: productDoc.id, ...productDoc.data() };
    } catch (error) {
      throw new Error('Error fetching product from Firestore: ' + error.message);
    }
  },

  // async updateProduct(productId, productData) {
  //   try {
  //     const productRef = db.collection('products').doc(productId);
  //     await productRef.update({
  //       ...productData,
  //       updatedAt: new Date(),
  //     });
  //     const updatedProduct = await productRef.get();
  //     return { id: updatedProduct.id, ...updatedProduct.data() };
  //   } catch (error) {
  //     throw new Error('Error updating product in Firestore: ' + error.message);
  //   }
  // },

  async updateProduct(productId, productData) {
    try {
      const productRef = db.collection("products").doc(productId)

      await productRef.update({
        ...productData,
        updatedAt: new Date(),
      })

      const updatedDoc = await productRef.get()
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      throw new Error("Error updating product in Firestore: " + error.message)
    }
  },


  async deleteProduct(productId) {
    try {
      await db.collection('products').doc(productId).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting product from Firestore: ' + error.message);
    }
  },
  
  // Get the names of all active branches
  async getActiveCategories() {
    const branchRef = db.collection('categories').where('isActive', '==', true);
    const snapshot = await branchRef.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => doc.data().name);
  },

};

module.exports = ProductModel;