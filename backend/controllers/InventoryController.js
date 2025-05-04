
// backend\controllers\InventoryController.js
const { InventoryService } = require('../services/InventoryService');
const { LogService } = require('../services/LogService');

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

            // Validate required fields
            if (!stockData.branchId || !stockData.productId || !stockData.varietyId || !stockData.quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: branchId, productId, varietyId, quantity'
                });
            }

            console.log('Stock data:', stockData);
            console.log('User:', user);

            // Add stock
            const result = await this.inventoryService.addStock(stockData, user);

            return res.status(200).json({
                success: true,
                message: 'Stock added successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in addStock controller:', error);

            await this.logService.logError({
                errorType: 'CONTROLLER_ERROR',
                user: req.user,
                action: 'ADD_STOCK',
                targetResource: 'inventory',
                message: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to add stock'
            });
        }
    }

    /**
     * Deduct stock from a branch (for orders)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deductStock(req, res) {
        try {
            const orderData = req.body;
            const user = req.user;

            // Validate required fields
            if (!orderData.branchId || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: branchId, items'
                });
            }

            // Validate each item
            for (const item of orderData.items) {
                if (!item.productId || !item.varietyId || !item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each item must have productId, varietyId, and quantity'
                    });
                }
            }

            // Deduct stock
            const result = await this.inventoryService.deductStock(orderData, user);

            return res.status(200).json({
                success: true,
                message: 'Stock deducted successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in deductStock controller:', error);

            await this.logService.logError({
                errorType: 'CONTROLLER_ERROR',
                user: req.user,
                action: 'DEDUCT_STOCK',
                targetResource: 'inventory',
                message: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to deduct stock'
            });
        }
    }

    /**
     * Reject stock (mark as expired, damaged, etc.)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async rejectStock(req, res) {
        try {
            const rejectData = req.body;
            const user = req.user;


            console.log('Stock data:', rejectData);
            console.log('User:', user);

            // Validate required fields
            if (!rejectData.branchId || !rejectData.productId || !rejectData.varietyId || !rejectData.quantity || !rejectData.rejectReason) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: branchId, productId, varietyId, quantity, rejectReason'
                });
            }

            // Reject stock
            const result = await this.inventoryService.rejectStock(rejectData, user);

            return res.status(200).json({
                success: true,
                message: 'Stock rejected successfully',
                data: result
            });
        } catch (error) {

            console.error('Error in rejectStock controller:', error);

            await this.logService.logError({
                errorType: 'CONTROLLER_ERROR',
                user: req.user,
                action: 'REJECT_STOCK',
                targetResource: 'inventory',
                message: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to reject stock'
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


            console.log('Stock data:', transferData);
            console.log('User:', user);

            // Validate required fields
            if (!transferData.sourceBranchId || !transferData.destBranchId || !transferData.productId || !transferData.varietyId || !transferData.quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: sourceBranchId, destBranchId, productId, varietyId, quantity'
                });
            }

            // Transfer stock
            const result = await this.inventoryService.transferStock(transferData, user);

            return res.status(200).json({
                success: true,
                message: 'Stock transferred successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in transferStock controller:', error);

            await this.logService.logError({
                errorType: 'CONTROLLER_ERROR',
                user: req.user,
                action: 'TRANSFER_STOCK',
                targetResource: 'inventory',
                message: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to transfer stock'
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


            console.log('Adjust data:', adjustData);
            console.log('User:', user);



            // Validate required fields
            if (!adjustData.branchId || !adjustData.productId || !adjustData.varietyId || adjustData.newQuantity === undefined || !adjustData.reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: branchId, productId, varietyId, newQuantity, reason'
                });
            }

            // Adjust stock
            const result = await this.inventoryService.adjustStock(adjustData, user);

            return res.status(200).json({
                success: true,
                message: 'Stock adjusted successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in adjustStock controller:', error);

            await this.logService.logError({
                errorType: 'CONTROLLER_ERROR',
                user: req.user,
                action: 'ADJUST_STOCK',
                targetResource: 'inventory',
                message: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to adjust stock'
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
                order: req.query.order || 'desc'
            };

            if (!branchId) {
                return res.status(400).json({
                    success: false,
                    message: 'Branch ID is required'
                });
            }

            const stockItems = await this.inventoryService.getBranchStock(branchId, options);

            return res.status(200).json({
                success: true,
                count: stockItems.length,
                data: stockItems
            });
        } catch (error) {
            console.error('Error in getBranchStock controller:', error);

            await this.logService.logError({
                errorType: 'CONTROLLER_ERROR',
                user: req.user,
                action: 'GET_BRANCH_STOCK',
                targetResource: 'inventory',
                message: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get branch stock'
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
                productId: req.query.productId,
                varietyId: req.query.varietyId,
                type: req.query.type,
                performedBy: req.query.performedBy,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                limit: req.query.limit ? parseInt(req.query.limit, 10) : 100,
                order: req.query.order || 'desc',
                startAfter: req.query.startAfter
            };

            const logs = await this.inventoryService.getInventoryLogs(options);

            return res.status(200).json({
                success: true,
                count: logs.length,
                data: logs
            });
        } catch (error) {
            console.error('Error in getInventoryLogs controller:', error);

            await this.logService.logError({
                errorType: 'CONTROLLER_ERROR',
                user: req.user,
                action: 'GET_INVENTORY_LOGS',
                targetResource: 'inventory',
                message: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                success: false,
                message: error.message || 'Failed to get inventory logs'
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
    getInventoryLogs: (req, res) => inventoryController.getInventoryLogs(req, res)
};