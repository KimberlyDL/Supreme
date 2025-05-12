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

import { defineStore } from "pinia"
import { db, storage } from "@/services/firebase"
// import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import { collection, addDoc, updateDoc, doc, deleteDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import { getDownloadURL, ref as storageRef } from "firebase/storage"
import axios from "axios"

const apiUrl = import.meta.env.VITE_API_BASE_URL

export const useCategoryStore = defineStore("category", {
  state: () => ({
    fetchedCategories: [],
    categoriesWithProducts: [],
    loading: false,
    error: null,
    unsubscribe: null,
    unsubscribeCategories: null,
  }),

  getters: {
    activeCategories() {
      return this.fetchedCategories.filter((cat) => cat.isActive)
    },
  },

  actions: {
    // productStore
    // editProductStore ay awan
    // async fetchCategoryNamesRealtime() {
    //   if (this.unsubscribe) {
    //     this.unsubscribe()
    //   }

    //   try {
    //     const q = query(collection(db, "categories"), orderBy("name"))

    //     this.unsubscribe = onSnapshot(
    //       q,
    //       (snapshot) => {
    //         this.fetchedCategories = snapshot.docs.map((doc) => ({
    //           id: doc.id,
    //           name: doc.data().name,
    //           isActive: doc.data().isActive,
    //         }))
    //       },
    //       (error) => {
    //         console.error("Error fetching categories:", error)
    //         this.error = error.message
    //       },
    //     )
    //   } catch (error) {
    //     console.error("Error setting up categories listener:", error)
    //     this.error = error.message
    //   }
    // },

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

    async fetchCategoriesWithProducts() {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`${apiUrl}categories/withproducts`)
        const categoriesData = response.data.categories || []

        // Process each category to get image URLs for products
        const processedCategories = await Promise.all(
          categoriesData.map(async (category) => {
            // Process products to get image URLs
            const productsWithImages = await Promise.all(
              (category.products || []).map(async (product) => {
                // Get image URLs from Firebase Storage
                const imageUrls = product.imagePaths?.length
                  ? await Promise.all(
                      product.imagePaths.map((path) =>
                        getDownloadURL(storageRef(storage, path)).catch((error) => {
                          console.error(`Error getting URL for ${path}:`, error)
                          return null
                        }),
                      ),
                    )
                  : []

                // Filter out any null URLs (from errors)
                const validImageUrls = imageUrls.filter((url) => url !== null)

                return {
                  ...product,
                  imageUrls: validImageUrls,
                  imageUrl: validImageUrls.length > 0 ? validImageUrls[0] : null,
                }
              }),
            )

            return {
              ...category,
              products: productsWithImages,
            }
          }),
        )

        this.categoriesWithProducts = processedCategories
        return processedCategories
      } catch (error) {
        console.error("Error fetching categories with products:", error)
        this.error = error.message
        return []
      } finally {
        this.loading = false
      }
    },

    async addCategory(categoryData) {
      try {
        const response = await axios.post(`${apiUrl}categories`, categoryData)
        return response.data
      } catch (error) {
        console.error("Error adding category:", error)
        throw error
      }
    },

    async updateCategory(categoryId, categoryData) {
      try {
        const response = await axios.put(`${apiUrl}categories/${categoryId}`, categoryData)
        return response.data
      } catch (error) {
        console.error("Error updating category:", error)
        throw error
      }
    },

    async deleteCategory(categoryId) {
      try {
        await axios.delete(`${apiUrl}categories/${categoryId}`)
        return true
      } catch (error) {
        console.error("Error deleting category:", error)
        throw error
      }
    },

    async moveProductsBetweenCategories(productIds, sourceCategoryId, targetCategoryId, keepInSource = false) {
      try {
        const response = await axios.post(`${apiUrl}products/move-between-categories`, {
          productIds,
          sourceCategoryId,
          targetCategoryId,
          keepInSource,
        })
        return response.data
      } catch (error) {
        console.error("Error moving products between categories:", error)
        throw error
      }
    },

    async removeProductFromCategory(productId, categoryId) {
      try {
        const response = await axios.post(`${apiUrl}products/remove-from-category`, {
          productId,
          categoryId,
        })
        return response.data
      } catch (error) {
        console.error("Error removing product from category:", error)
        throw error
      }
    },

    async removeProductsFromCategory(productIds, categoryId) {
      try {
        const response = await axios.post(`${apiUrl}products/remove-from-category-bulk`, {
          productIds,
          categoryId,
        })
        return response.data
      } catch (error) {
        console.error("Error removing products from category:", error)
        throw error
      }
    },

    stopListeningCategoryNames() {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: "category-store",
        storage: localStorage,
        paths: ["fetchedCategories"],
      },
    ],
  },
})




// import { defineStore } from 'pinia'
// import { db, auth } from '@/services/firebase'
// import { collection, addDoc, updateDoc, doc, deleteDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
// import { getIdToken } from 'firebase/auth'
// import axios from 'axios'

// const apiUrl = import.meta.env.VITE_API_BASE_URL

// export const useCategoryStore = defineStore('category', {
//   state: () => ({
//     categories: [],
//     loading: false,
//     error: null,
//     unsubscribe: null,
//     unsubscribeCategories: null,
//     fetchedCategories: [],

//     // unsubscribeCategories: null,
//     // fetchedCategories: []
//   }),

//   actions: {
//     async addCategory(categoryData) {
//       try {

//         console.log('categoryData', categoryData);

//         this.loading = true
//         const idToken = await getIdToken(auth.currentUser)

//         const response = await axios.post(`${apiUrl}categories`, categoryData, {
//           headers: {
//             Authorization: `Bearer ${idToken}`,
//           },
//         })
//         return response.data
//       } catch (error) {
//         console.error('Error adding category:', error)
//         this.error = error.message
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     async updateCategory(categoryId, categoryData) {
//       try {
//         this.loading = true
//         const idToken = await getIdToken(auth.currentUser)

//         const response = await axios.put(`${apiUrl}categories/${categoryId}`, categoryData, {
//           headers: {
//             Authorization: `Bearer ${idToken}`,
//           },
//         })

//         return response.data
//       } catch (error) {
//         console.error('Error updating category:', error)
//         this.error = error.message
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     async deleteCategory(categoryId) {
//       try {
//         this.loading = true
//         const idToken = await getIdToken(auth.currentUser)

//         await axios.delete(`${apiUrl}categories/${categoryId}`, {
//           headers: {
//             Authorization: `Bearer ${idToken}`,
//           },
//         })
//       } catch (error) {
//         console.error('Error deleting category:', error)
//         this.error = error.message
//         throw error
//       } finally {
//         this.loading = false
//       }
//     },

//     async getCategoriesWithProducts() {
//       try {
//         this.loading = true
//         const idToken = await getIdToken(auth.currentUser)

//         const response = await axios.get(`${apiUrl}categories/categorieswithproduct`, {
//           headers: {
//             Authorization: `Bearer ${idToken}`,
//           },
//         })

//         // for() {}
//       } catch (error) {
        
//       }
//     },
    
//     // #region Categories from the branchStore
//     fetchCategoriesRealtime() {
//       const categoryRef = query(collection(db, 'categories'), where('isActive', '==', true));
//       this.unsubscribeCategories = onSnapshot(categoryRef, (snapshot) => {
//         this.fetchedCategories = snapshot.docs.map(doc => doc.data().name);
//       });
//     },

//     stopListening() {
//       if (this.unsubscribeCategories) {
//         this.unsubscribeCategories();
//         this.unsubscribeCategories = null;
//         this.fetchedCategories = [];
//       }
//     },
//     // #endregion

//     // #region Categories same from the branchStore
//     fetchCategoryNamesRealtime() {
//       if (this.unsubscribeCategories) {
//         this.unsubscribeCategories()
//       }

//       const categoryRef = query(collection(db, 'categories'), where('isActive', '==', true));

//       this.unsubscribeCategories = onSnapshot(categoryRef, (snapshot) => {
//         this.fetchedCategories = snapshot.docs.map(doc => doc.data().name);
//       }, (error) => {
//         console.error('Error in realtime category names listener:', error)
//       });
//     },

//     stopListeningCategoryNames() {
//       if (this.unsubscribeCategories) {
//         this.unsubscribeCategories()
//         this.unsubscribeCategories = null
//       }
//     },
//     // #endregion

//     setupRealtimeCategories() {
//       if (this.unsubscribe) {
//         this.unsubscribe()
//       }

//       const q = query(collection(db, 'categories'), where('isActive', '==', true))

//       this.unsubscribe = onSnapshot(q, (snapshot) => {
//         this.categories = snapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }))
//       }, (error) => {
//         console.error('Error in realtime categories listener:', error)
//         this.error = error.message
//       })
//     },

//     stopListeningCategories() {
//       if (this.unsubscribe) {
//         this.unsubscribe()
//         this.unsubscribe = null
//       }
//     }
//   }
// })
