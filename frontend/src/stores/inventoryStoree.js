// src/stores/inventoryStore.js
import { defineStore } from 'pinia';
import { db } from '@/services/firebase';
import {
    collection,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore';
import { useAuthStore } from '@/stores/authStore';
import { useBranchStore } from '@/stores/branchStore';
import { useProductStore } from '@/stores/productStore';
import axios from 'axios';
import { getFreshToken } from '@/services/authService';

// API base URL
const API_URL = import.meta.env.VITE_API_BASE_URL;

// Improved debounce function that preserves 'this' context
function debounce(func, wait) {
    let timeout;

    return function (...args) {
        const context = this; // Store the context

        const later = () => {
            clearTimeout(timeout);
            func.apply(context, args); // Apply the stored context
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export const useInventoryStore = defineStore('inventory', {
    state: () => ({
        products: [],
        branches: [],
        selectedBranchId: null,
        branchStock: [],
        inventoryLogs: [],
        loading: false,
        error: null,
        success: null,
        message: null,
        unsubscribeProducts: null,
        unsubscribeBranches: null,
        unsubscribeStock: null,
        unsubscribeLogs: null,

        _currentBranchId: null,
        _listenerStatus: {
            products: false,
            branches: false,
            stock: false,
            logs: false
        }
    }),

    getters: {
        getProducts: (state) => state.products,
        getBranches: (state) => state.branches,
        getBranchStock: (state) => state.branchStock,
        getInventoryLogs: (state) => state.inventoryLogs,
        isLoading: (state) => state.loading,
        getError: (state) => state.error,
        getSuccess: (state) => state.success,
        getMessage: (state) => state.message
    },

    actions: {
        // Clear messages
        clearMessages() {
            this.error = null;
            this.success = null;
            this.message = null;
        },

        // Set messages
        setError(error) {
            this.error = error;
        },

        setSuccess(success) {
            this.success = success;
        },

        setMessage(message) {
            this.message = message;
        },

        // Initialize real-time listeners
        initializeListeners() {
            this.setupProductsListener();
            this.setupBranchesListener();
        },

        // Set up real-time listener for products
        setupProductsListener() {
            // Skip if already listening
            if (this._listenerStatus.products) return;

            const authStore = useAuthStore();

            if (!authStore.isLoggedIn || !authStore.isAdmin) {
                console.error('Unauthorized access to products data');
                return;
            }

            // Clear previous listener if exists
            if (this.unsubscribeProducts) {
                this.unsubscribeProducts();
            }

            // Create query for products
            const q = query(
                collection(db, 'products'),
                orderBy('name')
            );

            // Set up real-time listener
            this.unsubscribeProducts = onSnapshot(q, (snapshot) => {
                this.products = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }, (error) => {
                console.error('Error in real-time products updates:', error);
                this.error = error.message;
            });

            this._listenerStatus.products = true;
        },

        // Set up real-time listener for branches
        setupBranchesListener() {
            const authStore = useAuthStore();

            if (!authStore.isLoggedIn || !authStore.isAdmin) {
                console.error('Unauthorized access to branches data');
                return;
            }

            // Clear previous listener if exists
            if (this.unsubscribeBranches) {
                this.unsubscribeBranches();
            }

            // Create query for branches
            const q = query(
                collection(db, 'branches'),
                orderBy('name')
            );

            // Set up real-time listener
            this.unsubscribeBranches = onSnapshot(q, (snapshot) => {
                this.branches = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }, (error) => {
                console.error('Error in real-time branches updates:', error);
                this.error = error.message;
            });
        },

        // Fetch branches (compatibility method)
        async fetchBranches() {
            this.loading = true;
            this.error = null;

            try {
                // Try to use branchStore if available
                const branchStore = useBranchStore();
                if (branchStore && branchStore.fetchBranchesRealtime) {
                    const branches = await branchStore.fetchBranchesRealtime();
                    this.branches = branches || [];
                    return this.branches;
                }

                // Fallback to direct Firestore query
                const q = query(collection(db, 'branches'), orderBy('name'));
                const snapshot = await getDocs(q);
                this.branches = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                return this.branches;
            } catch (error) {
                console.error('Error fetching branches:', error);
                this.error = error.message;
                return [];
            } finally {
                this.loading = false;
            }
        },

        // Fetch products (compatibility method)
        async fetchProducts() {
            this.loading = true;
            this.error = null;

            try {
                // Try to use productStore if available
                const productStore = useProductStore();
                if (productStore && productStore.setupRealtimeProducts) {
                    await productStore.setupRealtimeProducts();
                    this.products = productStore.products || [];
                    return this.products;
                }

                // Fallback to direct Firestore query
                const q = query(collection(db, 'products'), orderBy('name'));
                const snapshot = await getDocs(q);
                this.products = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                return this.products;
            } catch (error) {
                console.error('Error fetching products:', error);
                this.error = error.message;
                return [];
            } finally {
                this.loading = false;
            }
        },

        // Set selected branch
        setSelectedBranch(branchId) {
            this.selectedBranchId = branchId;
            if (branchId) {
                this.setupBranchStockListener(branchId);
            } else {
                this.clearStockListener();
                this.branchStock = [];
            }
        },

        // Clear stock listener
        clearStockListener() {
            if (this.unsubscribeStock) {
                console.log('Clearing previous stock listener');
                this.unsubscribeStock();
                this.unsubscribeStock = null;
            }
            this._currentBranchId = null;
        },

        // Create a non-debounced version first
        _setupBranchStockListenerImpl(branchId) {
            const authStore = useAuthStore();

            if (!authStore.isLoggedIn || !authStore.isAdmin) {
                console.error('Unauthorized access to branch stock data');
                return;
            }

            // Check if we're already listening to this branch
            if (this.unsubscribeStock && this._currentBranchId === branchId) {
                console.log('Already listening to this branch, skipping setup');
                return;
            }

            // Clear previous listener if exists
            this.clearStockListener();

            // Store current branch ID for comparison
            this._currentBranchId = branchId;

            this.loading = true;
            console.log(`Setting up stock listener for branch: ${branchId}`);

            try {
                // Create query for branch stocks
                const q = query(
                    collection(db, 'branch_stocks'),
                    where('branchId', '==', branchId)
                );

                // Set up real-time listener
                this.unsubscribeStock = onSnapshot(q, async (snapshot) => {
                    // Check if this is still the current branch
                    if (this._currentBranchId !== branchId) {
                        console.log('Branch changed during listener execution, ignoring update');
                        return;
                    }

                    const stockItems = [];

                    // Process each document
                    for (const doc of snapshot.docs) {
                        const stockData = doc.data();

                        // Fetch product details
                        try {
                            if (stockData.productId) {
                                // Use a more direct approach to fetch product data
                                const productRef = doc(db, 'products', stockData.productId);
                                const productDoc = await getDoc(productRef);
                                const productData = productDoc.exists() ? productDoc.data() : null;

                                // Add to stock items with product data
                                stockItems.push({
                                    id: doc.id,
                                    ...stockData,
                                    product: productData
                                });
                            } else {
                                stockItems.push({
                                    id: doc.id,
                                    ...stockData,
                                    product: null
                                });
                            }
                        } catch (error) {
                            console.error('Error fetching product details:', error);
                            stockItems.push({
                                id: doc.id,
                                ...stockData,
                                product: null
                            });
                        }
                    }

                    this.branchStock = stockItems;
                    console.log(`Stock update received for branch ${branchId}, items: ${stockItems.length}`);
                    this.loading = false;
                }, (error) => {
                    console.error('Error in real-time stock updates:', error);
                    this.error = error.message;
                    this.loading = false;
                });
            } catch (error) {
                console.error('Error setting up stock listener:', error);
                this.error = error.message;
                this.loading = false;
            }
        },

        // Then create the debounced version that calls the implementation
        setupBranchStockListener: debounce(function (branchId) {
            this._setupBranchStockListenerImpl(branchId);
        }, 300),

        // Add a safe unsubscribe helper
        _safeUnsubscribe(unsubscribeFn, listenerName) {
            try {
                if (typeof unsubscribeFn === 'function') {
                    console.log(`Safely unsubscribing from ${listenerName} listener`);
                    unsubscribeFn();
                    return true;
                }
            } catch (error) {
                console.error(`Error unsubscribing from ${listenerName} listener:`, error);
            }
            return false;
        },

        // Set up real-time listener for inventory logs
        setupInventoryLogsListener(params = {}) {
            const authStore = useAuthStore();

            if (!authStore.isLoggedIn || !authStore.isAdmin) {
                console.error('Unauthorized access to inventory logs');
                return;
            }

            // Clear previous listener if exists
            if (this.unsubscribeLogs) {
                this.unsubscribeLogs();
            }

            this.loading = true;

            try {
                const {
                    branchId = this.selectedBranchId,
                    type = null,
                    startDate = null,
                    endDate = null,
                    pageSize = 20
                } = params;

                if (!branchId) {
                    throw new Error('Branch ID is required');
                }

                // Build query constraints
                let constraints = [
                    where('branchId', '==', branchId),
                    orderBy('timestamp', 'desc')
                ];

                // Create and execute query
                const q = query(collection(db, 'inventory_logs'), ...constraints);

                // Set up real-time listener
                this.unsubscribeLogs = onSnapshot(q, (snapshot) => {
                    const logs = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        timestamp: doc.data().timestamp?.toDate() || null
                    }));

                    this.inventoryLogs = logs;
                    this.loading = false;
                }, (error) => {
                    console.error('Error in real-time logs updates:', error);
                    this.error = error.message;
                    this.loading = false;
                });
            } catch (error) {
                console.error('Error setting up logs listener:', error);
                this.error = error.message;
                this.loading = false;
            }
        },

        // Helper method to get auth token for API requests
        async _getAuthToken() {
            try {
                const token = await getFreshToken(true);
                if (!token) {
                    throw new Error('Authentication token not available');
                }
                return token;
            } catch (error) {
                console.error('Error getting auth token:', error);
                throw error;
            }
        },

        // Add stock to branch inventory (using backend API)
        async addStock(stockData) {
            this.loading = true;
            this.error = null;
            this.success = null;
            this.message = null;

            try {
                const token = await this._getAuthToken();

                const response = await axios.post(
                    `${API_URL}inventory/stock/add`,
                    stockData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    this.success = true;
                    this.message = response.data.message;
                    return response.data;
                } else {
                    throw new Error(response.data.message || 'Failed to add stock');
                }
            } catch (error) {
                console.error('Error adding stock:', error);
                this.error = error.response?.data?.message || error.message;
                return { success: false, message: this.error };
            } finally {
                this.loading = false;
            }
        },

        // Deduct stock from branch inventory (using backend API)
        async deductStock(stockData) {
            this.loading = true;
            this.error = null;
            this.success = null;
            this.message = null;

            try {
                const token = await this._getAuthToken();

                const response = await axios.post(
                    `${API_URL}/inventory/stock/deduct`,
                    stockData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    this.success = true;
                    this.message = response.data.message;
                    return response.data;
                } else {
                    throw new Error(response.data.message || 'Failed to deduct stock');
                }
            } catch (error) {
                console.error('Error deducting stock:', error);
                this.error = error.response?.data?.message || error.message;
                return { success: false, message: this.error };
            } finally {
                this.loading = false;
            }
        },

        // Reject stock from branch inventory (using backend API)
        async rejectStock(stockData) {
            this.loading = true;
            this.error = null;
            this.success = null;
            this.message = null;

            try {
                const token = await this._getAuthToken();

                const response = await axios.post(
                    `${API_URL}/inventory/stock/reject`,
                    stockData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    this.success = true;
                    this.message = response.data.message;
                    return response.data;
                } else {
                    throw new Error(response.data.message || 'Failed to reject stock');
                }
            } catch (error) {
                console.error('Error rejecting stock:', error);
                this.error = error.response?.data?.message || error.message;
                return { success: false, message: this.error };
            } finally {
                this.loading = false;
            }
        },

        // Transfer stock between branches (using backend API)
        async transferStock(transferData) {
            this.loading = true;
            this.error = null;
            this.success = null;
            this.message = null;

            try {
                const token = await this._getAuthToken();

                const response = await axios.post(
                    `${API_URL}/inventory/stock/transfer`,
                    transferData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    this.success = true;
                    this.message = response.data.message;
                    return response.data;
                } else {
                    throw new Error(response.data.message || 'Failed to transfer stock');
                }
            } catch (error) {
                console.error('Error transferring stock:', error);
                this.error = error.response?.data?.message || error.message;
                return { success: false, message: this.error };
            } finally {
                this.loading = false;
            }
        },

        // Adjust stock count (using backend API)
        async adjustStock(adjustData) {
            this.loading = true;
            this.error = null;
            this.success = null;
            this.message = null;

            try {
                const token = await this._getAuthToken();

                const response = await axios.post(
                    `${API_URL}inventory/stock/adjust`,
                    adjustData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.data.success) {
                    this.success = true;
                    this.message = response.data.message;
                    return response.data;
                } else {
                    throw new Error(response.data.message || 'Failed to adjust stock');
                }
            } catch (error) {
                console.error('Error adjusting stock:', error);
                this.error = error.response?.data?.message || error.message;
                return { success: false, message: this.error };
            } finally {
                this.loading = false;
            }
        },

        // Enhanced cleanup method
        cleanup() {
            this._safeUnsubscribe(this.unsubscribeProducts, 'products');
            this.unsubscribeProducts = null;
            this._listenerStatus.products = false;

            if (this.unsubscribeBranches) {
                this._safeUnsubscribe(this.unsubscribeBranches, 'branches');
                this.unsubscribeBranches = null;
                this._listenerStatus.branches = false;
            }

            this.clearStockListener();
            this._listenerStatus.stock = false;

            if (this.unsubscribeLogs) {
                this._safeUnsubscribe(this.unsubscribeLogs, 'logs');
                this.unsubscribeLogs = null;
                this._listenerStatus.logs = false;
            }

            // Reset state
            this._currentBranchId = null;
        },
    },

    // Persist selected branch ID
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'inventory-store',
                storage: localStorage,
                paths: ['selectedBranchId']
            }
        ]
    }
});