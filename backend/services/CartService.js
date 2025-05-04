// backend\services\OrderService.js
// backend/services/OrderService.js
const OrderRepository = require("../repositories/OrderRepository")
const ProductRepository = require("../repositories/ProductRepository")
const CartRepository = require("../repositories/CartRepository")
const { Timestamp } = require("../config/firebase")
const { v4: uuidv4 } = require("uuid")

class CartService {
    constructor() {
        this.cartRepository = new CartRepository()
        this.productRepository = new ProductRepository()
    }

    // Create a new order
    async addToCart(item) {
        try {

            console.log("Adding item to cart:", item)

            // Validate items
            if (!item || item === 0) {
                throw new Error("At least one item is required")
            }
            // Check if item already exists in cart
            const cartItems = await this.cartRepository.getAllCartItems()

            const existingCartItem = cartItems.find(cartItem =>
                cartItem.productId === item.productId &&
                cartItem.variety.id === item.variety.id &&
                cartItem.branch === item.branch
            )


            if (existingCartItem) {
                // Item exists: add quantity to existing one

                const newQuantity = existingCartItem.quantity + item.quantity

                // Validate new total quantity against available stock
                await this.validateCartItem({ ...item, quantity: newQuantity })

                // Update existing cart item
                const updatedItem = {
                    ...existingCartItem,
                    quantity: newQuantity,
                    updatedAt: Timestamp.now(),
                }

                await this.cartRepository.updateCartItem(existingCartItem.id, updatedItem)

                return { message: "Cart item updated successfully.", item: updatedItem }
            } else {

                await this.validateCartItem(item);

                // Item does not exist: add as new cart item
                item.createdAt = Timestamp.now()
                item.updatedAt = Timestamp.now()

                const newCartItem = await this.cartRepository.addToCart(item)

                return { message: "New item added to cart.", item: newCartItem }
            }

            // // Validate stock and pricing for all items
            // await this.validateCartItem(item)


            // // Save order
            // return await this.cartRepository.addToCart(item)
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`)
        }
    }

    // // Validate order items for stock and pricing
    // async validateCartItem(items) {
    //     const product = await this.productRepository.getById(item.productId);


    //     if (!product) {
    //         throw new Error(`Product not found: ${item.productId}`);
    //     }

    //     // Find the matching variety by varietyId
    //     const variety = product.varieties.find(v => v.id === item.varietyId);

    //     if (!variety) {
    //         throw new Error(`Variety not found: ${item.varietyId} for product ${product.id}`);
    //     }

    //     // Check stock
    //     if (!this.checkItemStock(item)) {
    //         throw new Error(`Not enough stock for product ${product.id} (variety ${variety.id}): requested ${item.quantity}`);
    //     }

    //     // Validate pricing
    //     const currentPrice = this.getCurrentPrice(variety);
    //     if (Math.abs(currentPrice - item.unitPrice) > 0.01) {
    //         throw new Error(`Price mismatch for product ${product.id} (variety ${variety.id}): current price is ${currentPrice}, order price is ${item.unitPrice}`);
    //     }

    //     return true;
    // }

    // Validate item stock and pricing
    async validateCartItem(item) {
        const product = await this.productRepository.getById(item.productId)

        if (!product) {
            throw new Error(`Product not found: ${item.productId}`)
        }

        const variety = product.varieties.find(v => v.id === item.variety.id)

        if (!variety) {
            throw new Error(`Variety not found: ${item.variety.id} for product ${item.productId}`)
        }

        const stocks = await this.cartRepository.getAll()

        const matchingStock = stocks.find(stock =>
            stock.branchId === item.branch &&
            stock.varietyId === item.variety.id
        )

        if (!matchingStock) {
            throw new Error(`No stock found for branch ${item.branch} and variety ${item.variety.id}`)
        }

        if (matchingStock.quantity < item.quantity) {
            throw new Error(`Not enough stock: available ${matchingStock.quantity}, requested ${item.quantity}`)
        }

        // Validate pricing
        const currentPrice = this.getCurrentPrice(variety)
        if (Math.abs(currentPrice - item.price) > 0.01) {
            throw new Error(`Price mismatch: current price is ${currentPrice}, item price is ${item.price}`)
        }
    }

    // async checkItemStock(item) {
    //     try {
    //         const stocks = await this.cartRepository.getAll();

    //         // Find the matching stock
    //         const matchingStock = stocks.find(stock =>
    //             stock.branchId === item.branch &&
    //             stock.varietyId === item.varietyId
    //         );

    //         if (matchingStock) {
    //             console.log('Found matching stock:', matchingStock);

    //             if (matchingStock.quantity < item.quantity) {
    //                 console.warn('Not enough stock available:', matchingStock.quantity, 'for item:', item);
    //                 return false; // Not enough stock available
    //             }

    //             return true;

    //             // return matchingStock;

    //         } else {
    //             console.warn('No matching stock found for item:', item);
    //             return false;
    //         }

    //     } catch (error) {
    //         console.error('Error checking stock:', error);
    //         throw new Error('Error checking stock availability');
    //     }
    // }
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

    // // Generate a unique order number
    // generateOrderNumber() {
    //     const timestamp = new Date().getTime().toString().slice(-6)
    //     const random = Math.floor(Math.random() * 1000)
    //         .toString()
    //         .padStart(3, "0")
    //     return `ORD-${timestamp}-${random}`
    // }

    // // Get all orders with filtering and pagination
    // async getAllOrders(filters = {}) {
    //     try {
    //         // Transform filters for repository
    //         const repoFilters = {}

    //         if (filters.status) {
    //             repoFilters.status = filters.status
    //         }

    //         if (filters.startDate) {
    //             repoFilters.startDate = Timestamp.fromDate(new Date(filters.startDate))
    //         }

    //         if (filters.endDate) {
    //             repoFilters.endDate = Timestamp.fromDate(new Date(filters.endDate))
    //         }

    //         if (filters.search) {
    //             repoFilters.client = filters.search
    //         }

    //         if (filters.limit) {
    //             repoFilters.limit = Number.parseInt(filters.limit)
    //         }

    //         if (filters.startAfter) {
    //             repoFilters.startAfter = filters.startAfter
    //         }

    //         return await this.orderRepository.getAll(repoFilters)
    //     } catch (error) {
    //         throw new Error(`Error fetching orders: ${error.message}`)
    //     }
    // }

    // // Get order by ID
    // async getOrderById(id) {
    //     try {
    //         return await this.orderRepository.getById(id)
    //     } catch (error) {
    //         throw new Error(`Error fetching order: ${error.message}`)
    //     }
    // }

    // // Update an order
    // async updateOrder(orderData) {
    //     try {
    //         // Validate order ID
    //         if (!orderData.id) {
    //             throw new Error("Order ID is required")
    //         }

    //         // Get existing order
    //         const existingOrder = await this.orderRepository.getById(orderData.id)
    //         if (!existingOrder) {
    //             throw new Error("Order not found")
    //         }

    //         // Check if order is already completed or voided
    //         if (existingOrder.status === "Completed" || existingOrder.status === "Voided") {
    //             throw new Error(`Cannot update order with status: ${existingOrder.status}`)
    //         }

    //         // Validate stock and pricing for all items
    //         await this.validateOrderItems(orderData.items)

    //         // Update order data
    //         const updatedOrder = {
    //             orderNumber: existingOrder.orderNumber, // Preserve the original order number
    //             client: orderData.customerName,
    //             items: orderData.items.map((item) => ({
    //                 productId: item.productId,
    //                 product: item.product || item.productName,
    //                 quantity: item.quantity,
    //                 unitPrice: item.unitPrice,
    //                 variety: item.variety,
    //                 totalPrice: item.totalPrice,
    //                 pricingSnapshot: item.pricingSnapshot || {
    //                     originalPrice: item.variety?.originalPrice || item.unitPrice,
    //                     onSale: item.saleInfo?.onSale || false,
    //                     salePrice: item.saleInfo?.salePrice || null,
    //                     saleEndTime: item.saleInfo?.saleEndTime || null
    //                 },
    //             })),
    //             totalPrice: orderData.totalPrice,
    //             status: existingOrder.status,
    //         }

    //         return await this.orderRepository.update(orderData.id, updatedOrder)
    //     } catch (error) {
    //         throw new Error(`Error updating order: ${error.message}`)
    //     }
    // }

    // // Approve an order - this is where inventory is updated
    // async approveOrder(orderId) {
    //     try {
    //         // Get existing order
    //         const existingOrder = await this.orderRepository.getById(orderId)
    //         if (!existingOrder) {
    //             throw new Error("Order not found")
    //         }

    //         // Check if order is already completed or voided
    //         if (existingOrder.status === "Completed" || existingOrder.status === "Voided") {
    //             throw new Error(`Cannot approve order with status: ${existingOrder.status}`)
    //         }

    //         // Read all product documents first and store them
    //         const productIds = [...new Set(existingOrder.items.map(item => item.productId))]
    //         const productReads = []

    //         for (const productId of productIds) {
    //             productReads.push(this.productRepository.getById(productId))
    //         }

    //         const products = await Promise.all(productReads)
    //         const productMap = new Map()

    //         products.forEach(product => {
    //             if (product) productMap.set(product.id, product)
    //         })

    //         // Process all the product data and prepare updates
    //         const productUpdates = []

    //         for (const item of existingOrder.items) {
    //             const product = productMap.get(item.productId)

    //             if (!product) {
    //                 throw new Error(`Product not found: ${item.productId}`)
    //             }

    //             // Find the variety
    //             const varietyIndex = product.varieties.findIndex(
    //                 v => v.name === (item.variety?.varietyName || '')
    //             )

    //             if (varietyIndex === -1) {
    //                 throw new Error(`Variety not found: ${item.variety?.varietyName} for product ${item.product}`)
    //             }

    //             // Check if enough stock is available
    //             if (product.varieties[varietyIndex].stockQuantity < item.quantity) {
    //                 throw new Error(`Not enough stock for ${item.product} (${item.variety.varietyName}): requested ${item.quantity}, available ${product.varieties[varietyIndex].stockQuantity}`)
    //             }

    //             // Update stock quantity
    //             product.varieties[varietyIndex].stockQuantity -= item.quantity

    //             // Store the update for later
    //             productUpdates.push({
    //                 productId: item.productId,
    //                 data: { varieties: product.varieties }
    //             })
    //         }

    //         // Perform all updates
    //         for (const update of productUpdates) {
    //             await this.productRepository.update(update.productId, update.data)
    //         }

    //         // Update order status
    //         return await this.orderRepository.updateStatus(orderId, "Completed")
    //     } catch (error) {
    //         throw new Error(`Error approving order: ${error.message}`)
    //     }
    // }

    // // Void an order
    // async voidOrder(id) {
    //     try {
    //         // Get existing order
    //         const existingOrder = await this.orderRepository.getById(id)
    //         if (!existingOrder) {
    //             throw new Error("Order not found")
    //         }

    //         // Check if order is already voided
    //         if (existingOrder.status === "Voided") {
    //             throw new Error("Order is already voided")
    //         }

    //         // If order was completed, return items to inventory
    //         if (existingOrder.status === "Completed") {
    //             // Read all product documents first and store them
    //             const productIds = [...new Set(existingOrder.items.map(item => item.productId))]
    //             const productReads = []

    //             for (const productId of productIds) {
    //                 productReads.push(this.productRepository.getById(productId))
    //             }

    //             const products = await Promise.all(productReads)
    //             const productMap = new Map()

    //             products.forEach(product => {
    //                 if (product) productMap.set(product.id, product)
    //             })

    //             // Process all the product data and prepare updates
    //             const productUpdates = []

    //             for (const item of existingOrder.items) {
    //                 const product = productMap.get(item.productId)

    //                 if (!product) {
    //                     throw new Error(`Product not found: ${item.productId}`)
    //                 }

    //                 // Find the variety
    //                 const varietyIndex = product.varieties.findIndex(
    //                     v => v.name === (item.variety?.varietyName || '')
    //                 )

    //                 if (varietyIndex === -1) {
    //                     throw new Error(`Variety not found: ${item.variety?.varietyName} for product ${item.product}`)
    //                 }

    //                 // Return stock quantity
    //                 product.varieties[varietyIndex].stockQuantity += item.quantity

    //                 // Store the update for later
    //                 productUpdates.push({
    //                     productId: item.productId,
    //                     data: { varieties: product.varieties }
    //                 })
    //             }

    //             // Perform all updates
    //             for (const update of productUpdates) {
    //                 await this.productRepository.update(update.productId, update.data)
    //             }
    //         }

    //         // Update order status
    //         return await this.orderRepository.updateStatus(id, "Voided")
    //     } catch (error) {
    //         throw new Error(`Error voiding order: ${error.message}`)
    //     }
    // }

    // // Delete an order (admin only)
    // async deleteOrder(id) {
    //     try {
    //         return await this.orderRepository.delete(id)
    //     } catch (error) {
    //         throw new Error(`Error deleting order: ${error.message}`)
    //     }
    // }
}

module.exports = CartService