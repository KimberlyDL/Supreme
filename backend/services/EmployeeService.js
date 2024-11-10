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

    async updateEmployee(employeeId, employeeData) {
        try {
            const employeeRef = this.employeesCollection.doc(employeeId);
            await employeeRef.update(employeeData);

            // Fetch the updated document
            const updatedDoc = await employeeRef.get();
            return { id: updatedDoc.id, ...updatedDoc.data() };
        } catch (error) {
            console.error('Error updating employee in Firestore:', error);
            throw error;
        }
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
            recipientRoles: ['owner', 'manager'],
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

    async logEmployeeUpdate(employeeData, req) {
        const logId = `log_${new Date().getTime()}`;
        const logEntry = {
            logId,
            userId: employeeData.uid,
            userName: `${employeeData.firstName} ${employeeData.lastName}`,
            role: employeeData.role,
            actionType: "UPDATE",
            targetType: "employee",
            targetId: employeeData.uid,
            targetName: `${employeeData.firstName} ${employeeData.lastName}`,
            description: "Employee information updated",
            timestamp: new Date(),
            ipAddress: req.headers['x-forwarded-for'] || req.ip,
            deviceInfo: req.headers['user-agent'] || "Unknown Device",
            status: "successful",
            metadata: {
                updatedValue: {
                    ...employeeData,
                    updatedAt: new Date()
                }
            }
        };

        await this.activityLogsCollection.doc(logId).set(logEntry);
        return logId;
    }

    async createNotificationForEmployeeUpdate(employeeData) {
        const notificationId = `notif_${new Date().getTime()}`;
        const notification = {
            id: notificationId,
            type: 'EMPLOYEE_UPDATE',
            message: `Employee ${employeeData.firstName} ${employeeData.lastName}'s information has been updated.`,
            createdAt: new Date(),
            isRead: false,
            recipientRoles: ['owner', 'manager'],
            employeeId: employeeData.uid
        };

        await this.notificationsCollection.doc(notificationId).set(notification);
        return notificationId;
    }

    async handleEmployeeUpdate(employeeData, req) {
        try {
            const logId = await this.logEmployeeUpdate(employeeData, req);
            const notificationId = await this.createNotificationForEmployeeUpdate(employeeData);

            return { logId, notificationId };
        } catch (error) {
            console.error('Error in handleEmployeeUpdate:', error);
            throw error;
        }
    }

    async handleEmployeeDelete(employeeId, req) {
        try {
            const logId = await this.logEmployeeDelete(employeeId, req);
            const notificationId = await this.createNotificationForEmployeeDelete(employeeId);

            return { logId, notificationId };
        } catch (error) {
            console.error('Error in handleEmployeeDelete:', error);
            throw error;
        }
    }

    async logEmployeeDelete(employeeId, req) {
        const logId = `log_${new Date().getTime()}`;
        const logEntry = {
            logId,
            userId: req.user.uid, // Assuming you have user information in the request
            userName: req.user.displayName,
            role: req.user.role,
            actionType: "DELETE",
            targetType: "employee",
            targetId: employeeId,
            description: "Employee deleted",
            timestamp: new Date(),
            ipAddress: req.headers['x-forwarded-for'] || req.ip,
            deviceInfo: req.headers['user-agent'] || "Unknown Device",
            status: "successful"
        };

        await this.activityLogsCollection.doc(logId).set(logEntry);
        return logId;
    }

    async createNotificationForEmployeeDelete(employeeId) {
        const notificationId = `notif_${new Date().getTime()}`;
        const notification = {
            id: notificationId,
            type: 'EMPLOYEE_DELETE',
            message: `An employee (ID: ${employeeId}) has been deleted.`,
            createdAt: new Date(),
            isRead: false,
            recipientRoles: ['owner', 'manager'],
            employeeId: employeeId
        };

        await this.notificationsCollection.doc(notificationId).set(notification);
        return notificationId;
    }
    
}

module.exports = EmployeeService;