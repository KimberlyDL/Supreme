// src/stores/productStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { auth } from '@/services/firebase';
import { getIdToken } from 'firebase/auth';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
    unsubscribe: null,
  }),
  actions: {
    async setupRealtimeProducts() {
      const auth = getAuth();
      const db = getFirestore();

      if (this.unsubscribe) {
        this.unsubscribe();
      }

      this.loading = true;
      this.error = null;

      try {
        const q = query(collection(db, 'products'));
        
        this.unsubscribe = onSnapshot(q, (querySnapshot) => {
          const products = [];
          querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
          });
          this.products = products;
          this.loading = false;
        }, (error) => {
          console.error('Error fetching products:', error);
          this.error = error.message;
          this.loading = false;
        });
      } catch (error) {
        console.error('Error setting up real-time listener:', error);
        this.error = error.message;
        this.loading = false;
      }
    },

    clearRealtimeProducts() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.products = [];
    },

    async addProduct(productData, productImage) {
      try {
        this.loading = true;
        const idToken = await getIdToken(auth.currentUser);

        let imageUrl = null;
        let fileName = null;

        if (productImage) {
          const formData = new FormData();
          formData.append('file', productImage);

          const uploadResponse = await axios.post(`${apiUrl}products`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${idToken}`,
            },
          });

          imageUrl = uploadResponse.data.fileUrl;
          fileName = uploadResponse.data.fileData.fileName;
        }

        console.log("files", files);

        const response = await axios.post(`${apiUrl}products`, {
          ...productData,
          imageUrl,
          fileName,
        }, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        // this.products.push(response.data);
      } catch (error) {
        console.error('Error adding product:', error);
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