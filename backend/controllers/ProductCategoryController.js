// backend\controllers\ProductCategoryController.js

// backend/controllers/ProductCategoryController.js
// This class handles HTTP requests for product-category relationships

const ProductService = require("../services/ProductService")
const CategoryService = require("../services/CategoryService")
const { db } = require("../config/firebase")

class ProductCategoryController {
    constructor() {
        this.productService = new ProductService()
        this.categoryService = new CategoryService()
    }

    // Move products between categories
    async moveProductsBetweenCategories(req, res) {
        try {
            console.log('moving');
            const { productIds, sourceCategoryId, targetCategoryId, keepInSource = false } = req.body

            console.log(req.body);
            
            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({ error: "Product IDs are required" })
            }

            if (!targetCategoryId) {
                return res.status(400).json({ error: "Target category ID is required" })
            }

            // Get source and target categories
            const sourceCategory = sourceCategoryId ? await this.categoryService.getCategoryById(sourceCategoryId) : null
            const targetCategory = await this.categoryService.getCategoryById(targetCategoryId)

            if (!targetCategory) {
                return res.status(404).json({ error: "Target category not found" })
            }

            if (sourceCategoryId && !sourceCategory) {
                return res.status(404).json({ error: "Source category not found" })
            }

            // Process each product
            let batch = db.batch()
            let updateCount = 0

            for (const productId of productIds) {
                const productDoc = await db.collection("products").doc(productId).get()

                if (!productDoc.exists) {
                    console.warn(`Product ${productId} not found, skipping`)
                    continue
                }

                const productData = productDoc.data()
                let categories = [...(productData.category || [])]

                // Add to target category if not already there
                if (!categories.includes(targetCategory.name)) {
                    categories.push(targetCategory.name)
                }

                // Remove from source category if needed
                if (sourceCategory && !keepInSource) {
                    categories = categories.filter((cat) => cat !== sourceCategory.name)
                }

                console.log('updating');
                // Update the product
                batch.update(productDoc.ref, { category: categories })
                updateCount++

                // Commit in batches of 500 (Firestore limit)
                if (updateCount >= 500) {
                    await batch.commit()
                    batch = db.batch()
                    updateCount = 0
                }
            }

            // Commit any remaining updates
            if (updateCount > 0) {
                await batch.commit()
            }

            return res.status(200).json({
                message: `Successfully moved ${productIds.length} products to ${targetCategory.name}`,
            })
        } catch (error) {
            console.error("Error moving products between categories:", error)
            return res.status(500).json({ error: "Failed to move products between categories" })
        }
    }

    // Remove a product from a category
    async removeProductFromCategory(req, res) {
        try {
            const { productId, categoryId } = req.body

            if (!productId) {
                return res.status(400).json({ error: "Product ID is required" })
            }

            if (!categoryId) {
                return res.status(400).json({ error: "Category ID is required" })
            }

            // Get the category
            const category = await this.categoryService.getCategoryById(categoryId)
            if (!category) {
                return res.status(404).json({ error: "Category not found" })
            }

            // Get the product
            const productDoc = await db.collection("products").doc(productId).get()
            if (!productDoc.exists) {
                return res.status(404).json({ error: "Product not found" })
            }

            const productData = productDoc.data()
            const categories = (productData.category || []).filter((cat) => cat !== category.name)

            // Update the product
            await productDoc.ref.update({ category: categories })

            return res.status(200).json({
                message: `Successfully removed product from ${category.name}`,
            })
        } catch (error) {
            console.error("Error removing product from category:", error)
            return res.status(500).json({ error: "Failed to remove product from category" })
        }
    }

    // Remove multiple products from a category
    async removeProductsFromCategoryBulk(req, res) {
        try {
            const { productIds, categoryId } = req.body

            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({ error: "Product IDs are required" })
            }

            if (!categoryId) {
                return res.status(400).json({ error: "Category ID is required" })
            }

            // Get the category
            const category = await this.categoryService.getCategoryById(categoryId)
            if (!category) {
                return res.status(404).json({ error: "Category not found" })
            }

            // Process each product
            let batch = db.batch()
            let updateCount = 0

            for (const productId of productIds) {
                const productDoc = await db.collection("products").doc(productId).get()

                if (!productDoc.exists) {
                    console.warn(`Product ${productId} not found, skipping`)
                    continue
                }

                const productData = productDoc.data()
                const categories = (productData.category || []).filter((cat) => cat !== category.name)

                // Update the product
                batch.update(productDoc.ref, { category: categories })
                updateCount++

                // Commit in batches of 500 (Firestore limit)
                if (updateCount >= 500) {
                    await batch.commit()
                    batch = db.batch()
                    updateCount = 0
                }
            }

            // Commit any remaining updates
            if (updateCount > 0) {
                await batch.commit()
            }

            return res.status(200).json({
                message: `Successfully removed ${productIds.length} products from ${category.name}`,
            })
        } catch (error) {
            console.error("Error removing products from category:", error)
            return res.status(500).json({ error: "Failed to remove products from category" })
        }
    }
}

// Create singleton instance
const productCategoryController = new ProductCategoryController()

// Export request handler methods bound to the controller instance
module.exports = {
    moveProductsBetweenCategories:
        productCategoryController.moveProductsBetweenCategories.bind(productCategoryController),
    removeProductFromCategory: productCategoryController.removeProductFromCategory.bind(productCategoryController),
    removeProductsFromCategoryBulk:
        productCategoryController.removeProductsFromCategoryBulk.bind(productCategoryController),
}
