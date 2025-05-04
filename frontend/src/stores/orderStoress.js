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
  onSnapshot,
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
    unsubscribe: null,
  }),

  actions: {
    async createOrder(orderData) {
      try {

        console.log(orderData);

        this.loading = true
        this.error = null

        const idToken = await getIdToken(auth.currentUser)

        // Transform order data to match backend expectations
        const transformedItems = orderData.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,

          // variety: item.variety,

          varietyName: item.variety.varietyName,
          varietyQuantity: item.variety.varietyQuantity,
          varietyUnit: item.variety.varietyUnit,

          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,

          // Store pricing information for historical reference
          pricingSnapshot: item.pricingSnapshot || {
            // unitPrice: item.unitPrice,
            originalPrice: item.variety?.originalPrice,
            onSale: item.variety?.onSale || false,
            salePrice: item.variety?.salePrice || null,
          },
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

        // Add the new order to the local state
        if (response.data && response.data.order) {
          this.orders.unshift(response.data.order)
        }

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
          variety: item.variety,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          // Preserve pricing information for historical reference
          pricingSnapshot: item.pricingSnapshot || {
            unitPrice: item.unitPrice,
            originalPrice: item.variety?.originalPrice || item.unitPrice,
            isOnSale: item.variety?.isOnSale || false,
            salePrice: item.variety?.salePrice || null,
          },
        }))

        const requestData = {
          id: orderData.id,
          client: orderData.customerName,
          items: transformedItems,
          totalPrice: orderData.totalPrice,
          updatedAt: new Date(),
        }

        // Make API request to update the order
        const response = await axios.put(`${apiUrl}/orders/${orderData.id}`, requestData, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })

        // Update in Firestore directly as a fallback
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

        return response?.data || { success: true }
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

        const idToken = await getIdToken(auth.currentUser)

        // Make API request to void the order
        const response = await axios.patch(
          `${apiUrl}/orders/${orderId}/void`,
          {},
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          },
        )

        // Update in Firestore directly as a fallback
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

        return response?.data || { success: true }
      } catch (error) {
        console.error("Error voiding order:", error)
        this.error = error.message || "Failed to void order"
        throw error
      } finally {
        this.loading = false
      }
    },

    async completeOrder(orderId) {
      try {
        this.loading = true
        this.error = null

        const idToken = await getIdToken(auth.currentUser)

        // Make API request to complete the order
        const response = await axios.patch(
          `${apiUrl}/orders/${orderId}/complete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          },
        )

        // Update in Firestore directly as a fallback
        await updateDoc(doc(db, "orders", orderId), {
          status: "Completed",
          updatedAt: new Date(),
        })

        // Update local state if the order is in our list
        const orderIndex = this.orders.findIndex((order) => order.id === orderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            status: "Completed",
            updatedAt: new Date(),
          }
        }

        return response?.data || { success: true }
      } catch (error) {
        console.error("Error completing order:", error)
        this.error = error.message || "Failed to complete order"
        throw error
      } finally {
        this.loading = false
      }
    },

    // Set up real-time listener for orders
    setupRealtimeOrders() {
      if (this.unsubscribe) {
        this.unsubscribe()
      }

      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(50))

      this.unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const orderData = {
              id: change.doc.id,
              ...change.doc.data(),
            }

            if (change.type === "added") {
              // Check if order already exists in the array
              const existingIndex = this.orders.findIndex((order) => order.id === orderData.id)
              if (existingIndex === -1) {
                this.orders.unshift(orderData)
              }
            } else if (change.type === "modified") {
              const index = this.orders.findIndex((order) => order.id === orderData.id)
              if (index !== -1) {
                this.orders[index] = orderData
              }
            } else if (change.type === "removed") {
              this.orders = this.orders.filter((order) => order.id !== orderData.id)
            }
          })
        },
        (error) => {
          console.error("Error in real-time orders listener:", error)
        },
      )
    },

    // Clean up listener
    stopListening() {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
    },
  },
})

