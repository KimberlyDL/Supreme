// // src/stores/productStore.js
// import { defineStore } from 'pinia';
// import axios from 'axios';
// import { db, auth, storage } from '@/services/firebase';
// import { getIdToken } from 'firebase/auth';
// import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
// import { getDownloadURL, ref as storageRef } from 'firebase/storage';

// const apiUrl = import.meta.env.VITE_API_BASE_URL;

// export const useOrderStore = defineStore('order', {
//   state: () => ({
//     products: [],

//     loading: false,
//     error: null,

//     orders: [],
//     selectedProducts: [],
//     totalPrice: 0,

//     // lastVisible: null,
//     // hasMore: true,
//     // batchSize: 20,
//     // filters: {
//     //   categories: [],
//     //   branch: 'All',
//     //   onSale: false,
//     //   lowStock: false,
//     //   minPrice: null,
//     //   maxPrice: null,
//     // },
//     // unsubscribe: null,
//     // fetchedProducts: null,
//     // unsubscribeProducts: null
//   }), actions: {
//     async createOrder(requestData) {
//       try {
//         this.loading = true;
//         this.error = null;

//         const idToken = await getIdToken(auth.currentUser);

//         await axios.post(`${apiUrl}orders/create`, requestData, {
//           headers: {
//             Authorization: `Bearer ${idToken}`,
//           },
//         });

//         // Remove the deleted product from the local store
//         this.products = this.products.filter(product => product.id !== productId);
//       } catch (error) {
//         console.error('Error creating order:', error);
//         this.error = error.message || 'Failed to delete product';
//         throw error;
//       } finally {
//         this.loading = false;
//       }
//     },
//     addProductToOrder(product, variety, quantity) {
//       const existingItem = this.selectedProducts.find(
//         (item) => item.productName === product.name && item.varietyName === (variety?.varietyName || null)
//       );

//       if (existingItem) {
//         existingItem.quantity += quantity;
//       } else {
//         this.selectedProducts.push({
//           productName: product.name,
//           varietyName: variety?.varietyName || null,
//           varietyQuantity: variety?.varietyQuantity || null,
//           varietyPrice: variety?.varietyPrice || product.basePrice,
//           quantity,
//           totalPrice: (variety?.varietyPrice || product.basePrice) * quantity,
//         });
//       }

//       this.calculateTotal();
//     },

//     removeProductFromOrder(index) {
//       this.selectedProducts.splice(index, 1);
//       this.calculateTotal();
//     },

//     calculateTotal() {
//       this.totalPrice = this.selectedProducts.reduce((sum, item) => sum + item.totalPrice, 0);
//     },

//     async submitOrder(customerName) {
//       try {
//         const payload = {
//           customerName,
//           items: this.selectedProducts,
//           totalPrice: this.totalPrice,
//         };

//         await axios.post('/api/orders/create', payload);

//         this.selectedProducts = [];
//         this.totalPrice = 0;
//       } catch (error) {
//         console.error('Failed to submit order:', error);
//       }
//     },
//     addProductToOrder(product, variety, quantity) {
//       const existingItem = this.selectedProducts.find(
//         (item) => item.productName === product.name && item.varietyName === (variety?.varietyName || null)
//       );

//       if (existingItem) {
//         existingItem.quantity += quantity;
//       } else {
//         this.selectedProducts.push({
//           productName: product.name,
//           varietyName: variety?.varietyName || null,
//           varietyQuantity: variety?.varietyQuantity || null,
//           varietyPrice: variety?.varietyPrice || product.basePrice,
//           quantity,
//           totalPrice: (variety?.varietyPrice || product.basePrice) * quantity,
//         });
//       }

//       this.calculateTotal();
//     },




//   },
// });


// src/stores/orderStore.ts
// src/stores/orderStore.js
import { defineStore } from "pinia"
import axios from "axios"
import { db, auth } from "@/services/firebase"
import { getIdToken } from "firebase/auth"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore"

const apiUrl = import.meta.env.VITE_API_BASE_URL

export const useOrderStore = defineStore("order", {
  state: () => ({
    loading: false,
    error: null,

    orders: [],
    totalOrders: 0,
    lastVisible: null,
    hasMore: true,
  }),

  actions: {
    async createOrder(orderData) {
      try {
        this.loading = true
        this.error = null

        const idToken = await getIdToken(auth.currentUser)

        // Transform order data to match backend expectations
        const transformedItems = orderData.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          variety: item.variety
            ? {
              varietyName: item.variety.unit,
              varietyQuantity: item.variety.quantity,
              varietyPrice: item.variety.discountPrice,
            }
            : null,
          unitPrice: item.pricePerUnit,
          discount: null, // Add discount if needed
          totalPrice: item.totalPrice,
        }))

        const requestData = {
          customerName: orderData.customerName,
          items: transformedItems,
          totalPrice: orderData.totalPrice,
        }

        const response = await axios.post(`${apiUrl}orders/create`, requestData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })

        return response.data
      } catch (error) {
        console.error("Error creating order:", error)
        this.error = error.message || "Failed to create order"
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOrders(options = {}) {
      try {
        this.loading = true
        this.error = null

        const { page = 1, limit: pageLimit = 10, status = "all", startDate, endDate, search = "" } = options

        // Reset if it's a new search or first page
        if (page === 1) {
          this.orders = []
          this.lastVisible = null
          this.hasMore = true
        }

        // If we've already determined there are no more results
        if (page > 1 && !this.hasMore) {
          return []
        }

        const ordersQuery = collection(db, "orders")
        const constraints = []

        // Add filters
        if (status && status !== "all") {
          constraints.push(where("status", "==", status))
        }

        if (startDate && endDate) {
          const startTimestamp = Timestamp.fromDate(new Date(startDate))
          const endTimestamp = Timestamp.fromDate(new Date(endDate))
          constraints.push(where("createdAt", ">=", startTimestamp))
          constraints.push(where("createdAt", "<=", endTimestamp))
        }

        // Add search if provided
        if (search) {
          // This is a simple implementation - for more complex search you might need a different approach
          constraints.push(where("client", ">=", search))
          constraints.push(where("client", "<=", search + "\uf8ff"))
        }

        // Add sorting and pagination
        constraints.push(orderBy("createdAt", "desc"))

        if (this.lastVisible) {
          constraints.push(startAfter(this.lastVisible))
        }

        constraints.push(limit(pageLimit))

        // Execute query
        const q = query(ordersQuery, ...constraints)
        const querySnapshot = await getDocs(q)

        // Process results
        const orders = []
        querySnapshot.forEach((doc) => {
          orders.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        // Update state
        this.orders = page === 1 ? orders : [...this.orders, ...orders]
        this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null
        this.hasMore = querySnapshot.docs.length === pageLimit
        this.totalOrders = this.orders.length + (this.hasMore ? 1 : 0) // Approximate count

        return this.orders
      } catch (error) {
        console.error("Error fetching orders:", error)
        this.error = error.message || "Failed to fetch orders"
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOrderById(orderId) {
      try {
        this.loading = true
        this.error = null

        const orderDoc = await getDoc(doc(db, "orders", orderId))

        if (!orderDoc.exists()) {
          throw new Error("Order not found")
        }

        return {
          id: orderDoc.id,
          ...orderDoc.data(),
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        this.error = error.message || "Failed to fetch order"
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateOrder(orderData) {
      try {
        this.loading = true
        this.error = null

        const idToken = await getIdToken(auth.currentUser)

        // Transform order data to match backend expectations
        const transformedItems = orderData.items.map((item) => ({
          productId: item.productId,
          product: item.productName,
          quantity: item.quantity,
          variety: item.variety
            ? {
              varietyName: item.variety.unit,
              varietyQuantity: item.variety.quantity,
              varietyPrice: item.variety.discountPrice,
            }
            : null,
          discount: null,
          totalPrice: item.totalPrice,
        }))

        const requestData = {
          id: orderData.id,
          client: orderData.customerName,
          items: transformedItems,
          totalPrice: orderData.totalPrice,
          updatedAt: new Date(),
        }

        // Update in Firestore directly
        await updateDoc(doc(db, "orders", orderData.id), {
          client: requestData.client,
          items: requestData.items,
          totalPrice: requestData.totalPrice,
          updatedAt: requestData.updatedAt,
        })

        // Update local state if the order is in our list
        const orderIndex = this.orders.findIndex((order) => order.id === orderData.id)
        if (orderIndex !== -1) {
          this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            client: requestData.client,
            items: requestData.items,
            totalPrice: requestData.totalPrice,
            updatedAt: requestData.updatedAt,
          }
        }

        return { success: true }
      } catch (error) {
        console.error("Error updating order:", error)
        this.error = error.message || "Failed to update order"
        throw error
      } finally {
        this.loading = false
      }
    },

    async voidOrder(orderId) {
      try {
        this.loading = true
        this.error = null

        // Update in Firestore directly
        await updateDoc(doc(db, "orders", orderId), {
          status: "Voided",
          updatedAt: new Date(),
        })

        // Update local state if the order is in our list
        const orderIndex = this.orders.findIndex((order) => order.id === orderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            status: "Voided",
            updatedAt: new Date(),
          }
        }

        return { success: true }
      } catch (error) {
        console.error("Error voiding order:", error)
        this.error = error.message || "Failed to void order"
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})



