// backend/services/ProductService.js
const { db } = require('../config/firebase');

class ProductService {
    constructor() {
        this.productsCollection = db.collection('products');
        this.activityLogsCollection = db.collection('activityLogs');
        this.notificationsCollection = db.collection('notifications');
    }

    async logProductAction(actionType, productData, req) {
        const logId = `log_${new Date().getTime()}`;
        const logEntry = {
            logId,
            userId: req.user.uid,
            userName: req.user.displayName,
            role: req.user.role,
            actionType,
            targetType: "product",
            targetId: productData.id,
            targetName: productData.name,
            description: `${actionType} product: ${productData.name}`,
            timestamp: new Date(),
            ipAddress: req.headers['x-forwarded-for'] || req.ip,
            deviceInfo: req.headers['user-agent'] || "Unknown Device",
            status: "successful",
            metadata: {
                productData,
            }
        };

        await this.activityLogsCollection.doc(logId).set(logEntry);
        return logId;
    }

    async createNotificationForProductAction(actionType, productData) {
        const notificationId = `notif_${new Date().getTime()}`;
        const notification = {
            id: notificationId,
            type: `PRODUCT_${actionType}`,
            message: `Product ${productData.name} has been ${actionType.toLowerCase()}.`,
            createdAt: new Date(),
            isRead: false,
            recipientRoles: ['owner', 'manager', 'stock_manager'],
            productId: productData.id
        };

        await this.notificationsCollection.doc(notificationId).set(notification);
        return notificationId;
    }

    async handleNewProduct(productData, req) {
        const logId = await this.logProductAction('CREATE', productData, req);
        const notificationId = await this.createNotificationForProductAction('CREATE', productData);
        return { logId, notificationId };
    }

    async handleProductUpdate(productData, req) {
        const logId = await this.logProductAction('UPDATE', productData, req);
        const notificationId = await this.createNotificationForProductAction('UPDATE', productData);
        return { logId, notificationId };
    }

    async handleProductDelete(productId, req) {
        const productData = await this.productsCollection.doc(productId).get();
        const logId = await this.logProductAction('DELETE', { id: productId, ...productData.data() }, req);
        const notificationId = await this.createNotificationForProductAction('DELETE', { id: productId, ...productData.data() });
        return { logId, notificationId };
    }
}

module.exports = ProductService;