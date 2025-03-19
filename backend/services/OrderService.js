// backend/services/OrderService.js
// This class contains business logic for orders

const OrderRepository = require("../repositories/OrderRepository")
const ProductRepository = require("../repositories/ProductRepository")
const Order = require("../models/Order")
const { Timestamp } = require("../config/firebase")

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

            // Create order object
            const order = {
                client: orderData.customerName,
                items: orderData.items.map((item) => ({
                    productId: item.productId,
                    product: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.pricePerUnit,
                    variety: item.variety,
                    totalPrice: item.totalPrice,
                })),
                totalPrice: orderData.totalPrice,
                status: "Pending",
            }

            // Save order
            return await this.orderRepository.create(order)
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`)
        }
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

            // Update order data
            const updatedOrder = {
                client: orderData.customerName,
                items: orderData.items.map((item) => ({
                    productId: item.productId,
                    product: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.pricePerUnit,
                    variety: item.variety,
                    totalPrice: item.totalPrice,
                })),
                totalPrice: orderData.totalPrice,
                status: existingOrder.status,
            }

            return await this.orderRepository.update(orderData.id, updatedOrder)
        } catch (error) {
            throw new Error(`Error updating order: ${error.message}`)
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

