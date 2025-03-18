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

    // #region OldCodes
    
    // async logNewUser(userData, req) {
    //     try {
    //         const timestamp = Timestamp.now();
    //         const logId = `log_${timestamp.toMillis()}`;

    //         const logEntry = {
    //             logId,
    //             userId: userData.uid,
    //             userName: userData.username || '',
    //             role: userData.role,
    //             actionType: "CREATE",
    //             targetType: userData.role,
    //             targetId: userData.uid,
    //             targetUsername: userData.username || '',
    //             targetName: `${userData.profile?.firstName || ''} ${userData.profile?.lastName || ''}`.trim() || '',
    //             description: `New ${userData.role} created`,
    //             timestamp: timestamp,
    //             deviceInfo: req.headers['user-agent'] || "Unknown Device",
    //             status: "successful",
    //             metadata: {
    //                 newValue: {
    //                     ...userData,
    //                     createdAt: timestamp
    //                 }
    //             }
    //         };

    //         await this.activityLogsCollection.doc(logId).set(logEntry);
    //         return logId;            
    //     } catch (error) {
    //         throw error
    //     }
    // }

    // async logNewPassenger(userData, req) {
    //     try {
    //         const timestamp = Timestamp.now();
    //         const logId = `log_${timestamp.toMillis()}`;

    //         const logEntry = {
    //             logId,
    //             userId: userData.uid,
    //             userName: userData.username || '',
    //             role: userData.role,
    //             actionType: "CREATE",
    //             targetType: "passenger",
    //             targetId: userData.uid,
    //             targetUsername: userData.username || '',
    //             // targetName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || '',
    //             description: "New passenger created",
    //             timestamp: timestamp,
    //             ipAddress: req.headers['x-forwarded-for'] || req.ip,
    //             deviceInfo: req.headers['user-agent'] || "Unknown Device",
    //             status: "successful",
    //             metadata: {
    //                 newValue: {
    //                     ...userData,
    //                     createdAt: timestamp
    //                 }
    //             }
    //         };

    //         await this.activityLogsCollection.doc(logId).set(logEntry);
    //         return logId;            
    //     } catch (error) {
    //         throw error
    //     }
    // }

    // async createNotificationForNewPassenger(userData) {
    //     try {
    //         const timestamp = Timestamp.now();
    //         const notificationId = `notif_${timestamp.toMillis()}`;
    //         const notification = {
    //             id: notificationId,
    //             type: 'NEW_PASSENGER',
    //             message: `New PASSENGER ${userData.username} has been added.`,
    //             createdAt: timestamp,
    //             isRead: false,
    //             recipientRoles: ['admin'],
    //             employeeId: userData.uid
    //         };

    //         await this.notificationsCollection.doc(notificationId).set(notification);
    //         return notificationId;            
    //     } catch (error) {
    //         throw error
    //     }

    // }

    // async logNNotifNewPassenger(userData, req) {
    //     try {
    //         const logId = await this.logNewPassenger(userData, req);
    //         const notificationId = await this.createNotificationForNewPassenger(userData);

    //         return { logId, notificationId };
    //     } catch (error) {
    //         console.error('Error in handleNewEmployee:', error);
    //         throw error;
    //     }
    // }

    // async logUserChangePassword(userData, req) {
    //     try {
    //         const timestamp = Timestamp.now();
    //         const logId = `log_${timestamp.toMillis()}`;

    //         const logEntry = {
    //             logId,
    //             userId: userData.uid,
    //             userName: userData.username || '',
    //             role: userData.role,
    //             actionType: "CHANGE PASSWORD",
    //             targetType: userData.role,
    //             targetId: userData.uid,
    //             targetUsername: userData.username || '',
    //             description: `User ${userData.username} password`,
    //             timestamp: timestamp,
    //             // ipAddress: req.headers['x-forwarded-for'] || req.ip,
    //             deviceInfo: req.headers['user-agent'] || "Unknown Device",
    //             status: "successful",
    //             metadata: {
    //                 newValue: {
    //                     ...userData,
    //                     createdAt: timestamp
    //                 }
    //             }
    //         };

    //         await this.activityLogsCollection.doc(logId).set(logEntry);
    //         return logId;            
    //     } catch (error) {
    //         throw error
    //     }

    // }

    // async logUserAccountActivation(userData, req) {
    //     try {
    //         const timestamp = Timestamp.now();
    //         const logId = `log_${timestamp.toMillis()}`;

    //         const logEntry = {
    //             logId,
    //             userId: userData.uid,
    //             userName: userData.username || '',
    //             role: userData.role,
    //             actionType: "USER VERIFIED",
    //             targetType: userData.role,
    //             targetId: userData.uid,
    //             targetUsername: userData.username || '',
    //             description: `Account verified successfully.`,
    //             timestamp: timestamp,
    //             ipAddress: req.headers['x-forwarded-for'] || req.ip,
    //             deviceInfo: req.headers['user-agent'] || "Unknown Device",
    //             status: "successful",
    //             metadata: {
    //                 newValue: {
    //                     ...userData,
    //                     createdAt: timestamp
    //                 }
    //             }
    //         };

    //         await this.activityLogsCollection.doc(logId).set(logEntry);
    //         // return logId;

    //     } catch (err) {
    //         console.log(err);

    //         const error = new Error(err.message);
    //         error.name = 'LogUserAccountActivationError';
    //         throw error;
    //     }

    // }
    //  #endregion
}

module.exports = AuthService;