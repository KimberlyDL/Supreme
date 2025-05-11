// frontend\src\stores\orderStore.js
// frontend/src/stores/orderStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { db, auth } from '@/services/firebase';
import { getIdToken } from "firebase/auth";
import { computed } from "vue";
// import ( useInventoryStore ) from '@/stores/inventoryStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useBranchStore } from '@/stores/branchStore';
import { useProductStore } from '@/stores/productStore';
import { isVarietyOnSale, getVarietyPrice, computeOrderTotalPrice } from '../utils/priceUtils';

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    orderBy,
    where,
    limit,
    onSnapshot
} from 'firebase/firestore';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useOrderStore = defineStore('order', {
    state: () => ({
        orders: [],
        loading: false,
        error: null,
        unsubscribe: null,
        unsubscribeCatalogs: null,
        _listenerStatus: {
            products: false,
            branches: false,
            stock: false,
        },
    }),

    getters: {
        // catalogs
        // retrieveCategoriesfromProducts() {
        //     return computed(() => {

        //         const inventoryStore = useInventoryStore();

        //         const cat = []

        //         console.log("active products", inventoryStore.getActiveProducts);


        //         inventoryStore.getActiveProducts.map((product) => {

        //             console.log("product", product);

        //             for (const category of product.categories) {
        //                 if (!cat.includes(category)) {
        //                     cat.push(category)
        //                 }
        //             }
        //         })
        //         return cat;
        //     })
        // },

        retrieveCategoriesfromProducts: (state) => {
            const inventoryStore = useInventoryStore();
            return computed(() => {
                const categoriesSet = new Set();

                inventoryStore.branchStock.forEach(product => {
                    product.product?.category?.forEach(cat => categoriesSet.add(cat));
                });

                return Array.from(categoriesSet);
            });
        },



        // orders
        getOrderById: (state) => (orderId) => {
            return state.orders.find(order => order.id === orderId);
        },

        pendingOrders: (state) => {
            return state.orders.filter(order => order.status === 'Pending');
        },

        completedOrders: (state) => {
            return state.orders.filter(order => order.status === 'Completed');
        },

        voidedOrders: (state) => {
            return state.orders.filter(order => order.status === 'Voided');
        }
    },
    actions: {

        async setupRealtimeCatalogs() {
            const branchStore = useBranchStore();
            const productStore = useProductStore();
            const inventoryStore = useInventoryStore();



            if (!this._listenerStatus.branches || this._listenerStatus.products) {

                await inventoryStore.initializeListeners();

                // await branchStore.setupRealtimeActiveBranches();
                this._listenerStatus.products = true;
                this._listenerStatus.branches = true;
            }

            // set ng default branch

            // const branches = inventoryStore.getActiveBranchNames;

            if (inventoryStore.selectedBranchId) {
                // selectedBranchId.value = inventoryStore.selectedBranchId;
                inventoryStore.setSelectedBranch(inventoryStore.selectedBranchId.value);
            }
            if (branchStore.fetchedbranches.length > 0) {
                // selectedBranchId.value = branches.value[0].id;
                inventoryStore.setSelectedBranch(branchStore.fetchedbranches[0].id);
            }


            // if (!this._listenerStatus.products) {
            //     productStore.setupRealtimeActiveProducts();
            //     this._listenerStatus.products = true;
            // }

            // if(this._listenerStatus.stock) {
            //     await inventoryStore.setupRealtimeStock();
            //     this._listenerStatus.stock = true;
            // }

            // get stock
            // get products


        },

        async unsubscribeCatalogs() {

            const inventoryStore = useInventoryStore();


            inventoryStore.clearStockListener();
            inventoryStore.unsubscribeBranches();
            inventoryStore.unsubscribeProducts();
        },

        // Set up real-time listener for orders
        async setupRealtimeOrders() {
            if (this.unsubscribe) {
                this.unsubscribe();
            }

            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

            this.unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const orderData = { id: change.doc.id, ...change.doc.data() };
                        const index = this.orders.findIndex(o => o.id === orderData.id);
                        if (index === -1) {
                            this.orders.unshift(orderData);
                        }
                    }
                    if (change.type === "modified") {
                        const orderData = { id: change.doc.id, ...change.doc.data() };
                        const index = this.orders.findIndex(o => o.id === orderData.id);
                        if (index !== -1) {
                            this.orders[index] = orderData;
                        } else {
                            this.orders.unshift(orderData);
                        }
                    }
                    if (change.type === "removed") {
                        this.orders = this.orders.filter(o => o.id !== change.doc.id);
                    }
                });
            }, (error) => {
                console.error("Error in real-time orders listener:", error);
                this.error = error.message;
            });
        },

        // Clean up listener
        stopRealtimeOrders() {
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
        },

        // Fetch orders from backend
        async fetchOrders() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(`${apiUrl}orders`);
                this.orders = response.data;
                return this.orders;
            } catch (error) {
                console.error('Error fetching orders:', error);
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
                console.error('Error fetching order:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        
        async saveAdminOrder({
            orderItems,
            customerName,
            paymentType,
            additionalNotes,
            selectedBranchId
        }) {

            try {

                if (!auth.currentUser) {
                    throw new Error('User is not authenticated');
                }

                const token = await auth.currentUser.getIdToken();

                console.log(orderItems);
                // Compute total price in the store (optional if backend also computes)
                // const totalPrice = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                const items = orderItems.map(item => {
                    const onSale = isVarietyOnSale(item.variety);
                    const unitPrice = getVarietyPrice(item.variety);
                    const quantity = item.quantity;

                    return {
                        productId: item.productId,
                        varietyId: item.varietyId,
                        productName: item.product.name,
                        varietyName: item.variety.name,
                        onSale: onSale,
                        sale: onSale ? {
                            startDate: item.variety.sale.startDate?.seconds * 1000,
                            endDate: item.variety.sale.endDate?.seconds * 1000,
                            salePrice: item.variety.sale.salePrice,
                        } : null,
                        unitPrice,
                        quantity,
                        unit: item.variety.unit,
                        totalPrice: unitPrice * quantity || 0,
                    }
                });
                const discounts = 0;

                console.log('items', items);

                const totalPrice = discounts? (computeOrderTotalPrice(items) || 0) - discounts : computeOrderTotalPrice(items) || 0;

                const payload = {
                    branchId: selectedBranchId,
                    customerName,
                    paymentType,
                    notes: additionalNotes || '',
                    discounts,
                    totalPrice,
                    status: 'approved',
                    items,
                    createdAt: new Date().toISOString()
                };


                console.log('payload', payload);

                // Replace with your actual backend endpoint
                const response = await axios.post(
                    `${apiUrl}orders`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                return response.data;
            } catch (error) {
                console.log(error);
            }
        },


        // Create a new order
        async createOrder(orderData) {
            this.loading = true;
            this.error = null;

            const idToken = await getIdToken(auth.currentUser)

            try {
                const response = await axios.post(`${apiUrl}orders`, orderData, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Error creating order:', error);
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

            const idToken = await getIdToken(auth.currentUser)


            try {
                const response = await axios.put(`${apiUrl}orders/${orderData.id}`, orderData, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Error updating order:', error);
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
            const idToken = await getIdToken(auth.currentUser)

            try {
                const response = await axios.post(`${apiUrl}orders/${orderId}/approve`, {}, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Error approving order:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Void an order
        async voidOrder(orderId) {
            this.loading = true;
            this.error = null;

            const idToken = await getIdToken(auth.currentUser)

            try {
                const response = await axios.post(`${apiUrl}orders/${orderId}/void`, {},
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    });
                return response.data;
            } catch (error) {
                console.error('Error voiding order:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        }
    },
    // Persist selected branch ID
    persist: {
        enabled: true,
        // strategies: [
        //     {
        //         key: 'inventory-store',
        //         storage: localStorage,
        //         paths: ['selectedBranchId']
        //     }
        // ]
    }
});