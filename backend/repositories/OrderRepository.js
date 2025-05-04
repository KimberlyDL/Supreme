// backend/repositories/OrderRepository.js
// This class handles all database operations for orders

const { db, Timestamp } = require("../config/firebase")
const Order = require("../models/Order")

class OrderRepository {
    constructor() {
        this.collection = "orders"
    }

    // Create a new order
    async create(orderData) {
        try {
            // Ensure we're working with a plain object, not a class instance
            let dataToSave = orderData

            // If it's an Order instance, convert it to a plain object
            if (orderData instanceof Order) {
                dataToSave = orderData.toDatabase()
            }

            // Set timestamps
            dataToSave.createdAt = Timestamp.now()
            dataToSave.updatedAt = Timestamp.now()

            // Save to database
            const docRef = await db.collection(this.collection).add(dataToSave)

            // Return order with ID
            return { id: docRef.id, ...dataToSave }
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`)
        }
    }

    // Get all orders
    async getAll(filters = {}) {
        try {
            let query = db.collection(this.collection)

            // Apply filters
            if (filters.status && filters.status !== "all") {
                query = query.where("status", "==", filters.status)
            }

            if (filters.startDate && filters.endDate) {
                query = query.where("createdAt", ">=", filters.startDate).where("createdAt", "<=", filters.endDate)
            }

            if (filters.client) {
                query = query.where("client", ">=", filters.client).where("client", "<=", filters.client + "\uf8ff")
            }

            // Apply sorting
            query = query.orderBy("createdAt", "desc")

            // Apply pagination
            if (filters.limit) {
                query = query.limit(filters.limit)
            }

            if (filters.startAfter) {
                query = query.startAfter(filters.startAfter)
            }

            const snapshot = await query.get()

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
        } catch (error) {
            throw new Error(`Error fetching orders: ${error.message}`)
        }
    }

    // Get order by ID
    async getById(id) {
        try {
            const doc = await db.collection(this.collection).doc(id).get()

            if (!doc.exists) {
                return null
            }

            return {
                id: doc.id,
                ...doc.data(),
            }
        } catch (error) {
            throw new Error(`Error fetching order: ${error.message}`)
        }
    }

    // Update order
    async update(id, orderData) {
        try {
            // Ensure we're working with a plain object, not a class instance
            let dataToSave = orderData

            // If it's an Order instance, convert it to a plain object
            if (orderData instanceof Order) {
                dataToSave = orderData.toDatabase()
            }

            // Set updated timestamp
            dataToSave.updatedAt = Timestamp.now()

            // Update in database
            await db.collection(this.collection).doc(id).update(dataToSave)

            // Return updated order
            return {
                id,
                ...dataToSave,
            }
        } catch (error) {
            throw new Error(`Error updating order: ${error.message}`)
        }
    }

    // Delete order
    async delete(id) {
        try {
            await db.collection(this.collection).doc(id).delete()
            return true
        } catch (error) {
            throw new Error(`Error deleting order: ${error.message}`)
        }
    }

    // Update order status
    async updateStatus(id, status) {
        try {
            await db.collection(this.collection).doc(id).update({
                status: status,
                updatedAt: Timestamp.now(),
            })
            return true
        } catch (error) {
            throw new Error(`Error updating order status: ${error.message}`)
        }
    }

    // Search orders by orderNumber
    async searchByOrderNumber(orderNumber) {
        try {
            const snapshot = await db.collection(this.collection).where("orderNumber", "==", orderNumber).get()

            if (snapshot.empty) {
                return []
            }

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
        } catch (error) {
            throw new Error(`Error searching orders by number: ${error.message}`)
        }
    }
}

module.exports = OrderRepository