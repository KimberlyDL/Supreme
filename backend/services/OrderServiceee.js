// backend/services/OrderService.js
// This class contains business logic for orders

const OrderRepository = require("../repositories/OrderRepository")
const ProductRepository = require("../repositories/ProductRepository")
const Order = require("../models/Order")
const { Timestamp } = require("../config/firebase")
const { v4: uuidv4 } = require("uuid")

class OrderService {
    constructor() {
        this.orderRepository = new OrderRepository()
        this.productRepository = new ProductRepository()
    }

    // Create a new order
    async createOrder(orderData) {
        try {
            // Validate customer name
            if (!orderData.customerName) {
                throw new Error("Customer name is required")
            }

            // Validate items
            if (!orderData.items || orderData.items.length === 0) {
                throw new Error("At least one item is required")
            }

            // Generate a custom order ID
            const orderNumber = this.generateOrderNumber()

            // Create order object
            const order = {
                orderNumber,
                client: orderData.customerName,
                items: orderData.items.map((item) => ({
                    productId: item.productId,
                    product: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,

                    varietyName: item.varietyName,
                    varietyQuantity: item.varietyQuantity,
                    varietyUnit: item.varietyUnit,
                    
                    // variety: item.variety.name,
                    // varietyQuantity: item.variety.quantity,
                    // varietyUnit: item.variety.unit,

                    totalPrice: item.totalPrice,
                    // Store pricing information for historical reference
                    pricingSnapshot: item.pricingSnapshot || {
                        // unitPrice: item.unitPrice,
                        originalPrice: item.variety?.originalPrice || item.unitPrice,
                        isOnSale: item.variety?.isOnSale || false,
                        salePrice: item.variety?.salePrice || null,
                    },
                })),
                totalPrice: orderData.totalPrice,
                status: "Pending",
            }

            // Update product stock quantities
            await this.updateProductStock(order.items)

            // Save order
            return await this.orderRepository.create(order)
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`)
        }
    }

    // Generate a unique order number
    generateOrderNumber() {
        const timestamp = new Date().getTime().toString().slice(-6)
        const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")
        return `ORD-${timestamp}-${random}`
    }

    // Get all orders with filtering and pagination
    async getAllOrders(filters = {}) {
        try {
            // Transform filters for repository
            const repoFilters = {}

            if (filters.status) {
                repoFilters.status = filters.status
            }

            if (filters.startDate) {
                repoFilters.startDate = Timestamp.fromDate(new Date(filters.startDate))
            }

            if (filters.endDate) {
                repoFilters.endDate = Timestamp.fromDate(new Date(filters.endDate))
            }

            if (filters.search) {
                repoFilters.client = filters.search
            }

            if (filters.limit) {
                repoFilters.limit = Number.parseInt(filters.limit)
            }

            if (filters.startAfter) {
                repoFilters.startAfter = filters.startAfter
            }

            return await this.orderRepository.getAll(repoFilters)
        } catch (error) {
            throw new Error(`Error fetching orders: ${error.message}`)
        }
    }

    // Get order by ID
    async getOrderById(id) {
        try {
            return await this.orderRepository.getById(id)
        } catch (error) {
            throw new Error(`Error fetching order: ${error.message}`)
        }
    }

    // Update an order
    async updateOrder(orderData) {
        try {
            // Validate order ID
            if (!orderData.id) {
                throw new Error("Order ID is required")
            }

            // Get existing order
            const existingOrder = await this.orderRepository.getById(orderData.id)
            if (!existingOrder) {
                throw new Error("Order not found")
            }

            // Check if order is voided
            if (existingOrder.status === "Voided") {
                throw new Error("Cannot update a voided order")
            }

            // Calculate stock changes
            await this.handleStockChanges(existingOrder.items, orderData.items)

            // Update order data
            const updatedOrder = {
                orderNumber: existingOrder.orderNumber, // Preserve the original order number
                client: orderData.customerName,
                items: orderData.items.map((item) => ({
                    productId: item.productId,
                    product: item.productName || item.product,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    variety: item.variety,
                    totalPrice: item.totalPrice,
                    pricingSnapshot: item.pricingSnapshot || {
                        unitPrice: item.unitPrice,
                        originalPrice: item.variety?.originalPrice || item.unitPrice,
                        isOnSale: item.variety?.isOnSale || false,
                        salePrice: item.variety?.salePrice || null,
                    },
                })),
                totalPrice: orderData.totalPrice,
                status: existingOrder.status,
            }

            return await this.orderRepository.update(orderData.id, updatedOrder)
        } catch (error) {
            throw new Error(`Error updating order: ${error.message}`)
        }
    }

    // Handle stock changes when updating an order
    async handleStockChanges(oldItems, newItems) {
        try {
            // Create maps for easier lookup
            const oldItemMap = new Map()
            oldItems.forEach((item) => {
                const key = `${item.productId}-${item.variety?.varietyName || "default"}`
                oldItemMap.set(key, item)
            })

            const newItemMap = new Map()
            newItems.forEach((item) => {
                const key = `${item.productId}-${item.variety?.varietyName || "default"}`
                newItemMap.set(key, item)
            })

            // Items to update stock for
            const stockUpdates = []

            // Check for removed or quantity decreased items (increase stock)
            oldItemMap.forEach((oldItem, key) => {
                const newItem = newItemMap.get(key)

                if (!newItem) {
                    // Item was removed, increase stock by old quantity
                    stockUpdates.push({
                        productId: oldItem.productId,
                        varietyName: oldItem.variety?.varietyName,
                        quantityChange: oldItem.quantity, // Positive means increase stock
                    })
                } else if (oldItem.quantity > newItem.quantity) {
                    // Quantity decreased, increase stock by the difference
                    stockUpdates.push({
                        productId: oldItem.productId,
                        varietyName: oldItem.variety?.varietyName,
                        quantityChange: oldItem.quantity - newItem.quantity, // Positive means increase stock
                    })
                }
            })

            // Check for added or quantity increased items (decrease stock)
            newItemMap.forEach((newItem, key) => {
                const oldItem = oldItemMap.get(key)

                if (!oldItem) {
                    // Item was added, decrease stock by new quantity
                    stockUpdates.push({
                        productId: newItem.productId,
                        varietyName: newItem.variety?.varietyName,
                        quantityChange: -newItem.quantity, // Negative means decrease stock
                    })
                } else if (newItem.quantity > oldItem.quantity) {
                    // Quantity increased, decrease stock by the difference
                    stockUpdates.push({
                        productId: newItem.productId,
                        varietyName: newItem.variety?.varietyName,
                        quantityChange: -(newItem.quantity - oldItem.quantity), // Negative means decrease stock
                    })
                }
            })

            // Apply all stock updates
            for (const update of stockUpdates) {
                await this.updateProductVarietyStock(update.productId, update.varietyName, update.quantityChange)
            }
        } catch (error) {
            throw new Error(`Error handling stock changes: ${error.message}`)
        }
    }

    // Update product stock quantities
    async updateProductStock(items) {
        try {
            console.log('items', items);

            for (const item of items) {
                await this.updateProductVarietyStock(
                    item.productId,
                    item.varietyName,
                    -item.quantity, // Negative means decrease stock
                )
            }
        } catch (error) {
            throw new Error(`Error updating product stock: ${error.message}`)
        }
    }

    // Update stock for a specific product variety
    async updateProductVarietyStock(productId, varietyName, quantityChange) {
        try {
            const product = await this.productRepository.getById(productId)

            if (!product) {
                throw new Error(`Product not found: ${productId}`)
            }

            // console.log("Product found:", product)
            console.log("Variety name:", varietyName)

            // Find the variety
            const varietyIndex = product.varieties.findIndex((v) => v.name === varietyName)

            if (varietyIndex === -1) {
                throw new Error(`Variety not found: ${varietyName} for product ${productId}`)
            }

            // Update stock quantity
            const newStockQuantity = product.varieties[varietyIndex].stockQuantity + quantityChange

            // Ensure stock doesn't go below zero
            product.varieties[varietyIndex].stockQuantity = Math.max(0, newStockQuantity)

            // Save updated product
            await this.productRepository.update(productId, product)
        } catch (error) {
            throw new Error(`Error updating product variety stock: ${error.message}`)
        }
    }

    // Void an order
    async voidOrder(id) {
        try {
            // Get existing order
            const existingOrder = await this.orderRepository.getById(id)
            if (!existingOrder) {
                throw new Error("Order not found")
            }

            // Check if order is already voided
            if (existingOrder.status === "Voided") {
                throw new Error("Order is already voided")
            }

            // Return items to stock
            for (const item of existingOrder.items) {
                await this.updateProductVarietyStock(
                    item.productId,
                    item.variety?.varietyName,
                    item.quantity, // Positive means increase stock
                )
            }

            // Update order status
            return await this.orderRepository.updateStatus(id, "Voided")
        } catch (error) {
            throw new Error(`Error voiding order: ${error.message}`)
        }
    }

    // Complete an order
    async completeOrder(id) {
        try {
            // Get existing order
            const existingOrder = await this.orderRepository.getById(id)
            if (!existingOrder) {
                throw new Error("Order not found")
            }

            // Check if order is voided
            if (existingOrder.status === "Voided") {
                throw new Error("Cannot complete a voided order")
            }

            // Update order status
            return await this.orderRepository.updateStatus(id, "Completed")
        } catch (error) {
            throw new Error(`Error completing order: ${error.message}`)
        }
    }

    // Delete an order (admin only)
    async deleteOrder(id) {
        try {
            return await this.orderRepository.delete(id)
        } catch (error) {
            throw new Error(`Error deleting order: ${error.message}`)
        }
    }
}

module.exports = OrderService

