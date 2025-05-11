// backend/controllers/LogController.js
const { LogService } = require('../services/LogService');

class LogController {
    static async getOrderLogs(req, res) {
        try {
            const logService = new LogService();

            // Extract query parameters
            const {
                page = 1,
                limit = 20,
                status,
                startDate,
                endDate,
                search,
                orderId,
                orderNumber
            } = req.query;

            // Build options object
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                startDate,
                endDate,
                search,
                orderId,
                orderNumber
            };

            // Get logs
            const orderLogs = await logService.getOrderLogs(options);

            return res.status(200).json({
                success: true,
                logs: orderLogs.logs || [],
                pagination: orderLogs.pagination || {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: false,
                    total: 0
                }
            });
        } catch (error) {
            console.error('Error fetching order logs:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching order logs',
                error: error.message
            });
        }
    }

    static async getSaleLogs(req, res) {
        try {
            const logService = new LogService();

            // Extract query parameters
            const {
                page = 1,
                limit = 20,
                startDate,
                endDate,
                productId,
                branchId,
                orderId,
                orderNumber
            } = req.query;

            // Build options object
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                startDate,
                endDate,
                productId,
                branchId,
                orderId,
                orderNumber
            };

            // Get logs
            const saleLogs = await logService.getSaleLogs(options);

            return res.status(200).json({
                success: true,
                logs: saleLogs.logs || [],
                pagination: saleLogs.pagination || {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: false,
                    total: 0
                }
            });
        } catch (error) {
            console.error('Error fetching sale logs:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching sale logs',
                error: error.message
            });
        }
    }

    static async getActivityLogs(req, res) {
        try {
            const logService = new LogService();

            // Extract query parameters
            const {
                page = 1,
                limit = 20,
                userId,
                activityType,
                startDate,
                endDate
            } = req.query;

            // Build options object
            const options = {
                limit: parseInt(limit),
                reset: page === '1',
                userId,
                activityType,
                startDate,
                endDate
            };

            // Get logs directly from Firestore
            const logs = await logService.getActivityLogs(options);

            return res.status(200).json({
                success: true,
                logs: logs || [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: logs && logs.length === parseInt(limit),
                    lastVisible: logs && logs.length > 0 ? logs[logs.length - 1].id : null
                }
            });
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching activity logs',
                error: error.message
            });
        }
    }

    static async getSecurityLogs(req, res) {
        try {
            const logService = new LogService();

            // Extract query parameters
            const {
                page = 1,
                limit = 20,
                userId,
                eventType,
                severity,
                startDate,
                endDate
            } = req.query;

            // Build options object
            const options = {
                limit: parseInt(limit),
                reset: page === '1',
                userId,
                eventType,
                severity,
                startDate,
                endDate
            };

            // Get logs directly from Firestore
            const logs = await logService.getSecurityLogs(options);

            return res.status(200).json({
                success: true,
                logs: logs || [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: logs && logs.length === parseInt(limit),
                    lastVisible: logs && logs.length > 0 ? logs[logs.length - 1].id : null
                }
            });
        } catch (error) {
            console.error('Error fetching security logs:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching security logs',
                error: error.message
            });
        }
    }

    static async getInventoryLogs(req, res) {
        try {
            const logService = new LogService();

            // Extract query parameters
            const {
                page = 1,
                limit = 20,
                branchId,
                type,
                startDate,
                endDate
            } = req.query;

            // Build options object
            const options = {
                limit: parseInt(limit),
                reset: page === '1',
                branchId,
                type,
                startDate,
                endDate
            };

            // Get logs directly from Firestore
            const logs = await logService.getInventoryLogs(options);

            return res.status(200).json({
                success: true,
                logs: logs || [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: logs && logs.length === parseInt(limit),
                    lastVisible: logs && logs.length > 0 ? logs[logs.length - 1].id : null
                }
            });
        } catch (error) {
            console.error('Error fetching inventory logs:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching inventory logs',
                error: error.message
            });
        }
    }
}

module.exports = LogController;