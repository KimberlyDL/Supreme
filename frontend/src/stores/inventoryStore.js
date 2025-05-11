// src/stores/inventoryStore.js
import { defineStore } from 'pinia';
import { computed, watch } from 'vue';
import { db } from '@/services/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
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

// API base URL - Note: no trailing slash to match the format in the example
const API_URL = import.meta.env.VITE_API_BASE_URL;

//#region Helper Functions
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
//#endregion

export const useInventoryStore = defineStore('inventory', {
    //#region State
    state: () => ({
        selectedBranchId: null,
        branchStock: [],
        inventoryLogs: [],


        loading: false,
        error: null,
        success: null,
        message: null,


        unsubscribeStock: null,
        unsubscribeLogs: null,

        _currentBranchId: null,
        _listenerStatus: {
            products: false,
            branches: false,
            stock: false,
            logs: false
        },
        authStore: useAuthStore(), // Initialize authStore here
        branchStore: useBranchStore() // Initialize branchStore here
    }),
    //#endregion

    //#region Getters
    getters: {

        getActiveProducts() {
            const productStore = useProductStore()
            return productStore.productsForInventory.filter((p) => p?.isActive !== false)
        },

        getActiveBranches() {
            const branchStore = useBranchStore()
            return branchStore.fetchedbranches.filter((b) => b?.isActive !== false)
        },
        getActiveBrancheNames() {
            const branchStore = useBranchStore()
            return branchStore.fetchedBranchNames.filter((b) => b?.isActive !== false)
        },


        getBranchStock: (state) => state.branchStock,
        getInventoryLogs: (state) => state.inventoryLogs,
        isLoading: (state) => state.loading,
        getError: (state) => state.error,
        getSuccess: (state) => state.success,
        getMessage: (state) => state.message,

        // New getter to get product details by ID
        getProductById: (state) => (productId) => {
            return state.products.find(product => product.id === productId) || null;
        },

        // New getter to get variety details by product ID and variety ID
        getVarietyById: (state) => (productId, varietyId) => {
            const product = state.products.find(p => p.id === productId);
            if (product && product.varieties) {
                return product.varieties.find(v => v.id === varietyId) || null;
            }
            return null;
        },

        // // Enhanced branch stock getter with product and variety details
        // getEnhancedBranchStock: (state) => {
        //     return state.branchStock.map(item => {
        //         const productStore = useProductStore();
        //         const activeProducts = productStore.productsForInventory.filter((p) => p?.isActive !== false)

        //         const product = activeProducts.find(p => p.id === item.productId);

        //         // Find variety in product varieties
        //         let variety = null;
        //         if (product && product.varieties) {
        //             variety = product.varieties.find(v => v.id === item.varietyId);
        //         }

        //         return {
        //             ...item,
        //             productName: product ? product.name : 'Unknown Product',
        //             varietyName: variety ? variety.name : 'Default',
        //             displayName: `${product ? product.name : 'Unknown Product'} - ${variety ? variety.name : 'Default'}`
        //         };
        //     });
        // },

        getEnhancedBranchStock: (state) => {
            const productStore = useProductStore();
            const activeProducts = productStore.productsForInventory.filter(p => p?.isActive !== false);

            return state.branchStock.map(item => {
                const product = activeProducts.find(p => p.id === item.productId);
                const variety = product?.varieties?.find(v => v.id === item.varietyId);
                return {
                    ...item,
                    productName: product?.name || 'Unknown Product',
                    varietyName: variety?.name || 'Default',
                    displayName: `${product?.name || 'Unknown Product'} - ${variety?.name || 'Default'}`
                };
            });
        },

        getBranchStock: (state) => {
            const productStore = useProductStore();
            const activeProducts = productStore.productsForInventory.filter(p => p?.isActive !== false);

            return state.branchStock.map(item => {
                const product = activeProducts.find(p => p.id === item.productId);
                const variety = product?.varieties?.find(v => v.id === item.varietyId);

                return {
                    ...item,
                    productName: product?.name || 'Unknown Product',
                    varietyName: variety?.name || 'Default',
                    displayName: `${product?.name || 'Unknown Product'} - ${variety?.name || 'Default'}`
                };
            });
        }

    },
    //#endregion

    actions: {
        //#region Message Management
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
        //#endregion

        async initializeListeners() {
            const branchStore = useBranchStore();

            if (!this._listenerStatus.branches) {
                await branchStore.setupRealtimeActiveBranches();
                this._listenerStatus.branches = true;
            }

            const productStore = useProductStore();

            if (!this._listenerStatus.products) {
                await productStore.setupRealtimeActiveProducts();
                this._listenerStatus.products = true;
            }
        },

        unsubscribeBranches() {
            const branchStore = useBranchStore();

            branchStore.stopListening();

            this._listenerStatus = {
                branches: false,
            };
        },

        unsubscribeProducts() {
            const productStore = useProductStore();

            productStore.stopListening();

            this._listenerStatus = {
                products: false,
            };
        },

        //#region Branch Stock Management
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

                this.branchStock = []; // Clear branch stock data
            }
            this._currentBranchId = null;
        },

        // New method to refresh branch stock data with latest product info
        _refreshBranchStockData() {
            const productStore = useProductStore();
            const products = productStore.productsForInventory;

            // Update each stock item with fresh product data
            this.branchStock = this.branchStock.map(stockItem => {
                const productData = products.find(p => p.id === stockItem.productId);
                const varietyData = productData?.varieties?.find(v => v.id === stockItem.varietyId);

                return {
                    ...stockItem,
                    product: productData || null,
                    variety: varietyData || null,
                    productName: productData ? productData.name : 'Unknown Product',
                    varietyName: varietyData ? varietyData.name : 'Default',
                    displayName: `${productData ? productData.name : 'Unknown Product'} - ${varietyData ? varietyData.name : 'Default'}`
                };
            });
        },

        setupProductDataWatcher() {
            const productStore = useProductStore();

            // Watch for changes in product data
            watch(
                () => productStore.productsForInventory,
                () => {
                    // If we have branch stock data and a current branch, refresh the data
                    if (this.branchStock.length > 0 && this._currentBranchId) {
                        console.log('Products changed, refreshing branch stock data');
                        this._refreshBranchStockData();
                    }
                },
                { deep: true }
            );
        },



        // use the products and branches listeners to get the stock data
        // Create a non-debounced version first
        // _setupBranchStockListenerImpl(branchId) {
        //     if (!this.authStore.isLoggedIn || !this.authStore.isAdmin) {
        //         console.error('Unauthorized access to branch stock data');
        //         return;
        //     }

        //     // Check if we're already listening to this branch
        //     if (this.unsubscribeStock && this._currentBranchId === branchId) {
        //         console.log('Already listening to this branch, skipping setup');
        //         return;
        //     }

        //     // Clear previous listener if exists
        //     this.clearStockListener();

        //     // Store current branch ID for comparison
        //     this._currentBranchId = branchId;

        //     this.loading = true;
        //     // console.log(`Setting up stock listener for branch: ${branchId}`);

        //     try {
        //         // Create query for branch stocks
        //         const q = query(
        //             collection(db, 'branch_stocks'),
        //             where('branchId', '==', branchId)
        //         );

        //         // Set up real-time listener
        //         this.unsubscribeStock = onSnapshot(q, async (snapshot) => {
        //             // Check if this is still the current branch
        //             if (this._currentBranchId !== branchId) {
        //                 console.log('Branch changed during listener execution, ignoring update');
        //                 return;
        //             }

        //             const stockItems = [];

        //             // Process each document
        //             for (const snapshotdoc of snapshot.docs) {

        //                 const stockData = snapshotdoc.data();

        //                 try {

        //                     let products = this.getActiveProducts;

        //                     // console.log('products from getterz', products);

        //                     let productData = null;
        //                     let varietyData = null;

        //                     // console.log('products', productData);
        //                     // console.log('Vaireties:', varietyData);

        //                     if (products && Array.isArray(products)) {
        //                         productData = products.find(p => p.id === stockData.productId);
        //                     }

        //                     if (productData) {
        //                         varietyData = productData.varieties?.find(v => v.id === stockData.varietyId)
        //                     }

        //                     // Format expiration dates for display
        //                     const expirationDates = stockData.expirationDates || [];
        //                     const formattedExpirationDates = expirationDates.map(exp => {
        //                         // Convert Unix timestamp to Date object if needed
        //                         let dateObj;
        //                         if (typeof exp.date === 'number') {
        //                             // If it's a Unix timestamp in seconds, convert to milliseconds
        //                             dateObj = new Date(exp.date * 1000);
        //                         } else {
        //                             // Otherwise try to parse as date string
        //                             dateObj = new Date(exp.date);
        //                         }

        //                         return {
        //                             ...exp,
        //                             dateObj,
        //                             formattedDate: dateObj.toLocaleDateString()
        //                         };
        //                     });

        //                     // Add to stock items with product data
        //                     stockItems.push({
        //                         id: snapshotdoc.id,
        //                         ...stockData,
        //                         product: productData || null,
        //                         variety: varietyData || null,
        //                         productName: productData ? productData.name : 'Unknown Product',
        //                         varietyName: varietyData ? varietyData.name : 'Default',
        //                         displayName: `${productData ? productData.name : 'Unknown Product'} - ${varietyData ? varietyData.name : 'Default'}`,
        //                         expirationDates: formattedExpirationDates
        //                     });
        //                 } catch (error) {
        //                     console.error('Error fetching product details:', error);
        //                     stockItems.push({
        //                         id: snapshotdoc.id,
        //                         ...stockData,
        //                         product: null,
        //                         variety: null,
        //                         productName: 'Unknown Product',
        //                         varietyName: 'Default',
        //                         displayName: 'Unknown Product - Default'
        //                     });
        //                 }
        //             }

        //             console.log('Stock items:', stockItems);


        //             this.branchStock = stockItems;
        //             console.log(`Stock update received for branch ${branchId}, items: ${stockItems.length}`);
        //             this.loading = false;
        //         }, (error) => {
        //             console.error('Error in real-time stock updates:', error);
        //             this.error = error.message;
        //             this.loading = false;
        //         });

        //         this.setupProductDataWatcher();

        //     } catch (error) {
        //         console.error('Error setting up stock listener:', error);
        //         this.error = error.message;
        //         this.loading = false;
        //     }
        // },


        // Replace the _setupBranchStockListenerImpl method with this improved version:
        _setupBranchStockListenerImpl(branchId) {
            if (!this.authStore.isLoggedIn || !this.authStore.isAdmin) {
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

                    console.log(`Stock update received for branch ${branchId}, changes: ${snapshot.docChanges().length}`);

                    // Create a new array to ensure Vue detects the change
                    const stockItems = [...this.branchStock];
                    let hasChanges = false;

                    // Process each change
                    for (const change of snapshot.docChanges()) {
                        const doc = change.doc;
                        const stockData = doc.data();
                        const stockId = doc.id;

                        try {
                            const products = this.getActiveProducts;
                            const productData = products.find(p => p.id === stockData.productId);
                            const varietyData = productData?.varieties?.find(v => v.id === stockData.varietyId);

                            // Format expiration dates for display
                            const expirationDates = stockData.expirationDates || [];
                            const formattedExpirationDates = expirationDates.map(exp => {
                                // Convert Unix timestamp to Date object if needed
                                let dateObj;
                                if (typeof exp.date === 'number') {
                                    // If it's a Unix timestamp in seconds, convert to milliseconds
                                    dateObj = new Date(exp.date * 1000);
                                } else {
                                    // Otherwise try to parse as date string
                                    dateObj = new Date(exp.date);
                                }

                                return {
                                    ...exp,
                                    dateObj,
                                    formattedDate: dateObj.toLocaleDateString()
                                };
                            });

                            const updatedStock = {
                                id: stockId,
                                ...stockData,
                                product: productData || null,
                                variety: varietyData || null,
                                productName: productData ? productData.name : 'Unknown Product',
                                varietyName: varietyData ? varietyData.name : 'Default',
                                displayName: `${productData ? productData.name : 'Unknown Product'} - ${varietyData ? varietyData.name : 'Default'}`,
                                expirationDates: formattedExpirationDates
                            };

                            const index = stockItems.findIndex(item => item.id === stockId);

                            if (change.type === 'added') {
                                if (index === -1) {
                                    stockItems.push(updatedStock);
                                    hasChanges = true;
                                }
                            } else if (change.type === 'modified') {
                                if (index !== -1) {
                                    stockItems[index] = updatedStock;
                                    hasChanges = true;
                                }
                            } else if (change.type === 'removed') {
                                if (index !== -1) {
                                    stockItems.splice(index, 1);
                                    hasChanges = true;
                                }
                            }
                        } catch (error) {
                            console.error('Error processing stock item:', error);
                        }
                    }

                    // Only update the state if there were actual changes
                    if (hasChanges) {
                        console.log(`Updating branch stock with ${stockItems.length} items`);
                        // Create a new array reference to ensure reactivity
                        this.branchStock = [...stockItems];
                    }

                    this.loading = false;
                }, (error) => {
                    console.error('Error in real-time stock updates:', error);
                    this.error = error.message;
                    this.loading = false;
                });

                this.setupProductDataWatcher();

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
        //#endregion

        //#region Utility Methods
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
            if (!this.authStore.isLoggedIn || !this.authStore.isAdmin) {
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
                    const logs = snapshot.docs.map(doc => {
                        const data = doc.data();

                        // Format timestamp for display
                        let formattedTimestamp = null;
                        if (data.timestamp) {
                            const timestamp = data.timestamp.toDate();
                            formattedTimestamp = timestamp.toLocaleString();
                        }

                        return {
                            id: doc.id,
                            ...data,
                            timestamp: data.timestamp?.toDate() || null,
                            formattedTimestamp
                        };
                    });

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

        // Helper method to convert date to Unix timestamp in milliseconds
        _convertDateToTimestamp(dateString) {
            if (!dateString) return null;

            // Create date object and normalize to midnight UTC
            const date = new Date(dateString);
            date.setUTCHours(0, 0, 0, 0);

            // Return Unix timestamp in seconds (as expected by backend)
            return Math.floor(date.getTime() / 1000);
        },

        // Helper method to process expiration dates for API
        _processExpirationDates(expirationDates) {
            if (!expirationDates || !Array.isArray(expirationDates)) return [];

            return expirationDates.map(exp => {
                // If date is a string, convert to timestamp
                if (typeof exp.date === 'string') {
                    return {
                        date: this._convertDateToTimestamp(exp.date),
                        qty: parseInt(exp.qty, 10)
                    };
                }
                // If already a timestamp, return as is
                return {
                    date: exp.date,
                    qty: parseInt(exp.qty, 10)
                };
            });
        },
        //#endregion

        //#region API Operations
        // Add stock to branch inventory (using backend API)
        async addStock(stockData) {
            this.loading = true;
            this.error = null;
            this.success = null;
            this.message = null;

            try {
                const token = await this._getAuthToken();

                // Process expiration dates
                let processedData = { ...stockData };

                // Convert single expiration date to timestamp if provided
                if (processedData.expirationDate) {
                    processedData.expirationDate = this._convertDateToTimestamp(processedData.expirationDate);
                }

                // Process multiple expiration dates if provided
                if (processedData.expirationDates && Array.isArray(processedData.expirationDates)) {
                    processedData.expirationDates = this._processExpirationDates(processedData.expirationDates);
                }

                const response = await axios.post(
                    `${API_URL}inventory/stock/add`,
                    processedData,
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

                // Process expiration date if provided
                let processedData = { ...stockData };
                if (processedData.expirationDate) {
                    processedData.expirationDate = this._convertDateToTimestamp(processedData.expirationDate);
                }

                const response = await axios.post(
                    `${API_URL}inventory/stock/deduct`,
                    processedData,
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

                // Process expiration date if provided
                let processedData = { ...stockData };
                if (processedData.expirationDates) {
                    processedData.expirationDates = this._processExpirationDates(processedData.expirationDates);
                }

                const response = await axios.post(
                    `${API_URL}inventory/stock/reject`,
                    processedData,
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

                // Process expiration dates if provided
                let processedData = { ...transferData };

                if (processedData.expirationDates) {
                    processedData.expirationDates = this._processExpirationDates(processedData.expirationDates);
                }

                // // Process specific expiration dates to transfer if provided
                // if (processedData.transferExpirationDates && Array.isArray(processedData.transferExpirationDates)) {
                //     processedData.transferExpirationDates = this._processExpirationDates(processedData.transferExpirationDates);
                // }

                const response = await axios.post(
                    `${API_URL}inventory/stock/transfer`,
                    processedData,
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

                // Process data for API
                let processedData = { ...adjustData };

                // Convert single expiration date to timestamp if provided
                if (processedData.expirationDate) {
                    processedData.expirationDate = this._convertDateToTimestamp(processedData.expirationDate);
                }

                // Process multiple expiration dates if provided
                if (processedData.expirationDates && Array.isArray(processedData.expirationDates)) {
                    processedData.expirationDates = this._processExpirationDates(processedData.expirationDates);
                }

                const response = await axios.post(
                    `${API_URL}inventory/stock/adjust`,
                    processedData,
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
        //#endregion

        //#region Cleanup
        // Enhanced cleanup method
        cleanup() {
            // this._safeUnsubscribe(this.unsubscribeProducts, 'products');
            // this.unsubscribeProducts = null;
            // this._listenerStatus.products = false;

            // if (this.unsubscribeBranches) {
            //     this._safeUnsubscribe(this.unsubscribeBranches, 'branches');
            //     this.unsubscribeBranches = null;
            //     this._listenerStatus.branches = false;
            // }

            this.unsubscribeBranches();
            this.unsubscribeProducts();


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
        //#endregion
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