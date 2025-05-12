// backend\lib\AuthService.js
const { db, Timestamp } = require('../config/firebase');

class AuthService {
    constructor() {
        this.usersCollection = db.collection('users');
        this.activityLogsCollection = db.collection('activityLogs');
        this.notificationsCollection = db.collection('notifications');
    }

    async handleNewUser(userData, req) {
        try {
            const logId = await this.logNewUser(userData, req);
            const notificationId = await this.notifForNewUserAccount(userData);

            return { logId, notificationId };
        } catch (error) {
            console.error('Error in handleNewUser:', error);
            throw error;
        }
    }

    async logNewUser(userData, req) {
        try {
            const timestamp = Timestamp.now();
            const logId = `log_${timestamp.toMillis()}`;

            const logEntry = {
                logId,
                userId: userData.uid,
                userName: '',
                role: userData.role,
                actionType: "CREATE",
                targetType: userData.role,
                targetId: userData.uid,
                targetUsername: '',
                targetName: '',
                description: `New ${userData.role} created`,
                timestamp: timestamp,
                deviceInfo: req.headers['user-agent'] || "Unknown Device",
                status: "successful",
                metadata: {
                    newValue: {
                        ...userData,
                        createdAt: timestamp
                    }
                }
            };

            await this.activityLogsCollection.doc(logId).set(logEntry);
            return logId;
        } catch (error) {
            throw error
        }
    }

    async notifForNewUserAccount(userData) {
        try {
            const timestamp = Timestamp.now();
            const notificationId = `notif_${timestamp.toMillis()}`;
            const notification = {
                id: notificationId,
                type: `NEW_${userData.role}`,
                message: `New ${userData.role} has been added with email ${userData.email}.`,
                createdAt: timestamp,
                isRead: false,
                recipientRoles: ['admin'],
                userId: userData.uid
            };

            await this.notificationsCollection.doc(notificationId).set(notification);
            return notificationId;
        } catch (error) {
            throw error
        }

    }
}

module.exports = AuthService;