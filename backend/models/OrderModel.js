// backend\models\OrderModel.js
const { db, Timestamp } = require('../config/firebase');

const OrderModel = {
    //#region Create
    async createOrder(order) {
        try {
            const orderRef = await db.collection("orders").add({
                ...order,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            return { id: orderRef.id, ...order }
        } catch (error) {
            throw new Error("Error saving order data to Firestore: " + error.message)
        }
    },
    //#endregion

    //#region GetbyId
    async getOrderById(orderId) {
        try {
            const orderDoc = await db.collection("orders").doc(orderId).get()

            if (!orderDoc.exists) {
                return null
            }

            return { id: orderDoc.id, ...orderDoc.data() }
        } catch (error) {
            throw new Error("Error fetching order from Firestore: " + error.message)
        }
    },
    //#endregion

    //#region Update
    async updateOrder(orderId, orderData) {
        try {
            await db
                .collection("orders")
                .doc(orderId)
                .update({
                    ...orderData,
                    updatedAt: new Date(),
                })

            return { id: orderId, ...orderData }
        } catch (error) {
            throw new Error("Error updating order in Firestore: " + error.message)
        }
    },
    //#endregion
    
    //#region Void
    async voidOrder(orderId) {
        try {
            await db.collection("orders").doc(orderId).update({
                status: "Voided",
                updatedAt: new Date(),
            })

            return { success: true }
        } catch (error) {
            throw new Error("Error voiding order in Firestore: " + error.message)
        }
    },
    //#endregion

    //#region GetOrders
    async getOrders(options = {}) {
        try {
            const { limit = 10, startAfter = null, status = null, startDate = null, endDate = null, search = null } = options

            let query = db.collection("orders").orderBy("createdAt", "desc")

            if (status) {
                query = query.where("status", "==", status)
            }

            if (startDate && endDate) {
                query = query.where("createdAt", ">=", startDate).where("createdAt", "<=", endDate)
            }

            if (startAfter) {
                query = query.startAfter(startAfter)
            }

            query = query.limit(limit)

            const snapshot = await query.get()

            const orders = []
            snapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() })
            })

            const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null

            return {
                orders,
                lastVisible,
                hasMore: snapshot.docs.length === limit,
            }
        } catch (error) {
            throw new Error("Error fetching orders from Firestore: " + error.message)
        }
    },
    //#endregion
    
    // #region Copilot

    async getOrdersByCustomer(customerId) {
        try {
            const query = db.collection("orders").where("customerId", "==", customerId).orderBy("createdAt", "desc")

            const snapshot = await query.get()

            const orders = []
            snapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() })
            })

            return orders
        } catch (error) {
            throw new Error("Error fetching orders from Firestore: " + error.message)
        }
    },

    async getOrdersByProduct(productId) {
        try {
            const query = db.collection("orders").where("productId", "==", productId).orderBy("createdAt", "desc")

            const snapshot = await query.get()

            const orders = []
            snapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() })
            })

            return orders
        } catch (error) {
            throw new Error("Error fetching orders from Firestore: " + error.message)
        }
    },

    async getOrdersByStatus(status) {
        try {
            const query = db.collection("orders").where("status", "==", status).orderBy("createdAt", "desc")

            const snapshot = await query.get()

            const orders = []
            snapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() })
            })

            return orders
        } catch (error) {
            throw new Error("Error fetching orders from Firestore: " + error.message)
        }
    },

    async getOrdersByDate(startDate, endDate) {
        try {
            const query = db.collection("orders").where("createdAt", ">=", startDate).where("createdAt", "<=", endDate).orderBy("createdAt", "desc")

            const snapshot = await query.get()

            const orders = []
            snapshot.forEach((doc) => {
                orders.push({ id: doc.id, ...doc.data() })
            })

            return orders
        } catch (error) {
            throw new Error("Error fetching orders from Firestore: " + error.message)
        }
    },
    //#endregion
};

module.exports = OrderModel;