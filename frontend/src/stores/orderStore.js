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

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    where,
    limit,
    startAfter,
    getDocs,
    doc,
    getDoc
} from "firebase/firestore"

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

        // New state for hybrid approach
        currentOrderId: null,
        currentOrder: null,
        unsubscribeCurrentOrder: null,
        orderFilters: {
            status: null,
            startDate: null,
            endDate: null,
            search: null,
            limit: 10,
            page: 1
        }
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

        // New getter for formatted orders with computed properties
        formattedOrders: (state) => {
            return state.orders.map(order => ({
                ...order,
                formattedDate: order.createdAt ? new Date(order.createdAt.toDate()).toLocaleString() : 'Unknown',
                formattedTotal: order.totalPrice ? `$${order.totalPrice.toFixed(2)}` : '$0.00',
                itemCount: order.items ? order.items.length : 0,
                statusClass: getStatusClass(order.status)
            }));
        },

        // New getter for current order with computed properties
        formattedCurrentOrder: (state) => {
            if (!state.currentOrder) return null;

            return {
                ...state.currentOrder,
                formattedDate: state.currentOrder.createdAt ?
                    new Date(state.currentOrder.createdAt.toDate()).toLocaleString() : 'Unknown',
                formattedTotal: state.currentOrder.totalPrice ?
                    `$${state.currentOrder.totalPrice.toFixed(2)}` : '$0.00',
                itemCount: state.currentOrder.items ? state.currentOrder.items.length : 0,
                statusClass: getStatusClass(state.currentOrder.status),
                items: state.currentOrder.items ? state.currentOrder.items.map(item => ({
                    ...item,
                    formattedPrice: `$${item.unitPrice.toFixed(2)}`,
                    formattedTotal: `$${item.totalPrice.toFixed(2)}`
                })) : []
            };
        }
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

        // Set up real-time listener for orders with filtering
        async setupRealtimeOrders(filters = {}) {
            if (this.unsubscribe) {
                this.unsubscribe()
                this.unsubscribe = null
            }

            this.loading = true;
            this.error = null;

            try {
                // Update filters state
                this.orderFilters = {
                    ...this.orderFilters,
                    ...filters
                };

                // Build query constraints
                let constraints = [orderBy("createdAt", "desc")];

                if (filters.status && filters.status !== "all") {
                    constraints.unshift(where("status", "==", filters.status));
                }

                if (filters.startDate) {
                    const startDate = new Date(filters.startDate);
                    constraints.push(where("createdAt", ">=", startDate));
                }

                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    constraints.push(where("createdAt", "<=", endDate));
                }

                // Add limit
                const limitValue = filters.limit || this.orderFilters.limit;
                constraints.push(limit(limitValue));

                // Create query
                const q = query(collection(db, "orders"), ...constraints);

                // Set up real-time listener
                this.unsubscribe = onSnapshot(q, (snapshot) => {
                    // Process changes
                    const changes = snapshot.docChanges();

                    // Handle initial load or filter change
                    if (this.orders.length === 0 || Object.keys(filters).length > 0) {
                        // Replace all orders
                        this.orders = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                    } else {
                        // Process individual changes
                        changes.forEach((change) => {
                            if (change.type === "added") {
                                const orderData = { id: change.doc.id, ...change.doc.data() };
                                const index = this.orders.findIndex((o) => o.id === orderData.id);
                                if (index === -1) {
                                    this.orders.unshift(orderData);
                                }
                            }
                            if (change.type === "modified") {
                                const orderData = { id: change.doc.id, ...change.doc.data() };
                                const index = this.orders.findIndex((o) => o.id === orderData.id);
                                if (index !== -1) {
                                    this.orders[index] = orderData;
                                } else {
                                    this.orders.unshift(orderData);
                                }
                            }
                            if (change.type === "removed") {
                                this.orders = this.orders.filter((o) => o.id !== change.doc.id);
                            }
                        });
                    }

                    this.loading = false;
                }, (error) => {
                    console.error("Error in real-time orders listener:", error);
                    this.error = error.message;
                    this.loading = false;
                });
            } catch (error) {
                console.error("Error setting up orders listener:", error);
                this.error = error.message;
                this.loading = false;
            }
        },

        // Clean up listener
        stopRealtimeOrders() {
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
        },

        // Set up real-time listener for a single order
        async setupRealtimeOrderById(orderId) {
            // Clean up previous listener if exists
            this.cleanupCurrentOrderListener();

            if (!orderId) {
                this.currentOrder = null;
                this.currentOrderId = null;
                return;
            }

            this.loading = true;
            this.error = null;
            this.currentOrderId = orderId;

            try {
                // Set up real-time listener for the specific order
                const orderRef = doc(db, "orders", orderId);

                this.unsubscribeCurrentOrder = onSnapshot(orderRef, (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        this.currentOrder = {
                            id: docSnapshot.id,
                            ...docSnapshot.data()
                        };
                    } else {
                        this.currentOrder = null;
                        this.error = "Order not found";
                    }

                    this.loading = false;
                }, (error) => {
                    console.error("Error in real-time order listener:", error);
                    this.error = error.message;
                    this.loading = false;
                });
            } catch (error) {
                console.error("Error setting up order listener:", error);
                this.error = error.message;
                this.loading = false;
            }
        },

        // Clean up current order listener
        cleanupCurrentOrderListener() {
            if (this.unsubscribeCurrentOrder) {
                this.unsubscribeCurrentOrder();
                this.unsubscribeCurrentOrder = null;
            }
        },

        // Load more orders (pagination)
        async loadMoreOrders() {
            if (!this.hasMore || this.loading) return;

            this.loading = true;
            this.error = null;

            try {
                // Get the last document as the starting point
                const lastOrder = this.orders[this.orders.length - 1];
                if (!lastOrder) return;

                // Build query constraints
                let constraints = [orderBy("createdAt", "desc")];

                if (this.orderFilters.status && this.orderFilters.status !== "all") {
                    constraints.unshift(where("status", "==", this.orderFilters.status));
                }

                if (this.orderFilters.startDate) {
                    const startDate = new Date(this.orderFilters.startDate);
                    constraints.push(where("createdAt", ">=", startDate));
                }

                if (this.orderFilters.endDate) {
                    const endDate = new Date(this.orderFilters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    constraints.push(where("createdAt", "<=", endDate));
                }

                // Add startAfter for pagination
                constraints.push(startAfter(lastOrder.createdAt));

                // Add limit
                constraints.push(limit(this.orderFilters.limit));

                // Create and execute query
                const q = query(collection(db, "orders"), ...constraints);
                const snapshot = await getDocs(q);

                // Process results
                const newOrders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Append new orders to existing list
                this.orders = [...this.orders, ...newOrders];

                // Update hasMore flag
                this.hasMore = newOrders.length === this.orderFilters.limit;

                return newOrders;
            } catch (error) {
                console.error("Error loading more orders:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Fetch orders from backend with filtering and pagination
        async fetchOrders(options = {}) {
            this.loading = true;
            this.error = null;

            try {
                const { page = 1, limit = 10, status, startDate, endDate, search } = options;

                let url = `${apiUrl}orders?limit=${limit}`;

                if (status && status !== "all") {
                    url += `&status=${status}`;
                }

                if (startDate) {
                    url += `&startDate=${startDate}`;
                }

                if (endDate) {
                    url += `&endDate=${endDate}`;
                }

                if (search) {
                    url += `&search=${search}`;
                }

                // For pagination
                if (page > 1 && this.orders.length > 0) {
                    const lastDoc = this.orders[(page - 1) * limit - 1];
                    if (lastDoc) {
                        url += `&startAfter=${lastDoc.id}`;
                    }
                }

                const response = await axios.get(url);


                if (page === 1) {
                    this.orders = response.data;
                } else {
                    this.orders = [...this.orders, ...response.data];
                }

                this.hasMore = response.data.length === limit;
                this.totalOrders = this.orders.length;

                return this.orders;
            } catch (error) {
                console.error("Error fetching orders:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Fetch a single order by ID
        async fetchOrderById(orderId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(`${apiUrl}orders/${orderId}`);
                return response.data;
            } catch (error) {
                console.error("Error fetching order:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Validate stock availability before saving order
        async validateOrderStock(orderItems, branchId) {
            const inventoryStore = useInventoryStore();
            this.stockValidationErrors = [];

            // Ensure branch stock is loaded
            if (!inventoryStore.branchStock.length) {
                await inventoryStore.setSelectedBranch(branchId);
            }

            // Create a map of stock items for quick lookup
            const stockMap = new Map();
            inventoryStore.branchStock.forEach((item) => {
                const key = `${item.productId}-${item.varietyId}`;
                stockMap.set(key, item);
            });

            // Check each item for stock availability
            const stockIssues = [];
            for (const item of orderItems) {
                const stockKey = `${item.productId}-${item.varietyId}`;
                const stockItem = stockMap.get(stockKey);

                if (!stockItem) {
                    stockIssues.push({
                        item,
                        issue: "Product not found in branch inventory",
                    });
                    continue;
                }

                // Check total stock quantity
                if (stockItem.quantity < item.quantity) {
                    stockIssues.push({
                        item,
                        issue: "Insufficient stock",
                        requested: item.quantity,
                        available: stockItem.quantity,
                    });
                }
            }

            if (stockIssues.length > 0) {
                this.stockValidationErrors = stockIssues;
                return false;
            }

            return true;
        },

        // Validate sale prices before saving order
        async validateOrderSalePrices(orderItems) {
            const productStore = useProductStore();
            this.saleValidationErrors = [];

            // Ensure products are loaded
            if (productStore.products.length === 0) {
                await productStore.fetchProducts(true);
            }

            // Check each item with sale price
            const invalidItems = validateSalePrices(orderItems, productStore.products);

            if (invalidItems.length > 0) {
                this.saleValidationErrors = invalidItems;
                return false;
            }

            return true;
        },

        async saveAdminOrder({ orderItems, customerName, paymentType, notes, selectedBranchId }) {
            try {
                if (!auth.currentUser) {
                    throw new Error("User is not authenticated");
                }

                // Validate stock availability and sale prices
                const isStockValid = await this.validateOrderStock(orderItems, selectedBranchId);
                if (!isStockValid) {
                    throw new Error("Stock validation failed. Please check available quantities.");
                }

                const isSalePriceValid = await this.validateOrderSalePrices(orderItems);
                if (!isSalePriceValid) {
                    throw new Error("Some items have invalid sale prices. Please refresh and try again.");
                }

                const token = await auth.currentUser.getIdToken();

                const items = orderItems.map((item) => {
                    const onSale = isVarietyOnSale(item.variety);
                    const unitPrice = getVarietyPrice(item.variety);
                    const quantity = item.quantity;

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
                    };
                });
                const discounts = 0;

                const totalPrice = discounts
                    ? (computeOrderTotalPrice(items) || 0) - discounts
                    : computeOrderTotalPrice(items) || 0;

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
                };

                // Replace with your actual backend endpoint
                const response = await axios.post(`${apiUrl}orders`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                return response.data;
            } catch (error) {
                console.error("Error saving order:", error);
                throw error;
            }
        },

        // Create a new order
        async createOrder(orderData) {
            this.loading = true;
            this.error = null;

            try {
                // Validate stock availability and sale prices
                if (orderData.items && orderData.items.length > 0) {
                    const isStockValid = await this.validateOrderStock(orderData.items, orderData.branchId);
                    if (!isStockValid) {
                        throw new Error("Stock validation failed. Please check available quantities.");
                    }

                    const isSalePriceValid = await this.validateOrderSalePrices(orderData.items);
                    if (!isSalePriceValid) {
                        throw new Error("Some items have invalid sale prices. Please refresh and try again.");
                    }
                }

                const idToken = await getIdToken(auth.currentUser);

                const response = await axios.post(`${apiUrl}orders`, orderData, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });

                // Firebase listener will handle adding to local state
                return response.data;
            } catch (error) {
                console.error("Error creating order:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Update an existing order
        async updateOrder(orderData) {
            this.loading = true;
            this.error = null;

            try {
                // Validate stock availability and sale prices
                if (orderData.items && orderData.items.length > 0) {
                    const isStockValid = await this.validateOrderStock(orderData.items, orderData.branchId);
                    if (!isStockValid) {
                        throw new Error("Stock validation failed. Please check available quantities.");
                    }

                    const isSalePriceValid = await this.validateOrderSalePrices(orderData.items);
                    if (!isSalePriceValid) {
                        throw new Error("Some items have invalid sale prices. Please refresh and try again.");
                    }
                }

                const idToken = await getIdToken(auth.currentUser);

                const response = await axios.put(`${apiUrl}orders/${orderData.id}`, orderData, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });

                // Firebase listener will handle updating in local state
                return response.data;
            } catch (error) {
                console.error("Error updating order:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Approve an order - this will update inventory
        async approveOrder(orderId) {
            this.loading = true;
            this.error = null;

            try {
                const idToken = await getIdToken(auth.currentUser);

                const response = await axios.post(
                    `${apiUrl}orders/${orderId}/approve`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    },
                );

                // Firebase listener will handle updating in local state
                return response.data;
            } catch (error) {
                console.error("Error approving order:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Void an order (for pending orders only)
        async voidOrder(orderId) {
            this.loading = true;
            this.error = null;

            try {
                const idToken = await getIdToken(auth.currentUser);

                const response = await axios.post(
                    `${apiUrl}orders/${orderId}/void`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    },
                );

                // Firebase listener will handle updating in local state
                return response.data;
            } catch (error) {
                console.error("Error voiding order:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Return an order (for completed orders only)
        async returnOrder(orderId, returnReason) {
            this.loading = true;
            this.error = null;

            try {
                const idToken = await getIdToken(auth.currentUser);

                const response = await axios.post(
                    `${apiUrl}orders/${orderId}/return`,
                    { returnReason },
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    },
                );

                // Firebase listener will handle updating in local state
                return response.data;
            } catch (error) {
                console.error("Error returning order:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Delete an order (admin only, for pending orders only)
        async deleteOrder(orderId) {
            this.loading = true;
            this.error = null;

            try {
                const idToken = await getIdToken(auth.currentUser);

                const response = await axios.delete(`${apiUrl}orders/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });

                // Firebase listener will handle removing from local state
                return response.data;
            } catch (error) {
                console.error("Error deleting order:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Generate order receipt
        async generateReceipt(orderId) {
            this.loading = true;
            this.error = null;

            try {
                // First ensure we have the latest order data
                if (!this.currentOrder || this.currentOrderId !== orderId) {
                    await this.setupRealtimeOrderById(orderId);
                }

                // Wait for order data to load
                if (!this.currentOrder) {
                    throw new Error("Order not found");
                }

                // Return the formatted order data for receipt generation
                return this.formattedCurrentOrder;
            } catch (error) {
                console.error("Error generating receipt:", error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Clean up all listeners
        cleanup() {
            this.stopRealtimeOrders();
            this.cleanupCurrentOrderListener();
        }
    },

    // Persist selected branch ID
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'order-store',
                storage: localStorage,
                paths: ['orderFilters']
            }
        ]
    },
});

// Helper function for status styling
function getStatusClass(status) {
    switch (status) {
        case 'Completed':
            return 'text-green-600 bg-green-100';
        case 'Pending':
            return 'text-yellow-600 bg-yellow-100';
        case 'Voided':
            return 'text-red-600 bg-red-100';
        case 'Returned':
            return 'text-purple-600 bg-purple-100';
        default:
            return 'text-gray-600 bg-gray-100';
    }
}