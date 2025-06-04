const { db, Timestamp } = require("../config/firebase");
const { ActionUtils } = require("../utilities/actionUtils");
const {
  _generateShortId,
  _generateLogId,
  _generateActivityLogId,
  _generateOrdSaleLogId,
} = require("../utilities/utils");

/**
 * Service for logging security events and application activities
 */
class LogService {
  constructor() {
    this.orderLogsCollection = "order_logs";
    this.saleLogsCollection = "sales_logs";
    this.securityLogsCollection = "security_logs";
    this.activityLogsCollection = "activity_logs";
    this.errorLogsCollection = "error_logs";
    this.actionUtils = ActionUtils?.createDefault
      ? ActionUtils.createDefault()
      : null;
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
        query = query.where("user.uid", "==", options.userId);
      }

      if (options.activityType) {
        query = query.where("activityType", "==", options.activityType);
      }

      // Date range filtering
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        query = query.where("timestamp", ">=", Timestamp.fromDate(startDate));
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1);
        query = query.where("timestamp", "<", Timestamp.fromDate(endDate));
      }

      // Add ordering
      query = query.orderBy("timestamp", options.order || "desc");

      // Add pagination
      const limit = parseInt(options.limit) || 20;
      query = query.limit(limit);

      if (options.lastVisible) {
        const lastDoc = await db
          .collection(this.activityLogsCollection)
          .doc(options.lastVisible)
          .get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      }));
    } catch (error) {
      console.error("Error fetching activity logs:", error);
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
        query = query.where("user.uid", "==", options.userId);
      }

      if (options.eventType) {
        query = query.where("eventType", "==", options.eventType);
      }

      if (options.severity) {
        query = query.where("severity", "==", options.severity);
      }

      // Date range filtering
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        query = query.where("timestamp", ">=", Timestamp.fromDate(startDate));
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1);
        query = query.where("timestamp", "<", Timestamp.fromDate(endDate));
      }

      // Add ordering
      query = query.orderBy("timestamp", options.order || "desc");

      // Add pagination
      const limit = parseInt(options.limit) || 20;
      query = query.limit(limit);

      if (options.lastVisible) {
        const lastDoc = await db
          .collection(this.securityLogsCollection)
          .doc(options.lastVisible)
          .get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      }));
    } catch (error) {
      console.error("Error fetching security logs:", error);
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
      let query = db.collection("inventory_logs");

      // Add filters
      if (options.branchId) {
        query = query.where("branchId", "==", options.branchId);
      }

      if (options.type) {
        query = query.where("type", "==", options.type);
      }

      // Date range filtering
      if (options.startDate) {
        const startDate = new Date(options.startDate);
        query = query.where("timestamp", ">=", Timestamp.fromDate(startDate));
      }

      if (options.endDate) {
        const endDate = new Date(options.endDate);
        // Add one day to include the end date fully
        endDate.setDate(endDate.getDate() + 1);
        query = query.where("timestamp", "<", Timestamp.fromDate(endDate));
      }

      // Add ordering
      query = query.orderBy("timestamp", options.order || "desc");

      // Add pagination
      const limit = parseInt(options.limit) || 20;
      query = query.limit(limit);

      if (options.lastVisible) {
        const lastDoc = await db
          .collection("inventory_logs")
          .doc(options.lastVisible)
          .get();
        if (lastDoc.exists) {
          query = query.startAfter(lastDoc);
        }
      }

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      }));
    } catch (error) {
      console.error("Error fetching inventory logs:", error);
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
        const [method, url] = eventData.action.split(" ");
        eventData.actionType = this.actionUtils.getActionType(method, url);
      }

      const logData = {
        timestamp: Timestamp.now(),
        eventType: eventData.eventType || "UNKNOWN",
        user: this._sanitizeUser(eventData.user),
        action: eventData.action,
        actionType: eventData.actionType,
        targetResource: eventData.targetResource,
        details: eventData.details,
        ip: eventData.ip,
        userAgent: eventData.userAgent,
        metadata: eventData.metadata || {},
        severity: this._determineSeverity(eventData.eventType),
      };

      if (eventData.error) {
        logData.error = eventData.error;
      }

      // Using Admin SDK method
      const docRef = await db
        .collection(this.securityLogsCollection)
        .add(logData);
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error("Error logging security event:", error);
      // Fallback to console logging if database logging fails
      console.warn(
        "Security Event:",
        JSON.stringify({
          timestamp: new Date().toISOString(),
          ...eventData,
        })
      );
      return null;
    }
  }

  /**
   * Log an application activity
   * @param {Array} logIds - Ids of connected logs
   * @param {Object} user - Data about the activity
   * @returns {Promise<Object>} The created log document
   */
  async logAdminActivity(activityData, logIds, id) {
    try {
      // Determine action type if not provided
      if (!activityData.actionType && activityData.action && this.actionUtils) {
        const [method, url] = activityData.action.split(" ");
        activityData.actionType = this.actionUtils.getActionType(method, url);
      }

      const logData = {
        timestamp: Timestamp.now(),
        activityType: activityData.activityType,
        user: this._sanitizeUser(activityData.user),
        linkedLogId: logIds || [],
        action: activityData.action,
        actionType: activityData.actionType,
        targetResource: activityData.targetResource,
        resourceId: activityData.resourceId,
        details: activityData.details,
      };

      // Using Admin SDK method
      const docRef = await db
        .collection(this.activityLogsCollection)
        .doc(id)
        .set(logData);
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error("Error logging activity:", error);
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
        const [method, url] = activityData.action.split(" ");
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
        metadata: activityData.metadata || {},
      };

      // Using Admin SDK method
      const docRef = await db
        .collection(this.activityLogsCollection)
        .add(logData);
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error("Error logging activity:", error);
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
        errorType: errorData.errorType || "APPLICATION_ERROR",
        user: errorData.user ? this._sanitizeUser(errorData.user) : null,
        action: errorData.action,
        targetResource: errorData.targetResource,
        message: errorData.message,
        stack: errorData.stack,
        details: errorData.details,
        metadata: errorData.metadata || {},
        severity: errorData.severity || "high",
      };

      // Using Admin SDK method
      const docRef = await db.collection(this.errorLogsCollection).add(logData);
      return { id: docRef.id, ...logData };
    } catch (error) {
      console.error("Error logging application error:", error);
      // Fallback to console logging
      console.error(
        "Application Error:",
        JSON.stringify({
          timestamp: new Date().toISOString(),
          ...errorData,
        })
      );
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
  _generateLogId(type, branchId, orderNumber = "") {
    const now = new Date();

    const pad = (n) => n.toString().padStart(2, "0");

    const timestamp = [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds()),
    ].join("");

    const cleanBranch = branchId
      ? branchId.replace(/\s+/g, "").toUpperCase()
      : "NOBRANCH";
    const shortOrder = orderNumber ? `${orderNumber}` : "";

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
      branchName: user.branch || null,
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
      "UNAUTHORIZED_ACCESS",
      "AUTHENTICATION_FAILURE",
      "ROLE_MODIFICATION_VIOLATION",
      "DATA_DELETION",
      "ACCOUNT_LOCKOUT",
      "ACCESS_DENIED",
    ];

    const mediumSeverityEvents = [
      "BRANCH_ACCESS_VIOLATION",
      "PASSWORD_CHANGE",
      "PROFILE_UPDATE",
      "ROLE_MIDDLEWARE_ERROR",
    ];

    if (highSeverityEvents.includes(eventType)) {
      return "high";
    } else if (mediumSeverityEvents.includes(eventType)) {
      return "medium";
    } else {
      return "low";
    }
  }
}

module.exports = { LogService };
