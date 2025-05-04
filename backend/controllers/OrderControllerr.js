// backend/controllers/OrderController.js
// This class handles HTTP requests for orders

const OrderService = require("../services/OrderService")

class OrderController {
  constructor() {
    this.orderService = new OrderService()
  }

  // Create a new order
  async createOrder(req, res) {
    try {

      console.log("Request body:", req.body)
      
      const orderData = req.body

      const newOrder = await this.orderService.createOrder(orderData)

      return res.status(201).json({
        message: "Order created successfully",
        order: newOrder,
      })
    } catch (error) {
      console.error("Failed to create order:", error)
      return res.status(500).json({ error: "Failed to create order: " + error.message })
    }
  }

  // Get all orders with filtering and pagination
  async getAllOrders(req, res) {
    try {
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
        limit: req.query.limit,
        startAfter: req.query.startAfter,
      }

      const orders = await this.orderService.getAllOrders(filters)

      return res.json(orders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      return res.status(500).json({ error: "Failed to fetch orders" })
    }
  }

  // Get order by ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params
      const order = await this.orderService.getOrderById(id)

      if (!order) {
        return res.status(404).json({ error: "Order not found" })
      }

      return res.json(order)
    } catch (error) {
      console.error("Error fetching order:", error)
      return res.status(500).json({ error: "Failed to fetch order" })
    }
  }

  // Update an order
  async updateOrder(req, res) {
    try {
      const { id } = req.params
      const orderData = req.body
      orderData.id = id

      const updatedOrder = await this.orderService.updateOrder(orderData)

      return res.status(200).json({
        message: "Order updated successfully",
        order: updatedOrder,
      })
    } catch (error) {
      console.error("Failed to update order:", error)
      return res.status(500).json({ error: "Failed to update order: " + error.message })
    }
  }

  // Void an order
  async voidOrder(req, res) {
    try {
      const { id } = req.params

      await this.orderService.voidOrder(id)

      return res.status(200).json({
        message: "Order voided successfully",
      })
    } catch (error) {
      console.error("Failed to void order:", error)
      return res.status(500).json({ error: "Failed to void order: " + error.message })
    }
  }

  // Complete an order
  async completeOrder(req, res) {
    try {
      const { id } = req.params

      await this.orderService.completeOrder(id)

      return res.status(200).json({
        message: "Order completed successfully",
      })
    } catch (error) {
      console.error("Failed to complete order:", error)
      return res.status(500).json({ error: "Failed to complete order: " + error.message })
    }
  }

  // Delete an order (admin only)
  async deleteOrder(req, res) {
    try {
      const { id } = req.params

      await this.orderService.deleteOrder(id)

      return res.status(200).json({
        message: "Order deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete order:", error)
      return res.status(500).json({ error: "Failed to delete order: " + error.message })
    }
  }
}

// Create singleton instance
const orderController = new OrderController()

// Export request handler methods bound to the controller instance
module.exports = {
  createOrder: orderController.createOrder.bind(orderController),
  getAllOrders: orderController.getAllOrders.bind(orderController),
  getOrderById: orderController.getOrderById.bind(orderController),
  updateOrder: orderController.updateOrder.bind(orderController),
  voidOrder: orderController.voidOrder.bind(orderController),
  completeOrder: orderController.completeOrder.bind(orderController),
  deleteOrder: orderController.deleteOrder.bind(orderController),
}

//#region Old Codes

// // backend/controllers/ProductController.js
// const { bucket, Timestamp } = require('../../config/firebase');
// const { v4: uuidv4 } = require('uuid');
// const sharp = require("sharp")
// const ProductModel = require('../../models/ProductModel');
// const UploadModel = require('../../models/UploadModel');
// const CategoryModel = require('../../models/CategoryModel');
// const OrderModel = require('../../models/OrderModel');

// const ProductService = require('../../services/ProductService');
// const UploadImages = require('../../lib/UploadImages');

// const productService = new ProductService();

// const OrderController = {
//   //#region Create
//   createOrder: async (req, res) => {
//     try {
//       const user = req.user
//       const { customerName, items, totalPrice } = req.body

//       if (!user || !items || !Array.isArray(items)) {
//         return res.status(400).json({ error: "Invalid order data" })
//       }

//       const orders = items.map((item) => {
//         const variety = item.variety
//           ? {
//             varietyName: item.variety.varietyName,
//             varietyQuantity: item.variety.varietyQuantity,
//             varietyPrice: item.variety.varietyPrice,
//           }
//           : null
        
//         // const unitPrice = item.variety? item.variety.varietyPrice : item.unitPrice;
//         return {
//           productId: item.productId,
//           product: item.productName,
//           quantity: item.quantity || 0,
//           variety,
//           unitPrice: item.unitPrice,
//           discount: item.discount || null,
//           totalPrice: item.totalPrice,
//         }
//       })

//       const newOrder = {
//         userId: user.uid,
//         client: customerName,
//         items: orders,
//         totalPrice,
//         status: "Pending",
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       }

//       const order = await OrderModel.createOrder(newOrder)
//       res.status(201).json({ order })
//     } catch (error) {
//       console.error("Failed to place order:", error)
//       res.status(500).json({ error: "Failed to place order" })
//     }
//   },

//   // createOrder: async (req, res) => {
//   //     try {

//   //         const user = req.user;

//   //         // {
//   //         //     role: 'owner',
//   //         //     branch: 'all',
//   //         //     iss: 'https://securetoken.google.com/test-2e37e',
//   //         //     aud: 'test-2e37e',
//   //         //     auth_time: 1741668462,
//   //         //     user_id: 'EqQih80ucUX3yxNa0dob8ZPAVKj1',
//   //         //     sub: 'EqQih80ucUX3yxNa0dob8ZPAVKj1',
//   //         //     iat: 1741779050,
//   //         //     exp: 1741782650,
//   //         //     email: 'suppremeagrivet@gmail.com',
//   //         //     email_verified: true,
//   //         //     firebase: { identities: { email: [Array] }, sign_in_provider: 'password' },
//   //         //     uid: 'EqQih80ucUX3yxNa0dob8ZPAVKj1'
//   //         // }

//   //         console.log(req.body);
//   //         const { customerName, productName, quantity, items, variety, totalPrice } = req.body;

//   //         if (!user || !product) {
//   //             return res.status(400).json({ error: "Invalid order data" });
//   //         }

//   //         // return res.status(201).json({ message: "Order created" });

//   //         if (!items && !Array.isArray(items)) {
//   //             return res.status(400).json({ error: "Invalid order data" });
//   //         }

//   //         let orders = []
//   //         for (const item of items) {

//   //             let variety = null;

//   //             if (item.variety) {
//   //                 variety = {
//   //                     varietyName: item.varietyName,
//   //                     varietyQuantity: item.varietyQuantity,
//   //                     varietyPrice: item.varietyPrice,
//   //                 }
//   //             };

//   //             orders.push({
//   //                 product: item.productName,
//   //                 quantity: item.quantity || 0,
//   //                 variety,
//   //                 discount: item.discount || null,
//   //                 totalPrice: item.totalPrice
//   //             })
//   //         }

//   //         const newOrder = {
//   //             userId: req.user.uid,
//   //             client: customerName,
//   //             items: orders,
//   //             totalPrice,
//   //             status: "Pending",
//   //         };

//   //         const order = await OrderModel.createOrder(newOrder);

//   //         res.status(201).json({ order });
//   //     } catch (error) {
//   //         console.error('Failed to place order:', error);
//   //         res.status(500).json({ error: 'Failed to place order' });
//   //     }
//   // },

//   //#endregion

//   //#region GetOrderById
//   getOrderById: async (req, res) => {
//     try {
//       const orderId = req.params.id
//       const order = await OrderModel.getOrderById(orderId)

//       if (!order) {
//         return res.status(404).json({ error: "Order not found" })
//       }

//       res.status(200).json({ order })
//     } catch (error) {
//       console.error("Failed to get order:", error)
//       res.status(500).json({ error: "Failed to get order" })
//     }
//   },
//   //#endregion

//   //#region Update Order
//   updateOrder: async (req, res) => {
//     try {
//       const orderId = req.params.id
//       const { customerName, items, totalPrice } = req.body

//       // First check if order exists
//       const existingOrder = await OrderModel.getOrderById(orderId)

//       if (!existingOrder) {
//         return res.status(404).json({ error: "Order not found" })
//       }

//       // Check if order is already voided
//       if (existingOrder.status === "Voided") {
//         return res.status(400).json({ error: "Cannot update a voided order" })
//       }

//       // Transform items
//       const transformedItems = items.map((item) => ({
//         productId: item.productId,
//         product: item.productName,
//         quantity: item.quantity || 0,
//         variety: item.variety
//           ? {
//             varietyName: item.variety.varietyName || item.variety.unit,
//             varietyQuantity: item.variety.varietyQuantity || item.variety.quantity,
//             varietyPrice: item.variety.varietyPrice || item.variety.discountPrice,
//           }
//           : null,
//         discount: item.discount || null,
//         totalPrice: item.totalPrice,
//       }))

//       const updatedOrder = {
//         client: customerName,
//         items: transformedItems,
//         totalPrice,
//         updatedAt: new Date(),
//       }

//       const result = await OrderModel.updateOrder(orderId, updatedOrder)
//       res.status(200).json({ order: result })
//     } catch (error) {
//       console.error("Failed to update order:", error)
//       res.status(500).json({ error: "Failed to update order" })
//     }
//   },
//   //#endregion

//   //#region Void Order
//   voidOrder: async (req, res) => {
//     try {
//       const orderId = req.params.id

//       // First check if order exists
//       const existingOrder = await OrderModel.getOrderById(orderId)

//       if (!existingOrder) {
//         return res.status(404).json({ error: "Order not found" })
//       }

//       // Check if order is already voided
//       if (existingOrder.status === "Voided") {
//         return res.status(400).json({ error: "Order is already voided" })
//       }

//       const result = await OrderModel.voidOrder(orderId)
//       res.status(200).json(result)
//     } catch (error) {
//       console.error("Failed to void order:", error)
//       res.status(500).json({ error: "Failed to void order" })
//     }
//   },

//   //#endregion

//   //#region Get Orders
//   getOrders: async (req, res) => {
//     try {
//       const { limit = 10, page = 1, status, startDate, endDate, search } = req.query

//       const options = {
//         limit: Number.parseInt(limit),
//         startAfter: req.query.startAfter || null,
//         status: status !== "all" ? status : null,
//         startDate: startDate ? new Date(startDate) : null,
//         endDate: endDate ? new Date(endDate) : null,
//         search: search || null,
//       }

//       const result = await OrderModel.getOrders(options)

//       res.status(200).json({
//         orders: result.orders,
//         lastVisible: result.lastVisible ? result.lastVisible.id : null,
//         hasMore: result.hasMore,
//       })
//     } catch (error) {
//       console.error("Failed to get orders:", error)
//       res.status(500).json({ error: "Failed to get orders" })
//     }
//   },

//   //#endregion
// }

// module.exports = OrderController;


//#endregion