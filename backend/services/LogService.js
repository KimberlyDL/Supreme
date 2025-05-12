const { db, Timestamp } = require('../config/firebase');
const { ActionUtils } = require('../utilities/actionUtils');

/**
 * Service for logging security events and application activities
 */
class LogService {
  constructor() {
    this.orderLogsCollection = 'order_logs';
    this.saleLogsCollection = 'sales_logs';
    this.securityLogsCollection = 'security_logs';
    this.activityLogsCollection = 'activity_logs';
    this.errorLogsCollection = 'error_logs';
    this.actionUtils = ActionUtils?.createDefault ? ActionUtils.createDefault() : null;
  }

  /**
   * Log an order activity
   * @param {Object} data - Log data
   * @param {Object} user - User who performed the action
   * @returns {Promise<Object>} Created log
   */
  async logOrderActivity({ data, user, action }) {
    try {
      const logId = this._generateLogId('ORDER', data.branchId, data.orderNumber);

      const logData = {
        timestamp: Timestamp.now(),
        createdBy: this._sanitizeUser(user),
        order: { ...data },
        orderNumber: data.orderNumber,
        action: action || '',
        details: `Order ${data.orderNumber} ${action}` || '',
      };

      await db.collection(this.orderLogsCollection).doc(logId).set(logData);

      return { id: logId, ...logData };
    } catch (error) {
      console.error('Error logging order activity:', error);
      // Don't throw - logging should not interrupt the main flow
      return null;
    }
  }

  /**
   * Log a sale activity
   * @param {Object} data - Log data
   * @param {Object} user - User who performed the action
   * @returns {Promise<Object>} Created log
   */
  async logSaleActivity({ data, user }) {
    try {
      const logId = this._generateLogId('SALE', data.branchId, data.orderNumber);

      const logData = {
        timestamp: Timestamp.now(),
        createdBy: this._sanitizeUser(user),
        client: data.client,
        orderNumber: data.orderNumber,
        branchId: data.branchId,
        paymentType: data.paymentType,
        notes: data.notes,
        discounts: data.discounts,
        items: data.items,
        totalPrice: data.totalPrice
      };

      await db.collection(this.saleLogsCollection).doc(logId).set(logData);

      return { id: logId, ...logData };
    } catch (error) {
      console.error('Error logging sale activity:', error);
      // Don't throw - logging should not interrupt the main flow
      return null;
    }
  }

  /**
   * Get order logs with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Logs and pagination info
   */
  async getOrderLogs(options = {}) {
    try {
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;

      // Build query
      let query = db.collection(this.orderLogsCollection);

      // Apply filters
      if (options.orderId) {
        query = query.where('order.id', '==', options.orderId);
      }

      if (options.orderNumber) {
        query = query.where('orderNumber', '==', options.orderNumber);
      }

      if (options.status) {
        query = query.where('order.status', '==', options.status);
      }

      // Date range filtering
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        query = query.where('timestamp', '>=', Timestamp.fromDate(startDate));
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1);
        query = query.where('timestamp', '<', Timestamp.fromDate(endDate));
      }

      // Apply sorting
      query = query.orderBy('timestamp', 'desc');

      // Apply pagination
      query = query.limit(limit);

      // If not the first page, use startAfter for pagination
      if (page > 1 && options.lastVisible) {
        const lastDoc = await db.collection(this.orderLogsCollection).doc(options.lastVisible).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      // Execute query
      const snapshot = await query.get();

      // Format results
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
          createdBy: data.createdBy || null,
          order: data.order || {}
        };
      });

      // // Get total count (optional - might be expensive for large collections)
      // let total = 0;
      // if (options.getTotal) {
      //   // This is a simplified count - for large collections, consider a more efficient approach
      //   const countQuery = db.collection(this.orderLogsCollection);
      //   const countSnapshot = await countQuery.get();
      //   total = countSnapshot.size;
      // }

      return {
        logs,
        pagination: {
          page,
          limit,
          hasMore: logs.length === limit,
          // total,
          lastVisible: logs.length > 0 ? logs[logs.length - 1].id : null
        }
      };
    } catch (error) {
      console.error('Error getting order logs:', error);
      throw error;
    }
  }

  /**
   * Get sale logs with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Logs and pagination info
   */
  async getSaleLogs(options = {}) {
    try {
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;

      // Build query
      let query = db.collection(this.saleLogsCollection);

      // Apply filters
      if (options.orderId) {
        query = query.where('orderId', '==', options.orderId);
      }

      if (options.orderNumber) {
        query = query.where('orderNumber', '==', options.orderNumber);
      }

      if (options.productId) {
        query = query.where('items', 'array-contains', { productId: options.productId });
      }

      if (options.branchId) {
        query = query.where('branchID', '==', options.branchId);
      }

      // Date range filtering
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        query = query.where('timestamp', '>=', Timestamp.fromDate(startDate));
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1);
        query = query.where('timestamp', '<', Timestamp.fromDate(endDate));
      }

      // Apply sorting
      query = query.orderBy('timestamp', 'desc');

      // Apply pagination
      query = query.limit(limit);

      // If not the first page, use startAfter for pagination
      if (page > 1 && options.lastVisible) {
        const lastDoc = await db.collection(this.saleLogsCollection).doc(options.lastVisible).get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      // Execute query
      const snapshot = await query.get();

      // Format results
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
          createdBy: data.createdBy || null
        };
      });

      // Get total count (optional - might be expensive for large collections)
      let total = 0;
      if (options.getTotal) {
        // This is a simplified count - for large collections, consider a more efficient approach
        const countQuery = db.collection(this.saleLogsCollection);
        const countSnapshot = await countQuery.get();
        total = countSnapshot.size;
      }

      return {
        logs,
        pagination: {
          page,
          limit,
          hasMore: logs.length === limit,
          total,
          lastVisible: logs.length > 0 ? logs[logs.length - 1].id : null
        }
      };
    } catch (error) {
      console.error('Error getting sale logs:', error);
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

      // Date range filtering
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        query = query.where('timestamp', '>=', Timestamp.fromDate(startDate));
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1);
        query = query.where('timestamp', '<', Timestamp.fromDate(endDate));
      }

      // Add ordering
      query = query.orderBy('timestamp', options.order || 'desc');

      // Add pagination
      const limit = parseInt(options.limit) || 20;
      query = query.limit(limit);

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

      // Date range filtering
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        query = query.where('timestamp', '>=', Timestamp.fromDate(startDate));
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1);
        query = query.where('timestamp', '<', Timestamp.fromDate(endDate));
      }

      // Add ordering
      query = query.orderBy('timestamp', options.order || 'desc');

      // Add pagination
      const limit = parseInt(options.limit) || 20;
      query = query.limit(limit);

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
   * Get inventory logs with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of log documents
   */
  async getInventoryLogs(options = {}) {
    try {
      let query = db.collection('inventory_logs');

      // Add filters
      if (options.branchId) {
        query = query.where('branchId', '==', options.branchId);
      }

      if (options.type) {
        query = query.where('type', '==', options.type);
      }

      // Date range filtering
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        query = query.where('timestamp', '>=', Timestamp.fromDate(startDate));
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1);
        query = query.where('timestamp', '<', Timestamp.fromDate(endDate));
      }

      // Add ordering
      query = query.orderBy('timestamp', options.order || 'desc');

      // Add pagination
      const limit = parseInt(options.limit) || 20;
      query = query.limit(limit);

      if (options.lastVisible) {
        const lastDoc = await db.collection('inventory_logs').doc(options.lastVisible).get();
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
      console.error('Error fetching inventory logs:', error);
      throw error;
    }
  }

  /**
   * Log a security-related event
   * @param {Object} eventData - Data about the security event
   * @returns {Promise<Object>} The created log document
   */
  async logSecurityEvent(eventData) {
    try {
      // Determine action type if not provided
      if (!eventData.actionType && eventData.action && this.actionUtils) {
        const [method, url] = eventData.action.split(' ');
        eventData.actionType = this.actionUtils.getActionType(method, url);
      }

      const logData = {
        timestamp: Timestamp.now(),
        eventType: eventData.eventType || 'UNKNOWN',
        user: this._sanitizeUser(eventData.user),
        action: eventData.action,
        actionType: eventData.actionType,
        targetResource: eventData.targetResource,
        details: eventData.details,
        ip: eventData.ip,
        userAgent: eventData.userAgent,
        metadata: eventData.metadata || {},
        severity: this._determineSeverity(eventData.eventType)
      };

      if (eventData.error) {
        logData.error = eventData.error;
      }

      // Using Admin SDK method
      const docRef = await db.collection(this.securityLogsCollection).add(logData);
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error('Error logging security event:', error);
      // Fallback to console logging if database logging fails
      console.warn('Security Event:', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...eventData
      }));
      return null;
    }
  }

  /**
   * Log an application activity
   * @param {Object} activityData - Data about the activity
   * @returns {Promise<Object>} The created log document
   */
  async logActivity(activityData) {
    try {
      // Determine action type if not provided
      if (!activityData.actionType && activityData.action && this.actionUtils) {
        const [method, url] = activityData.action.split(' ');
        activityData.actionType = this.actionUtils.getActionType(method, url);
      }

      const logData = {
        timestamp: Timestamp.now(),
        activityType: activityData.activityType,
        user: this._sanitizeUser(activityData.user),
        action: activityData.action,
        actionType: activityData.actionType,
        targetResource: activityData.targetResource,
        resourceId: activityData.resourceId,
        details: activityData.details,
        changes: activityData.changes || {},
        metadata: activityData.metadata || {}
      };

      // Using Admin SDK method
      const docRef = await db.collection(this.activityLogsCollection).add(logData);
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  }

  /**
   * Log an application error
   * @param {Object} errorData - Data about the error
   * @returns {Promise<Object>} The created log document
   */
  async logError(errorData) {
    try {
      const logData = {
        timestamp: Timestamp.now(),
        errorType: errorData.errorType || 'APPLICATION_ERROR',
        user: errorData.user ? this._sanitizeUser(errorData.user) : null,
        action: errorData.action,
        targetResource: errorData.targetResource,
        message: errorData.message,
        stack: errorData.stack,
        details: errorData.details,
        metadata: errorData.metadata || {},
        severity: errorData.severity || 'high'
      };

      // Using Admin SDK method
      const docRef = await db.collection(this.errorLogsCollection).add(logData);
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error('Error logging application error:', error);
      // Fallback to console logging
      console.error('Application Error:', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...errorData
      }));
      return null;
    }
  }

  /**
   * Generate a unique log ID
   * @param {'ORDER' | 'SALE'} type - Type of the log
   * @param {string} branchId - Branch ID
   * @param {string} orderNumber - Order number (optional)
   * @returns {string} - Formatted log ID
   */
  _generateLogId(type, branchId, orderNumber = '') {
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, '0');

    const timestamp = [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds())
    ].join('');

    const cleanBranch = branchId ? branchId.replace(/\s+/g, '').toUpperCase() : 'NOBRANCH';
    const shortOrder = orderNumber ? `${orderNumber}` : '';

    return `${type}-${cleanBranch}-${timestamp}-${shortOrder}`;
  }

  /**
   * Sanitize user object to include only necessary fields
   * @param {Object} user - User object
   * @returns {Object} Sanitized user object
   * @private
   */
  _sanitizeUser(user) {
    if (!user) return null;

    return {
      uid: user.uid,
      email: user.email,
      role: user.role,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      branchId: user.branchId || null,
      branchName: user.branch || null
    };
  }

  /**
   * Determine severity level based on event type
   * @param {string} eventType - Type of security event
   * @returns {string} Severity level
   * @private
   */
  _determineSeverity(eventType) {
    const highSeverityEvents = [
      'UNAUTHORIZED_ACCESS',
      'AUTHENTICATION_FAILURE',
      'ROLE_MODIFICATION_VIOLATION',
      'DATA_DELETION',
      'ACCOUNT_LOCKOUT',
      'ACCESS_DENIED'
    ];

    const mediumSeverityEvents = [
      'BRANCH_ACCESS_VIOLATION',
      'PASSWORD_CHANGE',
      'PROFILE_UPDATE',
      'ROLE_MIDDLEWARE_ERROR'
    ];

    if (highSeverityEvents.includes(eventType)) {
      return 'high';
    } else if (mediumSeverityEvents.includes(eventType)) {
      return 'medium';
    } else {
      return 'low';
    }
  }
}

module.exports = { LogService };