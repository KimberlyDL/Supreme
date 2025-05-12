const { db, Timestamp } = require('../config/firebase');

/**
 * Repository for managing log data in the database
 */
class LogRepository {
    constructor() {
        this.securityLogsCollection = 'security_logs';
        this.activityLogsCollection = 'activity_logs';
        this.errorLogsCollection = 'error_logs';
    }

    /**
     * Create a new security log entry
     * @param {Object} logData - Log data to save
     * @returns {Promise<Object>} Created log document
     */
    async createSecurityLog(logData) {
        try {
            const docRef = await db.collection(this.securityLogsCollection).add({
                ...logData,
                timestamp: Timestamp.now()
            });
            return { id: docRef.id, ...logData };
        } catch (error) {
            console.error('Error creating security log:', error);
            throw error;
        }
    }

    /**
     * Create a new activity log entry
     * @param {Object} logData - Log data to save
     * @returns {Promise<Object>} Created log document
     */
    async createActivityLog(logData) {
        try {
            const docRef = await db.collection(this.activityLogsCollection).add({
                ...logData,
                timestamp: Timestamp.now()
            });
            return { id: docRef.id, ...logData };
        } catch (error) {
            console.error('Error creating activity log:', error);
            throw error;
        }
    }

    /**
     * Create a new error log entry
     * @param {Object} logData - Log data to save
     * @returns {Promise<Object>} Created log document
     */
    async createErrorLog(logData) {
        try {
            const docRef = await db.collection(this.errorLogsCollection).add({
                ...logData,
                timestamp: Timestamp.now()
            });
            return { id: docRef.id, ...logData };
        } catch (error) {
            console.error('Error creating error log:', error);
            throw error;
        }
    }

    /**
     * Get security logs with pagination and filtering
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of log documents
     */
    async getSecurityLogs(options = {}) {
        try {
            let query = db.collection(this.securityLogsCollection);

            // Add filters
            if (options.userId) {
                query = query.where('user.uid', '==', options.userId);
            }

            if (options.eventType) {
                query = query.where('eventType', '==', options.eventType);
            }

            if (options.severity) {
                query = query.where('severity', '==', options.severity);
            }

            if (options.startDate && options.endDate) {
                query = query.where('timestamp', '>=', Timestamp.fromDate(new Date(options.startDate)))
                    .where('timestamp', '<=', Timestamp.fromDate(new Date(options.endDate)));
            }

            // Add ordering
            query = query.orderBy('timestamp', options.order || 'desc');

            // Add pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }

            // Add cursor for pagination
            if (options.lastVisible) {
                const lastDoc = await db.collection(this.securityLogsCollection).doc(options.lastVisible).get();
                if (lastDoc.exists) {
                    query = query.startAfter(lastDoc);
                }
            }

            const snapshot = await query.get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp.toDate()
            }));
        } catch (error) {
            console.error('Error fetching security logs:', error);
            throw error;
        }
    }

    /**
     * Get activity logs with pagination and filtering
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of log documents
     */
    async getActivityLogs(options = {}) {
        try {
            let query = db.collection(this.activityLogsCollection);

            // Add filters
            if (options.userId) {
                query = query.where('user.uid', '==', options.userId);
            }

            if (options.activityType) {
                query = query.where('activityType', '==', options.activityType);
            }

            if (options.resourceId) {
                query = query.where('resourceId', '==', options.resourceId);
            }

            if (options.startDate && options.endDate) {
                query = query.where('timestamp', '>=', Timestamp.fromDate(new Date(options.startDate)))
                    .where('timestamp', '<=', Timestamp.fromDate(new Date(options.endDate)));
            }

            // Add ordering
            query = query.orderBy('timestamp', options.order || 'desc');

            // Add pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }

            // Add cursor for pagination
            if (options.lastVisible) {
                const lastDoc = await db.collection(this.activityLogsCollection).doc(options.lastVisible).get();
                if (lastDoc.exists) {
                    query = query.startAfter(lastDoc);
                }
            }

            const snapshot = await query.get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp.toDate()
            }));
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            throw error;
        }
    }

    /**
     * Get error logs with pagination and filtering
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of log documents
     */
    async getErrorLogs(options = {}) {
        try {
            let query = db.collection(this.errorLogsCollection);

            // Add filters
            if (options.errorType) {
                query = query.where('errorType', '==', options.errorType);
            }

            if (options.severity) {
                query = query.where('severity', '==', options.severity);
            }

            if (options.startDate && options.endDate) {
                query = query.where('timestamp', '>=', Timestamp.fromDate(new Date(options.startDate)))
                    .where('timestamp', '<=', Timestamp.fromDate(new Date(options.endDate)));
            }

            // Add ordering
            query = query.orderBy('timestamp', options.order || 'desc');

            // Add pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }

            // Add cursor for pagination
            if (options.lastVisible) {
                const lastDoc = await db.collection(this.errorLogsCollection).doc(options.lastVisible).get();
                if (lastDoc.exists) {
                    query = query.startAfter(lastDoc);
                }
            }

            const snapshot = await query.get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp.toDate()
            }));
        } catch (error) {
            console.error('Error fetching error logs:', error);
            throw error;
        }
    }
}

module.exports = { LogRepository };