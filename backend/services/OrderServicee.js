// backend\services\OrderService.js
// backend/services/OrderService.js
const OrderRepository = require("../repositories/OrderRepository")
const ProductRepository = require("../repositories/ProductRepository")
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


            console.log('orderDate items');
            console.log(orderData.items);
            // Validate stock and pricing for all items
            await this.validateOrderItems(orderData.items)

            // Create order object
            const order = {
                orderNumber,
                branchId: orderData.branchId,
                paymentType: orderData.paymentType,
                notes: orderData.notes || "",
                discounts: orderData.discounts || 0,
                client: orderData.customerName,
                items: orderData.items.map((item) => ({
                    productId: item.productId,
                    product: item.productName,
                    varietyId: item.varietyId,

                    quantity: item.quantity,
                    unit: item.unit,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    onSale: item.onSale,
                    sale: item.onSale ? { 
                        startDate: item.sale?.startDate,
                        endDate: item.sale?.endDate,
                        salePrice: item.sale?.salePrice
                    } : null,
                })),
                totalPrice: orderData.totalPrice,
                status: "Pending", // All orders start as pending
            }

            console.log('order');
            console.log(order);

            // Save order
            return await this.orderRepository.create(order)
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`)
        }
    }

    // Validate order items for stock and pricing
    async validateOrderItems(items) {
        const productIds = [...new Set(items.map(item => item.productId))]
        const productReads = []

        // Read all products first
        for (const productId of productIds) {
            productReads.push(this.productRepository.getById(productId))
        }

        const products = await Promise.all(productReads)
        const productMap = new Map()

        products.forEach(product => {
            if (product) productMap.set(product.id, product)
        })

        // Validate each item
        for (const item of items) {
            const product = productMap.get(item.productId)

            if (!product) {
                throw new Error(`Product not found: ${item.productId}`)
            }

            // Find the variety
            const variety = product.varieties.find(
                v => v.id === (item.varietyId || '')
            )

            if (!variety) {
                throw new Error(`Variety not found: ${item.variety?.varietyName} for product ${item.product}`)
            }

            // Check stock
            if (variety.stockQuantity < item.quantity) {
                throw new Error(`Not enough stock for ${item.product} (${item.variety.varietyName}): requested ${item.quantity}, available ${variety.stockQuantity}`)
            }

            // Validate pricing
            const currentPrice = this.getCurrentPrice(variety)
            if (Math.abs(currentPrice - item.unitPrice) > 0.01) {
                throw new Error(`Price mismatch for ${item.product} (${item.variety.varietyName}): current price is ${currentPrice}, order price is ${item.unitPrice}`)
            }
        }

        return true
    }

    // Get current price for a variety
    getCurrentPrice(variety) {
        if (variety.onSale && variety.sale) {
            const now = Date.now()
            const startDate = variety.sale.startDate?.seconds * 1000
            const endDate = variety.sale.endDate?.seconds * 1000

            if (now >= startDate && now <= endDate) {
                return variety.sale.salePrice
            }
        }

        return variety.price
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

            // Check if order is already completed or voided
            if (existingOrder.status === "Completed" || existingOrder.status === "Voided") {
                throw new Error(`Cannot update order with status: ${existingOrder.status}`)
            }

            // Validate stock and pricing for all items
            await this.validateOrderItems(orderData.items)

            // Update order data
            const updatedOrder = {
                orderNumber: existingOrder.orderNumber, // Preserve the original order number
                client: orderData.customerName,
                items: orderData.items.map((item) => ({
                    productId: item.productId,
                    product: item.product || item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    variety: item.variety,
                    totalPrice: item.totalPrice,
                    pricingSnapshot: item.pricingSnapshot || {
                        originalPrice: item.variety?.originalPrice || item.unitPrice,
                        onSale: item.saleInfo?.onSale || false,
                        salePrice: item.saleInfo?.salePrice || null,
                        saleEndTime: item.saleInfo?.saleEndTime || null
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

    // Approve an order - this is where inventory is updated
    async approveOrder(orderId) {
        try {
            // Get existing order
            const existingOrder = await this.orderRepository.getById(orderId)
            if (!existingOrder) {
                throw new Error("Order not found")
            }

            // Check if order is already completed or voided
            if (existingOrder.status === "Completed" || existingOrder.status === "Voided") {
                throw new Error(`Cannot approve order with status: ${existingOrder.status}`)
            }

            // Read all product documents first and store them
            const productIds = [...new Set(existingOrder.items.map(item => item.productId))]
            const productReads = []

            for (const productId of productIds) {
                productReads.push(this.productRepository.getById(productId))
            }

            const products = await Promise.all(productReads)
            const productMap = new Map()

            products.forEach(product => {
                if (product) productMap.set(product.id, product)
            })

            // Process all the product data and prepare updates
            const productUpdates = []

            for (const item of existingOrder.items) {
                const product = productMap.get(item.productId)

                if (!product) {
                    throw new Error(`Product not found: ${item.productId}`)
                }

                // Find the variety
                const varietyIndex = product.varieties.findIndex(
                    v => v.name === (item.variety?.varietyName || '')
                )

                if (varietyIndex === -1) {
                    throw new Error(`Variety not found: ${item.variety?.varietyName} for product ${item.product}`)
                }

                // Check if enough stock is available
                if (product.varieties[varietyIndex].stockQuantity < item.quantity) {
                    throw new Error(`Not enough stock for ${item.product} (${item.variety.varietyName}): requested ${item.quantity}, available ${product.varieties[varietyIndex].stockQuantity}`)
                }

                // Update stock quantity
                product.varieties[varietyIndex].stockQuantity -= item.quantity

                // Store the update for later
                productUpdates.push({
                    productId: item.productId,
                    data: { varieties: product.varieties }
                })
            }

            // Perform all updates
            for (const update of productUpdates) {
                await this.productRepository.update(update.productId, update.data)
            }

            // Update order status
            return await this.orderRepository.updateStatus(orderId, "Completed")
        } catch (error) {
            throw new Error(`Error approving order: ${error.message}`)
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

            // If order was completed, return items to inventory
            if (existingOrder.status === "Completed") {
                // Read all product documents first and store them
                const productIds = [...new Set(existingOrder.items.map(item => item.productId))]
                const productReads = []

                for (const productId of productIds) {
                    productReads.push(this.productRepository.getById(productId))
                }

                const products = await Promise.all(productReads)
                const productMap = new Map()

                products.forEach(product => {
                    if (product) productMap.set(product.id, product)
                })

                // Process all the product data and prepare updates
                const productUpdates = []

                for (const item of existingOrder.items) {
                    const product = productMap.get(item.productId)

                    if (!product) {
                        throw new Error(`Product not found: ${item.productId}`)
                    }

                    // Find the variety
                    const varietyIndex = product.varieties.findIndex(
                        v => v.name === (item.variety?.varietyName || '')
                    )

                    if (varietyIndex === -1) {
                        throw new Error(`Variety not found: ${item.variety?.varietyName} for product ${item.product}`)
                    }

                    // Return stock quantity
                    product.varieties[varietyIndex].stockQuantity += item.quantity

                    // Store the update for later
                    productUpdates.push({
                        productId: item.productId,
                        data: { varieties: product.varieties }
                    })
                }

                // Perform all updates
                for (const update of productUpdates) {
                    await this.productRepository.update(update.productId, update.data)
                }
            }

            // Update order status
            return await this.orderRepository.updateStatus(id, "Voided")
        } catch (error) {
            throw new Error(`Error voiding order: ${error.message}`)
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