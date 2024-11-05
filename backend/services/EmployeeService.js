// backend/services/EmployeeService.js
const { db } = require('../config/firebase');
// const ActivityLog = require('./ActivityLog');

class EmployeeService {
    constructor() {
        this.employeesCollection = db.collection('employees');
        this.activityLogsCollection = db.collection('activityLogs');
        this.notificationsCollection = db.collection('notifications');
        // this.activityLog = new ActivityLog(this.activityLogsCollection);
    }

    async logEmployeeCreation(employeeData, req) {
        const logId = `log_${new Date().getTime()}`;
        const logEntry = {
            logId,
            userId: employeeData.uid,
            userName: `${employeeData.firstName} ${employeeData.lastName}`,
            role: employeeData.role,
            actionType: "CREATE",
            targetType: "employee",
            targetId: employeeData.uid,
            targetName: `${employeeData.firstName} ${employeeData.lastName}`,
            description: "New employee created",
            timestamp: new Date(),
            ipAddress: req.headers['x-forwarded-for'] || req.ip,
            deviceInfo: req.headers['user-agent'] || "Unknown Device",
            status: "successful",
            metadata: {
                newValue: {
                    ...employeeData,
                    createdAt: new Date()
                }
            }
        };

        await this.activityLogsCollection.doc(logId).set(logEntry);
        return logId;
    }

    async createNotificationForNewEmployee(employeeData) {
        const notificationId = `notif_${new Date().getTime()}`;
        const notification = {
            id: notificationId,
            type: 'NEW_EMPLOYEE',
            message: `New employee ${employeeData.firstName} ${employeeData.lastName} has been added.`,
            createdAt: new Date(),
            isRead: false,
            recipientRoles: ['owner', 'manager'], // Specify roles that should receive this notification
            employeeId: employeeData.uid
        };

        await this.notificationsCollection.doc(notificationId).set(notification);
        return notificationId;
    }

    async handleNewEmployee(employeeData, req) {
        try {
            const logId = await this.logEmployeeCreation(employeeData, req);
            const notificationId = await this.createNotificationForNewEmployee(employeeData);
            
            return { logId, notificationId };
        } catch (error) {
            console.error('Error in handleNewEmployee:', error);
            throw error;
        }
    }
}

module.exports = EmployeeService;