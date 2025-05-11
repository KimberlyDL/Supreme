// frontend/src/stores/orderStore.js
import { defineStore } from "pinia"
import axios from "axios"
import { db, auth } from "@/services/firebase"
import { getIdToken } from "firebase/auth"
import { computed } from "vue"
import { useInventoryStore } from "@/stores/inventoryStore"
import { useBranchStore } from "@/stores/branchStore"
import { useProductStore } from "@/stores/productStore"
import { isVarietyOnSale, getVarietyPrice, computeOrderTotalPrice, validateSalePrices } from "../utils/priceUtils"

import { collection, query, orderBy, onSnapshot } from "firebase/firestore"

const apiUrl = import.meta.env.VITE_API_BASE_URL

export const useOrderStore = defineStore("order", {
    state: () => ({
        orders: [],
        totalOrders: 0,
        hasMore: false,
        loading: false,
        error: null,
        unsubscribe: null,
        unsubscribeCatalogs: null,
        _listenerStatus: {
            products: false,
            branches: false,
            stock: false,
        },
        saleValidationErrors: [], // For tracking sale validation errors
        stockValidationErrors: [], // For tracking stock validation errors
    }),

    getters: {
        retrieveCategoriesfromProducts: (state) => {
            const inventoryStore = useInventoryStore()
            return computed(() => {
                const categoriesSet = new Set()

                inventoryStore.branchStock.forEach((product) => {
                    product.product?.category?.forEach((cat) => categoriesSet.add(cat))
                })

                return Array.from(categoriesSet)
            })
        },

        // orders
        getOrderById: (state) => (orderId) => {
            return state.orders.find((order) => order.id === orderId)
        },

        pendingOrders: (state) => {
            return state.orders.filter((order) => order.status === "Pending")
        },

        completedOrders: (state) => {
            return state.orders.filter((order) => order.status === "Completed")
        },

        voidedOrders: (state) => {
            return state.orders.filter((order) => order.status === "Voided")
        },

        returnedOrders: (state) => {
            return state.orders.filter((order) => order.status === "Returned")
        },

        // New getter for validation errors
        hasValidationErrors: (state) => {
            return state.saleValidationErrors.length > 0 || state.stockValidationErrors.length > 0
        },
    },
    actions: {
        async setupRealtimeCatalogs() {
            const branchStore = useBranchStore()
            const productStore = useProductStore()
            const inventoryStore = useInventoryStore()

            if (!this._listenerStatus.branches || this._listenerStatus.products) {
                await inventoryStore.initializeListeners()
                this._listenerStatus.products = true
                this._listenerStatus.branches = true
            }

            if (inventoryStore.selectedBranchId) {
                inventoryStore.setSelectedBranch(inventoryStore.selectedBranchId.value)
            }
            if (branchStore.fetchedbranches.length > 0) {
                inventoryStore.setSelectedBranch(branchStore.fetchedbranches[0].id)
            }
        },

        async unsubscribeCatalogs() {
            const inventoryStore = useInventoryStore()
            inventoryStore.clearStockListener()
            inventoryStore.unsubscribeBranches()
            inventoryStore.unsubscribeProducts()
        },

        // Set up real-time listener for orders
        async setupRealtimeOrders() {
            if (this.unsubscribe) {
                this.unsubscribe()
            }

            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))

            this.unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added") {
                            const orderData = { id: change.doc.id, ...change.doc.data() }
                            const index = this.orders.findIndex((o) => o.id === orderData.id)
                            if (index === -1) {
                                this.orders.unshift(orderData)
                            }
                        }
                        if (change.type === "modified") {
                            const orderData = { id: change.doc.id, ...change.doc.data() }
                            const index = this.orders.findIndex((o) => o.id === orderData.id)
                            if (index !== -1) {
                                this.orders[index] = orderData
                            } else {
                                this.orders.unshift(orderData)
                            }
                        }
                        if (change.type === "removed") {
                            this.orders = this.orders.filter((o) => o.id !== change.doc.id)
                        }
                    })
                },
                (error) => {
                    console.error("Error in real-time orders listener:", error)
                    this.error = error.message
                },
            )
        },

        // Clean up listener
        stopRealtimeOrders() {
            if (this.unsubscribe) {
                this.unsubscribe()
                this.unsubscribe = null
            }
        },

        // Fetch orders from backend with filtering and pagination
        async fetchOrders(options = {}) {
            this.loading = true
            this.error = null

            try {
                const { page = 1, limit = 10, status, startDate, endDate, search } = options

                let url = `${apiUrl}orders?limit=${limit}`

                if (status && status !== "all") {
                    url += `&status=${status}`
                }

                if (startDate) {
                    url += `&startDate=${startDate}`
                }

                if (endDate) {
                    url += `&endDate=${endDate}`
                }

                if (search) {
                    url += `&search=${search}`
                }

                // For pagination
                if (page > 1 && this.orders.length > 0) {
                    const lastDoc = this.orders[(page - 1) * limit - 1]
                    if (lastDoc) {
                        url += `&startAfter=${lastDoc.id}`
                    }
                }

                const response = await axios.get(url)

                if (page === 1) {
                    this.orders = response.data
                } else {
                    this.orders = [...this.orders, ...response.data]
                }

                this.hasMore = response.data.length === limit
                this.totalOrders = this.orders.length

                return this.orders
            } catch (error) {
                console.error("Error fetching orders:", error)
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // Fetch a single order by ID
        async fetchOrderById(orderId) {
            this.loading = true
            this.error = null
            try {
                const response = await axios.get(`${apiUrl}orders/${orderId}`)
                return response.data
            } catch (error) {
                console.error("Error fetching order:", error)
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // Validate stock availability before saving order
        async validateOrderStock(orderItems, branchId) {
            const inventoryStore = useInventoryStore()
            this.stockValidationErrors = []

            // Ensure branch stock is loaded
            if (!inventoryStore.branchStock.length) {
                await inventoryStore.setSelectedBranch(branchId)
            }

            // Create a map of stock items for quick lookup
            const stockMap = new Map()
            inventoryStore.branchStock.forEach((item) => {
                const key = `${item.productId}-${item.varietyId}`
                stockMap.set(key, item)
            })

            // Check each item for stock availability
            const stockIssues = []
            for (const item of orderItems) {
                const stockKey = `${item.productId}-${item.varietyId}`
                const stockItem = stockMap.get(stockKey)

                if (!stockItem) {
                    stockIssues.push({
                        item,
                        issue: "Product not found in branch inventory",
                    })
                    continue
                }

                // Check total stock quantity
                if (stockItem.quantity < item.quantity) {
                    stockIssues.push({
                        item,
                        issue: "Insufficient stock",
                        requested: item.quantity,
                        available: stockItem.quantity,
                    })
                }
            }

            if (stockIssues.length > 0) {
                this.stockValidationErrors = stockIssues
                return false
            }

            return true
        },

        // Validate sale prices before saving order
        async validateOrderSalePrices(orderItems) {
            const productStore = useProductStore()
            this.saleValidationErrors = []

            // Ensure products are loaded
            if (productStore.products.length === 0) {
                await productStore.fetchProducts(true)
            }

            // Check each item with sale price
            const invalidItems = validateSalePrices(orderItems, productStore.products)

            if (invalidItems.length > 0) {
                this.saleValidationErrors = invalidItems
                return false
            }

            return true
        },

        async saveAdminOrder({ orderItems, customerName, paymentType, notes, selectedBranchId }) {
            try {
                if (!auth.currentUser) {
                    throw new Error("User is not authenticated")
                }

                console.log('orderItems', orderItems);

                // Validate stock availability and sale prices
                const isStockValid = await this.validateOrderStock(orderItems, selectedBranchId)
                if (!isStockValid) {
                    throw new Error("Stock validation failed. Please check available quantities.")
                }

                const isSalePriceValid = await this.validateOrderSalePrices(orderItems)
                if (!isSalePriceValid) {
                    throw new Error("Some items have invalid sale prices. Please refresh and try again.")
                }

                const token = await auth.currentUser.getIdToken()

                const items = orderItems.map((item) => {
                    const onSale = isVarietyOnSale(item.variety)
                    const unitPrice = getVarietyPrice(item.variety)
                    const quantity = item.quantity

                    return {
                        productId: item.productId,
                        varietyId: item.varietyId,
                        productName: item.product.name,
                        varietyName: item.variety.name,
                        onSale: onSale,
                        sale: onSale
                            ? {
                                startDate: item.variety.sale.startDate,
                                endDate: item.variety.sale.endDate,
                                salePrice: item.variety.sale.salePrice,
                            }
                            : null,
                        unitPrice,
                        quantity,
                        unit: item.variety.unit,
                        totalPrice: unitPrice * quantity || 0,
                    }
                })
                const discounts = 0

                const totalPrice = discounts
                    ? (computeOrderTotalPrice(items) || 0) - discounts
                    : computeOrderTotalPrice(items) || 0

                const payload = {
                    branchId: selectedBranchId,
                    customerName,
                    paymentType,
                    notes: notes || "",
                    discounts,
                    totalPrice,
                    status: "Pending",
                    items,
                    createdAt: new Date().toISOString(),
                }


                console.log('payload', payload);
                
                // Replace with your actual backend endpoint
                const response = await axios.post(`${apiUrl}orders`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                return response.data
            } catch (error) {
                console.error("Error saving order:", error)
                throw error
            }
        },

        // Create a new order
        async createOrder(orderData) {
            this.loading = true
            this.error = null

            try {
                // Validate stock availability and sale prices
                if (orderData.items && orderData.items.length > 0) {
                    const isStockValid = await this.validateOrderStock(orderData.items, orderData.branchId)
                    if (!isStockValid) {
                        throw new Error("Stock validation failed. Please check available quantities.")
                    }

                    const isSalePriceValid = await this.validateOrderSalePrices(orderData.items)
                    if (!isSalePriceValid) {
                        throw new Error("Some items have invalid sale prices. Please refresh and try again.")
                    }
                }

                const idToken = await getIdToken(auth.currentUser)

                const response = await axios.post(`${apiUrl}orders`, orderData, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                })

                // Add the new order to the local state
                if (response.data.order) {
                    const newOrder = response.data.order
                    const index = this.orders.findIndex((o) => o.id === newOrder.id)
                    if (index === -1) {
                        this.orders.unshift(newOrder)
                        this.totalOrders++
                    }
                }

                return response.data
            } catch (error) {
                console.error("Error creating order:", error)
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // Update an existing order
        async updateOrder(orderData) {
            this.loading = true
            this.error = null

            try {
                // Validate stock availability and sale prices
                if (orderData.items && orderData.items.length > 0) {
                    const isStockValid = await this.validateOrderStock(orderData.items, orderData.branchId)
                    if (!isStockValid) {
                        throw new Error("Stock validation failed. Please check available quantities.")
                    }

                    const isSalePriceValid = await this.validateOrderSalePrices(orderData.items)
                    if (!isSalePriceValid) {
                        throw new Error("Some items have invalid sale prices. Please refresh and try again.")
                    }
                }

                const idToken = await getIdToken(auth.currentUser)

                const response = await axios.put(`${apiUrl}orders/${orderData.id}`, orderData, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                })

                // Update the order in the local state
                if (response.data.order) {
                    const updatedOrder = response.data.order
                    const index = this.orders.findIndex((o) => o.id === updatedOrder.id)
                    if (index !== -1) {
                        this.orders[index] = updatedOrder
                    }
                }

                return response.data
            } catch (error) {
                console.error("Error updating order:", error)
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // Approve an order - this will update inventory
        async approveOrder(orderId) {
            this.loading = true
            this.error = null

            try {
                const idToken = await getIdToken(auth.currentUser)

                const response = await axios.post(
                    `${apiUrl}orders/${orderId}/approve`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    },
                )

                // Update the order status in the local state
                const index = this.orders.findIndex((o) => o.id === orderId)
                if (index !== -1) {
                    this.orders[index].status = "Completed"
                    this.orders[index].completedAt = new Date().toISOString()
                }

                return response.data
            } catch (error) {
                console.error("Error approving order:", error)
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // Void an order (for pending orders only)
        async voidOrder(orderId) {
            this.loading = true
            this.error = null

            try {
                const idToken = await getIdToken(auth.currentUser)

                const response = await axios.post(
                    `${apiUrl}orders/${orderId}/void`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    },
                )

                // Update the order status in the local state
                const index = this.orders.findIndex((o) => o.id === orderId)
                if (index !== -1) {
                    this.orders[index].status = "Voided"
                    this.orders[index].voidedAt = new Date().toISOString()
                }

                return response.data
            } catch (error) {
                console.error("Error voiding order:", error)
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // Return an order (for completed orders only)
        async returnOrder(orderId, returnReason) {
            this.loading = true
            this.error = null

            try {
                const idToken = await getIdToken(auth.currentUser)

                const response = await axios.post(
                    `${apiUrl}orders/${orderId}/return`,
                    { returnReason },
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    },
                )

                // Update the order status in the local state
                const index = this.orders.findIndex((o) => o.id === orderId)
                if (index !== -1) {
                    this.orders[index].status = "Returned"
                    this.orders[index].returnedAt = new Date().toISOString()
                    this.orders[index].returnReason = returnReason
                }

                return response.data
            } catch (error) {
                console.error("Error returning order:", error)
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },

        // Delete an order (admin only, for pending orders only)
        async deleteOrder(orderId) {
            this.loading = true
            this.error = null

            try {
                const idToken = await getIdToken(auth.currentUser)

                const response = await axios.delete(`${apiUrl}orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                })

                // Remove the order from the local state
                this.orders = this.orders.filter((o) => o.id !== orderId)
                this.totalOrders--

                return response.data
            } catch (error) {
                console.error("Error deleting order:", error)
                this.error = error.message
                throw error
            } finally {
                this.loading = false
            }
        },
    },
    // Persist selected branch ID
    persist: {
        enabled: true,
    },
})
