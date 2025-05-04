// frontend\src\stores\orderStore.js
import { defineStore } from 'pinia';
import { db } from '@/services/firebase';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    runTransaction
} from 'firebase/firestore';
import { useProductStore } from './productStore';

export const useOrderStore = defineStore('order', {
    state: () => ({
        orders: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchOrders() {
            this.loading = true;
            this.error = null;
            try {
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);

                this.orders = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                return this.orders;
            } catch (error) {
                console.error('Error fetching orders:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchOrderById(orderId) {
            this.loading = true;
            this.error = null;
            try {
                const orderRef = doc(db, 'orders', orderId);
                const orderDoc = await getDoc(orderRef);

                if (!orderDoc.exists()) {
                    throw new Error('Order not found');
                }

                return {
                    id: orderDoc.id,
                    ...orderDoc.data()
                };
            } catch (error) {
                console.error('Error fetching order:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createOrder(orderData) {
            this.loading = true;
            this.error = null;
            try {
                // Generate order number
                const orderNumber = `ORD-${Math.floor(Math.random() * 1000000)}-${Math.floor(Math.random() * 1000)}`;

                const orderRef = await addDoc(collection(db, 'orders'), {
                    orderNumber,
                    client: orderData.customerName,
                    items: orderData.items,
                    totalPrice: orderData.totalPrice,
                    status: orderData.status || 'Pending', // Default to Pending
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });

                return {
                    id: orderRef.id,
                    orderNumber
                };
            } catch (error) {
                console.error('Error creating order:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateOrder(orderData) {
            this.loading = true;
            this.error = null;
            try {
                const orderRef = doc(db, 'orders', orderData.id);

                await updateDoc(orderRef, {
                    client: orderData.customerName,
                    items: orderData.items,
                    totalPrice: orderData.totalPrice,
                    updatedAt: serverTimestamp()
                });

                return true;
            } catch (error) {
                console.error('Error updating order:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async voidOrder(orderId) {
            this.loading = true;
            this.error = null;
            try {
                const orderRef = doc(db, 'orders', orderId);

                await updateDoc(orderRef, {
                    status: 'Voided',
                    updatedAt: serverTimestamp()
                });

                return true;
            } catch (error) {
                console.error('Error voiding order:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        //#region Approve Order

        async approveOrder(orderId) {
            this.loading = true;
            this.error = null;
            try {
                const orderRef = doc(db, 'orders', orderId);

                // Use a transaction to ensure data consistency
                await runTransaction(db, async (transaction) => {
                    // STEP 1: PERFORM ALL READS FIRST
                    const orderDoc = await transaction.get(orderRef);

                    if (!orderDoc.exists()) {
                        throw new Error('Order not found');
                    }

                    const orderData = orderDoc.data();

                    // Check if order is already completed or voided
                    if (orderData.status === 'Completed' || orderData.status === 'Voided') {
                        throw new Error(`Cannot approve order with status: ${orderData.status}`);
                    }

                    // Read all product documents first and store them
                    const productReads = [];
                    const productRefs = [];

                    for (const item of orderData.items) {
                        const productRef = doc(db, 'products', item.productId);
                        productRefs.push({ ref: productRef, item });
                        productReads.push(transaction.get(productRef));
                    }

                    // Wait for all product reads to complete
                    const productDocs = await Promise.all(productReads);

                    // Process all the product data and prepare updates
                    const productUpdates = [];

                    for (let i = 0; i < productDocs.length; i++) {
                        const productDoc = productDocs[i];
                        const { item } = productRefs[i];

                        if (!productDoc.exists()) {
                            throw new Error(`Product not found: ${item.productId}`);
                        }

                        const productData = productDoc.data();

                        // Find the variety
                        const varietyIndex = productData.varieties.findIndex(
                            v => v.name === item.variety.varietyName
                        );

                        if (varietyIndex === -1) {
                            throw new Error(`Variety not found: ${item.variety.varietyName}`);
                        }

                        // Check if enough stock is available
                        if (productData.varieties[varietyIndex].stockQuantity < item.quantity) {
                            throw new Error(`Not enough stock for ${item.product} (${item.variety.varietyName})`);
                        }

                        // Update stock quantity
                        productData.varieties[varietyIndex].stockQuantity -= item.quantity;

                        // Store the update for later
                        productUpdates.push({
                            ref: productRefs[i].ref,
                            data: { varieties: productData.varieties }
                        });
                    }

                    // STEP 2: PERFORM ALL WRITES AFTER ALL READS

                    // Update all products
                    for (const update of productUpdates) {
                        transaction.update(update.ref, update.data);
                    }

                    // Update order status
                    transaction.update(orderRef, {
                        status: 'Completed',
                        updatedAt: serverTimestamp()
                    });
                });

                return true;
            } catch (error) {
                console.error('Error approving order:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        }

        // async approveOrder(orderId) {
        //     this.loading = true;
        //     this.error = null;
        //     try {
        //         const productStore = useProductStore();
        //         const orderRef = doc(db, 'orders', orderId);

        //         // Use a transaction to ensure data consistency
        //         await runTransaction(db, async (transaction) => {
        //             const orderDoc = await transaction.get(orderRef);

        //             if (!orderDoc.exists()) {
        //                 throw new Error('Order not found');
        //             }

        //             const orderData = orderDoc.data();

        //             // Check if order is already completed or voided
        //             if (orderData.status === 'Completed' || orderData.status === 'Voided') {
        //                 throw new Error(`Cannot approve order with status: ${orderData.status}`);
        //             }

        //             // Update inventory for each item
        //             for (const item of orderData.items) {
        //                 const productRef = doc(db, 'products', item.productId);
        //                 const productDoc = await transaction.get(productRef);

        //                 if (!productDoc.exists()) {
        //                     throw new Error(`Product not found: ${item.productId}`);
        //                 }

        //                 const productData = productDoc.data();

        //                 // Find the variety
        //                 const varietyIndex = productData.varieties.findIndex(
        //                     v => v.name === item.variety.varietyName
        //                 );

        //                 if (varietyIndex === -1) {
        //                     throw new Error(`Variety not found: ${item.variety.varietyName}`);
        //                 }

        //                 // Check if enough stock is available
        //                 if (productData.varieties[varietyIndex].stockQuantity < item.quantity) {
        //                     throw new Error(`Not enough stock for ${item.product} (${item.variety.varietyName})`);
        //                 }

        //                 // Update stock quantity
        //                 productData.varieties[varietyIndex].stockQuantity -= item.quantity;

        //                 // Update the product
        //                 transaction.update(productRef, {
        //                     varieties: productData.varieties
        //                 });
        //             }

        //             // Update order status
        //             transaction.update(orderRef, {
        //                 status: 'Completed',
        //                 updatedAt: serverTimestamp()
        //             });
        //         });

        //         return true;
        //     } catch (error) {
        //         console.error('Error approving order:', error);
        //         this.error = error.message;
        //         throw error;
        //     } finally {
        //         this.loading = false;
        //     }
        // }

        //#endregion Approve Order
    },
    getters: {
        getOrderById: (state) => (orderId) => {
            return state.orders.find(order => order.id === orderId);
        }
    }
});