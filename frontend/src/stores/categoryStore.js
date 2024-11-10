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
import { defineStore } from 'pinia';
import axios from 'axios';
import { auth } from '@/services/firebase';
import { getIdToken } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot} from 'firebase/firestore';
import router from '@router';
import { useAuthStore } from './authStore';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useProductStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
    unsubscribe: null,
  }),
  actions: {
    async setupRealtimeCategories() {
      const auth = getAuth();
      const db = getFirestore();

      if (this.unsubscribe) {
        this.unsubscribe();
      }

      this.loading = true;
      this.error = null;

      try {
        const q = query(collection(db, 'categories'));
        
        this.unsubscribe = onSnapshot(q, (querySnapshot) => {
          const categories = [];
          querySnapshot.forEach((doc) => {
            categories.push({ id: doc.id, ...doc.data() });
          });
          this.categories = categories;
          this.loading = false;
        }, (error) => {
          console.error('Categories cannot be loaded:', error);
          this.error = 'Categories cannot be loaded.';
          this.loading = false;
        });
      } catch (error) {
        console.error('Error setting up real-time listener:', error);
        this.error = 'Categories cannot be loaded.';
        this.loading = false;
      }
    },

    clearRealtimeProducts() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.catogories = [];
    },

    async addCategory(categoryData, categoryImage) {
        try {
          this.loading = true;
          const idToken = await getIdToken(auth.currentUser);
  
          const formData = new FormData();
          for (const key in categoryData) {
            formData.append(key, categoryData[key]);
          }
          if (categoryImage) {
            formData.append('image', categoryImage);
          }
  
          const response = await axios.post(`${apiUrl}categories`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${idToken}`,
            },
          });
  
          // The real-time listener will update the categories array
          console.log('Category added:', response.data);
        } catch (error) {
          console.error('Error adding category:', error);
          this.error = error.message;
        } finally {
          this.loading = false;
        }
      },

    async updateProduct(productId, productData, productImage) {
      try {
        this.loading = true;
        const idToken = await getIdToken(auth.currentUser);

        let imageUrl = productData.imageUrl;
        let fileName = productData.fileName;

        if (productImage) {
          const formData = new FormData();
          formData.append('file', productImage);

          const uploadResponse = await axios.post(`${apiUrl}products/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${idToken}`,
            },
          });

          imageUrl = uploadResponse.data.fileUrl;
          fileName = uploadResponse.data.fileData.fileName;
        }

        const response = await axios.put(`${apiUrl}products/${productId}`, {
          ...productData,
          imageUrl,
          fileName,
        }, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          this.products[index] = response.data;
        }
      } catch (error) {
        console.error('Error updating product:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteProduct(productId) {
      try {
        this.loading = true;
        const idToken = await getIdToken(auth.currentUser);
        await axios.delete(`${apiUrl}products/${productId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        this.products = this.products.filter(p => p.id !== productId);
      } catch (error) {
        console.error('Error deleting product:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
});