// backend\repositories\CartRepository.js
// This class handles all database operations for products
const { db, Timestamp } = require("../config/firebase")
const Product = require("../models/Product")

// #region Old Codes 
class CartRepository {
    constructor() {
        this.collection = "cart"
        this.collectionStock = "branch_stocks"
    }

    // // Create a new product
    // async create(productData, productId) {
    //     try {
    //         // Ensure we're working with a plain object, not a class instance
    //         let dataToSave = productData

    //         // If it's a Product instance, convert it to a plain object
    //         if (productData instanceof Product) {
    //             dataToSave = productData.toDatabase()
    //         }

    //         // Set timestamps
    //         dataToSave.createdAt = Timestamp.now()
    //         dataToSave.updatedAt = Timestamp.now()

    //         // // Save to database
    //         // const docRef = await db.collection(this.collection).add(dataToSave)

    //         // Save to database using custom productId
    //         // Use .doc(productId) to set custom ID
    //         const docRef = await db.collection(this.collection).doc(productId).set(dataToSave)

    //         // Return product with ID
    //         return { id: docRef.id, ...dataToSave }
    //     } catch (error) {
    //         throw new Error(`Error creating product: ${error.message}`)
    //     }
    // }
    // Update a cart item
    async updateCartItem(cartItemId, updatedData) {
        try {
            await db.collection(this.collection).doc(cartItemId).update(updatedData)
            return true
        } catch (error) {
            throw new Error(`Error updating cart item: ${error.message}`)
        }
    }

    // Create a new product
    async addToCart(item) {
        try {
            // Ensure we're working with a plain object, not a class instance
            let dataToSave = item

            // If it's a Product instance, convert it to a plain object
            // if (productData instanceof Product) {
            //     dataToSave = productData.toDatabase()
            // }

            // Set timestamps
            dataToSave.createdAt = Timestamp.now()
            dataToSave.updatedAt = Timestamp.now()

            // // Save to database
            // const docRef = await db.collection(this.collection).add(dataToSave)

            // Save to database using custom productId
            // Use .doc(productId) to set custom ID
            // const docRef = await db.collection(this.collection).doc(productId).set(dataToSave)

            const docRef = await db.collection(this.collection).add(dataToSave);
            // return { id: docRef.id, ...logData };
            // Return product with ID
            return { id: docRef.id, ...dataToSave }
        } catch (error) {
            throw new Error(`Error adding to cart product: ${error.message}`)
        }
    }

    // Get all cart items
    async getAllCartItems() {
        try {
            const snapshot = await db.collection(this.collection).get()

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
        } catch (error) {
            throw new Error(`Error fetching stock: ${error.message}`)
        }
    }

    // Get all products
    async getAll() {
        try {
            const snapshot = await db.collection(this.collectionStock).get()

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
        } catch (error) {
            throw new Error(`Error fetching stock: ${error.message}`)
        }
    }
}

module.exports = CartRepository

//#endregion Old Codes