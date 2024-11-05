// backend\services\BranchService.js
const { db } = require('../config/firebase');

class BranchService {
    constructor() {
        this.branchesCollection = db.collection('branches');
        this.activityLogsCollection = db.collection('activityLogs');
        this.notificationsCollection = db.collection('notifications');
    }

    async logBranchAction(actionType, branchData, userData, req) {

        const username = `${userData.firstName} ${userData.lastName}`;
        const logId = `log_${new Date().getTime()}`;
        const logEntry = {
            logId,
            userId: userData.uid,
            userName: username,
            role: userData.role,
            actionType,
            targetType: "branch",
            targetId: branchData.id,
            targetName: branchData.name,
            description: `${actionType} branch: ${branchData.name}`,
            timestamp: new Date(),
            ipAddress: req.headers['x-forwarded-for'] || req.ip,
            deviceInfo: req.headers['user-agent'] || "Unknown Device",
            status: "successful",
            metadata: {
                newValue: {
                    ...branchData,
                    updatedBy: username,
                    updatedOn: new Date()
                }
            }
        };

        await this.activityLogsCollection.doc(logId).set(logEntry);
        return logId;
    }

    async createNotificationForBranchAction(actionType, branchData) {
        const notificationId = `notif_${new Date().getTime()}`;
        const notification = {
            id: notificationId,
            type: `BRANCH_${actionType}`,
            message: `Branch ${branchData.name} has been ${actionType.toLowerCase()}.`,
            createdAt: new Date(),
            isRead: false,
            recipientRoles: ['owner'],
            branchId: branchData.id
        };

        await this.notificationsCollection.doc(notificationId).set(notification);
        return notificationId;
    }

    async handleBranchAction(actionType, branchData, userData, req) {
        try {
            const logId = await this.logBranchAction(actionType, branchData, userData, req);
            const notificationId = await this.createNotificationForBranchAction(actionType, branchData);
            
            return { logId, notificationId };
            return { logId };
        } catch (error) {
            console.error(`Error in handle${actionType}Branch:`, error);
            throw error;
        }
    }

    async addBranch(branchData, userData, req) {
        const branchRef = await this.branchesCollection.add(branchData);
        const newBranchData = { ...branchData, id: branchRef.id };
        return this.handleBranchAction('CREATE', newBranchData, userData, req);
    }

    async editBranch(branchId, branchData, userData, req) {
        await this.branchesCollection.doc(branchId).update(branchData);
        const updatedBranchData = { ...branchData, id: branchId };
        return this.handleBranchAction('EDIT', updatedBranchData, userData, req);
    }

    async toggleBranchStatus(branchId, isActive, userData, req) {
        await this.branchesCollection.doc(branchId).update({ isActive });
        const branchData = { id: branchId, name: (await this.branchesCollection.doc(branchId).get()).data().name, isActive };
        const action = isActive ? 'ACTIVATE' : 'DEACTIVATE';
        return this.handleBranchAction(action, branchData, userData, req);
    }
}

module.exports = BranchService;