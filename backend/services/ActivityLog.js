// backend\services\ActivityLog.js
const { admin, db } = require('../config/firebase');

class ActivityLog {
    constructor(activityLogsCollection) {
        this.activityLogsCollection = activityLogsCollection || db.collection('activityLogs');
    }

    async logRegisterUserAction(userId, userName, role = "customer", req) {
        if (!userId || !userName) {
            throw new Error('Missing required fields: userId or userName.');
        }

        const logId = `log_${new Date().getTime()}`;
        const logEntry = {
            logId,
            userId,
            userName,
            branchName: "N/A",
            role,
            actionType: "CREATE",
            targetType: "user",
            targetId: userId,
            targetName: userName,
            description: "New user registration",
            timestamp: new Date(),
            ipAddress: req.headers['x-forwarded-for'] || req.ip,
            deviceInfo: req.headers['user-agent'] || "Unknown Device",
            status: "successful",
            metadata: {
                newValue: {
                    userId,
                    userName,
                    branchName: "N/A",
                    role,
                    registrationDate: new Date()
                }
            }
        };

        await this.activityLogsCollection.doc(logId).set(logEntry);
        return logId;
    }

    async logAddBranchAction(userId, userName, role, branchId, branchName, location = "N/A", req) {
        if (!userId || !branchId || !branchName) {
            throw new Error('Missing required fields: userId, branchId, or branchName.');
        }

        const logId = `log_${new Date().getTime()}`;
        const logEntry = {
            logId,
            userId,
            userName,
            role,
            actionType: "CREATE",
            targetType: "branch",
            targetId: branchId,
            targetName: branchName,
            description: `Added new branch: ${branchName}`,
            timestamp: new Date(),
            ipAddress: req.headers['x-forwarded-for'] || req.ip,
            deviceInfo: req.headers['user-agent'] || "Unknown Device",
            status: "successful",
            metadata: {
                newValue: {
                    branchId,
                    branchName,
                    location,
                    addedBy: userName,
                    addedOn: new Date()
                }
            }
        };

        try {
        await this.activityLogsCollection.doc(logId).set(logEntry);
        }
        catch (error) {
            throw error;
        }
        return logId;
    }

    async logEditBranchAction(userId, userName, role, branchId, branchName, location, req) {
        const logId = `log_${new Date().getTime()}`;

        const logData = {
            actionType: 'EDIT',
            description: `Updated branch: ${branchName}`,
            deviceInfo: req.headers['user-agent'],
            ipAddress: req.ip,
            logId: logId,
            metadata: {
                newValue: {
                    updatedBy: userName,
                    updatedOn: new Date(),
                    branchId,
                    branchName,
                    location
                }
            },
            role,
            status: 'successful',
            targetId: branchId,
            targetName: branchName,
            targetType: 'branch',
            timestamp: new Date(),
            userId,
            userName
        };

        // await db.collection('activityLogs').add(logData);
        await db.collection('activityLogs').doc(logId).set(logData);

    }

    async logBranchStatusChangeAction(userId, userName, role, branchId, branchName, action, req) {
        const logId = `log_${new Date().getTime()}`;
        
        const logData = {
            actionType: action,
            description: `${action === 'ACTIVATE' ? 'Activated' : 'Deactivated'} branch: ${branchName}`,
            deviceInfo: req.headers['user-agent'],
            ipAddress: req.ip,
            logId: logId,
            metadata: {
                newValue: {
                    updatedBy: userName,
                    updatedOn: new Date(),
                    branchId,
                    branchName,
                    status: action === 'ACTIVATE' ? 'active' : 'inactive'
                }
            },
            role,
            status: 'successful',
            targetId: branchId,
            targetName: branchName,
            targetType: 'branch',
            timestamp: new Date(),
            userId,
            userName
        };

        // await db.collection('activityLogs').add(logData);
        await db.collection('activityLogs').doc(logId).set(logData);
    }
}

module.exports = ActivityLog;
