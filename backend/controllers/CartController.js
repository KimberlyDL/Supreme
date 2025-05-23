// backend\controllers\OrderController.js
// backend/controllers/OrderController.js
const CartService = require("../services/CartService")

class CartController {
    constructor() {
        this.cartService = new CartService()
    }

    // Create a new order
    async addToCart(req, res) {
        try {
            const item = req.body

            console.log("Item to add to cart:", item)

            
            const newOrder = await this.cartService.addToCart(item)

            return res.status(201).json({
                message: "Item added to cart successfully",
                item: newOrder,
            })
        } catch (error) {
            console.error("Failed to create order:", error)
            return res.status(400).json({ error: error.message })
        }
    }

    // // Get all orders with filtering and pagination
    // async getAllOrders(req, res) {
    //     try {
    //         const filters = {
    //             status: req.query.status,
    //             startDate: req.query.startDate,
    //             endDate: req.query.endDate,
    //             search: req.query.search,
    //             limit: req.query.limit,
    //             startAfter: req.query.startAfter,
    //         }

    //         const orders = await this.orderService.getAllOrders(filters)

    //         return res.json(orders)
    //     } catch (error) {
    //         console.error("Error fetching orders:", error)
    //         return res.status(500).json({ error: error.message })
    //     }
    // }

    // // Get order by ID
    // async getOrderById(req, res) {
    //     try {
    //         const { id } = req.params
    //         const order = await this.orderService.getOrderById(id)

    //         if (!order) {
    //             return res.status(404).json({ error: "Order not found" })
    //         }

    //         return res.json(order)
    //     } catch (error) {
    //         console.error("Error fetching order:", error)
    //         return res.status(500).json({ error: error.message })
    //     }
    // }

    // // Update an order
    // async updateOrder(req, res) {
    //     try {
    //         const { id } = req.params
    //         const orderData = req.body
    //         orderData.id = id

    //         const updatedOrder = await this.orderService.updateOrder(orderData)

    //         return res.status(200).json({
    //             message: "Order updated successfully",
    //             order: updatedOrder,
    //         })
    //     } catch (error) {
    //         console.error("Failed to update order:", error)
    //         return res.status(400).json({ error: error.message })
    //     }
    // }

    // // Approve an order
    // async approveOrder(req, res) {
    //     try {
    //         const { id } = req.params
    //         await this.orderService.approveOrder(id)

    //         return res.status(200).json({
    //             message: "Order approved successfully",
    //         })
    //     } catch (error) {
    //         console.error("Failed to approve order:", error)
    //         return res.status(400).json({ error: error.message })
    //     }
    // }

    // // Void an order
    // async voidOrder(req, res) {
    //     try {
    //         const { id } = req.params
    //         await this.orderService.voidOrder(id)

    //         return res.status(200).json({
    //             message: "Order voided successfully",
    //         })
    //     } catch (error) {
    //         console.error("Failed to void order:", error)
    //         return res.status(400).json({ error: error.message })
    //     }
    // }

    // // Delete an order (admin only)
    // async deleteOrder(req, res) {
    //     try {
    //         const { id } = req.params
    //         await this.orderService.deleteOrder(id)

    //         return res.status(200).json({
    //             message: "Order deleted successfully",
    //         })
    //     } catch (error) {
    //         console.error("Failed to delete order:", error)
    //         return res.status(500).json({ error: error.message })
    //     }
    // }

    // // Validate order items (for client-side validation)
    // async validateOrderItems(req, res) {
    //     try {
    //         const { items } = req.body
    //         await this.orderService.validateOrderItems(items)

    //         return res.status(200).json({
    //             valid: true,
    //             message: "Order items are valid",
    //         })
    //     } catch (error) {
    //         console.error("Order validation failed:", error)
    //         return res.status(400).json({
    //             valid: false,
    //             error: error.message
    //         })
    //     }
    // }
}

// Create singleton instance
const cartController = new CartController()

// Export request handler methods bound to the controller instance
module.exports = {
    addToCart: cartController.addToCart.bind(cartController),
}