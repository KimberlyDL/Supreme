// backend\controllers\InventoryController.js
const { InventoryService } = require("../services/InventoryService");
const { LogService } = require("../services/LogService");
const { validateExpirationDates } = require("../utilities/utils");

class InventoryController {
  constructor() {
    this.inventoryService = new InventoryService();
    this.logService = new LogService();
  }

  /**
   * Add stock to a branch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async addStock(req, res) {
    try {
      const stockData = req.body;
      const user = req.user;

      if (
        !stockData.branchId ||
        !stockData.productId ||
        !stockData.varietyId ||
        !stockData.quantity ||
        !stockData.expirationDates
      ) {
        return res.status(400).json({
          message: "Incomplete stock data. Please fill all required fields.",
        });
      }

      const validationResult = validateExpirationDates(
        stockData.expirationDates,
        stockData.quantity
      );

      if (!validationResult.isValid) {
        return res.status(400).json({
          message: validationResult.message,
        });
      }

      console.log("Stock data:", stockData);
      console.log("User:", user);

      // Add stock
      const result = await this.inventoryService.addStock(stockData, user);

      return res.status(200).json({
        message: "Stock successfully added",
      });
    } catch (error) {
      console.error("Error in addStock controller:", error);

      const isErrorLogged = error.isLogged;
      if (!isErrorLogged) {
        await this.logService.logError({
          errorType: "CONTROLLER_ERROR",
          user: req.user,
          action: "ADD_STOCK",
          targetResource: "inventory",
          message: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Failed to add stock",
      });
    }
  }

  // /**
  //  * Deduct stock from a branch (for orders)
  //  * @param {Object} req - Express request object
  //  * @param {Object} res - Express response object
  //  */
  // async deductStock(req, res) {
  //   try {
  //     const orderData = req.body;
  //     const user = req.user;

  //     // Validate required fields
  //     if (
  //       !orderData.branchId ||
  //       !orderData.items ||
  //       !Array.isArray(orderData.items) ||
  //       orderData.items.length === 0
  //     ) {
  //       return res.status(400).json({
  //         message: "Incomplete stock data. Please fill all required fields.",
  //       });
  //     }

  //     // Validate each item
  //     for (const item of orderData.items) {
  //       if (!item.productId || !item.varietyId || !item.quantity) {
  //         return res.status(400).json({
  //           message: "Incomplete stock data. Please fill all required fields.",
  //         });
  //       }
  //     }

  //     // Deduct stock
  //     const result = await this.inventoryService.deductStock(orderData, user);

  //     return res.status(200).json({
  //       message: "Stock successfully deducted",
  //     });
  //   } catch (error) {
  //     console.error("Error in deductStock controller:", error);

  //   const isErrorLogged = error.isLogged;
  // if (!isErrorLogged) {
  //     await this.logService.logError({
  //       errorType: "CONTROLLER_ERROR",
  //       user: req.user,
  //       action: "DEDUCT_STOCK",
  //       targetResource: "inventory",
  //       message: error.message,
  //       stack: error.stack,
  //     });
  // }

  //     return res.status(500).json({
  //       message: "Failed to deduct stock",
  //     });
  //   }
  // }

  /**
   * Reject stock (mark as expired, damaged, etc.)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async rejectStock(req, res) {
    try {
      const rejectData = req.body;
      const user = req.user;

      console.log("Stock data:", rejectData);
      console.log("User:", user);
      // return;

      // Validate required fields
      if (
        !rejectData.branchId ||
        !rejectData.productId ||
        !rejectData.varietyId ||
        !rejectData.quantity ||
        !rejectData.expirationDates ||
        !rejectData.rejectReason
      ) {
        return res.status(400).json({
          message: "Incomplete stock data. Please fill all required fields.",
        });
      }

      const validationResult = validateExpirationDates(
        rejectData.expirationDates,
        rejectData.quantity
      );

      if (!validationResult.isValid) {
        return res.status(400).json({
          message: validationResult.message,
        });
      }

      // Reject stock
      const result = await this.inventoryService.rejectStock(rejectData, user);

      return res.status(200).json({
        message: "Stock successfully rejected",
      });
    } catch (error) {
      console.error("Error in rejectStock controller:", error);

      const isErrorLogged = error.isLogged;
      if (!isErrorLogged) {
        await this.logService.logError({
          errorType: "CONTROLLER_ERROR",
          user: req.user,
          action: "REJECT_STOCK",
          targetResource: "inventory",
          message: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Failed to reject stock",
      });
    }
  }

  /**
   * Transfer stock between branches
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async transferStock(req, res) {
    try {
      const transferData = req.body;
      const user = req.user;

      console.log("Stock data:", transferData);
      console.log("User:", user);

      // Validate required fields
      if (
        !transferData.sourceBranchId ||
        !transferData.destBranchId ||
        !transferData.productId ||
        !transferData.varietyId ||
        !transferData.quantity ||
        !transferData.expirationDates
      ) {
        return res.status(400).json({
          message: "Incomplete stock data. Please fill all required fields.",
        });
      }

      const validationResult = validateExpirationDates(
        transferData.expirationDates,
        transferData.newQuantity
      );

      if (!validationResult.isValid) {
        return res.status(400).json({
          message: validationResult.message,
        });
      }

      // Transfer stock
      const result = await this.inventoryService.transferStock(
        transferData,
        user
      );

      return res.status(200).json({
        message: "Stock successfully transferred",
      });
    } catch (error) {
      console.error("Error in transferStock controller:", error);

      const isErrorLogged = error.isLogged;
      if (!isErrorLogged) {
        await this.logService.logError({
          errorType: "CONTROLLER_ERROR",
          user: req.user,
          action: "TRANSFER_STOCK",
          targetResource: "inventory",
          message: error.message,
          stack: error.stack,
        });
      }
      return res.status(500).json({
        message: "Failed to transfer stock",
      });
    }
  }

  /**
   * Adjust stock count (for reconciliation)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async adjustStock(req, res) {
    try {
      const adjustData = req.body;
      const user = req.user;

      console.log("Adjust data:", adjustData);
      console.log("User:", user);

      // return;
      // Validate required fields
      if (
        !adjustData.branchId ||
        !adjustData.productId ||
        !adjustData.varietyId ||
        !adjustData.newQuantity ||
        !adjustData.expirationDates ||
        !adjustData.reason
      ) {
        return res.status(400).json({
          message: "Incomplete stock data. Please fill all required fields.",
        });
      }

      // Adjust stock
      const result = await this.inventoryService.adjustStock(adjustData, user);

      return res.status(200).json({
        message: "Stock successfully adjusted",
      });
    } catch (error) {
      console.error("Error in adjustStock controller:", error);
      const displayToUi = error.displayToUi;

      const isErrorLogged = error.isLogged;
      if (!isErrorLogged) {
        await this.logService.logError({
          errorType: "CONTROLLER_ERROR",
          user: req.user,
          action: "ADJUST_STOCK",
          targetResource: "inventory",
          message: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: displayToUi ? error.message : "Failed to adjust stock",
      });
    }
  }

  /**
   * Get stock for a branch
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBranchStock(req, res) {
    try {
      const { branchId } = req.params;
      const options = {
        productId: req.query.productId,
        varietyId: req.query.varietyId,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 100,
        order: req.query.order || "desc",
      };

      if (!branchId) {
        return res.status(400).json({
          message: "Branch ID is required",
        });
      }

      const stockItems = await this.inventoryService.getBranchStock(
        branchId,
        options
      );

      return res.status(200).json({
        count: stockItems.length,
        data: stockItems,
      });
    } catch (error) {
      console.error("Error in getBranchStock controller:", error);

      const isErrorLogged = error.isLogged;
      if (!isErrorLogged) {
        await this.logService.logError({
          errorType: "CONTROLLER_ERROR",
          user: req.user,
          action: "GET_BRANCH_STOCK",
          targetResource: "inventory",
          message: error.message,
          stack: error.stack,
        });
      }

      return res.status(500).json({
        message: "Failed to get branch stock",
      });
    }
  }

  /**
   * Get inventory logs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getInventoryLogs(req, res) {
    try {
      const options = {
        branchId: req.query.branchId,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : 50,
        lastVisible: req.query.lastVisible || null,
      };

      console.log(req.query);
      console.log(req.user);

      const result = await this.inventoryService.getInventoryLogs(options);

      console.log(result);
      return res.status(200).json({
        data: result,
      });
    } catch (error) {
      console.error("Error in getInventoryLogs controller:", error);

      const isErrorLogged = error.isLogged;
      if (!isErrorLogged) {
        await this.logService.logError({
          errorType: "CONTROLLER_ERROR",
          user: req.user,
          action: "GET_INVENTORY_LOGS",
          targetResource: "inventory",
          message: error.message,
          stack: error.stack,
        });
      }
      return res.status(500).json({
        message: "Failed to get inventory logs",
      });
    }
  }
}

// Create a singleton instance
const inventoryController = new InventoryController();

// Export controller methods
module.exports = {
  addStock: (req, res) => inventoryController.addStock(req, res),
  deductStock: (req, res) => inventoryController.deductStock(req, res),
  rejectStock: (req, res) => inventoryController.rejectStock(req, res),
  transferStock: (req, res) => inventoryController.transferStock(req, res),
  adjustStock: (req, res) => inventoryController.adjustStock(req, res),
  getBranchStock: (req, res) => inventoryController.getBranchStock(req, res),
  getInventoryLogs: (req, res) =>
    inventoryController.getInventoryLogs(req, res),
};
