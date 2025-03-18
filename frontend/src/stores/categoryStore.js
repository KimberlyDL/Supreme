// {
//     categoryId: "unique-category-id", // Auto-generated or manually assigned unique ID
//     name: "Category Name", // String - Name of the product category
//     description: "A brief description of the category", // String - Optional description
//     createdAt: Timestamp, // Firestore server timestamp for when the category was created
//     updatedAt: Timestamp, // Firestore server timestamp for the last update
//     parentCategory: "parent-category-id", // String - ID of the parent category if nested (optional)
//     status: "active", // String - Status of the category (e.g., "active", "inactive")
//     imageUrl: "https://example.com/image.jpg", // String - Optional URL for a category image
//     displayOrder: 1 // Number - Optional order for display purposes
//   }

// frontend\src\stores\categoryStore.js

import { defineStore } from 'pinia'
import { db, auth } from '@/services/firebase'
import { collection, addDoc, updateDoc, doc, deleteDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { getIdToken } from 'firebase/auth'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_BASE_URL

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
    unsubscribe: null,
    unsubscribeCategories: null,
    fetchedCategories: [],

    // unsubscribeCategories: null,
    // fetchedCategories: []
  }),

  actions: {
    async addCategory(categoryData) {
      try {

        console.log('categoryData', categoryData);

        this.loading = true
        const idToken = await getIdToken(auth.currentUser)

        const response = await axios.post(`${apiUrl}categories`, categoryData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        return response.data
      } catch (error) {
        console.error('Error adding category:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCategory(categoryId, categoryData) {
      try {
        this.loading = true
        const idToken = await getIdToken(auth.currentUser)

        const response = await axios.put(`${apiUrl}categories/${categoryId}`, categoryData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })

        return response.data
      } catch (error) {
        console.error('Error updating category:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteCategory(categoryId) {
      try {
        this.loading = true
        const idToken = await getIdToken(auth.currentUser)

        await axios.delete(`${apiUrl}categories/${categoryId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
      } catch (error) {
        console.error('Error deleting category:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // #region Categories from the branchStore
    fetchCategoriesRealtime() {
      const categoryRef = query(collection(db, 'categories'), where('isActive', '==', true));
      this.unsubscribeCategories = onSnapshot(categoryRef, (snapshot) => {
        this.fetchedCategories = snapshot.docs.map(doc => doc.data().name);
      });
    },

    stopListening() {
      if (this.unsubscribeCategories) {
        this.unsubscribeCategories();
        this.unsubscribeCategories = null;
        this.fetchedCategories = [];
      }
    },
    // #endregion

    // #region Categories same from the branchStore
    fetchCategoryNamesRealtime() {
      if (this.unsubscribeCategories) {
        this.unsubscribeCategories()
      }

      const categoryRef = query(collection(db, 'categories'), where('isActive', '==', true));

      this.unsubscribeCategories = onSnapshot(categoryRef, (snapshot) => {
        this.fetchedCategories = snapshot.docs.map(doc => doc.data().name);
      }, (error) => {
        console.error('Error in realtime category names listener:', error)
      });
    },

    stopListeningCategoryNames() {
      if (this.unsubscribeCategories) {
        this.unsubscribeCategories()
        this.unsubscribeCategories = null
      }
    },
    // #endregion

    setupRealtimeCategories() {
      if (this.unsubscribe) {
        this.unsubscribe()
      }

      const q = query(collection(db, 'categories'), where('isActive', '==', true))

      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.categories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      }, (error) => {
        console.error('Error in realtime categories listener:', error)
        this.error = error.message
      })
    },

    stopListeningCategories() {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
    }
  }
})
