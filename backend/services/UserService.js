const { db } = require('../config/firebase');

class UserService {
    constructor() {
        this.usersCollection = db.collection('users');
        this.activityLogsCollection = db.collection('activityLogs');
        this.notificationsCollection = db.collection('notifications');
    }

    async logUserRegistration(userData, req) {
        const logId = `log_${new Date().getTime()}`;
        const logEntry = {
            logId,
            userId: userData.uid,
            userName: `${userData.profile.firstName} ${userData.profile.lastName}`,
            role: userData.role,
            actionType: "REGISTER",
            targetType: "user",
            targetId: userData.uid,
            targetName: `${userData.profile.firstName} ${userData.profile.lastName}`,
            description: "New user registered",
            timestamp: new Date(),
            ipAddress: req.headers['x-forwarded-for'] || req.ip,
            deviceInfo: req.headers['user-agent'] || "Unknown Device",
            status: "successful",
            metadata: {
                newValue: {
                    ...userData,
                    createdAt: new Date()
                }
            }
        };

        await this.activityLogsCollection.doc(logId).set(logEntry);
        return logId;
    }

    async createNotificationForNewUser(notifData, uid) {
        const notificationId = `notif_${new Date().getTime()}`;
        const notification = {
            id: notificationId,
            type: 'NEW_USER',
            message: notifData.message,
            createdAt: new Date(),
            isRead: false,
            recipientRoles: ['owner', 'manager'], // Specify roles that should receive this notification
            userId: uid
        };

        await this.notificationsCollection.doc(notificationId).set(notification);
        return notificationId;
    }

    async handleNewUser(userData, req) {
        try {
            const logId = await this.logUserRegistration(userData, req);
            const notificationId = await this.createNotificationForNewUser(userData);

            return { logId, notificationId };
        } catch (error) {
            console.error('Error in handleNewUser:', error);
            throw error;
        }
    }
}

module.exports = UserService;